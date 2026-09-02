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
