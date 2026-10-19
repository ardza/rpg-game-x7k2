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
// v0.4.4 fix (Commissioner: stuck box on phone): a real <input> sits over the box on phone AND PC (tap the box to bring up the keyboard),
// a Cancel hit area sits over the hint line, touch X/menu always close, touch Z applies, Esc always closes, X key closes when the box is empty.
// Losing focus never closes the box and never strands it: keys still reach it through textSink.
const CHEAT_BOX = { x: 160, y: 200, w: 400, h: 130, field: { x: 176, y: 248, w: 368, h: 30 }, cancel: { x: 430, y: 292, w: 124, h: 30 } }; // canvas px (720x528)
class CheatInput { // DEV-CHEATS
  constructor(menu) { this.menu = menu; this.text = ""; this.result = ""; this.done = false; Input.textSink = e => this.key(e); Input.textAction = k => this.action(k); Input.held = {}; Input.pressed = {};
    this.touch = !!(window.Touch && Touch.enabled);
    if (typeof document !== "undefined" && document.createElement && document.body && document.body.appendChild) this.openDom(); }
  // Overlay positioned over the canvas box; follows resize/rotation.
  openDom() { const cv = document.getElementById && document.getElementById("game"); if (!cv || !cv.getBoundingClientRect) return;
    const root = document.createElement("div"); root.id = "cheat-ui"; root.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;z-index:20";
    const el = document.createElement("input"); el.id = "cheat-input"; el.type = "text"; el.autocomplete = "off"; el.autocapitalize = "off"; el.spellcheck = false; el.maxLength = DevCheats.maxLen;
    el.setAttribute("autocorrect", "off"); el.setAttribute("enterkeyhint", "go");
    el.style.cssText = "position:absolute;opacity:0.01;font-size:16px;border:0;padding:0;margin:0;background:transparent;color:transparent;caret-color:transparent;outline:none"; // 16px: no iOS focus zoom
    const cancel = document.createElement("div"); cancel.id = "cheat-cancel"; cancel.style.cssText = "position:absolute;cursor:pointer;touch-action:none";
    el.addEventListener("input", () => { if (!this.result) this.text = el.value.slice(0, DevCheats.maxLen); else el.value = this.text; });
    el.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Enter") { e.preventDefault(); this.submit(); } else if (e.key === "Escape") { e.preventDefault(); this.close(); } else if ((e.key === "x" || e.key === "X") && (this.result || !el.value)) { e.preventDefault(); this.close(); } else if (this.result) { e.preventDefault(); } }); // X backs out of an empty box or a result
    el.addEventListener("keyup", e => e.stopPropagation());
    for (const ev of ["pointerdown", "touchstart", "mousedown"]) el.addEventListener(ev, e => { e.stopPropagation && e.stopPropagation(); }, { passive: true });
    el.addEventListener("click", () => { if (this.result) this.close(); });
    cancel.addEventListener("pointerdown", e => { e.preventDefault(); e.stopPropagation(); this.close(); });
    root.appendChild(el); root.appendChild(cancel); document.body.appendChild(root);
    this.place = () => { const r = cv.getBoundingClientRect(), k = r.width / 720, put = (n, b) => { n.style.left = (r.left + b.x * k) + "px"; n.style.top = (r.top + b.y * k) + "px"; n.style.width = (b.w * k) + "px"; n.style.height = (b.h * k) + "px"; };
      put(el, CHEAT_BOX.field); put(cancel, CHEAT_BOX.cancel); };
    this.place(); window.addEventListener("resize", this.place); this.root = root; this.dom = el; this.cancelEl = cancel;
    try { el.focus(); } catch (e) {} }
  focused() { return !!this.dom && typeof document !== "undefined" && document.activeElement === this.dom; }
  submit() { if (this.result) return this.close(); if (this.dom) this.text = this.dom.value.slice(0, DevCheats.maxLen); this.result = DevCheats.apply(this.menu.game, this.text); if (this.dom) this.dom.value = this.text; }
  // Touch buttons while the box is open (Input.press -> textAction): X / menu close, Z applies (or closes the result).
  action(k) { if (k === "b" || k === "menu") return this.close(); if (k === "a") return this.submit(); }
  close() { if (this.done) return; this.done = true;
    if (this.root) { const r = this.root; this.root = null; this.dom = null; try { window.removeEventListener("resize", this.place); r.querySelector && r.querySelector("input") && r.querySelector("input").blur(); r.remove(); } catch (e) {} } /* DEV-CHEATS */
    if (Input.textSink) Input.textSink = null; Input.textAction = null; Input.held = {}; Input.pressed = {}; }
  // Keys that reach the window (box not focused, or no DOM input): handled here and mirrored into the input.
  key(e) {
    if (this.focused()) return; // the focused <input> handles typing, Enter and Esc itself
    const k = e.key || "";
    if (k === "Escape" || e.code === "Escape") return this.close();
    if (this.result) { if (k === "Enter" || e.code === "Enter" || e.code === "KeyX") this.close(); return; } // result shown: Enter/Esc/X closes
    if (k === "Enter" || e.code === "Enter") return this.submit();
    if ((e.code === "KeyX" || k === "x" || k === "X") && !this.text) return this.close(); // X on an empty box backs out
    if (k === "Backspace" || e.code === "Backspace") this.text = this.text.slice(0, -1);
    else if (k.length === 1 && this.text.length < DevCheats.maxLen) this.text += k;
    if (this.dom) { this.dom.value = this.text; try { this.dom.focus(); } catch (x) {} }
  }
  render(ctx) { const B = CHEAT_BOX; UI.frame(ctx, B.x, B.y, B.w, B.h); ctx.fillStyle = UI.textColor(); ctx.font = "16px monospace"; ctx.fillText(DevCheats.label, 184, 232);
    ctx.font = "14px monospace";
    if (this.result) ctx.fillText(this.result, 184, 268); else { ctx.strokeStyle = UI.textColor(); ctx.lineWidth = 2; ctx.strokeRect(B.field.x, B.field.y, B.field.w, B.field.h); ctx.fillText("> " + this.text + (Math.floor(Date.now() / 500) % 2 ? "_" : " "), 184, 268); }
    ctx.font = "12px monospace";
    const hint = this.result ? (this.touch ? "Z/X: close" : "Enter/Esc: close") : (this.touch ? "Tap the box to type. Z: apply" : "Type a code. Enter: apply");
    ctx.fillText(hint, 184, 312); ctx.fillText(this.result ? "[ Close ]" : "[ Cancel ]", 452, 312); }
}
Object.assign(window, { DEV_CHEATS, DevCheats, CheatInput, CHEAT_BOX }); // DEV-CHEATS
