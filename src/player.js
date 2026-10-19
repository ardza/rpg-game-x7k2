const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
class Player {
  constructor(x, y) { this.x = x; this.y = y; this.px = x * TILE; this.py = y * TILE; this.facing = "down"; this.moving = false; this.t = 0; this.steps = 0; this.speed = 6; /* tiles/sec */ }
  // returns true when a step just finished
  update(dt, map) {
    if (this.moving) {
      this.t = Math.min(1, this.t + dt * this.speed);
      this.px = (this.fromX + (this.x - this.fromX) * this.t) * TILE;
      this.py = (this.fromY + (this.y - this.fromY) * this.t) * TILE;
      if (this.t >= 1) { this.moving = false; this.steps++; return true; }
      return false;
    }
    for (const d of ["up", "down", "left", "right"]) {
      if (Input.isDown(d)) {
        this.facing = d;
        const nx = this.x + DIRS[d][0], ny = this.y + DIRS[d][1];
        if (!map.isSolid(nx, ny)) { this.fromX = this.x; this.fromY = this.y; this.x = nx; this.y = ny; this.t = 0; this.moving = true; }
        break;
      }
    }
    return false;
  }
  // v0.4.7 y-sort row: the lower of the two rows while stepping (so walking down past a roof draws in front once on the lower row)
  sortRow() { return this.moving ? Math.max(this.y, this.fromY) : this.y; }
  render(ctx, camX, camY) {
    const x = this.px - camX, y = this.py - camY, sd = GAME_DATA.sprites && GAME_DATA.sprites.player, P = GAME_DATA.world.person;
    if (sd) { // 64x80 walk sheet: cols = step / together / other step (loop 0,1,2,1), feet on the tile bottom (y - lift)
      const frame = this.moving ? [0, 1, 2, 1][(this.steps * 2 + (this.t > 0.5 ? 1 : 0)) % 4] : P.idle;
      if (Sprites.draw(ctx, "player", x, y - P.lift, P.w, P.h, frame * P.w, P.rows[this.facing] * P.h, P.w, P.h)) return;
    }
    const k = PXK; ctx.fillStyle = "#f2f2f2"; ctx.fillRect(x + 3 * k, y + 2 * k, 10 * k, 12 * k);
    ctx.fillStyle = "#d33"; const [dx, dy] = DIRS[this.facing];
    ctx.fillRect(x + (6.5 + dx * 4) * k, y + (6.5 + dy * 4) * k, 3 * k, 3 * k); // facing marker
  }
}
window.Player = Player;
