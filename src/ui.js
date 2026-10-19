// v0.4.5.1 holo UI: 9-slice assets/style2/ui/holo/holo_9slice_48.png (16px corners) + scanlines; falls back to the old dialog frame, then a rect.
const UI = {
  key: "ui_holo", oldKey: "ui_dialog", slice: 16, scale: 1,
  H: { text: "#d8f6ff", accent: "#3ff0e0", muted: "#7fa9c4", bar: "rgba(63,240,224,0.18)", glass: "#0a1222" }, // assets/style2/ui/holo/holo.json
  holo() { return !!Sprites.get(this.key); },
  frame(ctx, x, y, w, h) {
    const img = Sprites.get(this.key) || Sprites.get(this.oldKey);
    if (!img) { ctx.fillStyle = "#111"; ctx.fillRect(x, y, w, h); ctx.strokeStyle = "#666"; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2); return; }
    const s = this.slice, d = s * this.scale, W = img.width, H = img.height;
    ctx.imageSmoothingEnabled = false;
    const cols = [[0, s, x, d], [s, W - 2 * s, x + d, w - 2 * d], [W - s, s, x + w - d, d]];
    const rows = [[0, s, y, d], [s, H - 2 * s, y + d, h - 2 * d], [H - s, s, y + h - d, d]];
    for (const [sy, sh, dy, dh] of rows) for (const [sx, sw, dx, dw] of cols) ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    if (this.holo()) this.scan(ctx, x + 3, y + 3, w - 6, h - 6);
  },
  scan(ctx, x, y, w, h) { const s = Sprites.get("ui_holo_scan"); if (!s || !ctx.createPattern || w <= 0 || h <= 0) return;
    if (this._patCtx !== ctx) { this._pat = ctx.createPattern(s, "repeat"); this._patCtx = ctx; } if (!this._pat) return;
    const f = ctx.fillStyle; ctx.fillStyle = this._pat; ctx.fillRect(x, y, w, h); ctx.fillStyle = f; },
  fs(ctx) { return parseInt(String(ctx.font).replace(/^bold /, "")) || 16; },
  // menu row: highlight bar + chevron when selected (holo); old "> " prefix otherwise. x = where the prefix starts.
  item(ctx, label, x, y, sel, w) {
    if (!this.holo()) return ctx.fillText((sel ? "> " : "  ") + label, x, y);
    const fs = this.fs(ctx), f = ctx.fillStyle;
    if (sel) { const bh = Math.round(fs * 1.45), by = y - Math.round(fs * 1.05), bw = w || this.textW(ctx, "  " + label) + 16;
      ctx.fillStyle = this.H.bar; ctx.fillRect(x - 8, by, bw, bh); ctx.fillStyle = this.H.accent; ctx.fillRect(x - 8, by, 3, bh); this.chevron(ctx, x + 1, y, fs); }
    ctx.fillStyle = sel ? this.H.text : this.H.muted; ctx.fillText("  " + label, x, y); ctx.fillStyle = f; },
  chevron(ctx, x, y, fs) { const img = Sprites.get("ui_holo_chevron"), h = Math.round(fs * 0.9), w = Math.round(h * 16 / 22);
    if (img) { ctx.imageSmoothingEnabled = false; ctx.drawImage(img, x, y - h + Math.round(fs * 0.1), w, h); } else ctx.fillText(">", x, y); },
  // "Z to continue" marker: small chevron in holo, else the old arrow
  arrow(ctx, x, y) { if (!this.holo()) { ctx.font = this.font("arrow"); return ctx.fillText("▶", x, y); } this.chevron(ctx, x, y, 18); },
  header(ctx, x, y, w, label) { if (!this.holo()) return 0; const img = Sprites.get("ui_holo_header"), c = 8, h = 24;
    if (img) { ctx.imageSmoothingEnabled = false; ctx.drawImage(img, 0, 0, c, h, x, y, c, h); ctx.drawImage(img, c, 0, img.width - 2 * c, h, x + c, y, w - 2 * c, h); ctx.drawImage(img, img.width - c, 0, c, h, x + w - c, y, c, h); }
    const f = ctx.fillStyle, fo = ctx.font; ctx.fillStyle = this.H.accent; ctx.font = this.font("label", true); ctx.fillText(label, x + 12, y + 17); ctx.fillStyle = f; ctx.font = fo; return h; },
  // open blip: ~120ms fade/scale-in, render-only (input is never blocked). Restarts when a box hasn't been drawn for 100ms.
  blipMs: 120, _seen: {},
  blip(key) { const now = (window.performance && performance.now()) || Date.now(); let s = this._seen[key]; if (!s || now - s.last > 100) s = this._seen[key] = { t0: now }; s.last = now; return Math.min(1, (now - s.t0) / this.blipMs); },
  blipIn(ctx, key, cx, cy) { const p = this.blip(key); if (p >= 1 || !this.holo()) return false; const sy = 0.88 + 0.12 * p; ctx.save(); ctx.globalAlpha = 0.4 + 0.6 * p; ctx.translate(cx, cy); ctx.scale(1, sy); ctx.translate(-cx, -cy); return true; },
  // word-wrap by measureText; falls back to char count when measureText is unavailable (tests)
  wrap(ctx, text, maxW) {
    const width = w => (ctx.measureText && ctx.measureText(w) && ctx.measureText(w).width) || w.length * 9;
    const out = []; let line = "";
    for (const word of String(text).split(" ")) { const t = line ? line + " " + word : word; if (width(t) > maxW && line) { out.push(line); line = word; } else line = t; }
    if (line) out.push(line); return out;
  },
  // v0.4.5 text sizes (Commissioner: bigger text, readable at 390x844). Change sizes here only.
  sizes: { dialog: 22, battle: 22, menu: 22, bar: 22, barSmall: 18, label: 13, labelSmall: 11, small: 16, arrow: 18, shop: 16 },
  font(kind, bold) { return (bold ? "bold " : "") + (this.sizes[kind] || 16) + "px monospace"; },
  textW(ctx, t) { return (ctx.measureText && ctx.measureText(t) && ctx.measureText(t).width) || String(t).length * 13; },
  textColor() { return this.holo() ? this.H.text : Sprites.get(this.oldKey) ? "#1a1423" : "#fff"; },
  accent() { return this.holo() ? this.H.accent : this.textColor(); }
};
window.UI = UI;
