// localStorage save, schema version 4 (DESIGN v0.4 §13). v1–v3 saves are not migrated: they are discarded
// (removed) and the game starts fresh with a notice. Corrupt JSON or a wrong shape is treated the same way.
const SAVE_KEY = "skyreach_save", SAVE_VERSION = 5, LEGACY_SAVE_KEYS = ["wildbound_save_v1"];
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
      flags: Object.assign({}, game.flags), settings: Object.assign({}, game.settings),
      playMs: Math.floor(game.playMs || 0), coinsFound: (game.coinsFound || []).slice(), jobs: Object.assign({}, game.jobs), roomGrid: GAME_DATA.world.roomGrid }; // v5 (v0.4.4); roomGrid v0.4.7
  },
  valid(d) {
    const num = v => typeof v === "number" && isFinite(v) && v >= 0;
    return !!d && typeof d === "object" && d.version === SAVE_VERSION && d.player && d.player.pos && typeof d.player.pos.map === "string" &&
      Number.isInteger(d.player.pos.x) && Number.isInteger(d.player.pos.y) && num(d.money) && d.bag && typeof d.bag.packs === "object" &&
      Array.isArray(d.collection) && Array.isArray(d.hiddenFound) && d.flags && typeof d.flags === "object" &&
      num(d.playMs) && Array.isArray(d.coinsFound) && !!d.jobs && typeof d.jobs === "object";
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
    d = this.migrate(d);
    if (!this.valid(d)) { s.removeItem(SAVE_KEY); this.discarded = true; return null; }
    return d;
  },
  // v0.4.4: v4 -> v5 adds play time, Couch Cash found, job state. Everything else carries over unchanged.
  // v0.4.6 (save stays v5): drop the removed Battle Timing / wide-window settings and map any stored v0.4.5 rarity codes (C/U/R/E/L)
  // to the 4 tiers. Today saves don't store rarity (cards look it up by id), so this is a safety net for hand-edited/future data.
  migrate(d) {
    if (!d || typeof d !== "object") return d;
    if (d.version === 4) d = Object.assign({}, d, { version: 5, playMs: 0, coinsFound: [], jobs: { mowDay: null, extraAt: null } });
    if (d.version !== 5) return d;
    if (d.settings && typeof d.settings === "object") { d.settings = Object.assign({}, d.settings); delete d.settings.battleTiming; delete d.settings.wideWindows; }
    // v0.4.7: rooms went 15x11 -> 11x8. A save made inside a room on another grid (v0.4.6 saves have no roomGrid) lands on that room's spawn.
    const pm = d.player && d.player.pos && GAME_DATA.maps[d.player.pos.map];
    if (pm && pm.room && d.roomGrid !== GAME_DATA.world.roomGrid) { d.player = Object.assign({}, d.player, { pos: { map: d.player.pos.map, x: pm.spawn.x, y: pm.spawn.y } }); d.roomMapped = true; }
    const RL = GAME_DATA.rarityLegacy, fix = e => e && typeof e === "object" && typeof e.rarity === "string" && !GAME_DATA.rarities[e.rarity] && RL[e.rarity] ? Object.assign({}, e, { rarity: RL[e.rarity] }) : e;
    if (Array.isArray(d.collection)) d.collection = d.collection.map(fix);
    return d;
  },
  // v0.4.4: device prefs outside the save (Touch Controls), so Reset Game keeps them.
  PREFS_KEY: "skyreach_prefs",
  prefs() { const s = this.storage(); try { const p = s && JSON.parse(s.getItem(this.PREFS_KEY) || "null"); return p && typeof p === "object" ? p : {}; } catch (e) { return {}; } },
  setPref(k, v) { const s = this.storage(); if (!s) return; try { const p = this.prefs(); p[k] = v; s.setItem(this.PREFS_KEY, JSON.stringify(p)); } catch (e) {} },
  clear() { const s = this.storage(); if (s) { s.removeItem(SAVE_KEY); LEGACY_SAVE_KEYS.forEach(k => s.removeItem(k)); } }
};
Object.assign(window, { Save, SAVE_KEY, SAVE_VERSION });
