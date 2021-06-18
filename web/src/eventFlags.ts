/**
 * The indices of OrderedEventFlags that are string values.
 * Indicates the data should not be parsed to int.
 */
export const EventFlagStringIndices = [4, 5, 22, 24];

// TODO: Make these match the values in the web state
// so that updating the state can be done without checking.
// The strings can be anything (including minified)
// but the order matters.
// Also strip some of these out, once the event flags
// that are sent from the cpp is defined.
export const OrderedEventFlags = [
  "pos",
  "tPos",
  "speed",
  "accel",
  "deviceName",
  "mdnsName",
  "emitSyncData",
  "pinStep",
  "pinDir",
  "pinEn",
  "pinSleep",
  "pinReset",
  "pinMs1",
  "pinMs2",
  "pinMs3",
  "pinHomeSw",
  "cordLength",
  "cordDiameter",
  "axisDiameter",
  "stepsPerRev",
  "resolution",
  "mqttEnabled",
  "mqttHost",
  "mqttPort",
  "mqttTopic",
  "moveUp",
  "moveDown",
  "moveStop",
  "tick",
];
