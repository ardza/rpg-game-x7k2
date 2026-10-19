window.GAME_DATA = window.GAME_DATA || {};
// Base stats within DESIGN.md ranges (HP 30-90, others 20-80, BST 160-280).
// Roster swap is data-only: keys are stable ids; name/type/art/stats are fields. `art` = sprite file prefix.
// growth (4A): [{ toSpecies, level, condition: "moveType:<Type>" | "cheers" | "default" }] — no evolved forms yet, so empty.
GAME_DATA.creatures = {
  // Starters (story/starters.md). Art pending: sprites fall back to rects.
  kitewisp: { art: "kitewisp", name: "Kitewisp", type: "Gale",  color: "#9fd8f0", base: { hp: 42, atk: 50, def: 38, spd: 70 }, catchRate: 45, baseXP: 64, moves: ["tackle", "gust"],   growth: [] },
  brazzle:  { art: "brazzle", name: "Brazzle",  type: "Ember", color: "#c8402c", base: { hp: 46, atk: 62, def: 46, spd: 48 }, catchRate: 45, baseXP: 64, moves: ["tackle", "cinder"], growth: [] },
  lofton:   { art: "lofton", name: "Lofton",   type: "Stone", color: "#9a6b3f", base: { hp: 55, atk: 48, def: 62, spd: 35 }, catchRate: 45, baseXP: 64, moves: ["tackle", "pebble"], growth: [] },
  // Wild
  emberkit: { art: "emberkit", name: "Emberkit", type: "Ember", color: "#e8603c", base: { hp: 45, atk: 60, def: 40, spd: 65 }, catchRate: 45,  baseXP: 64, moves: ["tackle", "cinder", "flare"], growth: [] },
  puddlop:  { art: "puddlop", name: "Puddlop",  type: "Tide",  color: "#3c8ce8", base: { hp: 50, atk: 45, def: 55, spd: 40 }, catchRate: 190, baseXP: 56, moves: ["tackle", "splash"], growth: [] },
  sproutle: { art: "sproutle", name: "Sproutle", type: "Bloom", color: "#4cbf52", base: { hp: 48, atk: 47, def: 50, spd: 42 }, catchRate: 190, baseXP: 58, moves: ["tackle", "thornlash"], growth: [] },
  grumblet: { art: "grumblet", name: "Grumblet", type: "Stone", color: "#a08a6a", base: { hp: 60, atk: 55, def: 56, spd: 25 } /* DEF 70 -20% */, catchRate: 120, baseXP: 72, moves: ["tackle", "pebble"], growth: [] }
};
// LEGACY (v0.2.1 1v1 battle, debug-only in 0.3.0). Starter pick dropped per DESIGN v0.4 §2.
GAME_DATA.starters = ["kitewisp", "brazzle", "lofton"];
GAME_DATA.legacyCombat = false; // true = roamers + old 1v1 battle on the overworld (tests only)
GAME_DATA.starterLevel = 5;
GAME_DATA.partyCap = 6;
GAME_DATA.runChance = 0.75; // vs wild; guardians/rivals use canRun:false
GAME_DATA.startItems = { potion: 3 };
// Trainer actions (2A)
GAME_DATA.trainer = { startStamina: 3, regen: 1, maxStamina: 5,
  actions: { cheer: { cost: 1, atkMult: 1.25, turns: 2 }, guard: { cost: 1, dmgMult: 0.5 }, calm: { cost: 2, bond: 20 }, potion: { cost: 2, heal: 20, item: "potion" } } };
// Bond meter (1B) base values; scaled by Formulas.bondGain
GAME_DATA.bond = { ownType: 15, calm: 20, lowHp: 10, superEffective: -10, threshold: 100, lowHpFrac: 0.5 };
// Sprite paths (relative to index.html). Missing files fall back to colored rects.
const SPR = "assets/style-test/sprites/";
GAME_DATA.optionalSprites = /_back$/;
GAME_DATA.sprites = {
  // v0.3.1: overworld + UI use assets/style2 (STYLE2.md manifest). SPR (style-test) is only used by the legacy 1v1 battle.
  player: { src: "assets/style2/overworld/player_walk_48.png", cell: 48, frames: 3, idle: 1, rows: { down: 0, up: 1, left: 2, right: 3 } },
  images: { player: "assets/style2/overworld/player_walk_48.png", npc_mom: "assets/style2/overworld/mom_walk_48.png", npc_dad: "assets/style2/overworld/dad_walk_48.png",
    npc_ricky: "assets/style2/overworld/ricky_walk_48.png", npc_unboxer: "assets/style2/overworld/unboxer_walk_48.png", deco_sign: "assets/style2/tiles/sign_48.png",
    mom_bust: "assets/style2/npc/mom_bust_96.png", dad_bust: "assets/style2/npc/dad_shed_bust_96.png",
    ui_dialog: "assets/style2/ui/dialog_9slice_48.png", ui_holo: "assets/style2/ui/holo/holo_9slice_48.png", ui_holo_scan: "assets/style2/ui/holo/holo_scan_4.png", ui_holo_chevron: "assets/style2/ui/holo/holo_chevron_16x22.png", ui_holo_header: "assets/style2/ui/holo/holo_header_48x24.png", ui_holo_select: "assets/style2/ui/holo/holo_select_48x32.png", ui_coin: "assets/style2/ui/coin_32.png",
    ui_shop: "assets/style2/ui/shop_frame_360x240.png", shopkeeper_bust: "assets/style2/npc/shopkeeper_bust_96.png", ui_binder: "assets/style2/ui/binder_page_720x528.png" }
};
for (const id of Object.keys(GAME_DATA.creatures)) {
  GAME_DATA.creatures[id].sprites = { map: "cr_" + id + "_map", battle: "cr_" + id + "_battle", back: "cr_" + id + "_back" };
  const art = GAME_DATA.creatures[id].art || id;
  for (const [k, f] of [["map", "_map_32"], ["battle", "_battle_64"], ["back", "_back_64"]]) GAME_DATA.sprites.images["cr_" + id + "_" + k] = SPR + art + f + ".png";
}
GAME_DATA.items = {
  potion: { art: "potion", name: "Potion (+20 HP)", heal: 20 } // legacy battle value; DESIGN v0.4 Potion = 40% max HP (new combat, M3)
};
