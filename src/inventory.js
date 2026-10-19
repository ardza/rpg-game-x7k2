// Bag (DESIGN v0.4 §13: money, bag {potion, packs {basic, premium, elite}}). Packs are items keyed by tier id.
class Inventory {
  constructor(items, packs, money) {
    this.items = items || Object.assign({}, GAME_DATA.startItems);
    this.packs = {}; for (const id of Object.keys(GAME_DATA.packs)) this.packs[id] = Math.max(0, (packs && packs[id]) | 0);
    this.money = Math.max(0, money | 0);
  }
  add(id, n = 1) { this.items[id] = (this.items[id] || 0) + n; }
  remove(id, n = 1) { if ((this.items[id] || 0) < n) return false; this.items[id] -= n; if (!this.items[id]) delete this.items[id]; return true; }
  addPack(tier, n = 1) { if (!(tier in this.packs)) return false; this.packs[tier] += n; return true; }
  removePack(tier, n = 1) { if ((this.packs[tier] || 0) < n) return false; this.packs[tier] -= n; return true; }
  addMoney(n) { this.money += n; }
  spend(n) { if (this.money < n) return false; this.money -= n; return true; }
  // Shop: buy a pack with coins. Returns "ok" | "locked" | "poor".
  buyPack(tier, flags = {}) {
    const p = GAME_DATA.packs[tier]; if (!p) return "locked";
    if (p.unlockFlag && !flags[p.unlockFlag]) return "locked";
    if (!this.spend(p.price)) return "poor";
    this.addPack(tier); return "ok";
  }
  list() {
    const out = Object.entries(this.items).map(([id, n]) => ({ id, n, name: Inventory.ITEMS[id] ? Inventory.ITEMS[id].name : id }));
    for (const [id, n] of Object.entries(this.packs)) if (n) out.push({ id: "pack_" + id, n, name: GAME_DATA.packs[id].name });
    return out;
  }
}
Inventory.ITEMS = GAME_DATA.items;
window.Inventory = Inventory;
