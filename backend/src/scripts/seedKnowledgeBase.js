import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import { Incident } from '../models/Incident.js';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';

const sampleFRCIncidents = [
  {
    teamNumber: 1156,
    matchNumber: 'Q12',
    eventCode: 'brba',
    category: 'RADIO_COMMS',
    priority: 'HIGH',
    status: 'RESOLVED',
    description: 'Robot radio disconnected 30 seconds into teleop during heavy bumper-to-bumper collision. Driver Station reported RIO disconnect and loss of network link.',
    diagnosis: 'Inspected OpenMesh VH-109 radio power harness and RJ45 connection. Found locking tab broken on Ethernet cable and loose 12V barrel connector.',
    rootCause: 'Loose RJ45 Ethernet cable (missing locking tab) and 12V barrel jack power connector dislodged under mechanical shock during collision.',
    appliedSolution: 'Replaced Ethernet cable with molded boot locking tab cable, installed REV Radio Power Module (RPM) with POE power delivery, and zip-tied cable connections to radio chassis.',
    resolvedAt: new Date(Date.now() - 3600000 * 24 * 3)
  },
  {
    teamNumber: 1860,
    matchNumber: 'Q28',
    eventCode: 'brba',
    category: 'RADIO_COMMS',
    priority: 'CRITICAL',
    status: 'RESOLVED',
    description: 'Driver Station laptop unable to link with FRC field network at field queue. RIO status light red, no IP assigned on Ethernet adapter.',
    diagnosis: 'Checked Driver Station Ethernet adapter settings. DS laptop had static IP set to 192.168.1.50 instead of DHCP for field AP.',
    rootCause: 'Driver Station laptop NIC had hardcoded static IP configuration leftover from pit test bench debugging.',
    appliedSolution: 'Reconfigured DS Ethernet network adapter to Automatic (DHCP), verified FRC Kiosk flashing tool team number binding, and confirmed successful field link.',
    resolvedAt: new Date(Date.now() - 3600000 * 24 * 2)
  },
  {
    teamNumber: 7033,
    matchNumber: 'Q05',
    eventCode: 'brba',
    category: 'VISION_COPROCESSOR',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    description: 'Video feed latency exceeded 400ms during Autonomous mode. Field Network Monitor indicated team exceeded 7Mbps bandwidth cap.',
    diagnosis: 'Inspected Limelight 3 vision camera configuration. Streams were configured for 1080p 60FPS uncompressed MJPEG stream.',
    rootCause: 'Uncompressed high-resolution vision camera stream exceeded FRC field network bandwidth threshold (7Mbps limit).',
    appliedSolution: 'Downscaled Limelight stream to 320x240 @ 30FPS with 30% compression ratio, bringing total bandwidth draw down to 2.1 Mbps.',
    resolvedAt: new Date(Date.now() - 3600000 * 24 * 4)
  },
  {
    teamNumber: 7459,
    matchNumber: 'Q19',
    eventCode: 'brba',
    category: 'ROBOTIC_POWER',
    priority: 'CRITICAL',
    status: 'RESOLVED',
    description: 'Robot completely power cycled mid-match while pushing opponent across center line. All LEDs and RIO turned off for 5 seconds.',
    diagnosis: 'Checked 120A main breaker terminal studs and main battery leads. Terminal lug nuts were loose and showing signs of heat discoloration.',
    rootCause: 'Loose 10-32 terminal stud nuts on 120A main breaker caused high contact resistance, overheating the breaker and causing thermal expansion trip under 140A load spike.',
    appliedSolution: 'Torqued main breaker terminal nuts to 35 in-lbs with star lock washers, replaced charred 4AWG copper lug, and tested under stall torque.',
    resolvedAt: new Date(Date.now() - 3600000 * 24 * 1)
  },
  {
    teamNumber: 7563,
    matchNumber: 'Q34',
    eventCode: 'brba',
    category: 'ROBOTIC_POWER',
    priority: 'HIGH',
    status: 'RESOLVED',
    description: 'RoboRIO brownouts (voltage dropping under 6.8V) during intake acceleration, causing motor controllers to restart.',
    diagnosis: 'Tested battery under 100A load using Beak Battery Analyzer. Internal resistance measured 0.026 ohms (threshold > 0.020 is fail). SB50 connector terminals loose.',
    rootCause: 'Degraded lead-acid battery with high internal resistance combined with worn Anderson SB50 contact pins creating voltage drop under heavy current pull.',
    appliedSolution: 'Replaced battery with fresh competition-grade battery (0.014 ohm resistance) and recrimped SB50 connector contacts with proper ratcheting crimper.',
    resolvedAt: new Date(Date.now() - 3600000 * 24 * 5)
  },
  {
    teamNumber: 7565,
    matchNumber: 'Q42',
    eventCode: 'brba',
    category: 'ROBOTIC_POWER',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    description: 'Arm shooter motor stopped responding during Teleop. REV Power Distribution Hub (PDH) channel 7 LED blinking red.',
    diagnosis: 'Inspected 40A ATO auto-reset breaker on PDH channel 7. Wiring insulation was pinched against metal chassis frame.',
    rootCause: 'Chafed 12AWG wire insulation shorted against aluminum frame rail, causing 40A breaker to continuously trip.',
    appliedSolution: 'Repaired damaged wire insulation with heat shrink, wrapped harness with protective snakeskin sleeving, and deburred chassis edge.',
    resolvedAt: new Date(Date.now() - 3600000 * 24 * 2)
  },
  {
    teamNumber: 7567,
    matchNumber: 'Q15',
    eventCode: 'brba',
    category: 'CAN_BUS',
    priority: 'CRITICAL',
    status: 'RESOLVED',
    description: 'Complete CAN bus failure at match start. All SPARK MAX controllers rapidly flashing magenta (no CAN signal). Driver Station reported 0% CAN utilization.',
    diagnosis: 'Checked CAN_H (Green) and CAN_L (Yellow) continuity with multimeter across roboRIO and PDP. Found open circuit on CAN_H in elevator energy chain.',
    rootCause: 'CAN_H wire severed inside moving energy chain due to tight bend radius and lack of strain relief.',
    appliedSolution: 'Soldered broken wire, added high-flex silicone wire section inside energy chain, installed zip-tie strain relief anchors, and verified 60-ohm bus resistance.',
    resolvedAt: new Date(Date.now() - 3600000 * 24 * 3)
  },
  {
    teamNumber: 8066,
    matchNumber: 'Q08',
    eventCode: 'brba',
    category: 'CAN_BUS',
    priority: 'HIGH',
    status: 'RESOLVED',
    description: 'Intermittent CAN frame drops and high CAN error count (TX/RX errors > 50/sec) causing stutters in swerve drive module response.',
    diagnosis: 'Measured CAN bus resistance with main battery disconnected. Multimeter read 120 ohms instead of the required 60 ohms.',
    rootCause: 'Missing 120-ohm terminating resistor at the far end of the CAN bus (CANivore network tail).',
    appliedSolution: 'Enabled built-in 120-ohm termination resistor switch on the final CANivore device and confirmed 60-ohm total bus impedance.',
    resolvedAt: new Date(Date.now() - 3600000 * 24 * 4)
  },
  {
    teamNumber: 8882,
    matchNumber: 'Q22',
    eventCode: 'brba',
    category: 'CAN_BUS',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    description: 'Intake motor controller failed to instantiate in code. Phoenix Tuner showed CAN ID collision on ID 5.',
    diagnosis: 'Scanned CAN bus using REV Hardware Client. Found both Intake Roller SPARK MAX and Indexer SPARK MAX configured with CAN ID 5.',
    rootCause: 'Replacement SPARK MAX installed in pit was left at default CAN ID 5, conflicting with existing intake motor ID.',
    appliedSolution: 'Reassigned Indexer SPARK MAX to CAN ID 9 using REV Hardware Client and updated robot code mapping.',
    resolvedAt: new Date(Date.now() - 3600000 * 24 * 6)
  },
  {
    teamNumber: 9045,
    matchNumber: 'Q31',
    eventCode: 'brba',
    category: 'MECHANICAL',
    priority: 'HIGH',
    status: 'RESOLVED',
    description: 'Swerve module back-left wheel locked up during match. Motor drawing 70A current limit without rotating module.',
    diagnosis: 'Disassembled SDS MK4i swerve module drive column. Found aluminum metal shavings jammed in bevel gear teeth and missing pinion set screw.',
    rootCause: 'Loose motor pinion set screw backed out into gear housing and aluminum debris lodged between bevel gear teeth under high torque.',
    appliedSolution: 'Cleaned bevel gear teeth with wire brush, applied NLGI #2 lithium grease, replaced set screw with red Loctite 271, and torqued to spec.',
    resolvedAt: new Date(Date.now() - 3600000 * 24 * 1)
  },
  {
    teamNumber: 9046,
    matchNumber: 'Q11',
    eventCode: 'brba',
    category: 'PNEUMATICS',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    description: 'Pneumatic intake arm failed to actuate during autonomous mode. Working pressure gauge dropping from 60 PSI to 20 PSI in 30 seconds.',
    diagnosis: 'Performed soapy water bubble test on pneumatic tubing. Found leak at 1/4" push-to-connect fitting on double solenoid manifold.',
    rootCause: 'Polyurethane pneumatic tubing was cut at an angle with diagonal cutters, preventing O-ring seal inside PTC fitting.',
    appliedSolution: 'Re-cut pneumatic tubing squarely using a dedicated pneumatic tube cutter and verified system held 60 PSI stored pressure for over 15 minutes.',
    resolvedAt: new Date(Date.now() - 3600000 * 24 * 3)
  },
  {
    teamNumber: 9047,
    matchNumber: 'Q45',
    eventCode: 'brba',
    category: 'CODE_EXCEPTION',
    priority: 'CRITICAL',
    status: 'RESOLVED',
    description: 'Robot code crashed instantly upon enabling Autonomous mode. Driver Station displayed "Robot Code Red" uncaught java.lang.NullPointerException.',
    diagnosis: 'Examined Driver Station Console Log traceback. Exception thrown at `RobotContainer.java:84` inside Autonomous Command instantiation.',
    rootCause: 'PhotonVision target result was queried before vision camera object was initialized in `RobotContainer` constructor.',
    appliedSolution: 'Reordered initialization sequence in `RobotContainer.java`, added `Optional` null checks around AprilTag pose estimation results, and redeployed code.',
    resolvedAt: new Date(Date.now() - 3600000 * 24 * 2)
  },
  {
    teamNumber: 9085,
    matchNumber: 'Q14',
    eventCode: 'brba',
    category: 'CODE_EXCEPTION',
    priority: 'HIGH',
    status: 'RESOLVED',
    description: 'Robot driving in circles during field auto alignment. Gyro angle telemetry frozen at 0 degrees.',
    diagnosis: 'Inspected RioLog output. Found NavX-MXP SPI bus initialization timeout during `robotInit()`.',
    rootCause: 'Heavy blocking synchronous network call inside `robotInit()` delayed SPI bus initialization handshake beyond 500ms timeout.',
    appliedSolution: 'Refactored camera network table initialization into asynchronous thread executor (`CompletableFuture.runAsync`) and verified NavX gyro calibration.',
    resolvedAt: new Date(Date.now() - 3600000 * 24 * 5)
  },
  {
    teamNumber: 9110,
    matchNumber: 'Q03',
    eventCode: 'brba',
    category: 'DRIVER_STATION',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    description: 'Joysticks completely unresponsive when match started, though DS showed green link.',
    diagnosis: 'Checked Driver Station USB setup tab. Joystick 0 (Xbox Controller) had swapped slots with USB Camera controller (Index 1).',
    rootCause: 'Plugging in USB web camera before Xbox controller shifted controller index assignments in Windows Device Manager.',
    appliedSolution: 'Reordered USB controllers in FRC Driver Station setup tab (Index 0 set to Xbox Controller), locked slot order, and re-tested bindings.',
    resolvedAt: new Date(Date.now() - 3600000 * 24 * 4)
  },
  {
    teamNumber: 1156,
    matchNumber: 'Q40',
    eventCode: 'brba',
    category: 'MOTOR_CONTROLLER',
    priority: 'HIGH',
    status: 'RESOLVED',
    description: 'Left shooter flywheel oscillating violently and cutting out under high RPM target velocity setpoint.',
    diagnosis: 'Connected Phoenix Tuner X to Talon FX motor controller. Found motor firmware running legacy v23.0 while code was built against Phoenix v24.2 Pro API.',
    rootCause: 'Firmware version incompatibility caused velocity closed-loop PID controller calculation overflow in Talon FX onboard firmware.',
    appliedSolution: 'Flashed latest Talon FX v24.2 firmware via Phoenix Tuner X, re-tuned kP and kF feedforward gains, and validated stable 5500 RPM velocity hold.',
    resolvedAt: new Date(Date.now() - 3600000 * 24 * 1)
  },
  {
    teamNumber: 1860,
    matchNumber: 'Q52',
    eventCode: 'brba',
    category: 'FIELD_NETWORK',
    priority: 'CRITICAL',
    status: 'RESOLVED',
    description: 'Driver Station dropped FMS connection upon match enable on Red 2 driver station shelf.',
    diagnosis: 'Checked Ethernet cable connecting DS laptop to field team shelf switch. RJ45 clip was sheared off and cable connection was intermittent.',
    rootCause: 'Damaged RJ45 Ethernet patch cable dislodged from Driver Station shelf switch port when drive team bumped shelf during enable.',
    appliedSolution: 'Replaced shelf patch cable with heavy-duty snagless Cat6 cable, tested link integrity with field network diagnostic tool, and confirmed stable FMS connection.',
    resolvedAt: new Date(Date.now() - 3600000 * 24 * 2)
  }
];

async function seed() {
  try {
    await connectDB();
    console.log('Database connected for seeding...');

    // Get event details for brba
    const brbaEvent = await Event.findOne({ code: 'brba' });
    if (brbaEvent) {
      console.log(`Found event ${brbaEvent.name} (${brbaEvent.code}) with ${brbaEvent.teams.length} teams.`);
    }

    // Clear previous incidents to ensure clean event matching for brba
    await Incident.deleteMany({});
    console.log('Cleared existing incidents in DB.');

    // Find sample user to assign as reporter/assignee
    const adminUser = await User.findOne({ role: 'ADMIN' }) || await User.findOne();
    const ftaUser = await User.findOne({ role: 'FTA' }) || adminUser;

    let seededCount = 0;
    for (const inc of sampleFRCIncidents) {
      await Incident.create({
        ...inc,
        eventCode: 'brba',
        reportedBy: adminUser?._id || null,
        assignedTo: ftaUser?._id || null,
        closedBy: ftaUser?._id || null
      });
      seededCount++;
    }

    console.log(`Successfully seeded ${seededCount} sample FRC incidents for event 'brba' into Knowledge Base!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding knowledge base:', error);
    process.exit(1);
  }
}

seed();
