// DEV-CHEATS (v0.4.3): Admin Cheats for testing pull rates. Strip before the final release (see README "Stripping dev cheats").
// Single switch: set DEV_CHEATS = false to hide the menu entry and disable all cheat input.
const DEV_CHEATS = true; // DEV-CHEATS
const DevCheats = { // DEV-CHEATS
  label: "Admin Cheats", maxLen: 24,
  codes: { gold: g => { Economy.addCoins(g, 50000); Save.save(g); return T("cheatGold"); } },
  enabled() { return !!window.DEV_CHEATS; },
  // Returns the message for an entered code. Trimmed, case-insensitive.
  apply(game, raw) { const f = this.codes[String(raw).trim().toLowerCase()]; return f ? f(game) : T("cheatUnknown"); }
};
// Canvas text box owned by the pause menu. While open, Input.textSink takes every keydown, so nothing reaches movement/menus/debug.
class CheatInput { // DEV-CHEATS
  constructor(menu) { this.menu = menu; this.text = ""; this.result = ""; this.done = false; Input.textSink = e => this.key(e); Input.held = {}; Input.pressed = {}; }
  close() { this.done = true; if (Input.textSink) Input.textSink = null; Input.held = {}; Input.pressed = {}; }
  key(e) {
    const k = e.key || "";
    if (this.result) { if (k === "Escape" || k === "Enter" || e.code === "Escape" || e.code === "Enter") this.close(); return; } // result shown: Enter/Esc closes
    if (k === "Escape" || e.code === "Escape") return this.close();
    if (k === "Enter" || e.code === "Enter") { this.result = DevCheats.apply(this.menu.game, this.text); return; }
    if (k === "Backspace" || e.code === "Backspace") { this.text = this.text.slice(0, -1); return; }
    if (k.length === 1 && this.text.length < DevCheats.maxLen) this.text += k;
  }
  render(ctx) { UI.frame(ctx, 160, 200, 400, 130); ctx.fillStyle = UI.textColor(); ctx.font = "16px monospace"; ctx.fillText(DevCheats.label, 184, 232);
    ctx.font = "14px monospace";
    if (this.result) { ctx.fillText(this.result, 184, 268); ctx.font = "12px monospace"; ctx.fillText("Enter/Esc: close", 184, 312); }
    else { ctx.fillText("> " + this.text + "_", 184, 268); ctx.font = "12px monospace"; ctx.fillText("Type a code, Enter to apply, Esc to cancel", 184, 312); } }
}
Object.assign(window, { DEV_CHEATS, DevCheats, CheatInput }); // DEV-CHEATS
