// Creatures + 1v1 turn battle with trainer actions (2A) and bond-meter recruiting (1B).
function recalcStats(c) {
  const b = GAME_DATA.creatures[c.species].base, L = c.level, oldMax = c.maxHp || 0;
  c.maxHp = Formulas.hpAt(b.hp, L); c.atk = Formulas.statAt(b.atk, L); c.def = Formulas.statAt(b.def, L); c.spd = Formulas.statAt(b.spd, L);
  c.hp = oldMax ? Math.max(0, Math.min(c.maxHp, c.hp + (c.maxHp - oldMax))) : c.maxHp;
  return c;
}
function makeCreature(species, level) {
  const sp = GAME_DATA.creatures[species]; if (!sp) throw new Error("Unknown species " + species);
  level = Math.max(1, Math.min(Formulas.LEVEL_CAP, level));
  return recalcStats({ species, name: sp.name, type: sp.type, level, xp: Formulas.xpTotal(level), status: null, moves: sp.moves.slice(0, 4), counts: { moveType: {}, cheers: 0 } });
}
function setLevel(c, L) { c.level = Math.max(1, Math.min(Formulas.LEVEL_CAP, L)); c.xp = Formulas.xpTotal(c.level); recalcStats(c); }
function typeMultiplier(a, d) { return Formulas.typeMult(a, d); }
function calcDamage(att, def, move, atkMult = 1) {
  const mult = Formulas.typeMult(move.type, def.type), stab = move.type === att.type ? 1.5 : 1;
  const rand = Formulas.fixedDamageRand ? 1 : 0.85 + Formulas.rand() * 0.15;
  return { dmg: Formulas.damage(att.level, move.power, att.atk * atkMult, def.def, mult, stab, rand), mult };
}
// 4A: evolve if a growth branch applies (counts survive; stats recomputed)
function checkGrowth(c) {
  const g = Formulas.pickGrowth(GAME_DATA.creatures[c.species].growth, c.level, c.counts || {});
  if (!g || !GAME_DATA.creatures[g.toSpecies]) return [];
  const from = c.name, sp = GAME_DATA.creatures[g.toSpecies];
  c.species = g.toSpecies; c.name = sp.name; c.type = sp.type; c.moves = sp.moves.slice(0, 4); recalcStats(c);
  return [T("grew", { name: from, to: sp.name })];
}
function grantXp(c, amount) {
  const lines = [T("gainedXp", { name: c.name, n: amount })];
  c.xp += amount; const L = Formulas.levelForXp(c.xp);
  if (L > c.level) { c.level = L; recalcStats(c); lines.push(T("levelUp", { name: c.name, lv: L })); lines.push(...checkGrowth(c)); }
  return lines;
}
class Battle {
  constructor(game, enemy, opts = {}) {
    this.game = game; this.enemy = enemy; this.ally = game.party.find(c => c.hp > 0) || game.party[0];
    const tr = GAME_DATA.trainer;
    this.stamina = tr.startStamina; this.trainerUsed = false; this.cheerTurns = 0; this.guarding = false;
    this.bond = 0; this.bondLocked = false;
    this.canRun = opts.canRun ?? true; // false for guardians/rivals (DESIGN.md v0.2.1)
    this.log = [T("encounter", { name: enemy.name })]; this.phase = "message"; this.after = "menu";
    this.options = ["FIGHT", "TRAINER", "RECRUIT", "RUN"]; this.menuIdx = 0; this.list = null; this.done = false; this.result = null;
  }
  say(lines, after) { this.log = lines; this.phase = "message"; this.after = after; }
  openList(title, entries, onPick, canBack = true) { this.list = { title, entries, onPick, canBack, idx: 0 }; this.phase = "list"; }
  addBond(base, lines) {
    if (this.bondLocked) return;
    const n = Formulas.bondGain(base, GAME_DATA.creatures[this.enemy.species].catchRate);
    this.bond = Math.max(0, this.bond + n);
    if (lines) lines.push(T("bondChange", { sign: n >= 0 ? "+" : "", n, total: this.bond }));
  }
  useMove(user, target, moveId) {
    const m = GAME_DATA.moves[moveId], out = [T("usedMove", { name: user.name, move: m.name })], isAlly = user === this.ally;
    if (isAlly) user.counts = user.counts || { moveType: {}, cheers: 0 }, user.counts.moveType[m.type] = (user.counts.moveType[m.type] || 0) + 1;
    if (Formulas.rand() * 100 >= m.accuracy) { out.push(T("missed", { move: m.name })); return out; }
    let { dmg, mult } = calcDamage(user, target, m, isAlly && this.cheerTurns > 0 ? GAME_DATA.trainer.actions.cheer.atkMult : 1);
    if (!isAlly && this.guarding) dmg = Math.max(1, Math.floor(dmg * GAME_DATA.trainer.actions.guard.dmgMult));
    target.hp = Math.max(0, target.hp - dmg);
    if (mult > 1) out.push(T("superEffective")); else if (mult < 1) out.push(T("notEffective"));
    if (isAlly) { // 1B bond events from the player's move
      if (m.type === target.type) this.addBond(GAME_DATA.bond.ownType, out);
      if (mult > 1) this.addBond(GAME_DATA.bond.superEffective, out);
      if (target.hp <= 0) { this.bondLocked = true; this.bond = 0; }
    }
    return out;
  }
  endTurn(lines, next = "menu") {
    const B = GAME_DATA.bond, tr = GAME_DATA.trainer;
    if (this.enemy.hp > 0 && this.enemy.hp <= this.enemy.maxHp * B.lowHpFrac) this.addBond(B.lowHp, lines);
    this.stamina = Math.min(tr.maxStamina, this.stamina + tr.regen);
    if (this.cheerTurns > 0) this.cheerTurns--;
    this.guarding = false; this.trainerUsed = false;
    this.say(lines, next);
  }
  allyFainted(lines) {
    lines = lines.concat([T("faintOwn", { name: this.ally.name })]);
    if (!this.game.party.some(c => c.hp > 0)) return this.say(lines.concat([T("blackout")]), "end:lose");
    this.endTurn(lines, "swap");
  }
  openSwap() {
    this.openList(T("chooseNext"), this.game.party.map((c, i) => ({ label: c.name + " Lv" + c.level + " " + c.hp + "/" + c.maxHp, value: i, enabled: c.hp > 0 })),
      i => { this.ally = this.game.party[i]; this.say([T("goNext", { name: this.ally.name })], "menu"); }, false);
  }
  enemyMove() { return this.enemy.moves[Math.floor(Formulas.rand() * this.enemy.moves.length)]; }
  enemyAct(lines) {
    lines = lines.concat(this.useMove(this.enemy, this.ally, this.enemyMove()));
    if (this.ally.hp <= 0) return this.allyFainted(lines);
    this.endTurn(lines);
  }
  winLines() { return [T("faintWild", { name: this.enemy.name }), T("win")].concat(grantXp(this.ally, Formulas.xpGain(GAME_DATA.creatures[this.enemy.species].baseXP, this.enemy.level))); }
  playerTurn(moveId) {
    let lines = [];
    if (this.ally.spd >= this.enemy.spd) {
      lines = this.useMove(this.ally, this.enemy, moveId);
      if (this.enemy.hp <= 0) return this.say(lines.concat(this.winLines()), "end:win");
      return this.enemyAct(lines);
    }
    lines = this.useMove(this.enemy, this.ally, this.enemyMove());
    if (this.ally.hp <= 0) return this.allyFainted(lines);
    lines = lines.concat(this.useMove(this.ally, this.enemy, moveId));
    if (this.enemy.hp <= 0) return this.say(lines.concat(this.winLines()), "end:win");
    this.endTurn(lines);
  }
  // 2A: one command per turn, before the creature acts; does not use the creature's turn
  trainerAction(id) {
    const a = GAME_DATA.trainer.actions[id];
    if (this.trainerUsed) return this.say([T("trainerUsed")], "menu");
    if (this.stamina < a.cost) return this.say([T("noStamina")], "menu");
    const lines = [];
    if (id === "potion") {
      if (!this.game.inventory.remove(a.item)) return this.say([T("noPotion")], "menu");
      const before = this.ally.hp; this.ally.hp = Math.min(this.ally.maxHp, this.ally.hp + a.heal);
      lines.push(T("potion", { name: this.ally.name, hp: this.ally.hp - before }));
    } else if (id === "cheer") { this.cheerTurns = a.turns; this.ally.counts.cheers++; lines.push(T("cheer", { name: this.ally.name })); }
    else if (id === "guard") { this.guarding = true; lines.push(T("guard", { name: this.ally.name })); }
    else if (id === "calm") { lines.push(T("calm", { name: this.enemy.name })); this.addBond(a.bond, lines); }
    this.stamina -= a.cost; this.trainerUsed = true;
    this.say(lines, "menu");
    return true;
  }
  recruit() {
    if (this.game.party.length >= GAME_DATA.partyCap) return this.say([T("partyFull")], "menu");
    if (!this.bondLocked && this.bond >= GAME_DATA.bond.threshold) {
      this.game.party.push(this.enemy);
      return this.say([T("recruited", { name: this.enemy.name })].concat(grantXp(this.ally, Formulas.xpGain(GAME_DATA.creatures[this.enemy.species].baseXP, this.enemy.level))), "end:caught");
    }
    this.enemyAct([T("recruitFail", { name: this.enemy.name })]); // fails and costs the turn
  }
  run() { if (!this.canRun) return this.say([T("noRun")], "menu"); if (Formulas.rand() < GAME_DATA.runChance) this.say([T("ranAway")], "end:run"); else this.enemyAct([T("noEscape")]); }
  update() {
    if (this.phase === "message") {
      if (Input.wasPressed("a")) {
        if (this.after.startsWith("end:")) { this.done = true; this.result = this.after.slice(4); }
        else if (this.after === "swap") this.openSwap();
        else this.phase = this.after;
      }
    } else if (this.phase === "menu") {
      const n = this.options.length;
      if (Input.wasPressed("left")) this.menuIdx = (this.menuIdx + n - 1) % n;
      if (Input.wasPressed("right")) this.menuIdx = (this.menuIdx + 1) % n;
      if (Input.wasPressed("a")) {
        const o = this.options[this.menuIdx];
        if (o === "FIGHT") this.openList("Moves", this.ally.moves.map(id => { const m = GAME_DATA.moves[id]; return { label: m.name + " (" + m.type + ", " + m.power + ")", value: id, enabled: true }; }), id => this.playerTurn(id));
        else if (o === "TRAINER") this.openList("Trainer (stamina " + this.stamina + ")", Object.entries(GAME_DATA.trainer.actions).map(([id, a]) => ({
          label: id[0].toUpperCase() + id.slice(1) + " (" + a.cost + ")" + (id === "potion" ? " x" + (this.game.inventory.items.potion || 0) : ""), value: id,
          enabled: !this.trainerUsed && this.stamina >= a.cost && (id !== "potion" || this.game.inventory.items.potion > 0) })), id => this.trainerAction(id));
        else if (o === "RECRUIT") this.recruit();
        else this.run();
      }
    } else if (this.phase === "list") {
      const L = this.list, n = L.entries.length;
      if (Input.wasPressed("up")) L.idx = (L.idx + n - 1) % n;
      if (Input.wasPressed("down")) L.idx = (L.idx + 1) % n;
      if (Input.wasPressed("b") && L.canBack) this.phase = "menu";
      else if (Input.wasPressed("a") && L.entries[L.idx].enabled) L.onPick(L.entries[L.idx].value);
    }
  }
  drawHp(ctx, c, x, y) {
    UI.frame(ctx, x, y, 240, 56);
    ctx.fillStyle = UI.textColor(); ctx.font = "15px monospace"; ctx.fillText(c.name + " Lv" + c.level + " [" + c.type + "]", x + 10, y + 20);
    const r = c.hp / c.maxHp; ctx.fillStyle = "#555"; ctx.fillRect(x + 10, y + 27, 200, 9);
    ctx.fillStyle = r > 0.5 ? "#3c3" : r > 0.2 ? "#dc3" : "#d33"; ctx.fillRect(x + 10, y + 27, 200 * r, 9);
    ctx.fillStyle = UI.textColor(); ctx.font = "12px monospace"; ctx.fillText(c.hp + "/" + c.maxHp, x + 10, y + 50);
  }
  render(ctx) {
    ctx.fillStyle = "#cfe8c0"; ctx.fillRect(0, 0, 720, 528);
    const es = GAME_DATA.creatures[this.enemy.species], as = GAME_DATA.creatures[this.ally.species];
    if (!Sprites.draw(ctx, es.sprites.battle, 470, 10, 192, 192)) { ctx.fillStyle = es.color; ctx.fillRect(500, 60, 96, 96); }
    if (!Sprites.draw(ctx, as.sprites.back, 70, 184, 192, 192) && !Sprites.draw(ctx, as.sprites.battle, 70, 184, 192, 192)) { ctx.fillStyle = as.color; ctx.fillRect(110, 220, 112, 112); }
    this.drawHp(ctx, this.enemy, 30, 30); this.drawHp(ctx, this.ally, 440, 250);
    ctx.fillStyle = "#222"; ctx.font = "13px monospace";
    ctx.fillText("Stamina " + this.stamina + "/" + GAME_DATA.trainer.maxStamina + (this.cheerTurns ? "  Cheer " + this.cheerTurns : "") + (this.guarding ? "  Guard" : ""), 440, 330);
    ctx.fillText("Bond " + (this.bondLocked ? "lost" : this.bond + "/100"), 30, 104);
    UI.frame(ctx, 0, 380, 720, 148); ctx.fillStyle = UI.textColor(); ctx.font = "15px monospace";
    if (this.phase === "message") this.log.flatMap(l => UI.wrap(ctx, l, 680)).slice(0, 6).forEach((l, i) => ctx.fillText(l, 20, 404 + i * 19));
    else if (this.phase === "menu") this.options.forEach((o, i) => ctx.fillText((i === this.menuIdx ? "> " : "  ") + o, 30 + i * 170, 450));
    else { const L = this.list; ctx.fillText(L.title + (L.canBack ? "  (X: back)" : ""), 20, 404);
      L.entries.forEach((e, i) => { ctx.fillStyle = e.enabled ? UI.textColor() : "#888"; ctx.fillText((i === L.idx ? "> " : "  ") + e.label, 30, 426 + i * 19); }); }
  }
}
Object.assign(window, { Battle, makeCreature, setLevel, recalcStats, calcDamage, typeMultiplier, grantXp, checkGrowth });
