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
  hypewick:        { name: "Hypewick", short: "Hypewick",        rarity: "C", price: 12, type: "Ember",   color: "#f08a3c", base: { hp: 45, atk: 55, def: 40, spd: 60 },
    moves: ["card_basic", "viral_flare"], status: "burnout", flavor: "A candle that sets itself on fire for every new trend." },
  influencorn:     { name: "Influencorn", short: "Corn",     rarity: "U", price: 50, type: "Gale",    color: "#f2a6e0", base: { hp: 55, atk: 60, def: 45, spd: 70 },
    moves: ["card_basic", "ring_light"], status: "cringe", flavor: "A unicorn that can't stop filming itself." },
  crypto_grumblet: { name: "Crypto Grumblet", short: "Grumblet", rarity: "R", price: 90, type: "Stone",   color: "#a08a6a", base: { hp: 80, atk: 60, def: 90, spd: 30 },
    moves: ["card_basic", "rug_pull"], status: "rugged", flavor: "A rock that sold its own body as an NFT and now rents it back." },
  doomscroll_slug: { name: "Doomscroll Slug", short: "Slug", rarity: "R", price: 120, type: "Neutral", color: "#7fd4c8", base: { hp: 75, atk: 65, def: 70, spd: 50 },
    moves: ["card_basic", "ratio"], status: "brainrot", flavor: "Glued to a glowing phone, leaving a trail of hot takes." },
  gym_bro_goose:   { name: "Gym Bro Goose", short: "Goose",   rarity: "E", price: 270, type: "Gale",    color: "#f4f1e6", base: { hp: 70, atk: 90, def: 60, spd: 70 },
    moves: ["card_basic", "never_skip_leg_day"], status: "pooped_on", flavor: "Won't shut up about protein. Craps on everything." },
  // v0.4.3 batch 2 (docs/cards_batch2_stats.md, Director). Big Feed skipped.
  vapebat: { name: "Vapebat", short: "Vapebat", rarity: "C", price: 12, type: "Gale", color: "#b7a3e8", base: { hp: 40, atk: 50, def: 35, spd: 75 }, moves: ["card_basic", "cloud_chase"], status: null, flavor: "Smells like blue raspberry and bad decisions." },
  hustle_hamster: { name: "Hustle Hamster", short: "Hamster", rarity: "C", price: 15, type: "Neutral", color: "#e0b070", base: { hp: 45, atk: 50, def: 40, spd: 65 }, moves: ["card_basic", "grindset"], status: null, flavor: "Runs 6 side hustles. Profit: negative." },
  thirst_trout: { name: "Thirst Trout", short: "Trout", rarity: "C", price: 14, type: "Gale", color: "#6fb7e0", base: { hp: 50, atk: 50, def: 45, spd: 55 }, moves: ["card_basic", "story_post"], status: null, flavor: "Posts at 2 AM. Deletes at 2:05." },
  mukbang_mole: { name: "Mukbang Mole", short: "Mole", rarity: "C", price: 13, type: "Stone", color: "#8a6a4a", base: { hp: 65, atk: 45, def: 60, spd: 30 }, moves: ["card_basic", "big_bite"], status: "gross_out", flavor: "Eats on camera so you don't have to." },
  copypasta_cat: { name: "Copypasta Cat", short: "CopyCat", rarity: "C", price: 10, type: "Neutral", color: "#c8c8c8", base: { hp: 50, atk: 45, def: 50, spd: 55 }, moves: ["card_basic", "ctrl_v"], status: null, flavor: "Has never had an original thought. Proud of it." },
  reply_guy_rat: { name: "Reply Guy Rat", short: "ReplyRat", rarity: "C", price: 13, type: "Stone", color: "#9a8f80", base: { hp: 45, atk: 55, def: 45, spd: 55 }, moves: ["card_basic", "actually"], status: "burnout", flavor: "\"Well actually...\" is his whole personality." },
  filter_frog: { name: "Filter Frog", short: "Frog", rarity: "C", price: 16, type: "Gale", color: "#8fd47a", base: { hp: 50, atk: 40, def: 55, spd: 55 }, moves: ["card_basic", "beauty_mode"], status: null, flavor: "Looks nothing like this in person." },
  burner_beetle: { name: "Burner Beetle", short: "Beetle", rarity: "C", price: 14, type: "Ember", color: "#c0503a", base: { hp: 45, atk: 55, def: 45, spd: 55 }, moves: ["card_basic", "alt_attack"], status: null, flavor: "Has 14 accounts. All defending itself." },
  streak_snail: { name: "Streak Snail", short: "Snail", rarity: "U", price: 40, type: "Stone", color: "#d49a5a", base: { hp: 65, atk: 50, def: 75, spd: 40 }, moves: ["card_basic", "don_t_break_it"], status: null, flavor: "Hasn't missed a day in 400 days. Hasn't enjoyed one either." },
  merch_moth: { name: "Merch Moth", short: "Moth", rarity: "U", price: 45, type: "Ember", color: "#e07a3a", base: { hp: 50, atk: 60, def: 45, spd: 75 }, moves: ["card_basic", "limited_drop"], status: "burnout", flavor: "Drop is live. Quality is not." },
  podcast_parrot: { name: "Podcast Parrot", short: "Parrot", rarity: "U", price: 50, type: "Gale", color: "#3fbf6f", base: { hp: 55, atk: 55, def: 50, spd: 70 }, moves: ["card_basic", "just_asking"], status: "brainrot", flavor: "Just asking questions. Three hours of them." },
  prankster_possum: { name: "Prankster Possum", short: "Possum", rarity: "U", price: 35, type: "Neutral", color: "#b0a8a0", base: { hp: 60, atk: 50, def: 65, spd: 55 }, moves: ["card_basic", "play_dead"], status: null, flavor: "\"It's just a prank!\" (It was not.)" },
  reaction_raccoon: { name: "Reaction Raccoon", short: "Raccoon", rarity: "U", price: 48, type: "Ember", color: "#e85a4a", base: { hp: 55, atk: 65, def: 45, spd: 65 }, moves: ["card_basic", "gasp_cam"], status: null, flavor: "Watches your video. Gets paid more than you." },
  lo_fi_lizard: { name: "Lo-Fi Lizard", short: "Lizard", rarity: "U", price: 42, type: "Stone", color: "#6aa08a", base: { hp: 70, atk: 45, def: 70, spd: 45 }, moves: ["card_basic", "chill_beat"], status: null, flavor: "Beats to study and lose to." },
  guru_gecko: { name: "Guru Gecko", short: "Gecko", rarity: "R", price: 125, type: "Ember", color: "#f0c040", base: { hp: 60, atk: 75, def: 55, spd: 70 }, moves: ["card_basic", "passive_income"], status: "rugged", flavor: "Sells a course on how to sell courses." },
  cancel_crow: { name: "Cancel Crow", short: "Crow", rarity: "R", price: 110, type: "Gale", color: "#3a3a5a", base: { hp: 60, atk: 70, def: 50, spd: 80 }, moves: ["card_basic", "receipts"], status: null, flavor: "Found your post from 2014." },
  pump_pug: { name: "Pump Pug", short: "Pump Pug", rarity: "R", price: 85, type: "Stone", color: "#c8a070", base: { hp: 80, atk: 70, def: 70, spd: 40 }, moves: ["card_basic", "pump_it"], status: "rugged", flavor: "To the moon. The moon is down 90%." },
  hype_hydra: { name: "Hype Hydra", short: "Hydra", rarity: "E", price: 260, type: "Ember", color: "#ff5a2a", base: { hp: 75, atk: 80, def: 60, spd: 75 }, moves: ["card_basic", "triple_threat"], status: null, flavor: "Cut one off and two collabs grow back." },
  clout_kraken: { name: "Clout Kraken", short: "Kraken", rarity: "E", price: 280, type: "Neutral", color: "#7a4ac0", base: { hp: 85, atk: 75, def: 70, spd: 60 }, moves: ["card_basic", "mass_follow"], status: "brainrot", flavor: "Follows everyone. Follows back no one." },
  final_boss_boomer: { name: "Final Boss Boomer", short: "Boomer", rarity: "L", price: 600, type: "Stone", color: "#c0b090", base: { hp: 100, atk: 80, def: 95, spd: 45 }, moves: ["card_basic", "back_in_my_day"], status: "burnout", flavor: "Doesn't know what any of this is. Still wins." }
};
for (const [id, c] of Object.entries(GAME_DATA.cards)) { c.id = id; c.foilFrame = !!GAME_DATA.rarities[c.rarity].foil; }
// Card art (assets/style2 manifest, v0.3.1). Art cutouts 99x70 go in the frame's art window; missing -> colored rect.
const S2 = "assets/style2/";
GAME_DATA.cardArtWindow = { x: 11, y: 28, w: 99, h: 70 };
GAME_DATA.cardArt = {}; GAME_DATA.cardMapSprite = {};
// v0.4.3: only ids whose files exist on disk are registered (no 404s while Game Artist finishes batch 2); others draw the rect fallback.
GAME_DATA.cardArtHave = ["hypewick", "influencorn", "crypto_grumblet", "doomscroll_slug", "gym_bro_goose", "vapebat", "hustle_hamster", "thirst_trout", "mukbang_mole", "copypasta_cat", "reply_guy_rat", "filter_frog", "burner_beetle", "streak_snail", "merch_moth", "podcast_parrot", "prankster_possum", "reaction_raccoon", "lo_fi_lizard", "guru_gecko", "cancel_crow", "pump_pug", "hype_hydra", "clout_kraken", "final_boss_boomer"];
GAME_DATA.cardMapHave = Object.keys(GAME_DATA.cards).filter(id => id !== "big_feed");
for (const id of Object.keys(GAME_DATA.cards)) { if (GAME_DATA.cardArtHave.includes(id)) GAME_DATA.cardArt[id] = S2 + "cards/art/" + id + "_art_99x70.png"; if (GAME_DATA.cardMapHave.includes(id)) GAME_DATA.cardMapSprite[id] = S2 + "overworld/" + id + "_map_48.png"; }
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
