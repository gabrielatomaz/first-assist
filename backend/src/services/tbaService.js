const BASE_URL = 'https://www.thebluealliance.com/api/v3';

const getHeaders = () => {
  const apiKey = process.env.TBA_API_KEY;
  if (!apiKey) {
    throw new Error('TBA_API_KEY is not configured in backend environment variables.');
  }
  return {
    'X-TBA-Auth-Key': apiKey,
    'Accept': 'application/json'
  };
};

/**
 * Fetch official team info by team number (e.g., 254 or 'frc254')
 */
export const getTeamFromTBA = async (teamNumber) => {
  const cleanNumber = String(teamNumber).toLowerCase().replace('frc', '');
  const response = await fetch(`${BASE_URL}/team/frc${cleanNumber}`, {
    headers: getHeaders()
  });

  if (response.status === 404) {
    throw new Error(`Team ${cleanNumber} not found on The Blue Alliance.`);
  }
  if (!response.ok) {
    throw new Error(`TBA API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    number: data.team_number,
    name: data.nickname || data.name,
    city: data.city,
    state: data.state_prov,
    country: data.country,
    rookieYear: data.rookie_year || new Date().getFullYear()
  };
};

/**
 * Fetch official event details by event key (e.g., '2026brsp')
 */
export const getEventFromTBA = async (eventKey) => {
  const cleanKey = String(eventKey).trim().toLowerCase();
  const response = await fetch(`${BASE_URL}/event/${cleanKey}`, {
    headers: getHeaders()
  });

  if (response.status === 404) {
    throw new Error(`Event '${cleanKey}' not found on The Blue Alliance.`);
  }
  if (!response.ok) {
    throw new Error(`TBA API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    code: data.event_code || cleanKey,
    key: data.key,
    name: data.name,
    year: data.year,
    location: `${data.city || ''}, ${data.state_prov || ''}, ${data.country || ''}`.replace(/^, |, $/g, ''),
    startDate: data.start_date,
    endDate: data.end_date
  };
};

/**
 * Fetch list of official FRC event keys/summary for a given year (e.g., 2026)
 */
export const getEventsByYearFromTBA = async (year) => {
  const season = year || new Date().getFullYear();
  const response = await fetch(`${BASE_URL}/events/${season}/simple`, {
    headers: getHeaders()
  });

  if (!response.ok) {
    throw new Error(`TBA API error fetching events for ${season}: ${response.status}`);
  }

  const events = await response.json();
  return events.map(e => ({
    key: e.key,
    code: e.event_code,
    name: e.name,
    year: e.year,
    location: `${e.city || ''}, ${e.state_prov || ''}, ${e.country || ''}`.replace(/^, |, $/g, '')
  }));
};

/**
 * Fetch list of team numbers attending an event (e.g., '2026brsp')
 */
export const getEventTeamsFromTBA = async (eventKey) => {
  const cleanKey = String(eventKey).trim().toLowerCase();
  const response = await fetch(`${BASE_URL}/event/${cleanKey}/teams/keys`, {
    headers: getHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch team roster for event ${cleanKey} from TBA.`);
  }

  const teamKeys = await response.json(); // returns array of strings e.g. ['frc254', 'frc1772']
  return teamKeys.map(key => parseInt(key.replace('frc', ''), 10)).filter(num => !isNaN(num));
};

/**
 * Fetch list of official FRC events a team is participating in during a given season year.
 * Always uses the year-specific TBA endpoint to avoid flooding with historical events.
 */
export const getTeamEventsFromTBA = async (teamNumber, year) => {
  const cleanNumber = String(teamNumber).toLowerCase().replace('frc', '');
  const seasonYear = year || new Date().getFullYear();
  try {
    const response = await fetch(`${BASE_URL}/team/frc${cleanNumber}/events/${seasonYear}/simple`, {
      headers: getHeaders()
    });

    if (!response.ok) return [];

    const events = await response.json();
    // Sort alphabetically by name for a clean dropdown
    events.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return events.map(e => ({
      key: e.key,
      code: e.event_code,
      name: e.name,
      year: e.year,
      location: `${e.city || ''}, ${e.state_prov || ''}, ${e.country || ''}`.replace(/^, |, $/g, '')
    }));
  } catch (err) {
    console.warn('TBA getTeamEventsFromTBA error:', err.message);
    return [];
  }
};

/**
 * Fetch matches played by a team at a specific event from TBA
 */
export const getTeamEventMatchesFromTBA = async (teamNumber, eventKey) => {
  const cleanNumber = String(teamNumber).toLowerCase().replace('frc', '');
  const cleanKey = String(eventKey).trim().toLowerCase();
  try {
    const response = await fetch(`${BASE_URL}/team/frc${cleanNumber}/event/${cleanKey}/matches/simple`, {
      headers: getHeaders()
    });

    if (!response.ok) return [];

    const matches = await response.json();
    const levelOrder = { 'qm': 1, 'ef': 2, 'qf': 3, 'sf': 4, 'f': 5 };
    matches.sort((a, b) => {
      if (levelOrder[a.comp_level] !== levelOrder[b.comp_level]) {
        return (levelOrder[a.comp_level] || 9) - (levelOrder[b.comp_level] || 9);
      }
      return a.match_number - b.match_number;
    });

    return matches.map(m => {
      let label = `Match ${m.match_number}`;
      if (m.comp_level === 'qm') label = `Quals ${m.match_number} (Q${m.match_number})`;
      else if (m.comp_level === 'sf') label = `Semifinal ${m.set_number}-${m.match_number}`;
      else if (m.comp_level === 'f') label = `Final ${m.match_number}`;
      
      let key = `Q${m.match_number}`;
      if (m.comp_level !== 'qm') key = `${m.comp_level.toUpperCase()}${m.match_number}`;

      return {
        key: key,
        label: label,
        compLevel: m.comp_level,
        matchNumber: m.match_number
      };
    });
  } catch (err) {
    console.warn('TBA getTeamEventMatchesFromTBA error:', err.message);
    return [];
  }
};
