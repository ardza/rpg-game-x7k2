// Game bootstrap, loop and state machine (intro | overworld | battle | menu).
// v0.3.0: Mom intro replaces the starter pick. The old 1v1 battle is legacy: reachable only via debug (E) unless
// GAME_DATA.legacyCombat is true. New party combat is M3 (not built).
class Game {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext("2d");
    this.battle = null; this.menu = null; this.talk = null;
    const s = Save.load();
    const pos = s ? s.player.pos : null;
    this.mapId = (pos && GAME_DATA.maps[pos.map]) ? pos.map : (GAME_DATA.startMap || "starter");
    this.map = new TileMap(GAME_DATA.maps[this.mapId]);
    const sp = pos && GAME_DATA.maps[pos.map] && !this.map.isSolid(pos.x, pos.y) ? pos : GAME_DATA.maps[this.mapId].spawn;
    this.player = new Player(sp.x, sp.y); if (s && s.player.facing) this.player.facing = s.player.facing;
    const pl = s ? s.player : {};
    this.stats = { level: pl.level || 1, xp: pl.xp || 0, hp: pl.hp ?? Formulas.hpAt(60, pl.level || 1), stamina: pl.stamina ?? 3 }; // DESIGN §6 player base HP 60
    this.inventory = new Inventory(s ? { potion: s.bag.potion | 0 } : null, s && s.bag.packs, s ? s.money : 0);
    this.collection = new Collection(s && s.collection);
    this.deck = s && Array.isArray(s.deck) ? s.deck : []; this.active = s && Array.isArray(s.active) ? s.active : [];
    this.packsOpened = Object.assign({ basic: 0, premium: 0, elite: 0 }, s && s.packsOpened); this.packsTradedIn = (s && s.packsTradedIn) | 0; /* v0.3.4; old v4 saves default 0 */ this.pityCounter = (s && s.pityCounter) | 0; this.commonsTradedIn = (s && s.commonsTradedIn) | 0;
    this.hiddenFound = s ? s.hiddenFound.slice() : []; this.defeatedGroups = s && Array.isArray(s.defeatedGroups) ? s.defeatedGroups : [];
    this.flags = s ? Object.assign({}, s.flags) : {}; this.settings = Object.assign({ wideWindows: false }, s && s.settings);
    this.party = []; // LEGACY creature party for the old 1v1 battle (not saved)
    this.roamers = this.map.def.roam ? new Roamers(this.map) : null; this.map.defeated = this.defeatedGroups;
    this.introIdx = 0; this.momT = 0; if (this.state === undefined && !this.flags.momIntroDone) this.player.facing = GAME_DATA.momWalkIn.playerFacing; this.notice = Save.discarded ? T("oldSave") : null;
    this.state = this.flags.momIntroDone ? "overworld" : "intro";
    if (this.state === "overworld" && this.notice) { this.talk = this.notice; this.notice = null; }
    this.last = 0;
  }
  setState(st) { this.state = st; }
  // v0.3.4 rooms: move to another map (rooms <-> overworld). Rooms fire their "enter" interact on arrival.
  warp(mapId, x, y, facing) {
    const def = GAME_DATA.maps[mapId]; if (!def) return false;
    const prevDef = this.map && this.map.def; this.mapId = mapId; this.map = new TileMap(def); this.map.defeated = this.defeatedGroups; this.player = new Player(x, y); if (facing) this.player.facing = facing;
    const fromRoom = !!(prevDef && prevDef.room);
    this.roamers = def.roam ? new Roamers(this.map) : null; this.onStep();
    // v0.4.1: room "enter" lines (shop_entry) fire only on arrival from the overworld, never on a later step
    const it = def.room && !fromRoom && this.interactAt(x, y, "enter"); if (it && !this.talk) this.say(GAME_DATA.roomText[it.key], null);
    return true;
  }
  enterDoor(d) { const m = GAME_DATA.maps[d.to], e = m.entry || m.spawn; return this.warp(d.to, e.x, e.y, e.facing || "up"); }
  say(key, bust = "player_bust") { this.talk = T(key); this.talkBust = bust; }
  interactAt(x, y, trigger) { return (this.map.def.interact || []).find(i => i.trigger === trigger && [i.tile].concat(i.also || []).some(t => t[0] === x && t[1] === y)); }
  onStep() { // after a completed step (or arrival): room exit / enter triggers / plain hidden cards
    const { x, y } = this.player, def = this.map.def;
    if (def.room && def.exit && x === def.exit.x && y === def.exit.y) { const t = def.exit.to; this.warp(t.map, t.x, t.y, t.facing);
      if (def.exitText) this.say(def.exitText, null); return true; } // v0.4.1: shop_exit plays once on leaving
    const h = this.hiddenAt(x, y, "plain"); if (h) this.pickUp(h);
  }
  // v0.4.0 party battles: visible enemy groups on the map (decor with group id)
  groupAt(x, y) { return (this.map.def.decor || []).find(d => d.group && d.x === x && d.y === y && !this.map.gone(d)); }
  startPartyBattle(groupId, opts) { this.pbattle = new PartyBattle(this, groupId, opts); this.setState("pbattle"); return this.pbattle; }
  finishPartyBattle() { // statuses clear after the fight; HP is restored (no healing spot yet); results saved (v4)
    const b = this.pbattle, res = b.result; this.pbattle = null; this.lastBattle = { group: b.groupId, result: res, reward: b.reward || null };
    this.stats.hp = Formulas.hpAt(GAME_DATA.pb.player.base.hp, this.stats.level);
    if (res === "lose") { const sp = GAME_DATA.maps[GAME_DATA.startMap].spawn; this.warp(GAME_DATA.startMap, sp.x, sp.y, "down"); }
    this.setState("overworld"); Save.save(this);
  }
  openShop() { this.menu = new PauseMenu(this); this.menu.view = "shop"; this.menu.tab = 0; this.menu.sel = 0; this.menu.refusals = 0; this.menu.direct = true; this.setState("menu"); }
  finishIntro() {
    this.inventory.addMoney(GAME_DATA.momCoins); this.flags.momIntroDone = true;
    this.talk = T("momCoins", { n: GAME_DATA.momCoins }); this.setState("overworld");
  }
  hiddenAt(x, y, kind) { return (this.map.def.hidden || []).find(h => h.x === x && h.y === y && h.kind === kind && !this.hiddenFound.includes(h.id)); }
  pickUp(h) { this.hiddenFound.push(h.id); this.collection.add(h.cardId, h.holo); const name = GAME_DATA.cards[h.cardId].name + (h.holo ? " (holo)" : "");
    this.talk = h.text && GAME_DATA.text[h.text] ? T(h.text, { name }) : T("foundCard", { name }); }
  update(dt) {
    if (this.state === "intro") {
      // v0.3.5: in the bedroom. Old-save notice first, then Mom walks in (Z skips), then her lines, then coins.
      if (this.notice) { if (Input.wasPressed("a")) this.notice = null; return; }
      const W = GAME_DATA.momWalkIn;
      if (this.momT < W.ms) { this.momT = Input.wasPressed("a") ? W.ms : this.momT + dt * 1000; return; }
      if (Input.wasPressed("a") && ++this.introIdx >= GAME_DATA.momIntro.length) this.finishIntro();
    } else if (this.state === "overworld") {
      if (GAME_DATA.legacyCombat && this.roamers) this.roamers.update(dt);
      if (this.talk) { if (Input.wasPressed("a") || Input.wasPressed("b")) { this.talk = null; this.talkBust = null; } return; }
      if (Input.wasPressed("menu") || (Input.wasPressed("b") && !this.player.moving)) { this.menu = new PauseMenu(this); this.setState("menu"); return; }
      if (!this.player.moving && Input.wasPressed("a")) { // talk to decor / search the tile the player faces
        const [dx, dy] = DIRS[this.player.facing], fx = this.player.x + dx, fy = this.player.y + dy;
        const h = this.hiddenAt(fx, fy, "search"); if (h) return this.pickUp(h);
        const door = (this.map.def.doors || []).find(d => d.x === fx && d.y === fy); if (door) return this.enterDoor(door);
        const npc = (this.map.def.decor || []).find(d => d.opens && ((d.x === fx && d.y === fy) || (d.reach || []).some(r => r[0] === fx && r[1] === fy)));
        if (npc) return this.openShop();
        const grp = this.groupAt(fx, fy); if (grp) return this.startPartyBattle(grp.group);
        const it = this.map.def.room && this.interactAt(fx, fy, "face"); if (it) return this.say(GAME_DATA.roomText[it.key]);
        const d = (this.map.def.decor || []).find(d => d.text && d.x === fx && d.y === fy);
        if (d) { // text may be a list of keys: plays in order, then loops (per NPC)
          if (Array.isArray(d.text)) { this.talkIdx = this.talkIdx || {}; const i = this.talkIdx[d.id] | 0; this.talk = T(d.text[i % d.text.length]); this.talkIdx[d.id] = i + 1; }
          else this.talk = T(d.text);
          return; }
      }
      if (!this.player.moving && !this.talk) for (const d of ["up", "down", "left", "right"]) if (Input.isDown(d)) { // walk into a door
        const door = (this.map.def.doors || []).find(o => o.x === this.player.x + DIRS[d][0] && o.y === this.player.y + DIRS[d][1]);
        if (door) { this.player.facing = d; return this.enterDoor(door); }
        const grp = this.groupAt(this.player.x + DIRS[d][0], this.player.y + DIRS[d][1]); if (grp) { this.player.facing = d; return this.startPartyBattle(grp.group); } break; }
      if (GAME_DATA.legacyCombat && this.party.length && this.roamers) {
        // 8A (legacy): stepping toward a roamer's tile starts that battle instead of moving
        if (!this.player.moving) for (const d of ["up", "down", "left", "right"]) if (Input.isDown(d)) {
          const r = this.roamers.at(this.player.x + DIRS[d][0], this.player.y + DIRS[d][1]);
          if (r) { this.player.facing = d; return this.startBattle(r.creature, r.id); }
          break;
        }
      }
      if (this.player.update(dt, this.map)) {
        const before = this.mapId; this.onStep(); if (this.mapId !== before) return;
        if (GAME_DATA.legacyCombat && this.party.length && this.roamers) { const bump = this.roamers.onPlayerStep(this.player); if (bump) this.startBattle(bump.creature, bump.id); }
      }
    } else if (this.state === "battle") {
      this.battle.update();
      if (this.battle.done) {
        const res = this.battle.result, rid = this.battle.roamerId;
        if (res === "lose") { this.party.forEach(c => c.hp = c.maxHp); const sp = this.map.def.spawn; this.player = new Player(sp.x, sp.y); }
        if (rid && (res === "win" || res === "caught")) this.roamers.remove(rid);
        if (rid && res === "run") this.roamers.setFlee(rid);
        this.battle = null; this.setState("overworld");
      }
    } else if (this.state === "pbattle") {
      this.pbattle.update(dt); if (this.pbattle.done) this.finishPartyBattle();
    } else if (this.state === "menu") {
      this.menu.update(dt); if (this.menu.closed) { this.menu = null; this.setState("overworld"); }
    }
  }
  momWalking() { return this.momT < GAME_DATA.momWalkIn.ms; }
  renderIntro(ctx) { // v0.3.5: the bedroom itself, Mom walking in from the door, then her lines with her (or Dad's) bust
    this.renderWorld(ctx);
    const W = GAME_DATA.momWalkIn, k = Math.min(1, this.momT / W.ms), mx = (W.from.x + (W.to.x - W.from.x) * k) * TILE, my = (W.from.y + (W.to.y - W.from.y) * k) * TILE;
    const col = this.momWalking() ? [0, 1, 2, 1][Math.floor(this.momT / 120) % 4] : 1;
    if (!Sprites.draw(ctx, W.sprite, mx, my, TILE, TILE, col * W.cell, W.row * W.cell, W.cell, W.cell)) { ctx.fillStyle = "#ff3e8a"; ctx.fillRect(mx + 8, my + 4, TILE - 16, TILE - 8); }
    if (!this.notice && this.momWalking()) return;
    if (!this.notice) { const L0 = GAME_DATA.momIntro[Math.min(this.introIdx, GAME_DATA.momIntro.length - 1)], bust = /^DAD/.test(L0.who) ? "dad_bust" : "mom_bust";
      if (!Sprites.draw(ctx, bust, 500, 156, 192, 192)) { ctx.fillStyle = bust === "dad_bust" ? "#2f6bff" : "#ff3e8a"; ctx.fillRect(550, 170, 90, 178); } }
    UI.frame(ctx, 20, 20, 680, 130) /* top: keeps Mom + player visible at the door */; ctx.fillStyle = UI.textColor();
    if (this.notice) { ctx.font = "16px monospace"; UI.wrap(ctx, this.notice, 630).forEach((l, i) => ctx.fillText(l, 44, 60 + i * 22)); return; }
    const L = GAME_DATA.momIntro[Math.min(this.introIdx, GAME_DATA.momIntro.length - 1)];
    ctx.font = "bold 16px monospace"; ctx.fillText(L.who, 44, 52);
    ctx.font = "16px monospace"; UI.wrap(ctx, "\"" + L.line + "\"", 630).forEach((l, i) => ctx.fillText(l, 44, 80 + i * 22));
    ctx.font = "12px monospace"; ctx.fillText("▶", 670, 140); // v0.4.3: arrow only (Z still advances)
  }
  renderWorld(ctx) {
    const camX = Math.max(0, Math.min(this.player.px + TILE / 2 - this.canvas.width / 2, this.map.width * TILE - this.canvas.width));
    const camY = Math.max(0, Math.min(this.player.py + TILE / 2 - this.canvas.height / 2, this.map.height * TILE - this.canvas.height));
    this.map.render(ctx, camX, camY); this.map.renderDecor(ctx, camX, camY); this.renderHidden(ctx, camX, camY);
    if (GAME_DATA.legacyCombat && this.roamers) this.roamers.render(ctx, camX, camY);
    this.player.render(ctx, camX, camY);
  }
  renderHidden(ctx, camX, camY) {
    for (const h of this.map.def.hidden || []) if (h.kind === "plain" && !this.hiddenFound.includes(h.id)) {
      const x = h.x * TILE - camX, y = h.y * TILE - camY;
      if (!Sprites.draw(ctx, "cardmap_" + h.cardId, x, y, TILE, TILE)) { ctx.fillStyle = "#1a1423"; ctx.fillRect(x + 14, y + 10, 20, 28); ctx.fillStyle = GAME_DATA.cards[h.cardId].color; ctx.fillRect(x + 16, y + 12, 16, 24); }
      if (TileSet.ready) { const ts = TileSet.def.tileSize, f = GAME_DATA.cardSparkleFrame; ctx.drawImage(TileSet.img, (f % TileSet.def.columns) * ts, 0, ts, ts, x, y, TILE, TILE); }
      else { ctx.fillStyle = "#fff"; ctx.fillRect(x + 18, y + 14, 4, 4); }
    }
  }
  render() {
    const ctx = this.ctx; ctx.fillStyle = "#000"; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.state === "intro") return this.renderIntro(ctx);
    if (this.state === "battle") { this.battle.render(ctx); return; }
    if (this.state === "pbattle") { this.pbattle.render(ctx); return; }
    this.renderWorld(ctx);
    if (this.talk) { const b = this.talkBust && Sprites.get(this.talkBust) ? 96 : 0; // player portrait for self-talk lines (v0.3.4)
      if (b) Sprites.draw(ctx, this.talkBust, 24, 322, 96, 96);
      UI.frame(ctx, 20, 420, 680, 90); ctx.fillStyle = UI.textColor(); ctx.font = "16px monospace"; UI.wrap(ctx, this.talk, 630).forEach((l, i) => ctx.fillText(l, 44, 456 + i * 22)); }
    if (this.state === "menu") this.menu.render(ctx);
  }
  startBattle(foe, roamerId = null, opts = {}) {
    if (!this.party.length) { this.talk = T("noCombat"); return false; }
    this.battle = new Battle(this, foe, opts); this.battle.roamerId = roamerId; this.setState("battle"); return true;
  }
  frame(ts) {
    const dt = Math.min(0.05, (ts - this.last) / 1000 || 0); this.last = ts;
    Debug.update(this); if (!Debug.open) this.update(dt); this.render(); Debug.render(this, this.ctx); Input.endFrame();
    requestAnimationFrame(t => this.frame(t));
  }
}
window.Game = Game;
window.addEventListener("load", () => {
  Input.init(window); Debug.init(window); Touch.init(document.getElementById("game")); TileSet.load(GAME_DATA.tileset); Sprites.load(GAME_DATA.sprites.images);
  window.game = new Game(document.getElementById("game"));
  requestAnimationFrame(t => window.game.frame(t));
});
