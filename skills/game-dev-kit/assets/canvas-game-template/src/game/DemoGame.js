import { CFG } from "../config.js";

/**
 * Owns states, collisions, HUD data, and the world interface.
 * DOM-free. audio / particles / input may be null.
 */
export class DemoGame {
  constructor({ headless = false, audio = null, particles = null, input = null, camera = null } = {}) {
    this.headless = headless;
    this.audio = audio;
    this.particles = particles;
    this.input = input;
    this.camera = camera;
    this.state = "menu";
    this.hitStop = 0;
    this.squash = 1;
    this.resetPlay();
  }

  resetPlay() {
    this.player = {
      x: CFG.player.startX,
      y: CFG.player.startY,
      vx: 0,
      vy: 0,
      hp: CFG.player.hp,
      dashT: 0,
      dashCd: 0,
      iFrames: 0,
      facingX: 1,
      facingY: 0,
    };
    this.tokens = CFG.tokens.map((t) => ({ x: t.x, y: t.y, taken: false }));
    this.hazard = { x: CFG.hazard.x, y: CFG.hazard.y, r: CFG.hazard.r };
    this.collected = 0;
    this.time = 0;
    this.outcome = null;
    this.hitStop = 0;
    this.squash = 1;
  }

  world() {
    return {
      player: this.player,
      tokens: this.tokens,
      hazard: this.hazard,
      audio: this.audio,
      particles: this.particles,
      state: this.state,
    };
  }

  start() {
    this.state = "play";
    this.resetPlay();
  }

  step(dt) {
    if (this.state === "menu") {
      if (this.input?.pressed("start") || this.input?.pressed("dash")) {
        this.start();
      }
      this.input?.endFrame();
      return;
    }

    if (this.state === "win" || this.state === "lose") {
      if (this.input?.pressed("start")) this.start();
      this.input?.endFrame();
      return;
    }

    this.time += dt;
    if (this.hitStop > 0) {
      this.hitStop = Math.max(0, this.hitStop - dt);
      this.camera?.step(dt, this.player, this.player);
      this.particles?.step(dt);
      this.input?.endFrame();
      return;
    }

    this._movePlayer(dt);
    this._collectTokens();
    this._hazard();

    this.squash += (1 - this.squash) * Math.min(1, dt * 12);
    this.camera?.step(dt, this.player, this.player);
    this.particles?.step(dt);
    this.input?.endFrame();
  }

  assertSane() {
    const bodies = [this.player, this.hazard, ...this.tokens];
    for (const b of bodies) {
      if (!Number.isFinite(b.x) || !Number.isFinite(b.y)) {
        throw new Error("NaN in simulation");
      }
      if (
        b.x < -CFG.worldMargin ||
        b.y < -CFG.worldMargin ||
        b.x > CFG.width + CFG.worldMargin ||
        b.y > CFG.height + CFG.worldMargin
      ) {
        throw new Error("entity escaped world bounds");
      }
    }
    if (this.player && (!Number.isFinite(this.player.vx) || !Number.isFinite(this.player.vy))) {
      throw new Error("NaN velocity");
    }
  }

  draw(ctx) {
    if (!ctx) return;
    ctx.fillStyle = CFG.clear;
    ctx.fillRect(0, 0, CFG.width, CFG.height);

    const off = this.camera?.offset() ?? { x: 0, y: 0 };
    ctx.save();
    ctx.translate(off.x, off.y);

    ctx.fillStyle = "#3d5a80";
    ctx.beginPath();
    ctx.arc(this.hazard.x, this.hazard.y, this.hazard.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f4d35e";
    for (const t of this.tokens) {
      if (t.taken) continue;
      ctx.beginPath();
      ctx.arc(t.x, t.y, CFG.tokenR, 0, Math.PI * 2);
      ctx.fill();
    }

    const p = this.player;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(this.squash, 2 - this.squash);
    ctx.fillStyle = p.iFrames > 0 ? "#9b5de5" : "#00f5d4";
    ctx.fillRect(-CFG.player.r, -CFG.player.r, CFG.player.r * 2, CFG.player.r * 2);
    ctx.restore();

    this.particles?.draw(ctx);
    ctx.restore();

    ctx.fillStyle = "#e8eef7";
    ctx.font = "16px sans-serif";
    if (this.state === "menu") {
      ctx.fillText(CFG.title, 24, 32);
      ctx.fillText("Enter / Space to start  —  arrows/WASD move  —  Space dash", 24, 56);
    } else if (this.state === "play") {
      ctx.fillText(`tokens ${this.collected}/${CFG.winTokens}   hp ${this.player.hp}`, 24, 32);
    } else if (this.state === "win") {
      ctx.fillText("WIN — Enter to retry", 24, 32);
    } else {
      ctx.fillText("LOSE — Enter to retry", 24, 32);
    }
  }

  _movePlayer(dt) {
    const p = this.player;
    const axis = this.input?.axis() ?? { x: 0, y: 0 };
    if (axis.x !== 0 || axis.y !== 0) {
      p.facingX = axis.x;
      p.facingY = axis.y;
    }

    p.dashCd = Math.max(0, p.dashCd - dt);
    p.iFrames = Math.max(0, p.iFrames - dt);

    if (this.input?.pressed("dash") && p.dashCd <= 0) {
      p.dashT = CFG.player.dashDuration;
      p.dashCd = CFG.player.dashCooldown;
      p.iFrames = CFG.player.dashIFrames;
      this.squash = 1.22;
      this.audio?.beep?.({ freq: 200, freqEnd: 80, dur: 0.08, type: "triangle" });
    }

    if (p.dashT > 0) {
      p.dashT = Math.max(0, p.dashT - dt);
      const mag = Math.hypot(p.facingX, p.facingY) || 1;
      p.vx = (p.facingX / mag) * CFG.player.dashSpeed;
      p.vy = (p.facingY / mag) * CFG.player.dashSpeed;
    } else {
      p.vx += axis.x * CFG.player.accel * dt;
      p.vy += axis.y * CFG.player.accel * dt;
      const damp = Math.exp(-CFG.player.friction * dt);
      p.vx *= damp;
      p.vy *= damp;
      const speed = Math.hypot(p.vx, p.vy);
      if (speed > CFG.player.maxSpeed) {
        const s = CFG.player.maxSpeed / speed;
        p.vx *= s;
        p.vy *= s;
      }
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.x = clamp(p.x, CFG.player.r, CFG.width - CFG.player.r);
    p.y = clamp(p.y, CFG.player.r, CFG.height - CFG.player.r);
  }

  _collectTokens() {
    const p = this.player;
    for (const t of this.tokens) {
      if (t.taken) continue;
      if (dist(p.x, p.y, t.x, t.y) <= CFG.player.r + CFG.tokenR) {
        t.taken = true;
        this.collected += 1;
        this.particles?.emit?.(t.x, t.y, { color: "#f4d35e", count: 8 });
        this.audio?.pickup?.();
      }
    }
    if (this.collected >= CFG.winTokens) {
      this.state = "win";
      this.outcome = "win";
      this.audio?.win?.();
    }
  }

  _hazard() {
    const p = this.player;
    if (p.iFrames > 0) return;
    if (dist(p.x, p.y, this.hazard.x, this.hazard.y) <= CFG.player.r + this.hazard.r) {
      p.hp -= CFG.hazard.dmg;
      p.iFrames = CFG.hit.mercyIFrames;
      this.hitStop = CFG.hit.hitStop;
      this.squash = 0.78;
      this.camera?.addTrauma?.(CFG.hit.bodyTrauma);
      this.particles?.emit?.(p.x, p.y, { color: "#ef476f", count: 12 });
      this.audio?.hit?.();
      if (p.hp <= 0) {
        this.state = "lose";
        this.outcome = "lose";
        this.audio?.lose?.();
      }
    }
  }
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}
