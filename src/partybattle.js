// Party battles (v0.4.0, DESIGN v0.4 §6-§9 + Enemies v0.4.1 PROPOSAL). Numbers in src/data/battle.js and src/data/enemies.js.
// Player + up to 2 active deck cards vs an enemy group. SPD turn order, timed presses, statuses with the skip cap.
// The old 1v1 battle.js stays debug-only.
const PB = () => GAME_DATA.pb;
const PBF = { // pure helpers (tested directly)
  typeMult(a, d) { const r = PB().typeChart[a] || {}; return r[d] ?? 1; },
  pressResult(deltaMs, wide) { const P = PB().press, k = wide ? P.wideMult : 1, d = Math.abs(deltaMs);
    return deltaMs == null ? "miss" : d <= P.perfect * k ? "perfect" : d <= P.good * k ? "good" : "miss"; },
  buffCount(u) { return (u.st.cheer ? 1 : 0) + (u.st.guard ? 1 : 0); },
  effAtk(u) { return u.atk * (u.st.burnout ? PB().status.burnout.atk : 1); },
  effDef(u) { return u.def * (u.st.pooped_on ? PB().status.pooped_on.def : 1); },
  movePower(m, target) { return m.perBuff ? Math.min(m.maxPower, m.power + m.perBuff * PBF.buffCount(target)) : m.power; },
  // §8: base = floor(((2L/5+2)*power*ATK/DEF)/50+2); dmg = max(1, floor(base*type*stab*rand*press*mods)); block multiplies the result again.
  damage(att, def, m, o = {}) {
    const power = PBF.movePower(m, def), base = Math.floor(((2 * att.level / 5 + 2) * power * PBF.effAtk(att) / PBF.effDef(def)) / 50 + 2);
    const mt = PBF.moveType(att, m), type = PBF.typeMult(mt, def.type), stab = mt === att.type ? PB().stab : 1;
    const rand = o.rand ?? (Formulas.fixedDamageRand ? 1 : PB().randMin + (PB().randMax - PB().randMin) * Formulas.rand());
    const M = PB().mods, mods = (att.st.cheer ? M.cheer : 1) * (def.st.guard ? M.guard : 1) * ((o.targets || 1) > 1 ? M.multiTarget : 1);
    let dmg = Math.max(1, Math.floor(base * type * stab * rand * PB().press.attack[o.attackPress || "miss"] * mods));
    const bm = PB().press.block[o.blockPress || "miss"]; if (bm !== 1) dmg = Math.max(1, Math.floor(dmg * bm));
    return dmg;
  },
  // §7 skip cap: no stacking, Numb immunity, 40% cap; bosses half (max 20%), 2nd skip in the fight halved.
  skipChance(c, t) { const K = PB().skipCap; if (t.pendingSkip || t.numb > 0) return 0;
    if (t.boss) c = Math.min(c * K.bossMult, K.bossMax) * (t.skips > 0 ? K.bossSecondMult : 1); return Math.min(c, K.max); },
  // "You does a dance" -> "you do a dance": verb after "You", "You's" -> "Your", "their own" -> "your own", lowercase mid-sentence.
  you(line) { const Y = PB().you; if (!line || !new RegExp("\\b" + Y.name + "\\b").test(line)) return line;
    let s = line.replace(new RegExp("\\b" + Y.name + "'s\\b", "g"), "Your");
    s = s.replace(new RegExp("\\b" + Y.name + " (\\w+)(?: (inside and) (\\w+))?", "g"), (m, v, mid, v2) => Y.name + " " + (Y.verbs[v] || v) + (mid ? " " + mid + " " + (Y.verbs[v2] || v2) : ""));
    s = s.replace(new RegExp("(\\b" + Y.name + " \\w+(?: \\w+)*? )their\\b"), "$1" + Y.their);
    s = s.replace(new RegExp("(\\b" + Y.name + " [^.!?]*? and )(\\w+)", "g"), (m, a, v) => a + (Y.verbs[v] || v)); // "...and swings" -> "...and swing"
    s = s.replace(new RegExp("(\\b" + Y.name + " [^.!?]*?) it's\\b", "g"), "$1 you're");                        // "...brainrotted it's swinging" -> "you're"
    s = s.replace(/(^|[.!?]\s+)([^.!?]*?)\bYou\b/g, (m, a, b) => a + b + (b.length ? "you" : "You")).replace(/([.!?]\s+'?)you\b/g, "$1You").replace(/^you\b/, "You");
    s = s.replace(/^('?)you\b/, "$1You");
    s = s.replace(/\bYour\b/g, (m, i) => i === 0 || /[.!?]\s*'?$/.test(s.slice(0, i)) ? "Your" : "your");
    return s; },
  moveType(u, m) { return m.type === "own" ? u.type : m.type; }, // card_basic hits in the card's own type
  makeUnit(side, o) {
    const b = o.base, L = o.level, hx = o.holo ? GAME_DATA.holoStatMult : 1, st = v => Math.floor(Formulas.statAt(v, L) * hx);
    const hp = o.hp || Math.floor(Math.floor(Formulas.hpAt(b.hp, L) * hx) * (o.hpMult || 1));
    const clean = Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null));
    return Object.assign(clean, { side, level: L, maxHp: hp, hp, atk: st(b.atk), def: st(b.def), spd: st(b.spd), st: {}, skips: 0, numb: 0, pendingSkip: false });
  }
};
class PartyBattle {
  constructor(game, groupId, opts = {}) {
    const G = GAME_DATA.enemyGroups[groupId]; if (!G) throw new Error("Unknown enemy group " + groupId);
    this.game = game; this.groupId = groupId; this.group = G; this.boss = !!G.boss; this.auto = !!opts.auto; this.wide = !!(game.settings && game.settings.wideWindows);
    this.t = 0; this.round = 0; this.stamina = PB().stamina.start; this.presses = []; this.msgs = []; this.done = false; this.result = null; this.cmd = 0; this.tsel = 0;
    const P = PB().player, pl = game.stats.level;
    this.player = PBF.makeUnit("party", { id: "player", art: "player", name: P.name, type: P.type, base: P.base, level: pl, isPlayer: true });
    const deck = this.deckEntries();
    this.cards = deck.map(e => { const c = GAME_DATA.cards[e.cardId]; return PBF.makeUnit("party", { id: e.uid, uid: e.uid, cardId: e.cardId, art: e.cardId, name: c.name, type: c.type, base: c.base, level: e.level, holo: e.holo, moves: c.moves, rarity: c.rarity }); });
    this.active = this.cards.slice(0, PB().activeCards); this.bench = this.cards.slice(PB().activeCards);
    this.enemies = G.members.map(([id, L], i) => { const E = GAME_DATA.enemies[id]; return PBF.makeUnit("enemy", { id: id + "_" + i, eid: id, art: E.cardArt || id, name: E.name, type: E.type, base: E.base, level: L, moves: E.moves, ai: E.ai, boss: !!E.boss, hp: E.hp, hpMult: E.hpMult, def0: E }); });
    this.trainer = G.trainer || null;
    const lines = (opts.pre || []).concat([T("pbStart", { n: this.enemies.length > 1 ? this.enemies[0].name + " & co." : this.enemies[0].name })]);
    for (const e of this.enemies.filter((e, i, a) => a.findIndex(x => x.eid === e.eid) === i)) if (e.def0.barks && e.def0.barks.enter) lines.push(...TL(e.def0.barks.enter));
    for (const c of this.active) lines.push(T(PB().barkPrefix[c.cardId] + "_enter"));
    this.say(lines, () => this.startRound());
  }
  // Party: the deck (DESIGN §6, 6 cards; first 2 active). Empty deck -> the first 6 binder cards stand in (no deck picker yet).
  deckEntries() { const g = this.game, col = g.collection.list, byUid = u => col.find(e => e.uid === u);
    let list = (g.deck || []).map(byUid).filter(Boolean); if (!list.length) list = g.collection.sorted();
    const act = (g.active || []).map(byUid).filter(Boolean); list = act.concat(list.filter(e => !act.includes(e)));
    return list.slice(0, PB().deckSize); }
  get party() { return [this.player].concat(this.active); }
  alive(list) { return list.filter(u => u.hp > 0); }
  all() { return this.party.concat(this.enemies); }
  // --- flow
  say(lines, then) { this.msgs.push(...lines.filter(Boolean).map(PBF.you)); this.after = then || this.after; this.phase = "msg"; this.msgT = 0; }
  startRound() {
    this.round++; if (this.round > 1) this.stamina = Math.min(PB().stamina.cap, this.stamina + PB().stamina.perRound);
    for (let i = 0; i < this.active.length; i++) if (this.active[i].hp <= 0) { const nb = this.bench.find(b => b.hp > 0); if (nb) { this.bench.splice(this.bench.indexOf(nb), 1, this.active[i]); this.active[i] = nb; this.msgs.push(T(PB().barkPrefix[nb.cardId] + "_enter")); } }
    this.order = PartyBattle.turnOrder(this.alive(this.all())); this.turn = 0;
    if (this.msgs.length) return this.say([], () => this.nextTurn());
    this.nextTurn();
  }
  // §6: SPD desc; ties: party side, then higher level, then a seeded coin flip.
  static turnOrder(units) { const flip = new Map(units.map(u => [u, Formulas.rand()]));
    return units.slice().sort((a, b) => b.spd - a.spd || (a.side === b.side ? 0 : a.side === "party" ? -1 : 1) || b.level - a.level || flip.get(a) - flip.get(b)); }
  nextTurn() {
    if (this.checkEnd()) return;
    const u = this.order[this.turn++]; if (!u) return this.startRound();
    if (u.hp <= 0 || (u.side === "party" && !this.party.includes(u))) return this.nextTurn();
    this.actor = u;
    if (u.st.guard && u.st.guard.self) delete u.st.guard; // v0.4.3 self-Guard (Beauty Mode/Play Dead) lasts until the user's next turn
    if (u.isPlayer) for (const x of this.party) if (x.st.guard && x.st.guard.by === u.id) delete x.st.guard; // Guard lasts until your next turn
    u.log = (u.log || "") + (u.pendingSkip ? "S" : "A"); // turn log (tests: never "SS")
    if (u.pendingSkip) { u.pendingSkip = false; u.skips++; u.numb = PB().skipCap.numbTurns; u.skippedNow = true; return this.say([T("pbSkip", { name: u.name })], () => this.endTurn(u)); }
    if (u.side === "party") { this.phase = "command"; this.cmd = 0; this.sub = null; if (this.auto) this.autoParty(u); return; }
    this.enemyTurn(u);
  }
  endTurn(u) { // §7: effects tick at the end of the unit's own turn
    const S = PB().status, lines = [];
    if (u.st.gross_out && u.hp > 0) { const d = Math.max(1, Math.floor(u.maxHp * S.gross_out.dot)) * u.st.gross_out.stacks; u.hp = Math.max(0, u.hp - d); }
    for (const k of ["burnout", "pooped_on", "rugged", "brainrot", "cheer"]) if (u.st[k] && --u.st[k] <= 0) delete u.st[k];
    if (u.st.gross_out && --u.st.gross_out.turns <= 0) delete u.st.gross_out;
    if (!u.skippedNow && u.numb > 0) u.numb--; u.skippedNow = false;
    if (u.hp <= 0) lines.push(...this.koLines(u));
    if (lines.length) return this.say(lines, () => this.nextTurn());
    this.nextTurn();
  }
  checkEnd() {
    if (this.done || this.phase === "end") return true;
    if (!this.alive(this.enemies).length) { this.win(); return true; }
    const cardsLeft = this.alive(this.cards).length;
    if (this.player.hp <= 0 || (this.cards.length && !cardsLeft)) { const L = [T("pbLose")]; if (this.trainer) { L.push(T(this.trainer.loseLine)); this.game.flags[this.trainer.id + "Lost"] = true; } this.finish("lose", L); return true; }
    return false;
  }
  // --- party commands: Attack / Special / Item / Run
  commandList(u) { return PB().layout.commands; }
  specialMoves(u) { return u.isPlayer ? ["cheer", "guard"] : [u.moves[1]]; }
  choose(cmdIdx, subIdx = 0, targetIdx = 0) { // used by input and tests
    const u = this.actor, c = PB().layout.commands[cmdIdx];
    if (c === "Run") return this.tryRun();
    if (c === "Swap") return this.swap(u, targetIdx);
    if (c === "Item") { if ((this.game.inventory.items.potion || 0) < 1) return this.say([T("pbNoPotion")], () => { this.phase = "command"; });
      if (this.stamina < 1) return this.say([T("pbNoStamina")], () => { this.phase = "command"; });
      const t = this.alive(this.party)[targetIdx] || u; return this.usePotion(u, t); }
    const mid = c === "Attack" ? (u.isPlayer ? "strike" : u.moves[0]) : this.specialMoves(u)[subIdx], m = PB().moves[mid];
    if (m.support) { if (this.stamina < m.stamina) return this.say([T("pbNoStamina")], () => { this.phase = "command"; });
      const t = this.alive(this.party)[targetIdx] || u; return this.support(u, m, t); }
    const foes = this.alive(this.enemies); let targets = m.all ? foes : [foes[Math.min(targetIdx, foes.length - 1)]];
    if (m.hits) targets = Array.from({ length: m.hits }, () => foes[Math.floor(Formulas.rand() * foes.length)]); // v0.4.3 Triple Threat: random targets
    this.beginPress("attack", { user: u, move: mid, targets });
  }
  // v0.4.1 Director: bench swap is a turn action; it uses the swapping card's turn. The incoming card acts from next round.
  swapList(u) { return u && !u.isPlayer && this.active.includes(u) ? this.alive(this.bench) : []; }
  swap(u, idx = 0) { const L = this.swapList(u), nb = L[Math.min(idx, L.length - 1)];
    if (!nb) return this.say([T(u.isPlayer ? "pbSwapPlayer" : "pbSwapNone")], () => { this.phase = "command"; });
    const ai = this.active.indexOf(u), bi = this.bench.indexOf(nb); this.active[ai] = nb; this.bench[bi] = u; nb.swappedIn = this.round;
    this.say([T("pbSwap", { out: u.name, in: nb.name }), T(PB().barkPrefix[nb.cardId] + "_enter")], () => this.endTurn(u)); }
  tryRun() {
    if (this.trainer) return this.say([T(this.trainer.noRun)], () => { this.phase = "command"; }); // v0.4.4 trainer fights: no running
    if (this.boss) return this.say([T(this.enemies[0].def0.noRun || "pbRunFail")], () => { this.phase = "command"; });
    if (Formulas.rand() < PB().runChance) return this.finish("run", [T("pbRun")]);
    this.say([T("pbRunFail")], () => this.endTurn(this.actor));
  }
  usePotion(u, t) {
    this.stamina--; if (t.st.pooped_on) return this.say([T("pbNoHeal", { target: t.name })], () => this.endTurn(u));
    this.game.inventory.remove("potion"); const n = Math.min(t.maxHp - t.hp, Math.floor(t.maxHp * PB().potionHeal)); t.hp += n;
    this.say([T("pbHeal", { target: t.name, n })], () => this.endTurn(u));
  }
  support(u, m, t) {
    this.stamina -= m.stamina;
    if (t.st.rugged) return this.say([T("pbStatus", { target: t.name, status: "Rugged (can't be buffed)" })], () => this.endTurn(u));
    if (m.support === "cheer") { t.st.cheer = PB().buffs.cheer.turns; return this.say([T("pbCheer", { target: t.name })], () => this.endTurn(u)); }
    t.st.guard = { by: u.id }; this.say([T("pbGuard", { target: t.name })], () => this.endTurn(u));
  }
  // auto mode (tests/sim): sim baseline presses 20% Perfect / 50% Good / 30% Miss; player Potions an ally under 40%
  autoParty(u) {
    const hurt = this.alive(this.party).find(x => x.hp < x.maxHp * 0.4 && !x.st.pooped_on);
    if (u.isPlayer && hurt && this.stamina >= 1 && (this.game.inventory.items.potion || 0) > 0) return this.usePotion(u, hurt);
    const foes = this.alive(this.enemies), weak = foes.reduce((a, b) => a.hp <= b.hp ? a : b);
    this.choose(!u.isPlayer && Formulas.rand() < 0.5 ? 1 : 0, 0, foes.indexOf(weak)); } // cards: 50/50 basic/special (as the v0.4.1 sim)
  // --- enemy AI (v0.4.1)
  enemyTurn(u) {
    const foes = this.alive(this.party), M = PB().moves, pre = [];
    const lowest = () => foes.reduce((a, b) => a.hp / a.maxHp <= b.hp / b.maxHp ? a : b), rnd = () => foes[Math.floor(Formulas.rand() * foes.length)];
    let mid, tg;
    if (u.ai === "card") { mid = u.moves[Formulas.rand() < 0.5 ? 0 : 1]; tg = rnd(); } // v0.4.4 trainer cards: 50/50 basic/special
    else if (u.ai === "ricky") { mid = foes.some(x => x.pendingSkip || x.numb > 0) ? "selfie_jab" : "ring_light_flash"; tg = lowest(); }
    else if (u.ai === "unboxer") { mid = Formulas.rand() < 0.5 ? "box_cutter" : "peanut_barrage"; tg = this.player.hp > 0 && this.player.hp < this.player.maxHp / 2 ? this.player : rnd(); }
    else { const low = u.hp < u.maxHp / 2; if (low && !u.saidLow) { u.saidLow = true; pre.push(T(u.def0.lowHp)); }
      if (this.round % 3 === 0) mid = "chat_spam"; else if (low) { mid = Formulas.rand() < 0.75 ? "hot_take" : "donation_goal"; } else mid = Formulas.rand() < 0.35 ? "donation_goal" : "hot_take";
      tg = low && mid === "hot_take" ? foes.reduce((a, b) => a.hp <= b.hp ? a : b) : rnd(); }
    let targets = M[mid].all ? foes : M[mid].hits ? Array.from({ length: M[mid].hits }, rnd) : [tg];
    if (u.st.brainrot && !M[mid].all && Formulas.rand() < PB().status.brainrot.wrongTarget) { const own = this.alive(this.enemies); targets = [own[Math.floor(Formulas.rand() * own.length)]]; pre.push(T("pbWrong", { user: u.name, target: targets[0].name })); }
    const go = () => targets[0].side === "party" ? this.beginPress("block", { user: u, move: mid, targets }) : this.resolve({ user: u, move: mid, targets }, null);
    if (pre.length) return this.say(pre, go); go();
  }
  // --- timed presses (§6): attack cue fixed after wind-up; block cue 400-900ms (seeded)
  beginPress(kind, act) {
    const P = PB().press; this.act = act; this.pressKind = kind; this.phase = "press"; this.t = 0; this.pressAt = null;
    this.cue = kind === "attack" ? P.attackCueMs : P.blockCueMin + Math.floor(Formulas.rand() * (P.blockCueMax - P.blockCueMin + 1));
    if (this.auto || (window.Debug && Debug.autoPerfect)) this.pressAt = this.forcePress != null ? this.cue + this.forcePress : (window.Debug && Debug.autoPerfect ? this.cue : null);
    if (this.auto && this.forcePress == null) { const x = Formulas.rand(); this.pressAt = this.cue + (x < 0.2 ? 0 : x < 0.7 ? 100 : 300); }
    if (this.auto) this.endPress();
  }
  endPress() { const r = PBF.pressResult(this.pressAt == null ? null : this.pressAt - this.cue, this.wide); this.presses.push(r); this.resolve(this.act, r); }
  resolve(a, press) {
    const m = PB().moves[a.move], u = a.user, lines = [], targets = a.targets.filter(t => t.hp > 0);
    const barkAt = lines.length, landed = [];
    for (const t of targets) {
      if (t.hp <= 0) continue; // multi-hit: target already KO'd by an earlier hit
      const dmg = PBF.damage(u, t, m, { targets: m.hits ? 1 : targets.length, attackPress: a.user.side === "party" ? press : null, blockPress: t.side === "party" && u.side === "enemy" ? press : null });
      t.hp = Math.max(0, t.hp - dmg); lines.push(T("pbHit", { user: u.name, move: m.name, target: t.name, dmg }) + (press && press !== "miss" ? " (" + press.toUpperCase() + ")" : ""));
      if (t.hp > 0 && m.status) { const l = this.applyStatus(u, t, m); if (l) { lines.push(l); landed.push(t); } }
      if (t.hp <= 0) lines.push(...this.koLines(t));
    }
    // bark: always for plain moves; for status moves only when the status landed (the lines describe it)
    // v0.4.3 self effects after the hit: selfBuff (cheer/guard, 1 turn; blocked by Rugged), healSelf (blocked by Pooped On)
    if (m.selfBuff && u.hp > 0 && !u.st.rugged) { if (m.selfBuff === "cheer") u.st.cheer = 2; else u.st.guard = { by: u.id, self: true };
      lines.push(T(m.selfBuff === "cheer" ? "pbCheer" : "pbGuard", { target: u.name })); }
    if (m.healSelf && u.hp > 0 && !u.st.pooped_on) { const n = Math.min(u.maxHp - u.hp, Math.floor(u.maxHp * m.healSelf)); if (n > 0) { u.hp += n; lines.push(T("pbHeal", { target: u.name, n })); } }
    const uniq = [...new Set(targets)];
    if (m.bark && (!m.status || landed.length)) lines.splice(barkAt, 0, T(m.bark, { target: (landed.length ? landed : uniq).length === 1 ? (landed[0] || uniq[0]).name : "everyone" }));
    this.say(lines, () => this.endTurn(u));
  }
  applyStatus(u, t, m) {
    const S = PB().status[m.status]; let c = m.chance;
    if (m.status === "cringe") c = PBF.skipChance(c, t);
    if (!(Formulas.rand() < c)) return null;
    if (m.status === "cringe") t.pendingSkip = true;
    else if (m.status === "rugged") { const had = ["cheer", "guard"].filter(k => t.st[k]); if (had.length) { const k = had[Math.floor(Formulas.rand() * had.length)]; u.st[k] = k === "guard" ? { by: u.id } : t.st[k]; } delete t.st.cheer; delete t.st.guard; t.st.rugged = S.turns; }
    else if (m.status === "gross_out") { const g = t.st.gross_out || { stacks: 0 }; t.st.gross_out = { stacks: Math.min(S.maxStacks, g.stacks + 1), turns: S.turns }; }
    else t.st[m.status] = S.turns; // doesn't stack; refreshes
    return T("pbStatus", { target: t.name, status: S.name });
  }
  koLines(u) { if (u.koSaid) return []; u.koSaid = true; const out = [T("pbFaint", { name: u.name })];
    if (u.cardId) out.push(T(PB().barkPrefix[u.cardId] + "_ko")); if (u.def0 && u.def0.barks && u.def0.barks.ko) out.push(...TL(u.def0.barks.ko)); return out; }
  // --- end of fight
  rewards() { const C = PB().coins; let coins = this.enemies.reduce((s, e) => s + C.flat + C.perLevel * e.level, 0);
    if (this.boss) coins *= C.boss; if (this.presses.length && this.presses.every(p => p !== "miss")) coins *= C.allGood;
    const xp = this.enemies.reduce((s, e) => s + Formulas.xpGain(e.def0.baseXP, e.level), 0); if (this.trainer && this.trainer.coins != null) coins = this.trainer.coins; // v0.4.4 trainer flat payout (Thorne 30)
    return { coins: Math.floor(coins), xp }; }
  win() {
    const g = this.game, r = this.rewards(), lines = [T("pbWin", { coins: r.coins, xp: r.xp })];
    g.inventory.addMoney(r.coins);
    const lvl = (name, obj, gain, cap) => { const L0 = obj.level; obj.xp += gain; obj.level = Math.min(cap, Formulas.levelForXp(obj.xp)); if (obj.level > L0) lines.push(T("pbLevel", { name, n: obj.level })); };
    lvl(this.player.name, g.stats, r.xp, Formulas.LEVEL_CAP);
    for (const c of this.cards) { const e = g.collection.list.find(x => x.uid === c.uid); if (!e || c.hp <= 0) continue; // KO'd: 0
      lvl(c.name, e, Math.floor(r.xp * (this.active.includes(c) ? 1 : PB().benchXp)), Formulas.LEVEL_CAP); }
    if (!this.group.wild && !g.defeatedGroups.includes(this.groupId)) g.defeatedGroups.push(this.groupId);
    if (this.trainer) { lines.push(T(this.trainer.winLine)); g.flags[this.trainer.id + "Beaten"] = true; }
    for (const e of this.enemies) if (e.def0.drop) { g.inventory.addPack(e.def0.drop.pack, e.def0.drop.n); lines.push(T("pbDrop", { pack: GAME_DATA.packs[e.def0.drop.pack].name })); }
    this.reward = r; this.finish("win", lines);
  }
  finish(result, lines) { this.result = result; this.phase = "end"; this.msgs.push(...lines.map(PBF.you)); this.after = () => { this.done = true; }; this.msgT = 0; }
  // --- input/update
  update(dt = 0) {
    const ms = dt * 1000; this.t += ms; this.anim = (this.anim || 0) + ms;
    if (this.phase === "msg" || this.phase === "end") {
      this.msgT += ms; if (this.auto || Input.wasPressed("a") || this.msgT > 1600) { this.msgs.shift(); this.msgT = 0; }
      if (!this.msgs.length) { const f = this.after; this.after = null; if (this.phase !== "end") this.phase = "busy"; if (f) f(); }
      return;
    }
    if (this.phase === "press") {
      if (Input.wasPressed("a") && this.pressAt == null) this.pressAt = this.t;
      const P = PB().press, k = this.wide ? P.wideMult : 1;
      if (this.pressAt != null || this.t > this.cue + P.good * k) this.endPress();
      return;
    }
    if (this.phase === "command") {
      const n = PB().layout.commands.length, u = this.actor;
      if (Input.wasPressed("left")) this.cmd = (this.cmd + n - 1) % n; if (Input.wasPressed("right")) this.cmd = (this.cmd + 1) % n;
      if (Input.wasPressed("a")) { const c = PB().layout.commands[this.cmd];
        if (c === "Run") return this.choose(this.cmd);
        this.sub = 0; this.tsel = 0; this.phase = c === "Special" && u.isPlayer ? "sub" : "target"; if (this.phase === "target" && !this.targetList().length) this.choose(this.cmd); }
      return;
    }
    if (this.phase === "sub") { if (Input.wasPressed("up") || Input.wasPressed("down")) this.sub ^= 1; if (Input.wasPressed("b")) this.phase = "command"; if (Input.wasPressed("a")) { this.tsel = 0; this.phase = "target"; } return; }
    if (this.phase === "target") { const L = this.targetList(), n = L.length;
      if (Input.wasPressed("b")) { this.phase = "command"; return; }
      if (n && (Input.wasPressed("left") || Input.wasPressed("up"))) this.tsel = (this.tsel + n - 1) % n; if (n && (Input.wasPressed("right") || Input.wasPressed("down"))) this.tsel = (this.tsel + 1) % n;
      if (Input.wasPressed("a")) this.choose(this.cmd, this.sub || 0, this.tsel); }
  }
  targetList() { const u = this.actor, c = PB().layout.commands[this.cmd]; if (c === "Item") return this.alive(this.party); if (c === "Swap") return this.swapList(u);
    const m = PB().moves[c === "Attack" ? (u.isPlayer ? "strike" : u.moves[0]) : this.specialMoves(u)[this.sub || 0]]; if (m.support) return this.alive(this.party); return m.all ? [] : this.alive(this.enemies); }
  // --- layout (decided): party x40-300; enemies x400-690; 1-3 one row 96px; 4-5 front 96 (feet 430) + back 48 (feet 370), back drawn first
  static layout(nParty, nEnemy) {
    const Lo = PB().layout, row = (n, x0, x1, s = 96) => Array.from({ length: n }, (_, i) => Math.round(n === 1 ? (x0 + x1) / 2 : x0 + s / 2 + (x1 - x0 - s) * i / (n - 1)));
    const party = row(nParty, Lo.party.x0, Lo.party.x1).map(x => ({ x, feet: Lo.party.feet, size: Lo.party.size, row: "front" }));
    let enemies; if (nEnemy <= 3) enemies = row(nEnemy, Lo.enemies.x0, Lo.enemies.x1).map(x => ({ x, feet: Lo.front.feet, size: Lo.front.size, row: "front" }));
    else { const nf = nEnemy - 2; enemies = row(nf, Lo.enemies.x0, Lo.enemies.x1).map(x => ({ x, feet: Lo.front.feet, size: Lo.front.size, row: "front" }))
      .concat((Lo.back.xs || row(2, Lo.enemies.x0 + 40, Lo.enemies.x1 - 40, 48)).map(x => ({ x, feet: Lo.back.feet, size: Lo.back.size, row: "back" }))); }
    return { party, enemies };
  }
  drawUnit(ctx, u, p, flip) {
    const s = p.size, f = Math.floor((this.anim || 0) / PB().frameMs) % 3, key = "ft_" + u.art + "_" + s + "_" + f;
    const sk = s >= 96 ? 96 : 48, sh = s >= 96 ? s / 4 : 16; if (!Sprites.draw(ctx, "shadow_" + sk, p.x - s / 2, p.feet - sh / 2, s, sh)) { ctx.fillStyle = "rgba(26,20,35,0.3)"; ctx.fillRect(p.x - s / 3, p.feet - 4, s * 2 / 3, 8); }
    if (u.hp > 0) { const img = Sprites.get(key);
      if (img) { ctx.save(); ctx.imageSmoothingEnabled = false; if (flip) { ctx.translate(p.x + s / 2, 0); ctx.scale(-1, 1); ctx.drawImage(img, 0, p.feet - s, s, s); } else ctx.drawImage(img, p.x - s / 2, p.feet - s, s, s); ctx.restore(); }
      else { ctx.fillStyle = u.boss ? "#e8322b" : u.side === "enemy" ? "#ff7a1a" : "#ffd400"; ctx.fillRect(p.x - s / 3, p.feet - s * 0.9, s * 2 / 3, s * 0.9); } }
    const bw = s >= 96 ? 80 : 48, by = p.feet - s - 14; ctx.fillStyle = "#1a1423"; ctx.fillRect(p.x - bw / 2 - 1, by - 1, bw + 2, 8);
    ctx.fillStyle = u.hp / u.maxHp > 0.5 ? "#8fe03a" : u.hp / u.maxHp > 0.2 ? "#ffd400" : "#e8322b"; ctx.fillRect(p.x - bw / 2, by, Math.round(bw * u.hp / u.maxHp), 6);
    ctx.fillStyle = "#1a1423"; ctx.font = (s >= 96 ? 10 : 9) + "px monospace";
    const back = p.row === "back", maxW = back ? PB().layout.back.labelW : bw + 8; // v0.4.1: back row = name only, shrink font to fit
    let label = back ? u.name : u.name + " L" + u.level, nm = u.name; const fits = t => !ctx.measureText || !ctx.measureText(t) || ctx.measureText(t).width <= maxW || ctx.measureText(t).width === undefined;
    if (back) for (let fs = 8; !fits(label) && fs >= PB().layout.back.minFont; fs--) ctx.font = fs + "px monospace";
    while (!fits(label) && nm.length > 3) { nm = nm.slice(0, -1); label = back ? nm + "." : nm + ". L" + u.level; }
    p.label = label; p.labelFont = ctx.font; const lw = (ctx.measureText && ctx.measureText(label) && ctx.measureText(label).width) || label.length * 6; ctx.fillStyle = "rgba(246,241,228,0.85)"; const lx = back ? p.x - lw / 2 : p.x - bw / 2; ctx.fillRect(lx - 2, by - 14, lw + 4, 12); ctx.fillStyle = "#1a1423"; ctx.fillText(label, lx, by - 4);
    const S = PB().status, tags = Object.keys(u.st).filter(k => S[k]).map(k => S[k].tag).concat(u.pendingSkip ? ["CRG"] : [], u.numb > 0 ? ["NUMB"] : [], u.st.cheer ? ["CHR"] : [], u.st.guard ? ["GRD"] : []);
    if (tags.length) { ctx.fillStyle = "#e8322b"; ctx.fillText(tags.join(" "), p.x - bw / 2, p.feet + 12); }
  }
  render(ctx) {
    const Lo = PB().layout; ctx.fillStyle = "#c49a6c"; ctx.fillRect(0, 0, 720, 528); Sprites.draw(ctx, "bg_" + (this.group.bg || "drop_day"), 0, 0, 720, 528);
    const lay = PartyBattle.layout(this.party.length, this.enemies.length); this.lastLayout = lay;
    this.enemies.forEach((u, i) => { const p = lay.enemies[i]; if (u.boss && p.row === "front" && Sprites.get("ft_" + u.art + "_" + Lo.bossSize + "_0")) p.size = Lo.bossSize; }); // 144px boss art
    lay.enemies.map((p, i) => [p, this.enemies[i]]).sort((a, b) => (a[0].row === "back" ? 0 : 1) - (b[0].row === "back" ? 0 : 1)).forEach(([p, u]) => this.drawUnit(ctx, u, p, true));
    if (this.trainer) { const k = "ft_" + this.trainer.art + "_96_" + Math.floor((this.anim || 0) / PB().frameMs) % 3, img = Sprites.get(k); // trainer stands behind his cards (not a fighter)
      if (img) { ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(690, 0); ctx.scale(-1, 1); ctx.drawImage(img, 0, 236, 96, 96); ctx.restore(); } else { ctx.fillStyle = "#3fa34d"; ctx.fillRect(610, 250, 64, 82); } }
    this.party.forEach((u, i) => this.drawUnit(ctx, u, lay.party[i], false));
    if (this.phase === "target") { const L = this.targetList(), t = L[this.tsel]; if (t) { const all = this.party.concat(this.enemies), lp = this.party.includes(t) ? lay.party[this.party.indexOf(t)] : this.enemies.includes(t) ? lay.enemies[this.enemies.indexOf(t)] : null;
      if (!lp) { UI.frame(ctx, 300, 330, 240, 24 + L.length * 22); ctx.fillStyle = UI.textColor(); ctx.font = "15px monospace"; L.forEach((b, i) => ctx.fillText((i === this.tsel ? "> " : "  ") + b.name + " " + b.hp + "/" + b.maxHp, 314, 350 + i * 22)); } else {
      ctx.fillStyle = "#ffd400"; ctx.beginPath(); ctx.moveTo(lp.x - 8, lp.feet - lp.size - 34); ctx.lineTo(lp.x + 8, lp.feet - lp.size - 34); ctx.lineTo(lp.x, lp.feet - lp.size - 22); ctx.fill(); } } }
    if (this.phase === "press") { const P = PB().press, d = this.t - this.cue, on = Math.abs(d) <= P.good * (this.wide ? 2 : 1);
      ctx.fillStyle = on ? "#ffd400" : "rgba(255,255,255,0.6)"; ctx.font = "bold 28px monospace"; ctx.fillText(d < -P.good ? "..." : "Z!", 336, 300);
      if (window.Debug && Debug.open) { ctx.font = "12px monospace"; ctx.fillText("cue " + this.cue + "ms t " + Math.round(this.t), 300, 320); } }
    // command bar y446-528
    ctx.fillStyle = "#1a1423"; ctx.fillRect(0, Lo.bar.y, 720, Lo.bar.h); ctx.fillStyle = "#f6f1e4"; ctx.font = "16px monospace";
    const u = this.actor; ctx.fillText((u && u.side === "party" && this.phase !== "msg" ? u.name : "") + "  STA " + this.stamina + "/" + PB().stamina.cap + "  Potions " + (this.game.inventory.items.potion || 0), 20, Lo.bar.y + 24);
    Lo.commands.forEach((c, i) => { const x = 20 + i * 140, sel = this.phase === "command" && i === this.cmd; if (sel) { ctx.fillStyle = "#ffd400"; ctx.fillRect(x - 6, Lo.bar.y + 38, c.length * 10 + 12, 26); }
      ctx.fillStyle = sel ? "#1a1423" : (this.phase === "command" ? "#f6f1e4" : "#6b5a7a"); ctx.fillText(c, x, Lo.bar.y + 57); });
    if (this.phase === "sub") { UI.frame(ctx, 170, 330, 200, 80); ctx.fillStyle = UI.textColor(); this.specialMoves(u).forEach((m, i) => ctx.fillText((i === this.sub ? "> " : "  ") + PB().moves[m].name, 186, 362 + i * 24)); }
    if (this.msgs.length) { UI.frame(ctx, 20, 16, 680, 64); ctx.fillStyle = UI.textColor(); ctx.font = "15px monospace"; UI.wrap(ctx, this.msgs[0], 640).slice(0, 2).forEach((l, i) => ctx.fillText(l, 40, 42 + i * 20)); }
  }
}
Object.assign(window, { PartyBattle, PBF });
