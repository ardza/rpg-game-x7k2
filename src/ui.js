// 9-slice frame from assets/style2/ui/dialog_9slice_48.png (16px corners, drawn at 1x); rect fallback.
const UI = {
  key: "ui_dialog", slice: 16, scale: 1,
  frame(ctx, x, y, w, h) {
    const img = Sprites.get(this.key);
    if (!img) { ctx.fillStyle = "#111"; ctx.fillRect(x, y, w, h); ctx.strokeStyle = "#666"; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2); return; }
    const s = this.slice, d = s * this.scale, W = img.width, H = img.height;
    ctx.imageSmoothingEnabled = false;
    const cols = [[0, s, x, d], [s, W - 2 * s, x + d, w - 2 * d], [W - s, s, x + w - d, d]];
    const rows = [[0, s, y, d], [s, H - 2 * s, y + d, h - 2 * d], [H - s, s, y + h - d, d]];
    for (const [sy, sh, dy, dh] of rows) for (const [sx, sw, dx, dw] of cols) ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  },
  // word-wrap by measureText; falls back to char count when measureText is unavailable (tests)
  wrap(ctx, text, maxW) {
    const width = w => (ctx.measureText && ctx.measureText(w) && ctx.measureText(w).width) || w.length * 9;
    const out = []; let line = "";
    for (const word of String(text).split(" ")) { const t = line ? line + " " + word : word; if (width(t) > maxW && line) { out.push(line); line = word; } else line = t; }
    if (line) out.push(line); return out;
  },
  textColor() { return Sprites.get(this.key) ? "#1a1423" : "#fff"; }
};
window.UI = UI;
