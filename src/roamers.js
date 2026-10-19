// Tweak 8A (DESIGN.md v0.2): visible roaming wild creatures; random grass encounters removed.
// Rules (testable):
//  - Each zone: spawnTable (weights), maxActive (default 3), respawnSteps (default 40). Zones are filled to maxActive at map load.
//  - While a zone is below maxActive, each player step advances its counter; at respawnSteps one spawns (counter resets).
//  - Every roam.moveEverySteps (2) player steps, each roamer tries one random step; it only moves onto a free tile of its zone
//    (blocked attempts = stay put).
//  - Touch = battle: the player stepping toward a roamer's tile, or a roamer stepping onto the player's tile.
//  - Win/recruit removes the roamer. Run sets flee mode: it can't be touched and vanishes after roam.fleeSteps (2) player steps.
class Roamers {
  constructor(map) {
    this.map = map; this.cfg = map.def.roam; this.list = []; this.nextId = 1; this.steps = 0;
    this.zones = map.def.zones.map(z => ({ ...z, maxActive: z.maxActive ?? 3, respawnSteps: z.respawnSteps ?? 40, counter: 0, tiles: this.zoneTiles(z) }));
    for (const z of this.zones) while (this.count(z) < z.maxActive && this.spawn(z, null)) {}
  }
  zoneTiles(z) {
    const [x0, y0, w, h] = z.rect, out = [];
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if ((z.tiles || [3]).includes(this.map.tileAt(x, y))) out.push(x + "," + y);
    return new Set(out);
  }
  count(z) { return this.list.filter(r => r.zone === z && !r.flee).length; }
  inZone(z, x, y) { return z.tiles.has(x + "," + y); }
  at(x, y) { return this.list.find(r => r.x === x && r.y === y && !r.flee) || null; }
  occupied(x, y) { return this.list.some(r => r.x === x && r.y === y); }
  spawn(z, player) {
    const free = [...z.tiles].map(k => k.split(",").map(Number)).filter(([x, y]) => !this.occupied(x, y) && !(player && x === player.x && y === player.y));
    if (!free.length) return null;
    const [x, y] = free[Math.floor(Formulas.rand() * free.length)];
    const e = Formulas.weightedPick(z.spawnTable, Formulas.rand());
    const r = { id: this.nextId++, zone: z, creature: makeCreature(e.species, e.min + Math.floor(Formulas.rand() * (e.max - e.min + 1))),
      x, y, fromX: x, fromY: y, t: 1, facing: "down", flee: 0 };
    this.list.push(r); return r;
  }
  remove(id) { this.list = this.list.filter(r => r.id !== id); }
  setFlee(id) { const r = this.list.find(r => r.id === id); if (r) r.flee = this.cfg.fleeSteps; }
  // Call once per completed player step. Returns a roamer that bumped the player, or null.
  onPlayerStep(player) {
    this.steps++;
    for (const r of this.list.slice()) if (r.flee && --r.flee <= 0) this.remove(r.id);
    for (const z of this.zones) {
      if (this.count(z) < z.maxActive) { if (++z.counter >= z.respawnSteps) { z.counter = 0; this.spawn(z, player); } }
      else z.counter = 0;
    }
    if (this.steps % this.cfg.moveEverySteps !== 0) return null;
    let bump = null;
    for (const r of this.list) {
      const d = ["up", "down", "left", "right"][Math.floor(Formulas.rand() * 4)], [dx, dy] = DIRS[d], nx = r.x + dx, ny = r.y + dy;
      r.facing = d;
      if (!this.inZone(r.zone, nx, ny) || this.occupied(nx, ny)) continue;
      if (nx === player.x && ny === player.y) { if (!r.flee && !bump) bump = r; continue; }
      r.fromX = r.x; r.fromY = r.y; r.x = nx; r.y = ny; r.t = 0;
    }
    return bump;
  }
  update(dt) { for (const r of this.list) if (r.t < 1) r.t = Math.min(1, r.t + dt * this.cfg.tweenSpeed); }
  render(ctx, camX, camY) {
    const size = 32 * TILE_SCALE;
    for (const r of this.list) {
      const px = (r.fromX + (r.x - r.fromX) * r.t) * TILE - camX, py = (r.fromY + (r.y - r.fromY) * r.t) * TILE - camY;
      const sp = GAME_DATA.creatures[r.creature.species];
      ctx.save(); if (r.flee) ctx.globalAlpha = 0.5;
      if (r.facing === "left") { ctx.translate(2 * px + TILE, 0); ctx.scale(-1, 1); }
      const ok = Sprites.draw(ctx, sp.sprites.map, px + TILE / 2 - size / 2, py + TILE - size, size, size);
      ctx.restore();
      if (!ok) { ctx.fillStyle = sp.color; ctx.fillRect(px + 6, py + 6, TILE - 12, TILE - 12); }
    }
  }
}
window.Roamers = Roamers;
