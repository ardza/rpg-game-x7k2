// Keyboard state: held keys + one-shot "pressed" edges consumed per frame.
const Input = {
  held: {}, pressed: {},
  map: { ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left",
         ArrowRight: "right", KeyD: "right", KeyZ: "a", Enter: "a", Space: "a", KeyX: "b", Escape: "b", Backspace: "b", KeyM: "menu" },
  init(target) {
    target.addEventListener("keydown", e => { const k = this.map[e.code]; if (!k) return; e.preventDefault(); if (!this.held[k]) this.pressed[k] = true; this.held[k] = true; });
    target.addEventListener("keyup", e => { const k = this.map[e.code]; if (k) this.held[k] = false; });
  },
  isDown(k) { return !!this.held[k]; },
  wasPressed(k) { return !!this.pressed[k]; },
  endFrame() { this.pressed = {}; }
};
window.Input = Input;
