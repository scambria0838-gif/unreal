/** Every tunable number lives here. No magic numbers in entity code. */
export const CFG = {
  title: "Canvas Game Template",
  step: 1 / 60,
  dtClamp: 0.1,
  maxCatchUp: 5,
  width: 960,
  height: 540,
  letterbox: "#0b0d12",
  clear: "#12161f",

  player: {
    startX: 160,
    startY: 270,
    r: 14,
    hp: 3,
    accel: 2800,
    maxSpeed: 335,
    friction: 7.0,
    dashDuration: 0.2,
    dashCooldown: 1.2,
    dashSpeed: 980,
    dashIFrames: 0.22,
  },

  camera: {
    stiffness: 6.5,
    velocityLead: 0.15,
    aimLeadMax: 130,
    traumaDecay: 2.2,
    shakeMax: 22,
  },

  hit: {
    hitStop: 0.05,
    mercyIFrames: 0.35,
    bodyTrauma: 0.22,
    critTrauma: 0.5,
  },

  tokens: [
    { x: 420, y: 180 },
    { x: 720, y: 360 },
    { x: 300, y: 420 },
  ],
  tokenR: 10,
  winTokens: 3,

  hazard: { x: 820, y: 100, r: 28, dmg: 3 },

  worldMargin: 64,
  particleCap: 128,
};
