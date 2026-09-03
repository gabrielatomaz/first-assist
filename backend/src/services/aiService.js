import { GoogleGenAI } from '@google/genai';

/**
 * Generate AI-powered diagnostic recommendations for an FRC incident report using Google Gemini.
 * Includes automatic model fallback chain for 503 high demand / 429 rate limit spikes.
 * @param {Object} incident - Target incident ticket details
 * @param {Array} relatedIncidents - Historical resolved tickets for RAG context
 * @returns {Promise<{suggestedCause: string, suggestedSolution: string}>}
 */
export const generateDiagnosticSuggestion = async (incident, relatedIncidents = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY missing in environment. Using default diagnostic fallback.');
    return {
      suggestedCause: 'Loose cable connection or power brownout during match movement.',
      suggestedSolution: 'Verify Ethernet cable seating, check battery terminal torque, and inspect Driver Station logs for CAN bus errors.'
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Construct domain-specific FRC prompt
  const knowledgeBaseContext = relatedIncidents.length > 0
    ? `\nHistorical Knowledge Base Context (Past Similar Resolved Tickets):\n` +
      relatedIncidents.map((t, idx) => `${idx + 1}. Description: "${t.description}" | Cause: "${t.rootCause || 'N/A'}" | Solution: "${t.appliedSolution || 'N/A'}"`).join('\n')
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
1. Identify the most probable technical root cause (hardware, CAN bus, radio comms, RoboRIO, user code exception, or power drop).
2. Provide concise, step-by-step troubleshooting actions that the volunteer CSA or team can perform immediately in the pit or field queue.
3. Output MUST be strictly valid JSON matching this exact JSON schema:
{
  "suggestedCause": "Clear, technical 1-2 sentence explanation of the probable root cause.",
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
      console.log(`Gemini AI (${modelName}) Diagnostic Response:`, responseText);

      const json = JSON.parse(responseText);
      return {
        suggestedCause: json.suggestedCause || 'Unspecified technical cause detected by AI.',
        suggestedSolution: json.suggestedSolution || 'Inspect control system wiring and reboot RoboRIO.'
      };
    } catch (error) {
      console.warn(`Gemini model ${modelName} unavailable (${error.status || error.message}). Trying next fallback...`);
    }
  }

  // Graceful fallback if all candidate models are temporarily overloaded
  console.error('All Gemini candidate models failed or unavailable due to high demand spikes.');
  return {
    suggestedCause: 'Intermittent signal interruption or driver station connector drop.',
    suggestedSolution: 'Inspect Ethernet path, verify radio firmware version, and secure battery connection leads.'
  };
};
