// localStorage save, schema version 4 (DESIGN v0.4 §13). v1–v3 saves are not migrated: they are discarded
// (removed) and the game starts fresh with a notice. Corrupt JSON or a wrong shape is treated the same way.
const SAVE_KEY = "skyreach_save", SAVE_VERSION = 4, LEGACY_SAVE_KEYS = ["wildbound_save_v1"];
const Save = {
  discarded: false, // true after load() threw away an old/corrupt save
  storage() { try { return window.localStorage; } catch (e) { return null; } },
  serialize(game) {
    const p = game.player, inv = game.inventory;
    return { version: SAVE_VERSION,
      player: { level: game.stats.level, xp: game.stats.xp, hp: game.stats.hp, stamina: game.stats.stamina, pos: { map: game.mapId, x: p.x, y: p.y }, facing: p.facing },
      money: inv.money, bag: { potion: inv.items.potion || 0, packs: Object.assign({}, inv.packs) },
      collection: game.collection.list.map(e => Object.assign({}, e)), deck: game.deck.slice(), active: game.active.slice(),
      packsOpened: Object.assign({}, game.packsOpened), pityCounter: game.pityCounter, commonsTradedIn: game.commonsTradedIn, packsTradedIn: game.packsTradedIn | 0,
      hiddenFound: game.hiddenFound.slice(), defeatedGroups: game.defeatedGroups.slice(),
      flags: Object.assign({}, game.flags), settings: Object.assign({}, game.settings) };
  },
  valid(d) {
    const num = v => typeof v === "number" && isFinite(v) && v >= 0;
    return !!d && typeof d === "object" && d.version === SAVE_VERSION && d.player && d.player.pos && typeof d.player.pos.map === "string" &&
      Number.isInteger(d.player.pos.x) && Number.isInteger(d.player.pos.y) && num(d.money) && d.bag && typeof d.bag.packs === "object" &&
      Array.isArray(d.collection) && Array.isArray(d.hiddenFound) && d.flags && typeof d.flags === "object";
  },
  save(game) {
    const s = this.storage(); if (!s) return false;
    try { s.setItem(SAVE_KEY, JSON.stringify(this.serialize(game))); return true; } catch (e) { return false; }
  },
  load() {
    this.discarded = false; const s = this.storage(); if (!s) return null;
    for (const k of LEGACY_SAVE_KEYS) if (s.getItem(k) != null) { s.removeItem(k); this.discarded = true; }
    const raw = s.getItem(SAVE_KEY); if (raw == null) return null;
    let d = null; try { d = JSON.parse(raw); } catch (e) { d = null; }
    if (!this.valid(d)) { s.removeItem(SAVE_KEY); this.discarded = true; return null; }
    return d;
  },
  clear() { const s = this.storage(); if (s) { s.removeItem(SAVE_KEY); LEGACY_SAVE_KEYS.forEach(k => s.removeItem(k)); } }
};
Object.assign(window, { Save, SAVE_KEY, SAVE_VERSION });
