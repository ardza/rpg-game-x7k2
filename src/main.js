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
    this.flags = s ? Object.assign({}, s.flags) : {}; this.playMs = s ? s.playMs : 0; this.coinsFound = s ? s.coinsFound.slice() : []; this.jobs = Object.assign({ mowDay: null, extraAt: null }, s && s.jobs); this.settings = Object.assign({ touchControls: "auto" }, Save.prefs().touchControls ? { touchControls: Save.prefs().touchControls } : null, s && s.settings); delete this.settings.battleTiming; delete this.settings.wideWindows; /* v0.4.6: no timing step; old v5 values ignored */
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
    for (const d of def.decor || []) if (d.home) { d.x = d.home.x; d.y = d.home.y; } // v0.4.4 wandering goons start at home
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
    const h = this.hiddenAt(x, y, "plain"); if (h) return this.pickUp(h);
    const c = this.coinAt(x, y); if (c) { this.coinsFound.push(c.id); this.inventory.addMoney(c.n); this.talk = T("coinFound", { n: c.n }); this.talkBust = null; Save.save(this); return; }
  }
  // --- v0.4.4 town
  coinAt(x, y) { return (this.map.def.coins || []).find(c => c.x === x && c.y === y && !this.coinsFound.includes(c.id)); }
  facadeAt(x, y) { return (this.map.def.facades || []).find(f => f.x === x && f.y === y); }
  today() { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); } // mow: local calendar day
  // talk queue: lines shown one per Z; then() runs after the last one is dismissed
  sayLines(keys, then, bust = null) { this.talkQueue = keys.slice(1); this.talk = T(keys[0]); this.talkBust = bust; this.talkThen = then || null; }
  // Tall grass: the only forced fight. Returns the group id (or null) for one completed step on (x, y).
  grassCheck(x, y) { const G = this.map.def.grass; if (!G || !PartyBattle.canFight(this) /* v0.4.6: no cards, no wild fights */ || !this.map.isEncounter(x, y) || !(Formulas.rand() < G.rate)) return null; return Formulas.weightedPick(G.table, Formulas.rand()).group; }
  startGrassFight(grp) { const pre = this.flags.grassSeen ? [] : [T("grassFirst")]; this.flags.grassSeen = true; return this.startPartyBattle(grp, { pre }); }
  talkTrainer(d) { const f = this.flags;
    if (f.thorneBeaten) return this.sayLines(["thorne_after_win"], null, d.bust);
    this.sayLines(f.thorneLost ? ["thorne_after_lose", "thorne_pre2"] : ["thorne_pre", "thorne_pre2"], () => this.startPartyBattle(d.trainer), d.bust); }
  doJob(d) { const J = GAME_DATA.jobs;
    if (d.job === "mow") { if (this.jobs.mowDay === this.today()) return this.say("job_mow_wait", d.bust || null);
      return this.sayLines(["job_mow_start"], () => { this.fadeMs = 600; this.jobs.mowDay = this.today(); this.inventory.addMoney(J.mow.pay); this.say("job_mow_done", null); Save.save(this); }, d.bust || null); }
    if (d.job === "extra") { const left = this.jobs.extraAt == null ? 0 : J.extra.cooldownMs - (this.playMs - this.jobs.extraAt);
      if (left > 0) { this.talk = T("gig_extra_wait", { m: Math.ceil(left / 60000) }); this.talkBust = null; return; }
      return this.sayLines(["gig_extra_start", "gig_extra_hold"], () => { this.gig = { x: this.player.x, y: this.player.y, facing: this.player.facing, t: 0 }; }); } }
  updateGig(dt) { const g = this.gig, p = this.player; if (!g) return false;
    if (p.moving || p.x !== g.x || p.y !== g.y || p.facing !== g.facing || ["up", "down", "left", "right"].some(k => Input.isDown(k))) { this.gig = null; this.say("gig_extra_cancel", null); return true; }
    g.t += dt * 1000; if (g.t < GAME_DATA.jobs.extra.holdMs) return true;
    this.gig = null; this.jobs.extraAt = this.playMs; this.inventory.addMoney(GAME_DATA.jobs.extra.pay); this.say("gig_extra_done", null); Save.save(this); return true; }
  // goon markers wander in their patch (never onto the player, solids, other decor); fights are Z-only
  wanderGoons() { const W = this.map.def.goonWander; if (!W || this.map.def.room) return; this.goonSteps = (this.goonSteps | 0) + 1; if (this.goonSteps % W.everySteps) return;
    for (const d of this.map.def.decor || []) { if (!d.group || this.map.gone(d)) continue; d.home = d.home || { x: d.x, y: d.y };
      const [dx, dy] = DIRS[["up", "down", "left", "right"][Math.floor(Formulas.rand() * 4)]], nx = d.x + dx, ny = d.y + dy;
      if (Math.abs(nx - d.home.x) > W.radius || Math.abs(ny - d.home.y) > W.radius || !this.map.isEncounter(nx, ny) || this.map.isSolid(nx, ny) || (nx === this.player.x && ny === this.player.y) ||
        this.coinAt(nx, ny) || (this.map.def.hidden || []).some(h => h.x === nx && h.y === ny)) continue;
      this.map.blocked.delete(d.x + "," + d.y); d.x = nx; d.y = ny; this.map.blocked.add(nx + "," + ny); } }
  // v0.4.0 party battles: visible enemy groups on the map (decor with group id)
  groupAt(x, y) { return (this.map.def.decor || []).find(d => d.group && d.x === x && d.y === y && !this.map.gone(d)); }
  startPartyBattle(groupId, opts) { // v0.4.6: no player unit, so an empty binder can't fight (interim noCards line)
    if (!PartyBattle.canFight(this)) { this.pbattle = null; this.talk = T("noCards"); return null; }
    this.pbattle = new PartyBattle(this, groupId, opts); this.setState("pbattle"); return this.pbattle; }
  finishPartyBattle() { // statuses clear after the fight; card HP is per fight (no healing spot yet); results saved. v0.4.6: no player HP
    const b = this.pbattle, res = b.result; this.pbattle = null; this.lastBattle = { group: b.groupId, result: res, reward: b.reward || null };
    if (res === "lose") { const sp = GAME_DATA.maps[GAME_DATA.startMap].spawn; this.warp(GAME_DATA.startMap, sp.x, sp.y, "down"); }
    this.setState("overworld"); Save.save(this);
  }
  // v0.4.4 Reset Game (menu, confirmed): wipe the save, keep device prefs (Touch Controls), reload to a fresh intro.
  resetGame() { Save.setPref("touchControls", this.settings.touchControls || "auto"); Save.clear(); this.resetting = true;
    try { if (typeof location !== "undefined" && location.reload) location.reload(); } catch (e) {} return true; }
  openShop() { this.menu = new PauseMenu(this); this.menu.view = "shop"; this.menu.tab = 0; this.menu.sel = 0; this.menu.refusals = 0; this.menu.direct = true; this.setState("menu"); }
  finishIntro() {
    this.inventory.addMoney(GAME_DATA.momCoins); this.flags.momIntroDone = true;
    this.talk = T("momCoins", { n: GAME_DATA.momCoins }); this.setState("overworld");
  }
  hiddenAt(x, y, kind) { return (this.map.def.hidden || []).find(h => h.x === x && h.y === y && h.kind === kind && !this.hiddenFound.includes(h.id)); }
  pickUp(h) { this.hiddenFound.push(h.id); this.collection.add(h.cardId, h.holo); const name = GAME_DATA.cards[h.cardId].name + (h.holo ? " (holo)" : "");
    this.talk = h.text && GAME_DATA.text[h.text] ? T(h.text, { name }) : T("foundCard", { name }); }
  update(dt) {
    if (this.state !== "intro") this.playMs = (this.playMs || 0) + dt * 1000; // v0.4.4 play time (Ricky's Extra cooldown)
    if (this.state === "intro") {
      // v0.3.5: in the bedroom. Old-save notice first, then Mom walks in (Z skips), then her lines, then coins.
      if (this.notice) { if (Input.wasPressed("a")) this.notice = null; return; }
      const W = GAME_DATA.momWalkIn;
      if (this.momT < W.ms) { this.momT = Input.wasPressed("a") ? W.ms : this.momT + dt * 1000; return; }
      if (Input.wasPressed("a") && ++this.introIdx >= GAME_DATA.momIntro.length) this.finishIntro();
    } else if (this.state === "overworld") {
      if (GAME_DATA.legacyCombat && this.roamers) this.roamers.update(dt);
      if (this.fadeMs > 0) { this.fadeMs -= dt * 1000; return; } // v0.4.4 mow fade-to-black
      if (this.talk) { if (Input.wasPressed("a") || Input.wasPressed("b")) { this.talk = null;
        if (this.talkQueue && this.talkQueue.length) { this.talk = T(this.talkQueue.shift()); return; } this.talkBust = null;
        const f = this.talkThen; this.talkThen = null; if (f) f(); } return; }
      if (this.gig && this.updateGig(dt)) return;
      if (Input.wasPressed("menu") || (Input.wasPressed("b") && !this.player.moving)) { this.menu = new PauseMenu(this); this.setState("menu"); return; }
      if (!this.player.moving && Input.wasPressed("a")) { // talk to decor / search the tile the player faces
        const [dx, dy] = DIRS[this.player.facing], fx = this.player.x + dx, fy = this.player.y + dy;
        const h = this.hiddenAt(fx, fy, "search"); if (h) return this.pickUp(h);
        const door = (this.map.def.doors || []).find(d => d.x === fx && d.y === fy); if (door) return this.enterDoor(door);
        const npc = (this.map.def.decor || []).find(d => d.opens && ((d.x === fx && d.y === fy) || (d.reach || []).some(r => r[0] === fx && r[1] === fy)));
        if (npc) return this.openShop();
        const grp = this.groupAt(fx, fy); if (grp) return this.startPartyBattle(grp.group);
        const tr = (this.map.def.decor || []).find(d => d.trainer && d.x === fx && d.y === fy); if (tr) return this.talkTrainer(tr);
        const jb = (this.map.def.decor || []).find(d => d.job && d.x === fx && d.y === fy); if (jb) return this.doJob(jb);
        const fc = this.facadeAt(fx, fy); if (fc) return this.say(fc.text, null);
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
        // v0.4.4: walking into a goon marker no longer starts a fight (Z only). Facades / barrier: line on a fresh press.
        const fc = this.facadeAt(this.player.x + DIRS[d][0], this.player.y + DIRS[d][1]); if (fc && fc.bump !== false && Input.wasPressed(d)) { this.player.facing = d; return this.say(fc.text, null); } break; }
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
        this.wanderGoons();
        if (!this.talk) { const grp = this.grassCheck(this.player.x, this.player.y); if (grp) return this.startGrassFight(grp); }
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
      const n0 = (ctx.font = UI.font("dialog"), UI.wrap(ctx, "\"" + L0.line + "\"", 636).length), by0 = 20 + 72 + n0 * (UI.sizes.dialog + 8) + 6;
      if (!Sprites.draw(ctx, bust, 500, Math.max(156, by0), 192, 192)) { ctx.fillStyle = bust === "dad_bust" ? "#2f6bff" : "#ff3e8a"; ctx.fillRect(550, 170, 90, 178); } }
    // v0.4.5 bigger text; the box grows with the line count (top: keeps Mom + player visible at the door)
    const lh = UI.sizes.dialog + 8; ctx.font = UI.font("dialog");
    if (this.notice) { const N = UI.wrap(ctx, this.notice, 636); UI.frame(ctx, 20, 20, 680, 40 + N.length * lh); ctx.fillStyle = UI.textColor(); N.forEach((l, i) => ctx.fillText(l, 44, 20 + 20 + UI.sizes.dialog + i * lh)); return; }
    const L = GAME_DATA.momIntro[Math.min(this.introIdx, GAME_DATA.momIntro.length - 1)], WL = UI.wrap(ctx, "\"" + L.line + "\"", 636), h = 72 + WL.length * lh;
    UI.frame(ctx, 20, 20, 680, h); ctx.fillStyle = UI.textColor();
    ctx.font = UI.font("dialog", true); ctx.fillStyle = UI.accent(); ctx.fillText(L.who, 44, 56); ctx.fillStyle = UI.textColor();
    ctx.font = UI.font("dialog"); WL.forEach((l, i) => ctx.fillText(l, 44, 56 + lh + 4 + i * lh));
    UI.arrow(ctx, 668, 20 + h - 14); // v0.4.3: arrow only (Z still advances)
  }
  renderWorld(ctx) {
    const camX = Math.max(0, Math.min(this.player.px + TILE / 2 - this.canvas.width / 2, this.map.width * TILE - this.canvas.width));
    const camY = Math.max(0, Math.min(this.player.py + TILE / 2 - this.canvas.height / 2, this.map.height * TILE - this.canvas.height));
    this.map.render(ctx, camX, camY); this.map.renderDecor(ctx, camX, camY); this.renderHidden(ctx, camX, camY);
    for (const c of this.map.def.coins || []) if (!this.coinsFound.includes(c.id)) { const x = c.x * TILE - camX, y = c.y * TILE - camY; // Couch Cash sparkle
      if (!Sprites.draw(ctx, "ui_coin", x + 12, y + 16, 24, 24)) { ctx.fillStyle = "#e8b530"; ctx.fillRect(x + 16, y + 20, 16, 16); }
      if (TileSet.ready) { const ts = TileSet.def.tileSize, f = GAME_DATA.cardSparkleFrame; ctx.drawImage(TileSet.img, (f % TileSet.def.columns) * ts, 0, ts, ts, x, y, TILE, TILE); } }
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
      ctx.font = UI.font("dialog"); const lh = UI.sizes.dialog + 8, W = UI.wrap(ctx, this.talk, 636), h = 34 + W.length * lh, y = 516 - h; // v0.4.5 bigger text; box grows upward
      if (b) Sprites.draw(ctx, this.talkBust, 24, y - 98, 96, 96);
      UI.frame(ctx, 20, y, 680, h); ctx.fillStyle = UI.textColor(); W.forEach((l, i) => ctx.fillText(l, 44, y + 14 + UI.sizes.dialog + i * lh)); }
    if (this.state === "menu") this.menu.render(ctx);
    if (this.fadeMs > 0) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); }
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
  window.game = new Game(document.getElementById("game")); Touch.apply(window.game.settings.touchControls || "auto"); // v0.4.4 Touch Controls setting
  requestAnimationFrame(t => window.game.frame(t));
});
