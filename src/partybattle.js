// Party battles (v0.4.0 base, v0.4.6 rework). Numbers in src/data/battle.js and src/data/enemies.js.
// v0.4.6 (Director/Commissioner): creatures only (no player unit, no people sprites), no timing step ever (flat damage),
// turn-based by SPD, no target picking: everyone hits the opposing FRONT creature (party front = active[0] side closest to the
// enemies; enemy front = first standing enemy). Moves with target "all" hit every opposing creature. Brainrot = 33% lose the turn.
// Pacing (v0.4.5): every line waits for Z/tap, HP bars drain first, the action menu waits, turns never chain.
// The old 1v1 battle.js stays debug-only.
const PB = () => GAME_DATA.pb;
const PBF = { // pure helpers (tested directly)
  typeMult(a, d) { const r = PB().typeChart[a] || {}; return r[d] ?? 1; },
  buffCount(u) { return (u.st.cheer ? 1 : 0) + (u.st.guard ? 1 : 0); },
  effAtk(u) { return u.atk * (u.st.burnout ? PB().status.burnout.atk : 1); },
  effDef(u) { return u.def * (u.st.pooped_on ? PB().status.pooped_on.def : 1); },
  movePower(m, target) { return m.perBuff ? Math.min(m.maxPower, m.power + m.perBuff * PBF.buffCount(target)) : m.power; },
  moveTarget(m) { return m && m.target === "all" ? "all" : "front"; },
  // §8: base = floor(((2L/5+2)*power*ATK/DEF)/50+2); dmg = max(1, floor(base*type*stab*rand*flatAttack*mods)); hits on the party x flat.block again.
  // v0.4.6 flat = the old Good press multipliers (party attack x1.2, hits on the party x0.7). o.raw skips them (formula tests).
  damage(att, def, m, o = {}) {
    const power = PBF.movePower(m, def), base = Math.floor(((2 * att.level / 5 + 2) * power * PBF.effAtk(att) / PBF.effDef(def)) / 50 + 2);
    const mt = PBF.moveType(att, m), type = PBF.typeMult(mt, def.type), stab = mt === att.type ? PB().stab : 1;
    const rand = o.rand ?? (Formulas.fixedDamageRand ? 1 : PB().randMin + (PB().randMax - PB().randMin) * Formulas.rand());
    const M = PB().mods, Fl = PB().flat, mods = (att.st.cheer ? M.cheer : 1) * (def.st.guard ? M.guard : 1) * ((o.targets || 1) > 1 ? M.multiTarget : 1);
    const atkF = !o.raw && att.side === "party" ? Fl.attack : 1, blkF = !o.raw && def.side === "party" && att.side === "enemy" ? Fl.block : 1;
    let dmg = Math.max(1, Math.floor(base * type * stab * rand * atkF * mods));
    if (blkF !== 1) dmg = Math.max(1, Math.floor(dmg * blkF));
    return dmg;
  },
  // §7 skip cap: no stacking, Numb immunity, 40% cap; bosses half (max 20%), 2nd skip in the fight halved.
  skipChance(c, t) { const K = PB().skipCap; if (t.pendingSkip || t.numb > 0) return 0;
    if (t.boss) c = Math.min(c * K.bossMult, K.bossMax) * (t.skips > 0 ? K.bossSecondMult : 1); return Math.min(c, K.max); },
  // "You does a dance" -> "you do a dance" (safety net for writer lines that name You).
  you(line) { const Y = PB().you; if (!line || !new RegExp("\\b" + Y.name + "\\b").test(line)) return line;
    let s = line.replace(new RegExp("\\b" + Y.name + "'s\\b", "g"), "Your");
    s = s.replace(new RegExp("\\b" + Y.name + " (\\w+)(?: (inside and) (\\w+))?", "g"), (m, v, mid, v2) => Y.name + " " + (Y.verbs[v] || v) + (mid ? " " + mid + " " + (Y.verbs[v2] || v2) : ""));
    s = s.replace(new RegExp("(\\b" + Y.name + " \\w+(?: \\w+)*? )their\\b"), "$1" + Y.their);
    s = s.replace(new RegExp("(\\b" + Y.name + " [^.!?]*? and )(\\w+)", "g"), (m, a, v) => a + (Y.verbs[v] || v));
    s = s.replace(new RegExp("(\\b" + Y.name + " [^.!?]*?) it's\\b", "g"), "$1 you're");
    s = s.replace(/(^|[.!?]\s+)([^.!?]*?)\bYou\b/g, (m, a, b) => a + b + (b.length ? "you" : "You")).replace(/([.!?]\s+'?)you\b/g, "$1You").replace(/^you\b/, "You");
    s = s.replace(/^('?)you\b/, "$1You");
    s = s.replace(/\bYour\b/g, (m, i) => i === 0 || /[.!?]\s*'?$/.test(s.slice(0, i)) ? "Your" : "your");
    return s; },
  moveType(u, m) { return m.type === "own" ? u.type : m.type; }, // card_basic hits in the card's own type
  makeUnit(side, o) {
    const b = o.base, L = o.level, hx = o.holo ? GAME_DATA.holoStatMult : 1, st = v => Math.floor(Formulas.statAt(v, L) * hx);
    const hp = o.hp || Math.floor(Math.floor(Formulas.hpAt(b.hp, L) * hx) * (o.hpMult || 1));
    const clean = Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null));
    return Object.assign(clean, { side, level: L, maxHp: hp, hp, shown: hp, atk: st(b.atk), def: st(b.def), spd: st(b.spd), st: {}, skips: 0, numb: 0, pendingSkip: false });
  },
  // Group member -> enemy unit. People (enemies.<id>.person) send their creature at the slot's level (owner = the person).
  makeEnemy(id, L, i, slot) { // slot: optional 3rd member field { hpMult } (unused in data; sim tuning via SIM_HPM)
    let E = GAME_DATA.enemies[id], owner = null, baseXP;
    if (!E) throw new Error("Unknown enemy " + id);
    let P = null; if (E.person) { owner = id; P = E; baseXP = E.baseXP; E = GAME_DATA.enemies[P.unit || "card_" + P.sends]; }
    const def0 = owner ? Object.assign({}, E, { baseXP, owner }, P.noRun ? { noRun: P.noRun } : {}, P.lowHp ? { lowHp: P.lowHp } : {}, P.drop ? { drop: P.drop } : {}) : E; // person-level boss bits (Maxx)
    return PBF.makeUnit("enemy", { id: id + "_" + i, eid: owner ? (P.unit || "card_" + P.sends) : id, owner, art: E.cardArt || id, name: E.name, short: E.short, type: E.type, base: E.base, level: L,
      moves: E.moves, ai: E.ai, boss: !!E.boss, hp: E.hp, hpMult: (slot && slot.hpMult) || E.hpMult, def0 });
  }
};
class PartyBattle {
  constructor(game, groupId, opts = {}) {
    const G = GAME_DATA.enemyGroups[groupId]; if (!G) throw new Error("Unknown enemy group " + groupId);
    this.game = game; this.groupId = groupId; this.group = G; this.boss = !!G.boss; this.auto = !!opts.auto;
    this.t = 0; this.round = 0; this.stamina = PB().stamina.start; this.msgs = []; this.done = false; this.result = null; this.cmd = 0; this.tsel = 0; this.fx = null;
    const deck = this.deckEntries();
    this.cards = deck.map(e => { const c = GAME_DATA.cards[e.cardId]; return PBF.makeUnit("party", { id: e.uid, uid: e.uid, cardId: e.cardId, art: e.cardId, name: c.name, short: c.short, type: c.type, base: c.base, level: e.level, holo: e.holo, moves: c.moves, rarity: c.rarity }); });
    this.active = this.cards.slice(0, PB().activeCards); this.bench = this.cards.slice(PB().activeCards);
    this.enemies = G.members.map(([id, L, slot], i) => PBF.makeEnemy(id, L, i, slot));
    this.trainer = G.trainer || null;
    const lines = (opts.pre || []).slice();
    const owners = [...new Set(this.enemies.map(e => e.owner).filter(Boolean))]; for (const o of owners) lines.push(...TL(GAME_DATA.enemies[o].intro)); // each intro once per fight
    lines.push(T("pbStart", { n: this.enemies.length > 1 ? this.enemies[0].name + " & co." : this.enemies[0].name }));
    for (const e of this.enemies.filter((e, i, a) => !e.owner && a.findIndex(x => x.eid === e.eid && !x.owner) === i)) if (e.def0.barks && e.def0.barks.enter) lines.push(...TL(e.def0.barks.enter));
    for (const c of this.active) lines.push(T(PB().barkPrefix[c.cardId] + "_enter"));
    this.say(lines, () => this.startRound());
  }
  // Party: the deck (DESIGN §6, 6 cards; first 2 active). Empty deck -> the first 6 binder cards stand in (no deck picker yet).
  deckEntries() { const g = this.game, col = g.collection.list, byUid = u => col.find(e => e.uid === u);
    let list = (g.deck || []).map(byUid).filter(Boolean); if (!list.length) list = g.collection.sorted();
    const act = (g.active || []).map(byUid).filter(Boolean); list = act.concat(list.filter(e => !act.includes(e)));
    return list.slice(0, PB().deckSize); }
  static canFight(game) { return game.collection.list.length > 0; } // v0.4.6: no player unit, so no cards = no fight
  get party() { return this.active; }
  alive(list) { return list.filter(u => u.hp > 0); }
  all() { return this.active.concat(this.enemies); }
  front(side) { return (side === "party" ? this.active : this.enemies).find(u => u.hp > 0) || null; }
  foesOf(u) { return u.side === "party" ? this.enemies : this.active; }
  // --- flow
  say(lines, then) { this.msgs.push(...lines.filter(Boolean).map(PBF.you)); this.after = then || this.after; this.phase = "msg"; this.msgT = 0; }
  startRound() {
    this.round++; if (this.round > 1) this.stamina = Math.min(PB().stamina.cap, this.stamina + PB().stamina.perRound);
    this.order = PartyBattle.turnOrder(this.alive(this.all())); this.turn = 0;
    this.nextTurn();
  }
  // §6: SPD desc; ties: party side, then higher level, then a seeded coin flip.
  static turnOrder(units) { const flip = new Map(units.map(u => [u, Formulas.rand()]));
    return units.slice().sort((a, b) => b.spd - a.spd || (a.side === b.side ? 0 : a.side === "party" ? -1 : 1) || b.level - a.level || flip.get(a) - flip.get(b)); }
  nextTurn() {
    if (this.checkEnd()) return;
    const u = this.order[this.turn++]; if (!u) return this.startRound();
    if (u.hp <= 0 || (u.side === "party" && !this.active.includes(u))) return this.nextTurn();
    this.actor = u;
    if (u.st.guard && u.st.guard.self) delete u.st.guard; // v0.4.3 self-Guard (Beauty Mode/Play Dead) lasts until the user's next turn
    if (u.pendingSkip) { u.log = (u.log || "") + "S"; u.pendingSkip = false; u.skips++; u.numb = PB().skipCap.numbTurns; u.skippedNow = true; return this.say([T("pbSkip", { name: u.name })], () => this.endTurn(u)); }
    // v0.4.6 Brainrot: 33% chance the turn is lost (rolled before the player picks a move)
    if (u.st.brainrot && Formulas.rand() < PB().status.brainrot.loseTurn) { u.log = (u.log || "") + "B"; return this.say([T("pbWrong", { user: u.name })], () => this.endTurn(u)); }
    u.log = (u.log || "") + "A";
    if (u.side === "party") { this.phase = "command"; this.cmd = 0; this.sub = null; if (this.auto) this.autoParty(u); return; }
    this.enemyTurn(u);
  }
  endTurn(u) { // §7: effects tick at the end of the unit's own turn
    const S = PB().status, lines = [], pf = this.front("party"), ef = this.front("enemy");
    if (u.st.gross_out && u.hp > 0) { const d = Math.max(1, Math.floor(u.maxHp * S.gross_out.dot)) * u.st.gross_out.stacks; u.hp = Math.max(0, u.hp - d); }
    for (const k of ["burnout", "pooped_on", "rugged", "brainrot", "cheer"]) if (u.st[k] && --u.st[k] <= 0) delete u.st[k];
    if (u.st.gross_out && --u.st.gross_out.turns <= 0) delete u.st.gross_out;
    if (!u.skippedNow && u.numb > 0) u.numb--; u.skippedNow = false;
    if (u.hp <= 0) lines.push(...this.koLines(u));
    lines.push(...this.frontLines(pf, ef));
    if (lines.length) return this.say(lines, () => this.nextTurn());
    this.nextTurn();
  }
  // After KOs: a fainted active slot is refilled from the bench right away (it acts from next round); then announce a new front.
  frontLines(pf, ef) { const out = [];
    for (let i = 0; i < this.active.length; i++) if (this.active[i].hp <= 0) { const nb = this.bench.find(b => b.hp > 0);
      if (nb) { this.bench.splice(this.bench.indexOf(nb), 1, this.active[i]); this.active[i] = nb; nb.swappedIn = this.round; out.push(T(PB().barkPrefix[nb.cardId] + "_enter")); } }
    if (!this.front("enemy") || !this.front("party")) return out; // fight is over: no front-up line
    const np = this.front("party"), ne = this.front("enemy");
    if (pf && pf.hp <= 0 && np !== pf) out.push(T("pbFrontUp", { name: np.name }));
    if (ef && ef.hp <= 0 && ne !== ef) out.push(T("pbFrontUpEnemy", { name: ne.name }));
    return out; }
  checkEnd() {
    if (this.done || this.phase === "end") return true;
    if (!this.alive(this.enemies).length) { this.win(); return true; }
    if (!this.alive(this.cards).length) { const L = [T("pbLose")]; if (this.trainer) { L.push(T(this.trainer.loseLine)); this.game.flags[this.trainer.id + "Lost"] = true; } this.finish("lose", L); return true; } // v0.4.6: lost when every card is down
    return false;
  }
  // --- party commands: Attack / Special / Item / Swap / Run (the move is the only choice; it always goes at the front, or at everyone for "all")
  commandList() { return PB().layout.commands; }
  moveFor(u, c) { return c === "Attack" ? u.moves[0] : u.moves[1]; }
  choose(cmdIdx, subIdx = 0, targetIdx = 0) { // used by input and tests
    const u = this.actor, c = PB().layout.commands[cmdIdx];
    if (c === "Run") return this.tryRun();
    if (c === "Swap") return this.swap(u, targetIdx);
    if (c === "Item") { if ((this.game.inventory.items.potion || 0) < 1) return this.say([T("pbNoPotion")], () => { this.phase = "command"; });
      if (this.stamina < 1) return this.say([T("pbNoStamina")], () => { this.phase = "command"; });
      const t = this.alive(this.active)[targetIdx] || u; return this.usePotion(u, t); }
    this.resolve({ user: u, move: this.moveFor(u, c) });
  }
  // Swap (a turn action): trade places with the other active card (changes who's in front) or bring in a bench card. Incoming acts next round.
  swapList(u) { if (!u || !this.active.includes(u)) return []; return this.alive(this.active).filter(x => x !== u).concat(this.alive(this.bench)); }
  swap(u, idx = 0) { const L = this.swapList(u), nb = L[Math.min(idx, L.length - 1)];
    if (!nb) return this.say([T("pbSwapNone")], () => { this.phase = "command"; });
    const ai = this.active.indexOf(u);
    if (this.active.includes(nb)) { const bi = this.active.indexOf(nb); this.active[ai] = nb; this.active[bi] = u; return this.say([T("pbSwapActive", { name: this.front("party").name })], () => this.endTurn(u)); }
    const bi = this.bench.indexOf(nb); this.active[ai] = nb; this.bench[bi] = u; nb.swappedIn = this.round;
    this.say([T("pbSwap", { out: u.name, in: nb.name }), T(PB().barkPrefix[nb.cardId] + "_enter")], () => this.endTurn(u)); }
  tryRun() {
    if (this.trainer) return this.say([T(this.trainer.noRun)], () => { this.phase = "command"; }); // v0.4.4 trainer fights: no running
    if (this.boss) return this.say([T(this.enemies[0].def0.noRun || "pbRunFail")], () => { this.phase = "command"; });
    if (Formulas.rand() < PB().runChance) return this.finish("run", [T("pbRun")]);
    this.say([T("pbRunFail")], () => this.endTurn(this.actor));
  }
  usePotion(u, t) {
    this.stamina--; this.potionRound = this.round; if (t.st.pooped_on) return this.say([T("pbNoHeal", { target: t.name })], () => this.endTurn(u));
    this.game.inventory.remove("potion"); const n = Math.min(t.maxHp - t.hp, Math.floor(t.maxHp * PB().potionHeal)); t.hp += n;
    this.say([T("pbHeal", { target: t.name, n })], () => this.endTurn(u));
  }
  // auto mode (tests/sim): one Potion per round on an ally under 40%; otherwise 50/50 basic/special (as the v0.4.1 sim)
  autoParty(u) {
    const hurt = this.alive(this.active).find(x => x.hp < x.maxHp * 0.4 && !x.st.pooped_on);
    if (hurt && this.potionRound !== this.round && this.stamina >= 1 && (this.game.inventory.items.potion || 0) > 0) return this.usePotion(u, hurt);
    this.choose(Formulas.rand() < 0.5 ? 1 : 0); }
  // --- enemy AI: cards 50/50 basic/special; Maxx (boss) keeps his v0.4.1 pattern. Targets are never picked: front, or all.
  enemyTurn(u) {
    const pre = []; let mid;
    if (u.ai === "maxx") { const low = u.hp < u.maxHp / 2; if (low && !u.saidLow) { u.saidLow = true; pre.push(T(u.def0.lowHp)); }
      if (this.round % 3 === 0) mid = "chat_spam"; else if (low) mid = Formulas.rand() < 0.75 ? "hot_take" : "donation_goal"; else mid = Formulas.rand() < 0.35 ? "donation_goal" : "hot_take"; }
    else mid = u.moves[Formulas.rand() < 0.5 ? 0 : 1];
    const go = () => this.resolve({ user: u, move: mid });
    if (pre.length) return this.say(pre, go); go();
  }
  resolve(a) {
    const m = PB().moves[a.move], u = a.user, foeSide = u.side === "party" ? "enemy" : "party", lines = [], pf = this.front("party"), ef = this.front("enemy");
    const all = PBF.moveTarget(m) === "all", group = all ? this.alive(this.foesOf(u)) : null, landed = [], hit = [];
    if (all) lines.push(T("pbHitAll", { move: m.name, user: u.name })); // once, then the per-target damage lines
    const barkAt = lines.length, n = all ? group.length : (m.hits || 1);
    for (let i = 0; i < n; i++) {
      const t = all ? group[i] : this.front(foeSide); // multi-hit: the next hit goes at whoever is in front now
      if (!t || t.hp <= 0) continue;
      const dmg = PBF.damage(u, t, m, { targets: all ? group.length : 1 });
      t.hp = Math.max(0, t.hp - dmg); hit.push(t); lines.push(T("pbHit", { user: u.name, move: m.name, target: t.name, dmg }));
      if (t.hp > 0 && m.status) { const l = this.applyStatus(u, t, m); if (l) { lines.push(l); landed.push(t); } }
      if (t.hp <= 0) lines.push(...this.koLines(t));
    }
    if (all && hit.length) this.fx = { units: hit.slice(), t0: this.anim || 0 }; // render-only burst on every creature hit, at once
    // v0.4.3 self effects after the hit: selfBuff (cheer/guard, 1 turn; blocked by Rugged), healSelf (blocked by Pooped On)
    if (m.selfBuff && u.hp > 0 && !u.st.rugged) { if (m.selfBuff === "cheer") u.st.cheer = 2; else u.st.guard = { by: u.id, self: true };
      lines.push(T(m.selfBuff === "cheer" ? "pbCheer" : "pbGuard", { target: u.name })); }
    if (m.healSelf && u.hp > 0 && !u.st.pooped_on) { const h = Math.min(u.maxHp - u.hp, Math.floor(u.maxHp * m.healSelf)); if (h > 0) { u.hp += h; lines.push(T("pbHeal", { target: u.name, n: h })); } }
    // bark: always for plain moves; for status moves only when the status landed (the lines describe it)
    const uniq = [...new Set(hit)];
    if (m.bark && uniq.length && (!m.status || landed.length)) lines.splice(barkAt, 0, T(m.bark, { target: (landed.length ? landed : uniq).length === 1 ? (landed[0] || uniq[0]).name : "everyone" }));
    lines.push(...this.frontLines(pf, ef));
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
  // KO lines. Party card: faint + its KO bark. Person's creature: the person's ko line only when it's their LAST one standing, else the plain faint.
  koLines(u) { if (u.koSaid) return []; u.koSaid = true;
    if (u.owner) { const last = !this.enemies.some(e => e !== u && e.owner === u.owner && e.hp > 0); return last ? TL(GAME_DATA.enemies[u.owner].ko) : [T("pbFaint", { name: u.name })]; }
    const out = [T("pbFaint", { name: u.name })];
    if (u.cardId) out.push(T(PB().barkPrefix[u.cardId] + "_ko")); else if (u.def0 && u.def0.barks && u.def0.barks.ko) out.push(...TL(u.def0.barks.ko)); return out; }
  // --- end of fight
  rewards() { const C = PB().coins; let coins = this.enemies.reduce((s, e) => s + C.flat + C.perLevel * e.level, 0);
    if (this.boss) coins *= C.boss;
    const xp = this.enemies.reduce((s, e) => s + Formulas.xpGain(e.def0.baseXP, e.level), 0); if (this.trainer && this.trainer.coins != null) coins = this.trainer.coins; // v0.4.4 trainer flat payout (Thorne 30)
    if (this.group.coins != null) coins = this.group.coins; // v0.4.6 Director: explicit per-group payout (goons keep 11/31/66 after the level drop); XP still follows level
    return { coins: Math.floor(coins), xp }; }
  win() { // v0.4.6: no player XP; cards still level (active 100%, bench 50%, KO'd 0)
    const g = this.game, r = this.rewards(), lines = [T("pbWin", { coins: r.coins, xp: r.xp })];
    g.inventory.addMoney(r.coins);
    const lvl = (name, obj, gain, cap) => { const L0 = obj.level; obj.xp += gain; obj.level = Math.min(cap, Formulas.levelForXp(obj.xp)); if (obj.level > L0) lines.push(T("pbLevel", { name, n: obj.level })); };
    for (const c of this.cards) { const e = g.collection.list.find(x => x.uid === c.uid); if (!e || c.hp <= 0) continue;
      lvl(c.name, e, Math.floor(r.xp * (this.active.includes(c) ? 1 : PB().benchXp)), Formulas.LEVEL_CAP); }
    if (!this.group.wild && !g.defeatedGroups.includes(this.groupId)) g.defeatedGroups.push(this.groupId);
    if (this.trainer) { lines.push(T(this.trainer.winLine)); g.flags[this.trainer.id + "Beaten"] = true; }
    for (const e of this.enemies) if (e.def0.drop) { g.inventory.addPack(e.def0.drop.pack, e.def0.drop.n); lines.push(T("pbDrop", { pack: GAME_DATA.packs[e.def0.drop.pack].name })); }
    this.reward = r; this.finish("win", lines);
  }
  finish(result, lines) { this.result = result; this.phase = "end"; this.msgs.push(...lines.map(PBF.you)); this.after = () => { this.done = true; }; this.msgT = 0; }
  // --- input/update
  update(dt = 0) {
    const ms = dt * 1000; this.t += ms; this.anim = (this.anim || 0) + ms; this.drain(ms);
    if (this.phase === "msg" || this.phase === "end") {
      this.msgT += ms; // v0.4.5: never auto-advances; Z/tap only, after minMs and once the HP bars have drained
      if (this.msgs.length && (this.auto || (this.msgReady() && Input.wasPressed("a")))) { this.msgs.shift(); this.msgT = 0; }
      if (!this.msgs.length) { const f = this.after; this.after = null; if (this.phase !== "end") this.phase = "busy"; if (f) f(); }
      return;
    }
    if (this.phase === "command") {
      const n = PB().layout.commands.length;
      if (Input.wasPressed("left")) this.cmd = (this.cmd + n - 1) % n; if (Input.wasPressed("right")) this.cmd = (this.cmd + 1) % n;
      if (Input.wasPressed("a")) { const c = PB().layout.commands[this.cmd];
        if (c === "Item" || c === "Swap") { this.tsel = 0; if (this.targetList().length && (c === "Swap" || ((this.game.inventory.items.potion || 0) > 0 && this.stamina >= 1))) { this.phase = "target"; return; } }
        this.choose(this.cmd); }
      return;
    }
    if (this.phase === "target") { const L = this.targetList(), n = L.length; // Item: which ally to heal; Swap: who to trade places with
      if (Input.wasPressed("b")) { this.phase = "command"; return; }
      if (n && (Input.wasPressed("left") || Input.wasPressed("up"))) this.tsel = (this.tsel + n - 1) % n; if (n && (Input.wasPressed("right") || Input.wasPressed("down"))) this.tsel = (this.tsel + 1) % n;
      if (Input.wasPressed("a")) this.choose(this.cmd, 0, this.tsel); }
  }
  // v0.4.5 HP bars drain to the new value (<= drainMs) so the damage can be seen landing
  drain(ms) { const D = PB().pace; let busy = false;
    for (const u of this.all().concat(this.bench)) { if (u.shown == null || this.auto) { u.shown = u.hp; continue; } if (u.shown === u.hp) continue;
      const step = Math.max(D.drainMinPerSec, u.maxHp * 1000 / D.drainMs) * ms / 1000;
      u.shown = u.shown > u.hp ? Math.max(u.hp, u.shown - step) : Math.min(u.hp, u.shown + step); busy = true; }
    if (busy) this.settle = PB().pace.settleMs; else if (this.settle > 0) this.settle -= ms; }
  draining() { return this.all().concat(this.bench).some(u => u.shown != null && u.shown !== u.hp) || this.settle > 0; }
  msgReady() { return this.msgT >= PB().pace.minMs && !this.draining(); }
  targetList() { const u = this.actor, c = PB().layout.commands[this.cmd]; if (c === "Item") return this.alive(this.active); if (c === "Swap") return this.swapList(u); return []; }
  // --- layout v0.4.6 (Artist, 720x528). Index 0 = front: party front is the right-most slot, enemy front the left-most.
  static layout(nParty, nEnemy) {
    const Lo = PB().layout, row = (n, x0, x1, s) => Array.from({ length: n }, (_, i) => Math.round(n === 1 ? (x0 + x1) / 2 : x0 + s / 2 + (x1 - x0 - s) * i / (n - 1)));
    const side = (n, A, three, front) => { if (n <= 2) { const xs = row(n, A.x0, A.x1, Lo.big); if (front === "right") xs.reverse(); return xs.map(x => ({ x, feet: A.feet, size: Lo.big, row: "front" })); }
      return three.map((x, i) => ({ x, feet: A.feet, size: i === 1 ? Lo.big : Lo.mid, row: "front" })); };
    const party = side(Math.min(nParty, 3), Lo.party, Lo.three.party, "right");
    let enemies; if (nEnemy <= 3) enemies = side(nEnemy, Lo.enemies, Lo.three.enemies, "left");
    else { const C = Lo.crowd, fx = nEnemy - 2 === 3 ? C.front : C.frontTwo;
      enemies = fx.map(x => ({ x, feet: Lo.enemies.feet, size: Lo.mid, row: "front" })).concat(C.back.xs.map(x => ({ x, feet: C.back.feet, size: C.back.size, row: "back" }))); }
    return { party, enemies };
  }
  sprite(art, s, f) { for (const z of [s].concat(PB().fighterSizes(art))) { const img = Sprites.get("ft_" + art + "_" + z + "_" + f); if (img) return img; } return null; }
  drawUnit(ctx, u, p, flip) {
    const s = p.size, f = Math.floor((this.anim || 0) / PB().frameMs) % 3, sh = s / 4; u._p = p;
    if (!Sprites.draw(ctx, "shadow_96", p.x - s / 2, p.feet - sh / 2, s, sh)) { ctx.fillStyle = "rgba(26,20,35,0.3)"; ctx.fillRect(p.x - s / 3, p.feet - 4, s * 2 / 3, 8); }
    const hpS = u.shown != null ? u.shown : u.hp, fr = hpS / u.maxHp;
    if (hpS > 0) { const img = this.sprite(u.art, s, f);
      if (img) { ctx.save(); ctx.imageSmoothingEnabled = false; if (flip) { ctx.translate(p.x + s / 2, 0); ctx.scale(-1, 1); ctx.drawImage(img, 0, p.feet - s, s, s); } else ctx.drawImage(img, p.x - s / 2, p.feet - s, s, s); ctx.restore(); }
      else { ctx.fillStyle = u.boss ? "#e8322b" : u.side === "enemy" ? "#ff7a1a" : "#ffd400"; ctx.fillRect(p.x - s / 3, p.feet - s * 0.9, s * 2 / 3, s * 0.9); } }
    const Lo = PB().layout, bw = Lo.barW[s] || 80, by = p.feet - s - 14; ctx.fillStyle = "#1a1423"; ctx.fillRect(p.x - bw / 2 - 1, by - 1, bw + 2, 10);
    ctx.fillStyle = fr > 0.5 ? "#8fe03a" : fr > 0.2 ? "#ffd400" : "#e8322b"; ctx.fillRect(p.x - bw / 2, by, Math.round(bw * fr), 8);
    ctx.fillStyle = "#1a1423"; ctx.font = UI.font(p.row === "back" ? "labelSmall" : "label", true);
    const back = p.row === "back", maxW = back ? Lo.backLabelW : bw - 2; // front: name + level inside the bar width; back row: name only, centred
    const nm0 = u.short || u.name; let label = back ? nm0 : nm0 + " L" + u.level, nm = nm0; const fits = t => !ctx.measureText || !ctx.measureText(t) || ctx.measureText(t).width === undefined || ctx.measureText(t).width <= maxW;
    { const f0 = back ? UI.sizes.labelSmall : UI.sizes.label, fmin = back ? Lo.backMinFont : Lo.frontMinFont; for (let fs = f0; !fits(label) && fs > fmin; fs--) ctx.font = "bold " + (fs - 1) + "px monospace"; } // shrink (to 10px) before trimming
    while (!fits(label) && nm.length > 3) { nm = nm.slice(0, -1).trimEnd(); label = back ? nm + "." : nm + ". L" + u.level; }
    p.label = label; p.labelFont = ctx.font; const lw = (ctx.measureText && ctx.measureText(label) && ctx.measureText(label).width) || label.length * 6; ctx.fillStyle = "rgba(246,241,228,0.9)"; const lx = back ? p.x - lw / 2 : p.x - bw / 2, lh = parseInt(ctx.font.replace(/^bold /, "")) + 3; ctx.fillRect(lx - 2, by - lh - 2, lw + 4, lh); ctx.fillStyle = "#1a1423"; ctx.fillText(label, lx, by - 5);
    const S = PB().status, tags = Object.keys(u.st).filter(k => S[k]).map(k => S[k].tag).concat(u.pendingSkip ? ["CRG"] : [], u.numb > 0 ? ["NUMB"] : [], u.st.cheer ? ["CHR"] : [], u.st.guard ? ["GRD"] : []);
    if (tags.length && hpS > 0) { ctx.font = UI.font("labelSmall", true); ctx.fillStyle = "#e8322b"; ctx.fillText(tags.join(" "), p.x - bw / 2, p.feet + 14); }
  }
  // hit_all burst: 3 frames x ~80ms on every creature hit, all at once, centred ~0.85*s above the feet, scaled to s. Render-only.
  drawFx(ctx) { const X = PB().fx.hitAll; if (!this.fx) return; const f = Math.floor(((this.anim || 0) - this.fx.t0) / X.ms); if (f >= X.frames) { this.fx = null; return; }
    for (const u of this.fx.units) { const p = u._p; if (!p) continue; const s = p.size, cy = p.feet - X.lift * s;
      if (!Sprites.draw(ctx, "fx_hit_all_" + f, p.x - s / 2, cy - s / 2, s, s)) { ctx.fillStyle = "rgba(255,226,106,0.6)"; ctx.fillRect(p.x - s / 4, cy - s / 4, s / 2, s / 2); } } }
  render(ctx) {
    const Lo = PB().layout; ctx.fillStyle = "#c49a6c"; ctx.fillRect(0, 0, 720, 528); Sprites.draw(ctx, "bg_" + (this.group.bg || "drop_day"), 0, 0, 720, 528);
    const lay = PartyBattle.layout(this.active.length, this.enemies.length); this.lastLayout = lay;
    // draw order: back row, then smaller front units, then the big ones (the 144 middle sits in front of its 120 neighbours)
    const rank = p => (p.row === "back" ? 0 : 1) * 1000 + p.size;
    lay.enemies.map((p, i) => [p, this.enemies[i]]).sort((a, b) => rank(a[0]) - rank(b[0])).forEach(([p, u]) => this.drawUnit(ctx, u, p, true));
    this.active.map((u, i) => [lay.party[i], u]).sort((a, b) => rank(a[0]) - rank(b[0])).forEach(([p, u]) => this.drawUnit(ctx, u, p, false));
    this.drawFx(ctx);
    if (this.phase === "target") { const L = this.targetList(); const lh = UI.sizes.menu + 8; UI.frame(ctx, 250, 436 - 28 - L.length * lh, 340, 28 + L.length * lh); ctx.fillStyle = UI.textColor(); ctx.font = UI.font("menu");
      L.forEach((b, i) => UI.item(ctx, b.name + " " + b.hp + "/" + b.maxHp, 266, 436 - 14 - (L.length - 1 - i) * lh - 6, i === this.tsel, 312)); }
    // command bar y446-528
    const HO = UI.holo(), Hc = UI.H; ctx.fillStyle = HO ? Hc.glass : "#1a1423"; ctx.fillRect(0, Lo.bar.y, 720, Lo.bar.h); if (HO) { UI.scan(ctx, 0, Lo.bar.y, 720, Lo.bar.h); ctx.fillStyle = Hc.accent; ctx.fillRect(0, Lo.bar.y, 720, 2); } ctx.fillStyle = HO ? Hc.text : "#f6f1e4"; ctx.font = UI.font("barSmall");
    const u = this.actor, cmdNow = this.phase === "command" && u && u.side === "party", c = Lo.commands[this.cmd], mv = cmdNow && (c === "Attack" || c === "Special") ? PB().moves[this.moveFor(u, c)] : null;
    ctx.fillText((cmdNow ? u.name + "  " : "") + "STA " + this.stamina + "/" + PB().stamina.cap + "  Potions " + (this.game.inventory.items.potion || 0) + (mv ? "  > " + mv.name + (PBF.moveTarget(mv) === "all" ? " (all)" : "") : ""), 20, Lo.bar.y + 26); ctx.font = UI.font("menu", true);
    Lo.commands.forEach((c2, i) => { const x = 20 + i * 140, sel = this.phase === "command" && i === this.cmd; if (sel) { ctx.fillStyle = HO ? Hc.bar : "#ffd400"; ctx.fillRect(x - 6, Lo.bar.y + 36, UI.textW(ctx, c2) + 12, 32); if (HO) { ctx.fillStyle = Hc.accent; ctx.fillRect(x - 6, Lo.bar.y + 36, 3, 32); } }
      ctx.fillStyle = HO ? (sel ? Hc.text : this.phase === "command" ? Hc.muted : "#3d5670") : sel ? "#1a1423" : (this.phase === "command" ? "#f6f1e4" : "#8a7a9a"); ctx.fillText(c2, x, Lo.bar.y + 60); });
    // v0.4.5 message box: bigger text, up to 3 lines, arrow when Z/tap will advance (it never advances on its own)
    if (this.msgs.length) { ctx.font = UI.font("battle"); const L = UI.wrap(ctx, this.msgs[0], 636).slice(0, 3), lh = UI.sizes.battle + 7, h = 30 + L.length * lh;
      UI.frame(ctx, 20, 12, 680, h); ctx.fillStyle = UI.textColor(); L.forEach((l, i) => ctx.fillText(l, 40, 12 + 14 + UI.sizes.battle + i * lh));
      if (this.msgReady() && Math.floor(this.anim / 400) % 2 === 0) UI.arrow(ctx, 672, 12 + h - 12); }
  }
}
Object.assign(window, { PartyBattle, PBF });
