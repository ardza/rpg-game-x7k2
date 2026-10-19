const TILE_SRC = 48, TILE_SCALE = 1, TILE = TILE_SRC * TILE_SCALE; // style2: 48x48 tiles drawn at 1x (v0.3.1)
const PXK = TILE / 16; // scale for rect fallbacks drawn on a 16-unit grid
// Tileset loader: TileSet.ready true only after a successful load; otherwise rect fallback.
const TileSet = {
  img: null, ready: false, failed: false,
  load(def) {
    if (!def || typeof Image === "undefined") { this.failed = true; return; }
    const img = new Image();
    img.onload = () => { this.ready = img.width >= def.tileSize && img.height >= def.tileSize; };
    img.onerror = () => { this.failed = true; console.warn("Tileset failed to load, using colored rects:", def.src); };
    img.src = def.src; this.img = img; this.def = def;
  }
};
class TileMap {
  constructor(def) {
    this.def = def; this.width = def.width; this.height = def.height;
    this.grid = def.room ? def.tiles.map(r => r.slice()) : def.rows.map(r => r.split("").map(c => /\d/.test(c) ? Number(c) : c)) /* v0.4.4: letters = new tile ids */; // rooms: cell ids into interior_48.png
    this.blocked = new Set((def.decor || []).filter(d => d.solid).map(d => d.x + "," + d.y));
    if (this.grid.length !== this.height || this.grid.some(r => r.length !== this.width)) throw new Error("Map size mismatch: " + def.name);
  }
  roomInfo(x, y) { const out = x < 0 || y < 0 || x >= this.width || y >= this.height; return { name: out ? "wall" : this.def.cells[this.grid[y][x]], solid: out || this.def.collision[y][x] === 1, encounter: false }; }
  tileAt(x, y) { if (x < 0 || y < 0 || x >= this.width || y >= this.height) return 1; return this.grid[y][x]; }
  info(x, y) { if (this.def.room) return this.roomInfo(x, y); return GAME_DATA.tiles[this.tileAt(x, y)]; }
  gone(d) { return !!(d.group && this.defeated && this.defeated.includes(d.group)); } // v0.4.0: beaten enemy groups vanish
  isSolid(x, y) { return this.info(x, y).solid || (this.blocked.has(x + "," + y) && !(this.def.decor || []).some(d => d.solid && d.x === x && d.y === y && this.gone(d))); }
  renderDecor(ctx, camX, camY) {
    for (const d of this.def.decor || []) {
      const x = d.x * TILE - camX, y = d.y * TILE - camY;
      if (d.hidden || this.gone(d)) continue;
      if (d.cell) { const s = d.cell * TILE_SCALE; if (Sprites.draw(ctx, d.sprite, x + TILE / 2 - s / 2, y + TILE - s, s, s, (d.col || 0) * d.cell, d.row * d.cell, d.cell, d.cell)) continue; ctx.fillStyle = d.color || "#7a3b8f"; ctx.fillRect(x + 8, y + 4, TILE - 16, TILE - 8); }
      else if (!Sprites.draw(ctx, d.sprite, x, y + TILE - d.h * TILE_SCALE, d.w * TILE_SCALE, d.h * TILE_SCALE)) { ctx.fillStyle = "#9a6b3f"; ctx.fillRect(x + 8, y + 8, TILE - 16, TILE - 16); }
    }
  }
  isEncounter(x, y) { return !!this.info(x, y).encounter; }
  // Rooms: 720x528 background (15x11 cells); else interior_48.png cells; else rects (solid darker).
  renderRoom(ctx, camX, camY) {
    if (Sprites.draw(ctx, this.def.bgKey, -camX, -camY, this.width * TILE, this.height * TILE)) return;
    for (let y = 0; y < this.height; y++) for (let x = 0; x < this.width; x++) {
      if (Sprites.draw(ctx, "interior", x * TILE - camX, y * TILE - camY, TILE, TILE, this.grid[y][x] * 48, 0, 48, 48)) continue;
      ctx.fillStyle = this.def.collision[y][x] ? "#6b5a7a" : "#e8dcc4"; ctx.fillRect(x * TILE - camX, y * TILE - camY, TILE, TILE);
    }
  }
  render(ctx, camX, camY) {
    if (this.def.room) return this.renderRoom(ctx, camX, camY);
    for (let y = 0; y < this.height; y++) for (let x = 0; x < this.width; x++) {
      const t = GAME_DATA.tiles[this.grid[y][x]];
      if (TileSet.ready && t.frame != null) {
        const ts = TileSet.def.tileSize, cell = f => ctx.drawImage(TileSet.img, (f % TileSet.def.columns) * ts, Math.floor(f / TileSet.def.columns) * ts, ts, ts, x * TILE - camX, y * TILE - camY, TILE, TILE);
        ctx.imageSmoothingEnabled = false;
        if (t.base != null) cell(GAME_DATA.tiles[t.base].frame); // transparent decor tiles (fence, shed) sit on grass
        cell(t.frame);
        continue;
      }
      ctx.fillStyle = t.color; ctx.fillRect(x * TILE - camX, y * TILE - camY, TILE, TILE);
      if (t.encounter) { ctx.fillStyle = "#246e2d"; ctx.fillRect(x * TILE - camX + 3 * PXK, y * TILE - camY + 4 * PXK, 2 * PXK, 7 * PXK); ctx.fillRect(x * TILE - camX + 10 * PXK, y * TILE - camY + 6 * PXK, 2 * PXK, 6 * PXK); }
    }
  }
}
Object.assign(window, { TileMap, TileSet, TILE, TILE_SRC, TILE_SCALE, PXK });
