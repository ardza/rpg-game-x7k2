// Pack opening (v0.3.3, DESIGN v0.4 §4). Packs.roll is pure (uses Formulas.rand, so it's seedable);
// Packs.open consumes a pack, adds the cards, counts packsOpened.<tier>, updates pity and saves (v4).
const RARITY_ORDER = ["C", "U", "R", "E", "L"];
const Packs = {
  cardsOf(r) { return Object.keys(GAME_DATA.cards).filter(id => GAME_DATA.cards[id].rarity === r); },
  rollRarity(odds) { let x = Formulas.rand(); for (const r of RARITY_ORDER) { if (odds[r] == null) continue; if (x < odds[r]) return r; x -= odds[r]; } return "C"; },
  // Returns 5 slots { cardId, holo, rarity, rolled, rerolled, pity }. Legendary reroll (v0.4.1) only fires if a rarity has no cards; v0.4.3 Final Boss Boomer is a real Legendary.
  roll(tier, pityCounter = 0) {
    const P = GAME_DATA.packs[tier], pity = GAME_DATA.pity, out = [];
    const pityOn = pity.tiers.includes(tier) && pityCounter >= pity.after;
    for (let i = 0; i < P.cards; i++) {
      const rolled = this.rollRarity(P.odds); let r = rolled, forced = false;
      if (pityOn && i === pity.slot && RARITY_ORDER.indexOf(r) < RARITY_ORDER.indexOf(pity.rarity)) { r = pity.rarity; forced = true; }
      while (!this.cardsOf(r).length && r !== "C") r = RARITY_ORDER[RARITY_ORDER.indexOf(r) - 1]; // L -> E (only L is empty today)
      const ids = this.cardsOf(r), cardId = ids[Math.floor(Formulas.rand() * ids.length)];
      out.push({ cardId, holo: Formulas.rand() < GAME_DATA.holoChance, rarity: r, rolled, rerolled: rolled !== r && !forced, pity: forced });
    }
    return out;
  },
  hasEpicPlus(cards) { return cards.some(c => RARITY_ORDER.indexOf(c.rarity) >= RARITY_ORDER.indexOf("E")); },
  // Returns { ok, cards } or { ok:false, reason: "none" | "tier" }.
  open(game, tier) {
    if (!GAME_DATA.packs[tier]) return { ok: false, reason: "tier" };
    if (!game.inventory.removePack(tier)) return { ok: false, reason: "none" };
    const cards = this.roll(tier, game.pityCounter);
    for (const c of cards) c.uid = game.collection.add(c.cardId, c.holo).uid;
    game.packsOpened[tier] = (game.packsOpened[tier] | 0) + 1;
    if (GAME_DATA.pity.tiers.includes(tier)) game.pityCounter = this.hasEpicPlus(cards) ? 0 : game.pityCounter + 1;
    game.rerolledLegendary = (game.rerolledLegendary | 0) + cards.filter(c => c.rerolled).length; // logged (not saved)
    const saved = Save.save(game);
    return { ok: true, cards, saved };
  },
  firstOwned(game) { return Object.keys(GAME_DATA.packs).find(t => game.inventory.packs[t] > 0) || null; }
};
const RARITY_SEQ = { C: "common", U: "uncommon", R: "rare", E: "epic", L: "legendary" };
// Pack-rip screen: open_<tier> (1280ms) -> one reveal_<rarity>[_holo] per card (reveal3 loops) -> summary.
// Z: skip the tear (or the current reveal) / next card / close. X: jump to the summary.
class PackOpenScreen {
  constructor(game, tier, cards) {
    this.game = game; this.tier = tier; this.cards = cards; this.phase = "open"; this.idx = 0; this.t = 0; this.done = false;
  }
  seqKey() { return this.phase === "open" ? "open_" + this.tier : "reveal_" + RARITY_SEQ[this.cards[this.idx].rarity] + (this.cards[this.idx].holo ? "_holo" : ""); }
  // Current frame of a sequence at time t (ms): returns { i, name, ended }.
  static frameAt(seq, t) {
    let acc = 0; for (const f of seq.frames) { acc += f.ms; if (t < acc) return { i: f.i, name: f.name, ended: false }; }
    const last = seq.frames[seq.frames.length - 1]; return { i: last.i, name: last.name, ended: true };
  }
  frame() { const seq = GAME_DATA.packAnim.sequences[this.seqKey()]; return PackOpenScreen.frameAt(seq, this.t); }
  showsCard() { return this.phase === "reveal" && GAME_DATA.packAnim.cardFrames.includes(this.frame().name); }
  revealMs() { const s = GAME_DATA.packAnim.sequences[this.seqKey()]; return s.frames.slice(0, -1).reduce((a, f) => a + f.ms, 0); } // start of reveal3
  // Pull reaction (battle_text.md): Legendary > holo > Rare+ > Common; "packOpen" while tearing.
  reaction() {
    if (this.phase === "open") return T("packOpen");
    if (!this.showsCard()) return "";
    const c = this.cards[this.idx], name = GAME_DATA.cards[c.cardId].name;
    const k = c.rarity === "L" ? "packLegendary" : c.holo ? "packHolo" : c.rarity === "C" ? "packCommon" : c.rarity === "U" ? "packUncommon" : "packRarePlus";
    return k ? T(k, { name }) : "";
  }
  update(dt = 0) {
    this.t += dt * 1000;
    if (this.phase === "open" && this.frame().ended) { this.phase = "reveal"; this.t = 0; }
    if (this.phase === "another") {
      if (Input.wasPressed("up") || Input.wasPressed("down") || Input.wasPressed("left") || Input.wasPressed("right")) this.choice ^= 1;
      if (Input.wasPressed("b")) { this.done = true; return; }
      if (Input.wasPressed("a")) { this.again = this.choice === 0; this.done = true; }
      return;
    }
    if (Input.wasPressed("b") && this.phase !== "summary") { this.phase = "summary"; return; }
    if (!Input.wasPressed("a")) return;
    if (this.phase === "open") { this.phase = "reveal"; this.t = this.revealMs(); return; } // skip tear -> card 1 shown
    if (this.phase === "reveal") {
      if (!this.showsCard()) { this.t = this.revealMs(); return; }
      if (++this.idx >= this.cards.length) { this.phase = "summary"; this.idx = this.cards.length - 1; } else this.t = 0;
      return;
    }
    // Premium/Elite: if you still own one of this tier, ask before ripping another (packOpenAnother; default No since the v0.3.5 mash fix).
    if (this.phase === "summary" && GAME_DATA.pity.tiers.includes(this.tier) && this.game.inventory.packs[this.tier] > 0) { this.phase = "another"; this.choice = GAME_DATA.packAnotherDefault; return; }
    this.done = true;
  }
  render(ctx) {
    const A = GAME_DATA.packAnim, k = A.scale, W = A.frame_w * k, H = A.frame_h * k, X = (720 - W) / 2, Y = 8;
    ctx.fillStyle = "#1a1423"; ctx.fillRect(0, 0, 720, 528);
    ctx.fillStyle = "#f6f1e4"; ctx.font = "14px monospace";
    if (this.phase === "another") {
      UI.frame(ctx, 60, 180, 600, 150); ctx.fillStyle = UI.textColor(); ctx.font = "16px monospace";
      UI.wrap(ctx, T("packOpenAnother"), 540).forEach((l, i) => ctx.fillText(l, 90, 220 + i * 22));
      ["Yes", "No"].forEach((o, i) => ctx.fillText((i === this.choice ? "> " : "  ") + o + (i === 0 ? " (" + this.game.inventory.packs[this.tier] + " left)" : ""), 90 + i * 220, 300));
      return;
    }
    if (this.phase === "summary") {
      ctx.fillText(GAME_DATA.packs[this.tier].name + ": " + T("packSummary"), 24, 40);
      this.cards.forEach((c, i) => { const x = 24 + i * 138, y = 90; CardDraw.card(ctx, c.cardId, c.holo, x, y);
        ctx.fillStyle = GAME_DATA.rarities[c.rarity].frame; ctx.fillRect(x, y + 176, 120, 4); ctx.fillStyle = "#f6f1e4"; ctx.font = "12px monospace";
        ctx.fillText(GAME_DATA.cards[c.cardId].name, x, y + 196); ctx.fillText(GAME_DATA.rarities[c.rarity].name + (c.holo ? " *HOLO*" : ""), x, y + 212); });
      ctx.fillText(T("packClose"), 24, 500); return;
    }
    const f = this.frame(), key = "pack_" + this.seqKey();
    if (!Sprites.draw(ctx, key, X, Y, W, H, f.i * A.frame_w, 0, A.frame_w, A.frame_h)) { // fallback: pack / card-back rects
      ctx.fillStyle = this.phase === "open" ? "#e8b530" : "#6a4f8a"; const s = this.phase === "open" ? 1 + 0.05 * (f.i % 2) : 1;
      ctx.fillRect(X + W / 2 - 100 * s, Y + H / 2 - 140 * s, 200 * s, 280 * s); }
    if (this.showsCard()) { const c = this.cards[this.idx]; CardDraw.card(ctx, c.cardId, c.holo, X + A.cardAt.x * k, Y + A.cardAt.y * k, k); }
    const line = this.reaction(); if (line) { Sprites.draw(ctx, "player_bust", 600, 330, 96, 96); ctx.fillStyle = "#ffd400"; ctx.font = "16px monospace"; ctx.fillText(line, 24, 456); }
    ctx.fillStyle = "#f6f1e4"; ctx.font = "14px monospace";
    if (this.phase === "reveal") { const c = this.cards[this.idx];
      ctx.fillText((this.idx + 1) + "/" + this.cards.length + (this.showsCard() ? "  " + GAME_DATA.cards[c.cardId].name + " · " + GAME_DATA.rarities[c.rarity].name + (c.holo ? " *HOLO*" : "") : ""), 24, 480); }
    ctx.fillText(T("packHint"), 24, 504);
  }
}
Object.assign(window, { Packs, PackOpenScreen, RARITY_SEQ });
