// Card economy (DESIGN v0.4 §3/§5, locked). Pure helpers + game actions; no pack opening here.
const Economy = {
  // Card's own shop price; holo copies are worth x1.5, floored.
  cardPrice(cardId, holo = false) { const c = GAME_DATA.cards[cardId]; return holo ? Math.floor(c.price * GAME_DATA.holoPriceMult) : c.price; },
  addCoins(game, n) { game.inventory.addMoney(n); return game.inventory.money; }, // DEV-CHEATS: used by Admin Cheats
  notSold(cardId) { return !!GAME_DATA.rarities[GAME_DATA.cards[cardId].rarity].notSold; }, // v0.4.3: Legendary (Final Boss Boomer) never sold
  isCommon(cardId) { return GAME_DATA.cards[cardId].rarity === "C"; },
  // Sell-back: 20% of the card's price, floored. Commons (holo included) can't be sold -> null.
  sellValue(cardId, holo = false) { return this.isCommon(cardId) || this.notSold(cardId) ? null : Math.floor(this.cardPrice(cardId, holo) * GAME_DATA.sellRate); },
  // Sell one copy of a collection entry. Returns { ok, coins } or { ok:false, reason: "common" | "holoCommon" | "missing" | "deck" }.
  sell(game, uid) {
    const e = game.collection.list.find(x => x.uid === uid); if (!e) return { ok: false, reason: "missing" };
    if (this.isCommon(e.cardId)) return { ok: false, reason: e.holo ? "holoCommon" : "common" };
    if (this.notSold(e.cardId)) return { ok: false, reason: "notSold" };
    if (e.copies <= 1 && game.deck.includes(uid)) return { ok: false, reason: "deck" };
    const coins = this.sellValue(e.cardId, e.holo); game.collection.removeCopy(uid); game.inventory.addMoney(coins);
    return { ok: true, coins };
  },
  // Commons available for trade-in: all Common copies (holo + duplicates count); a copy in the deck doesn't count until removed.
  tradeableCommons(game) {
    return game.collection.list.filter(e => this.isCommon(e.cardId)).reduce((s, e) => s + e.copies - (game.deck.includes(e.uid) ? 1 : 0), 0);
  },
  // 50 Commons -> 1 Basic Pack. Takes non-holo copies first, then the biggest stacks. Counts packsTradedIn (v0.3.4 ruling), not packsOpened.
  tradeIn(game) {
    const need = GAME_DATA.tradeIn.commons, have = this.tradeableCommons(game);
    if (have < need) return { ok: false, have };
    let left = need;
    const pool = game.collection.list.filter(e => this.isCommon(e.cardId)).sort((a, b) => a.holo - b.holo || b.copies - a.copies);
    for (const e of pool) { const keep = game.deck.includes(e.uid) ? 1 : 0; while (left > 0 && e.copies > keep) { game.collection.removeCopy(e.uid); left--; } if (!left) break; }
    game.inventory.addPack(GAME_DATA.tradeIn.pack); game.commonsTradedIn += need; game.packsTradedIn = (game.packsTradedIn | 0) + 1; // v0.3.4 Director: not packsOpened
    return { ok: true, have: have - need };
  },
  // Expected sell-back of one pack (coins), per DESIGN §5: each slot rolls rarity from the tier odds; within a rarity the
  // card is uniform over cards of that rarity (rarity avg price if none exist yet); holo at 5% uses the x1.5 price.
  expectedSellBack(tier) {
    const P = GAME_DATA.packs[tier], h = GAME_DATA.holoChance; let slot = 0;
    for (const [r, p] of Object.entries(P.odds)) {
      if (r === "C") continue;
      const ids = Object.keys(GAME_DATA.cards).filter(id => GAME_DATA.cards[id].rarity === r);
      const val = holo => ids.length ? ids.reduce((s, id) => s + (this.sellValue(id, holo) || 0), 0) / ids.length
        : Math.floor((holo ? Math.floor(GAME_DATA.rarities[r].price.avg * GAME_DATA.holoPriceMult) : GAME_DATA.rarities[r].price.avg) * GAME_DATA.sellRate);
      slot += p * ((1 - h) * val(false) + h * val(true));
    }
    return slot * P.cards;
  }
};
window.Economy = Economy;
