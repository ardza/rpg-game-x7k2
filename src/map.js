// v0.4.7: world at native 64px tiles (GAME_DATA.world). 48px art that has no 64px version yet is drawn at TILE_SCALE = 64/48.
const TILE = GAME_DATA.world.tile, TILE_SRC = GAME_DATA.world.legacyTile, TILE_SCALE = TILE / TILE_SRC;
const PXK = TILE / 16; // scale for rect fallbacks drawn on a 16-unit grid
// Tileset loader: ready only after a successful load; otherwise rect fallback. TileSet = 64px atlas, TileSet48 = old atlas (fallback cells).
const makeTileSet = () => ({
  img: null, ready: false, failed: false, def: null,
  load(def) {
    if (!def || typeof Image === "undefined") { this.failed = true; return; }
    const img = new Image();
    img.onload = () => { this.ready = img.width >= def.tileSize && img.height >= def.tileSize; };
    img.onerror = () => { this.failed = true; console.warn("Tileset failed to load, using colored rects:", def.src); };
    img.src = def.src; this.img = img; this.def = def;
  },
  // draw cell f at (x, y) as a TILE x TILE square
  cell(ctx, f, x, y) { const d = this.def, ts = d.tileSize; ctx.imageSmoothingEnabled = false; ctx.drawImage(this.img, (f % d.columns) * ts, Math.floor(f / d.columns) * ts, ts, ts, Math.round(x), Math.round(y), TILE, TILE); }
});
const TileSet = makeTileSet(), TileSet48 = makeTileSet();
// One ground cell: pending cells (exit roads) prefer tiles64/<name>_64.png, else the 48px cell scaled up; else the 64px atlas.
function drawCell(ctx, f, x, y) {
  const pend = GAME_DATA.world.pendingCells[f];
  if (pend) { if (Sprites.draw(ctx, "tile64_" + pend, x, y, TILE, TILE)) return true; if (TileSet48.ready) { TileSet48.cell(ctx, f, x, y); return true; } }
  if (TileSet.ready) { TileSet.cell(ctx, f, x, y); return true; }
  if (TileSet48.ready) { TileSet48.cell(ctx, f, x, y); return true; }
  return false;
}
class TileMap {
  constructor(def) {
    this.def = def; this.width = def.width; this.height = def.height;
    this.grid = def.room ? def.tiles.map(r => r.slice()) : def.rows.map(r => r.split("").map(c => /\d/.test(c) ? Number(c) : c)) /* v0.4.4: letters = new tile ids */; // rooms: cell ids into interior_48.png
    this.blocked = new Set((def.decor || []).filter(d => d.solid).map(d => d.x + "," + d.y));
    if (this.grid.length !== this.height || this.grid.some(r => r.length !== this.width)) throw new Error("Map size mismatch: " + def.name);
    this.buildings = GAME_DATA.world.buildings[this.mapKey()] || [];
    this.underBuilding = new Set(); for (const b of this.buildings) for (let y = b.fy; y < b.fy + b.fh; y++) for (let x = b.fx; x < b.fx + b.fw; x++) this.underBuilding.add(x + "," + y);
  }
  mapKey() { return Object.keys(GAME_DATA.maps).find(k => GAME_DATA.maps[k] === this.def) || ""; }
  native() { return GAME_DATA.world.nativeMaps.includes(this.mapKey()); } // false = 48px art scaled up (temporary)
  roomInfo(x, y) { const out = x < 0 || y < 0 || x >= this.width || y >= this.height; return { name: out ? "wall" : this.def.cells[this.grid[y][x]], solid: out || this.def.collision[y][x] === 1, encounter: false }; }
  tileAt(x, y) { if (x < 0 || y < 0 || x >= this.width || y >= this.height) return 1; return this.grid[y][x]; }
  info(x, y) { if (this.def.room) return this.roomInfo(x, y); return GAME_DATA.tiles[this.tileAt(x, y)]; }
  gone(d) { return !!(d.group && this.defeated && this.defeated.includes(d.group)); } // v0.4.0: beaten enemy groups vanish
  isSolid(x, y) { return this.info(x, y).solid || (this.blocked.has(x + "," + y) && !(this.def.decor || []).some(d => d.solid && d.x === x && d.y === y && this.gone(d))); }
  isEncounter(x, y) { return !!this.info(x, y).encounter; }
  // --- v0.4.7 y-sorted pass: buildings, decor, NPCs, markers, player by bottom tile row (ties: buildings first, then decor, then the player)
  drawables(extra = []) {
    const out = this.buildings.map(b => ({ kind: "building", sortY: b.sortY, pri: 0, b }));
    for (const d of this.def.decor || []) if (!d.hidden && !this.gone(d)) out.push({ kind: "decor", sortY: d.y, pri: 1, d });
    return out.concat(extra).sort((a, b) => a.sortY - b.sortY || a.pri - b.pri);
  }
  drawBuilding(ctx, b, camX, camY) { const x = b.fx * TILE - camX, y = b.fy * TILE - b.up - camY;
    if (Sprites.draw(ctx, b.key, x, y, b.w, b.h)) return; ctx.fillStyle = "#c8402c"; ctx.fillRect(x, y, b.fw * TILE, b.fh * TILE + b.up); }
  // a person (64x80 sheet, feet on the tile bottom): px/py = tile top-left in world px
  static drawPerson(ctx, key, px, py, col, row, color) { const P = GAME_DATA.world.person;
    if (Sprites.draw(ctx, key, px, py - P.lift, P.w, P.h, col * P.w, row * P.h, P.w, P.h)) return true;
    ctx.fillStyle = color || "#7a3b8f"; ctx.fillRect(px + 8, py + 4, TILE - 16, TILE - 8); return false; }
  drawDecor(ctx, d, camX, camY) {
    const x = d.x * TILE - camX, y = d.y * TILE - camY;
    if (d.person) return TileMap.drawPerson(ctx, d.sprite, x, y, d.col || 0, d.row || 0, d.color);
    if (!Sprites.draw(ctx, d.sprite, x + TILE / 2 - d.w / 2, y + TILE - d.h, d.w, d.h)) { ctx.fillStyle = d.color || "#9a6b3f"; ctx.fillRect(x + 8, y + TILE - Math.max(TILE, d.h) + 8, TILE - 16, Math.max(TILE, d.h) - 16); }
  }
  renderDecor(ctx, camX, camY) { for (const it of this.drawables()) if (it.kind === "decor") this.drawDecor(ctx, it.d, camX, camY); else this.drawBuilding(ctx, it.b, camX, camY); }
  // Rooms (v0.4.7): 704x512 background (11x8 at 64px); else interior_64 cells (holo or plain, GAME_DATA.world.interior); else rects (solid darker).
  renderRoom(ctx, camX, camY) {
    if (Sprites.draw(ctx, this.def.bgKey, -camX, -camY, this.width * TILE, this.height * TILE)) return;
    for (let y = 0; y < this.height; y++) for (let x = 0; x < this.width; x++) {
      const ts = GAME_DATA.world.interior.tileSize, key = Sprites.get("interior") && Sprites.get("interior").width >= this.def.cells.length * ts ? "interior" : "interior_plain"; // live set (holo/plain), plain if it failed
      if (Sprites.draw(ctx, key, x * TILE - camX, y * TILE - camY, TILE, TILE, this.grid[y][x] * ts, 0, ts, ts)) continue;
      ctx.fillStyle = this.def.collision[y][x] ? "#6b5a7a" : "#e8dcc4"; ctx.fillRect(x * TILE - camX, y * TILE - camY, TILE, TILE);
    }
  }
  // which sides of (x, y) get a path_trace overlay (path tile next to grass / tall grass)
  traceSides(x, y) { const PT = GAME_DATA.world.pathTrace, nm = (a, b) => { const t = a < 0 || b < 0 || a >= this.width || b >= this.height ? null : GAME_DATA.tiles[this.grid[b][a]]; return t && t.name; };
    if (!PT.path.includes(nm(x, y))) return [];
    return [["n", 0, -1], ["s", 0, 1], ["e", 1, 0], ["w", -1, 0]].filter(([, dx, dy]) => PT.grass.includes(nm(x + dx, y + dy))).map(s => s[0]); }
  render(ctx, camX, camY) {
    if (this.def.room) return this.renderRoom(ctx, camX, camY);
    for (let y = 0; y < this.height; y++) for (let x = 0; x < this.width; x++) {
      const t = GAME_DATA.tiles[this.grid[y][x]], px = x * TILE - camX, py = y * TILE - camY;
      if (this.underBuilding.has(x + "," + y)) { if (drawCell(ctx, GAME_DATA.world.groundUnderBuildings, px, py)) continue; } // the building sprite covers it (collision stays)
      else if (t.frame != null && (TileSet.ready || TileSet48.ready)) {
        if (t.base != null) drawCell(ctx, GAME_DATA.tiles[t.base].frame, px, py); // transparent decor tiles (fence, shed) sit on grass
        drawCell(ctx, t.frame, px, py);
        for (const s of this.traceSides(x, y)) Sprites.draw(ctx, GAME_DATA.world.pathTrace.key + s, px, py, TILE, TILE);
        continue;
      }
      ctx.fillStyle = t.color; ctx.fillRect(px, py, TILE, TILE);
      if (t.encounter) { ctx.fillStyle = "#246e2d"; ctx.fillRect(px + 3 * PXK, py + 4 * PXK, 2 * PXK, 7 * PXK); ctx.fillRect(px + 10 * PXK, py + 6 * PXK, 2 * PXK, 6 * PXK); }
    }
  }
}
Object.assign(window, { TileMap, TileSet, TileSet48, drawCell, TILE, TILE_SRC, TILE_SCALE, PXK });
