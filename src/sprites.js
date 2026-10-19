// Image loader with per-key fallback: Sprites.get(key) returns a loaded Image or null (caller draws rects).
const Sprites = {
  imgs: {}, ok: {},
  load(map) {
    if (typeof Image === "undefined") return;
    for (const [key, src] of Object.entries(map)) {
      const img = new Image();
      img.onload = () => { this.ok[key] = true; };
      img.onerror = () => { const opt = GAME_DATA.optionalSprites && GAME_DATA.optionalSprites.test(key); (opt ? console.info : console.warn)((opt ? "Optional sprite not found: " : "Sprite missing, using rect fallback: ") + src); };
      img.src = src; this.imgs[key] = img;
    }
  },
  get(key) { return this.ok[key] ? this.imgs[key] : null; },
  // draw whole image or a cell; returns false if not available
  draw(ctx, key, dx, dy, dw, dh, sx = 0, sy = 0, sw, sh) {
    const img = this.get(key); if (!img) return false;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sx, sy, sw ?? img.width, sh ?? img.height, Math.round(dx), Math.round(dy), dw, dh);
    return true;
  }
};
window.Sprites = Sprites;
