import { CFG } from "../config.js";

export class Camera {
  constructor() {
    this.x = CFG.width * 0.5;
    this.y = CFG.height * 0.5;
    this.trauma = 0;
    this.phase = 0;
  }

  addTrauma(amount) {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  step(dt, target, velocity) {
    const leadX = (velocity?.x ?? 0) * CFG.camera.velocityLead;
    const leadY = (velocity?.y ?? 0) * CFG.camera.velocityLead;
    const tx = (target?.x ?? this.x) + leadX;
    const ty = (target?.y ?? this.y) + leadY;
    const k = 1 - Math.exp(-CFG.camera.stiffness * dt);
    this.x += (tx - this.x) * k;
    this.y += (ty - this.y) * k;
    this.trauma = Math.max(0, this.trauma - CFG.camera.traumaDecay * dt);
    this.phase += dt * 28;
  }

  offset() {
    const mag = this.trauma * this.trauma * CFG.camera.shakeMax;
    return {
      x: Math.cos(this.phase) * mag,
      y: Math.sin(this.phase * 1.17) * mag,
    };
  }
}
