export const mockIncidents = [
  {
    _id: '1',
    teamNumber: 254,
    matchNumber: 'Q12',
    description: 'Radio lost power during autonomous period. Robot stopped responding to driver station commands mid-match.',
    status: 'OPEN',
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    teamNumber: 1114,
    matchNumber: 'Q14',
    description: 'RoboRIO experiencing frequent brownouts causing intermittent disconnects during teleop. Battery voltage drops below 7V under load.',
    status: 'INVESTIGATING',
    createdAt: new Date().toISOString()
  },
  {
    _id: '3',
    teamNumber: 4613,
    matchNumber: 'Q8',
    description: 'CAN bus communication failure. Talon SRX motor controllers not responding. Wiring harness appears intact.',
    status: 'OPEN',
    createdAt: new Date().toISOString()
  }
]
