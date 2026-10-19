window.GAME_DATA = window.GAME_DATA || {};
// Card data (DESIGN.md v0.4 §3). Concepts from story/pitch_v3.md (v3.1). Stable ids: never rename a key.
// DESIGN v0.4 LOCKED by the Commissioner (2026-10-18 8:10 PM PT): stats, prices, economy.
// Rarity names/BST/value/price ranges per DESIGN §3 (avg = the doc's math average), frames per §11. Foil frame is Legendary only (Director ruling).
GAME_DATA.rarities = {
  C: { name: "Common",    bst: 200, value: 1,  price: { min: 10, max: 20, avg: 14 },  frame: "#9a9aa0", foil: false },
  U: { name: "Uncommon",  bst: 230, value: 3,  price: { min: 30, max: 55, avg: 42 },  frame: "#3fa34d", foil: false },
  R: { name: "Rare",      bst: 260, value: 9,  price: { min: 80, max: 130, avg: 105 }, frame: "#3b6fd1", foil: false },
  E: { name: "Epic",      bst: 290, value: 27, price: { min: 200, max: 300, avg: 250 }, frame: "#8a3fc0", foil: false },
  L: { name: "Legendary", bst: 320, value: 81, price: { min: 600, max: 600, avg: 600 }, frame: "#d4a72c", foil: true, notSold: true /* never sold in shops; value 600 */ }
};
GAME_DATA.holoChance = 0.05;   // DESIGN §3: any card, independent of rarity
GAME_DATA.holoStatMult = 1.05; // DESIGN §3: +5% every stat, floored
GAME_DATA.cards = {
  // Stats/prices from the DESIGN §3 example table (locked). price = the card's own shop price (inside its rarity range).
  hypewick:        { name: "Hypewick",        rarity: "C", price: 12, type: "Ember",   color: "#f08a3c", base: { hp: 45, atk: 55, def: 40, spd: 60 },
    moves: ["strike", "viral_flare"], status: "burnout", flavor: "A candle that sets itself on fire for every new trend." },
  influencorn:     { name: "Influencorn",     rarity: "U", price: 50, type: "Gale",    color: "#f2a6e0", base: { hp: 55, atk: 60, def: 45, spd: 70 },
    moves: ["strike", "ring_light"], status: "cringe", flavor: "A unicorn that can't stop filming itself." },
  crypto_grumblet: { name: "Crypto Grumblet", rarity: "R", price: 90, type: "Stone",   color: "#a08a6a", base: { hp: 80, atk: 60, def: 90, spd: 30 },
    moves: ["strike", "rug_pull"], status: "rugged", flavor: "A rock that sold its own body as an NFT and now rents it back." },
  doomscroll_slug: { name: "Doomscroll Slug", rarity: "R", price: 120, type: "Neutral", color: "#7fd4c8", base: { hp: 75, atk: 65, def: 70, spd: 50 },
    moves: ["strike", "ratio"], status: "brainrot", flavor: "Glued to a glowing phone, leaving a trail of hot takes." },
  gym_bro_goose:   { name: "Gym Bro Goose",   rarity: "E", price: 270, type: "Gale",    color: "#f4f1e6", base: { hp: 70, atk: 90, def: 60, spd: 70 },
    moves: ["strike", "never_skip_leg_day"], status: "pooped_on", flavor: "Won't shut up about protein. Craps on everything." }
};
for (const [id, c] of Object.entries(GAME_DATA.cards)) { c.id = id; c.foilFrame = !!GAME_DATA.rarities[c.rarity].foil; }
// Card art (assets/style2 manifest, v0.3.1). Art cutouts 99x70 go in the frame's art window; missing -> colored rect.
const S2 = "assets/style2/";
GAME_DATA.cardArtWindow = { x: 11, y: 28, w: 99, h: 70 };
GAME_DATA.cardArt = {}; GAME_DATA.cardMapSprite = {};
for (const id of Object.keys(GAME_DATA.cards)) { GAME_DATA.cardArt[id] = S2 + "cards/art/" + id + "_art_99x70.png"; GAME_DATA.cardMapSprite[id] = S2 + "overworld/" + id + "_map_48.png"; }
// One frame color per rarity (DESIGN §3/§11): C gray, U green, R blue, E purple, L gold foil (Legendary only).
GAME_DATA.cardFrames = { C: S2 + "cards/frame_common_120x168.png", U: S2 + "cards/frame_uncommon_120x168.png", R: S2 + "cards/frame_rare_120x168.png",
  E: S2 + "cards/frame_epic_120x168.png", L: S2 + "cards/frame_legendary_120x168.png",
  // fallbacks if a per-rarity frame is missing: empty plain (C) / gem (U-E) / legendary
  emptyPlain: S2 + "card_frame_plain_empty_120x168.png", emptyGem: S2 + "card_frame_gem_empty_120x168.png", emptyLegendary: S2 + "card_frame_legendary_empty_120x168.png",
  holo: S2 + "cards/holo_overlay_120x168.png" };
GAME_DATA.frameForRarity = { C: "emptyPlain", U: "emptyGem", R: "emptyGem", E: "emptyGem", L: "emptyLegendary" }; // fallback frame; foil = L only
// Economy (DESIGN §5, locked). Sell = 20% of the card's own price, floored; holo price x1.5 floored.
// Commons (holo included) can't be sold; 50 Commons trade in for 1 Basic Pack.
GAME_DATA.sellRate = 0.20;
GAME_DATA.holoPriceMult = 1.5;
GAME_DATA.tradeIn = { commons: 50, pack: "basic" };
// Packs (DESIGN §4, locked). odds = per-slot rarity chances (data only; pack opening is not built in 0.3.2).
GAME_DATA.packs = {
  basic:   { name: "Basic Pack",   price: 50,  cards: 5, unlockFlag: null,              odds: { C: 0.70, U: 0.22, R: 0.065, E: 0.014, L: 0.001 } },
  premium: { name: "Premium Pack", price: 125, cards: 5, unlockFlag: "premiumUnlocked", odds: { C: 0.45, U: 0.33, R: 0.15, E: 0.06, L: 0.01 } }, // after Island 1 boss
  elite:   { name: "Elite Pack",   price: 300, cards: 5, unlockFlag: "eliteUnlocked",   odds: { C: 0.20, U: 0.35, R: 0.28, E: 0.14, L: 0.03 } }  // Island 2
};
GAME_DATA.momCoins = 50; // DESIGN §1/§5
for (const [id, src] of Object.entries(GAME_DATA.cardArt)) GAME_DATA.sprites.images["card_" + id] = src;
for (const [id, src] of Object.entries(GAME_DATA.cardMapSprite)) GAME_DATA.sprites.images["cardmap_" + id] = src;
for (const [k, src] of Object.entries(GAME_DATA.cardFrames)) GAME_DATA.sprites.images["frame_" + k] = src;
