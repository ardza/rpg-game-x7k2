// Pure functions per docs/DESIGN.md. No DOM access; testable in node.
const Formulas = {
  LEVEL_CAP: 50,
  // Seedable RNG (mulberry32). Debug can call Formulas.seed(n); null = Math.random.
  _rng: null,
  seed(n) { if (n == null) { this._rng = null; return; } let a = n >>> 0; this._rng = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; },
  rand() { return this._rng ? this._rng() : Math.random(); },
  fixedDamageRand: false, // debug: rand = 1.0
  hpAt(base, L) { return Math.floor(base * 2 * L / 50) + L + 10; },
  statAt(base, L) { return Math.floor(base * 2 * L / 50) + 5; },
  typeMult(atkType, defType) { const row = GAME_DATA.types.chart[atkType] || {}; return row[defType] ?? 1; },
  // damage = floor(((2L/5+2)*power*ATK/DEF)/50+2) * typeMult * stab * rand, floored, min 1
  damage(L, power, atk, def, typeMult, stab, rand) {
    const base = Math.floor(((2 * L / 5 + 2) * power * atk / def) / 50 + 2);
    return Math.max(1, Math.floor(base * typeMult * stab * rand));
  },
  catchA(maxHP, curHP, catchRate, ballMult = 1, statusMult = 1) { return ((3 * maxHP - 2 * curHP) * catchRate * ballMult) / (3 * maxHP) * statusMult; },
  catchP(a) { return Math.min(a / 255, 1); },
  xpTotal(L) { return L <= 1 ? 0 : Math.floor(0.8 * L ** 3); },
  xpGain(baseXP, enemyLevel) { return Math.floor(baseXP * enemyLevel / 7); },
  levelForXp(xp) { let L = 1; while (L < this.LEVEL_CAP && xp >= this.xpTotal(L + 1)) L++; return L; },
  // 1B (DESIGN.md v0.2.1): positive gains (incl. Calm) = round(base * (catchRate + 255) / 510); negative = flat base.
  bondGain(base, catchRate) { return base > 0 ? Math.round(base * (catchRate + 255) / 510) : base; },
  // 4A: among branches with level <= L whose condition is met, take the highest count; ties -> first listed.
  // counts = { moveType: { Gale: n, ... }, cheers: n }. "default" is always met with count 0.
  pickGrowth(growth, L, counts) {
    let best = null, bestN = -1;
    for (const g of growth || []) {
      if (L < g.level) continue;
      let n;
      if (g.condition === "default") n = 0;
      else if (g.condition === "cheers") n = counts.cheers || 0;
      else if (g.condition.startsWith("moveType:")) n = (counts.moveType || {})[g.condition.slice(9)] || 0;
      else continue;
      if (g.condition !== "default" && n <= 0) continue; // not met
      if (n > bestN) { best = g; bestN = n; }
    }
    return best;
  },
  weightedPick(table, r) { const tot = table.reduce((s, e) => s + (e.weight || 1), 0); let x = r * tot; for (const e of table) { x -= (e.weight || 1); if (x < 0) return e; } return table[table.length - 1]; }
};
window.Formulas = Formulas;
