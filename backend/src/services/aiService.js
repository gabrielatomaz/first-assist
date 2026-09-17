import { GoogleGenAI } from '@google/genai';

const calculateSimilarity = (incident, historicalTicket) => {
  const t1 = `${incident.category} ${incident.description || ''}`.toLowerCase();
  const t2 = `${historicalTicket.category} ${historicalTicket.description || ''} ${historicalTicket.rootCause || ''} ${historicalTicket.appliedSolution || ''}`.toLowerCase();
  
  const words1 = new Set(t1.replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(t2.replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 2));
  
  if (words1.size === 0 || words2.size === 0) return 75;
  
  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }
  
  const union = new Set([...words1, ...words2]).size;
  const jaccard = union > 0 ? (intersection / union) : 0;
  
  const sameCategory = incident.category === historicalTicket.category;
  const score = Math.round((sameCategory ? 75 : 50) + (jaccard * 40));
  return Math.min(98, Math.max(68, score));
};

/**
 * Generate AI-powered diagnostic recommendations for an FRC incident report using Google Gemini.
 * Includes RAG (Retrieval-Augmented Generation) context from historical Knowledge Base tickets.
 * Includes automatic model fallback chain for 503 high demand / 429 rate limit spikes.
 * @param {Object} incident - Target incident ticket details
 * @param {Array} relatedIncidents - Historical resolved tickets for RAG context
 * @returns {Promise<{suggestedCause: string, suggestedSolution: string, isRagGrounded: boolean, citedIncidents: Array}>}
 */
export const generateDiagnosticSuggestion = async (incident, relatedIncidents = []) => {
  const citedIncidents = relatedIncidents.map(inc => ({
    incidentId: inc._id,
    teamNumber: inc.teamNumber,
    matchNumber: inc.matchNumber || 'N/A',
    eventCode: inc.eventCode || 'brba',
    category: inc.category,
    appliedSolution: inc.appliedSolution || inc.rootCause || 'N/A',
    similarityScore: calculateSimilarity(incident, inc)
  }));

  const isRagGrounded = citedIncidents.length > 0;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY missing in environment. Returning Response Not Found message.');
    return {
      suggestedCause: 'Response not found: AI service API key is missing or not configured.',
      suggestedSolution: 'No automatic AI response could be generated. Please consult an on-site CSA/FTA or inspect hardware connections manually.',
      isRagGrounded: false,
      citedIncidents: []
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Construct domain-specific FRC prompt with RAG context
  const knowledgeBaseContext = isRagGrounded
    ? `\n[VERIFIED KNOWLEDGE BASE COMPETITION RESOLUTIONS]\nThe following verified resolutions were recorded for similar incidents at past FRC events:\n` +
      relatedIncidents.map((t, idx) => `${idx + 1}. Team ${t.teamNumber} (Match ${t.matchNumber || 'N/A'}) [${t.category}]:\n   - Issue: "${t.description}"\n   - Root Cause: "${t.rootCause || 'N/A'}"\n   - Applied Fix: "${t.appliedSolution || 'N/A'}"`).join('\n\n')
    : '';

  const prompt = `You are an expert FIRST Robotics Competition (FRC) Control System Advisor (CSA) and FIRST Technical Advisor (FTA).
Analyze the following technical incident reported during an FRC competition match and provide an accurate root cause analysis and practical field troubleshooting recommendations:

Incident Report Details:
- Category: ${incident.category}
- Priority: ${incident.priority}
- Team Number: ${incident.teamNumber}
- Match Number: ${incident.matchNumber || 'N/A'}
- Reported Description: "${incident.description}"
${knowledgeBaseContext}

Instructions:
1. Analyze the current incident using both general FRC engineering knowledge and the provided verified Knowledge Base resolutions.
2. If the verified Knowledge Base resolutions apply, directly cite or ground your diagnosis in them (e.g., "Based on a similar issue resolved for Team 1156 (Match Q12)...").
3. If you cannot determine a confident root cause from the description or Knowledge Base resolutions, start 'suggestedCause' with: "Response not found: Insufficient incident details or Knowledge Base precedents to determine root cause confidently."
4. Output MUST be strictly valid JSON matching this exact JSON schema:
{
  "suggestedCause": "Clear, technical explanation of probable root cause, or 'Response not found: ...' if undetermined.",
  "suggestedSolution": "Actionable bullet points or step-by-step instructions for resolving the issue."
}`;

  // Candidate models chain to prevent 503 high demand failures
  const candidateModels = ['gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-3.6-flash'];

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '';
      console.log(`Gemini AI (${modelName}) RAG Diagnostic Response:`, responseText);

      const json = JSON.parse(responseText);
      const isNotFound = json.suggestedCause && json.suggestedCause.toLowerCase().includes('response not found');
      const grounded = isRagGrounded && !isNotFound;

      return {
        suggestedCause: json.suggestedCause || 'Response not found: Unspecified technical cause.',
        suggestedSolution: json.suggestedSolution || 'Inspect control system wiring and reboot RoboRIO.',
        isRagGrounded: grounded,
        citedIncidents: grounded ? citedIncidents : []
      };
    } catch (error) {
      console.warn(`Gemini model ${modelName} unavailable (${error.status || error.message}). Trying next fallback...`);
    }
  }

  // Graceful fallback if all candidate models are temporarily overloaded or network issue occurs
  console.error('All Gemini candidate models failed or unavailable due to network/service issue.');
  return {
    suggestedCause: 'Response not found due to a network connection or AI service availability issue.',
    suggestedSolution: 'Unable to retrieve AI diagnostic recommendation at this moment. Please verify network connectivity or inspect hardware manually.',
    isRagGrounded: false,
    citedIncidents: []
  };
};
