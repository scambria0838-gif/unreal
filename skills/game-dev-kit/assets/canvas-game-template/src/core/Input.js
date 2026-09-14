/**
 * Keyboard + optional injected tape. DOM-free unless attach() is called.
 */
export class Input {
  constructor() {
    this._down = new Set();
    this._pressed = new Set();
    this._listening = false;
    this._onKeyDown = (e) => this._handle(e, true);
    this._onKeyUp = (e) => this._handle(e, false);
  }

  attach(target) {
    if (this._listening || !target || typeof target.addEventListener !== "function") {
      return;
    }
    target.addEventListener("keydown", this._onKeyDown);
    target.addEventListener("keyup", this._onKeyUp);
    this._listening = true;
  }

  detach(target) {
    if (!this._listening || !target || typeof target.removeEventListener !== "function") {
      return;
    }
    target.removeEventListener("keydown", this._onKeyDown);
    target.removeEventListener("keyup", this._onKeyUp);
    this._listening = false;
  }

  inject(keys) {
    this._down = new Set(keys);
    for (const k of keys) this._pressed.add(k);
  }

  clearInjected() {
    this._down.clear();
  }

  down(name) {
    return this._down.has(name);
  }

  pressed(name) {
    return this._pressed.has(name);
  }

  axis() {
    let x = 0;
    let y = 0;
    if (this.down("left") || this.down("a")) x -= 1;
    if (this.down("right") || this.down("d")) x += 1;
    if (this.down("up") || this.down("w")) y -= 1;
    if (this.down("down") || this.down("s")) y += 1;
    if (x !== 0 && y !== 0) {
      const inv = 1 / Math.hypot(x, y);
      x *= inv;
      y *= inv;
    }
    return { x, y };
  }

  endFrame() {
    this._pressed.clear();
  }

  _handle(e, isDown) {
    const name = mapKey(e.key);
    if (!name) return;
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (isDown) {
      if (!this._down.has(name)) this._pressed.add(name);
      this._down.add(name);
    } else {
      this._down.delete(name);
    }
  }
}

function mapKey(key) {
  if (!key) return null;
  const k = String(key).toLowerCase();
  if (k === "arrowleft" || k === "a") return k === "a" ? "a" : "left";
  if (k === "arrowright" || k === "d") return k === "d" ? "d" : "right";
  if (k === "arrowup" || k === "w") return k === "w" ? "w" : "up";
  if (k === "arrowdown" || k === "s") return k === "s" ? "s" : "down";
  if (k === " " || k === "spacebar" || k === "space") return "dash";
  if (k === "enter") return "start";
  return null;
}
