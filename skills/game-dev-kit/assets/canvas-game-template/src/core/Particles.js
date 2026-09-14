import { CFG } from "../config.js";

export class Particles {
  constructor() {
    this.items = [];
  }

  emit(x, y, { count = 8, color = "#f4d35e", speed = 180, life = 0.35 } = {}) {
    const n = Math.min(count, CFG.particleCap - this.items.length);
    for (let i = 0; i < n; i += 1) {
      const a = (Math.PI * 2 * i) / Math.max(1, count);
      this.items.push({
        x,
        y,
        vx: Math.cos(a) * speed * (0.4 + (i % 3) * 0.2),
        vy: Math.sin(a) * speed * (0.4 + (i % 3) * 0.2),
        life,
        maxLife: life,
        color,
      });
    }
  }

  step(dt) {
    const next = [];
    for (const p of this.items) {
      p.life -= dt;
      if (p.life <= 0) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 420 * dt;
      next.push(p);
    }
    this.items = next;
  }

  draw(ctx) {
    if (!ctx) return;
    for (const p of this.items) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
  }
}
