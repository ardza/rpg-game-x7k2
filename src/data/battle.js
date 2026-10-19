window.GAME_DATA = window.GAME_DATA || {};
// Party battles (v0.4.0, DESIGN v0.4 §6-§9, locked). All numbers live here; src/partybattle.js reads them.
const B2 = "assets/style2/";
GAME_DATA.pb = {
  // §3 locked type loop for cards: Gale > Ember > Stone > Gale (2.0 / 0.5); Neutral 1.0 both ways. (The legacy chart in types.js is not used.)
  typeChart: { Gale: { Ember: 2, Stone: 0.5 }, Ember: { Stone: 2, Gale: 0.5 }, Stone: { Gale: 2, Ember: 0.5 } },
  stab: 1.5, randMin: 0.85, randMax: 1.0,
  activeCards: 2, deckSize: 6,                         // §6: up to 2 active cards (v0.4.6: no player unit); deck 6 (4 bench)
  stamina: { start: 3, perRound: 1, cap: 5 },
  runChance: 0.75,
  potionHeal: 0.40,
  // v0.4.6: no timing step ever. Damage is flat = the old "Good" press multipliers (balance unchanged): party hits x1.2, hits on the party x0.7.
  flat: { attack: 1.2, block: 0.7 },
  // v0.4.5 pacing: battle text never auto-advances; a line can be advanced after minMs and once every HP bar has finished draining.
  pace: { minMs: 220, drainMs: 650, drainMinPerSec: 40, settleMs: 150 },
  mods: { cheer: 1.25, guard: 0.70, multiTarget: 0.75 },
  // §7 statuses. turns tick at the end of the affected unit's own turn.
  status: {
    burnout:   { name: "Burnout",   tag: "BRN",  turns: 2, atk: 0.75 },
    cringe:    { name: "Cringe",    tag: "CRG",  skip: true },
    pooped_on: { name: "Pooped On", tag: "POOP", turns: 3, def: 0.75, noHeal: true },
    rugged:    { name: "Rugged",    tag: "RUG",  turns: 2 /* buff lock */ },
    brainrot:  { name: "Brainrot",  tag: "BRT",  turns: 2, loseTurn: 0.33 }, // v0.4.6 Director: 33% chance to lose the turn (was wrong target)
    gross_out: { name: "Gross-Out", tag: "GRS",  turns: 3, dot: 0.06, maxStacks: 3 }
  },
  skipCap: { max: 0.40, bossMult: 0.5, bossMax: 0.20, bossSecondMult: 0.5, numbTurns: 1 },
  buffs: { cheer: { turns: 2 }, guard: { untilNextTurn: true } },
  // Moves. v0.4.6 target: "front" (the opposing front creature) | "all" (every opposing creature, pbHitAll once, x0.75 each when 2+).
  // No target picking. hits: n hits on the current front (re-checked after a KO).
  moves: {
    card_basic:         { name: "Attack", power: 45, type: "own", target: "front" },                           // v0.4.1 Director: card basic = 45 in the card's own type
    viral_flare:        { name: "Viral Flare", power: 30, type: "Ember", target: "all", status: "burnout", chance: 0.30, bark: "hypewick_move" },
    ring_light:         { name: "Ring Light", power: 40, type: "Gale", target: "front", status: "cringe", chance: 0.30, bark: "influencorn_move" },
    rug_pull:           { name: "Rug Pull", power: 40, type: "Stone", target: "front", status: "rugged", chance: 1.0, bark: "grumblet_move" },
    ratio:              { name: "Ratio", power: 40, type: "Neutral", target: "front", perBuff: 10, maxPower: 80, status: "brainrot", chance: 0.30, bark: "slug_move" },
    never_skip_leg_day: { name: "Never Skip Leg Day", power: 70, type: "Gale", target: "front", status: "pooped_on", chance: 0.35, bark: "goose_move" },
    // v0.4.3 batch 2 specials (docs/cards_batch2_stats.md). selfBuff: cheer/guard on the user for 1 turn; healSelf: % max HP; hits: n hits on the front (v0.4.6).
    cloud_chase:     { name: "Cloud Chase", power: 35, type: "Gale", target: "front", bark: "vapebat_move" },
    grindset:        { name: "Grindset", power: 30, type: "Neutral", target: "front", selfBuff: "cheer", bark: "hustle_hamster_move" },
    story_post:      { name: "Story Post", power: 35, type: "Gale", target: "front", bark: "thirst_trout_move" },
    big_bite:        { name: "Big Bite", power: 35, type: "Stone", target: "front", status: "gross_out", chance: 0.20, bark: "mukbang_mole_move" },
    ctrl_v:          { name: "Ctrl+V", power: 30, type: "Neutral", target: "front", bark: "copypasta_cat_move" },
    actually:        { name: "Actually", power: 35, type: "Stone", target: "front", status: "burnout", chance: 0.20, bark: "reply_guy_rat_move" },
    beauty_mode:     { name: "Beauty Mode", power: 30, type: "Gale", target: "front", selfBuff: "guard", bark: "filter_frog_move" },
    alt_attack:      { name: "Alt Attack", power: 35, type: "Ember", target: "front", bark: "burner_beetle_move" },
    don_t_break_it:  { name: "Don't Break It", power: 45, type: "Stone", target: "front", bark: "streak_snail_move" },
    limited_drop:    { name: "Limited Drop", power: 40, type: "Ember", target: "front", status: "burnout", chance: 0.25, bark: "merch_moth_move" },
    just_asking:     { name: "Just Asking", power: 40, type: "Gale", target: "front", status: "brainrot", chance: 0.25, bark: "podcast_parrot_move" },
    play_dead:       { name: "Play Dead", power: 40, type: "Neutral", target: "front", selfBuff: "guard", bark: "prankster_possum_move" },
    gasp_cam:        { name: "Gasp Cam", power: 45, type: "Ember", target: "front", bark: "reaction_raccoon_move" },
    chill_beat:      { name: "Chill Beat", power: 40, type: "Stone", target: "front", healSelf: 0.10, bark: "lo_fi_lizard_move" },
    passive_income:  { name: "Passive Income", power: 55, type: "Ember", target: "front", status: "rugged", chance: 0.30, bark: "guru_gecko_move" },
    receipts:        { name: "Receipts", power: 55, type: "Gale", target: "front", perBuff: 10, maxPower: 75, bark: "cancel_crow_move" },
    pump_it:         { name: "Pump It", power: 50, type: "Stone", target: "front", status: "rugged", chance: 0.30, bark: "pump_pug_move" },
    triple_threat:   { name: "Triple Threat", power: 30, type: "Ember", target: "front", hits: 3, bark: "hype_hydra_move" },
    mass_follow:     { name: "Mass Follow", power: 60, type: "Neutral", target: "all", status: "brainrot", chance: 0.25, bark: "clout_kraken_move" },
    back_in_my_day:  { name: "Back In My Day", power: 80, type: "Stone", target: "front", status: "burnout", chance: 0.30, bark: "final_boss_boomer_move" },
    // v0.4.6: player specials (Cheer/Guard) and Ricky/Unboxer moves removed (no people fight); Maxx (boss, debug-only) below
    hot_take:          { name: "Hot Take", power: 45, type: "Ember", target: "front", bark: "maxx_hot_take" },
    chat_spam:         { name: "Chat Spam", power: 30, type: "Ember", target: "all", status: "burnout", chance: 0.30, bark: "maxx_chat_spam" },
    donation_goal:     { name: "Donation Goal", power: 45, type: "Neutral", target: "front", status: "cringe", chance: 0.20, bark: "maxx_donation" }
  },
  // §9 XP
  baseXP: { C: 50, R: 65, UR: 80, L: 120 }, benchXp: 0.5, // v0.4.6 4 tiers: lower old tier (Ultra Rare = old Rare 80)
  // §5 coins: sum(5 + 3L), x1.5 boss (v0.4.6: the all-Good press bonus is gone with the presses)
  coins: { flat: 5, perLevel: 3, boss: 1.5 },
  // Bark key prefix per card id (battle_text.md "Battle barks")
  barkPrefix: { hypewick: "hypewick", influencorn: "influencorn", crypto_grumblet: "grumblet", doomscroll_slug: "slug", gym_bro_goose: "goose",
    vapebat: "vapebat", hustle_hamster: "hustle_hamster", thirst_trout: "thirst_trout", mukbang_mole: "mukbang_mole", copypasta_cat: "copypasta_cat", reply_guy_rat: "reply_guy_rat", filter_frog: "filter_frog", burner_beetle: "burner_beetle", streak_snail: "streak_snail", merch_moth: "merch_moth", podcast_parrot: "podcast_parrot", prankster_possum: "prankster_possum", reaction_raccoon: "reaction_raccoon", lo_fi_lizard: "lo_fi_lizard", guru_gecko: "guru_gecko", cancel_crow: "cancel_crow", pump_pug: "pump_pug", hype_hydra: "hype_hydra", clout_kraken: "clout_kraken", final_boss_boomer: "final_boss_boomer" }, // v0.4.3 batch 2: prefix = id
  // v0.4.6 layout (Game Artist, 720x528, creatures only): floor y330-446, party x40-300 (front = right), enemies x400-690 (front = left), bar y446-528.
  // 1-2 per side: 144 (feet 430). 3 per side: middle 144, outer two 120. 4-5 enemies: front 3 at 120 (feet 430), back 2 at 96 (feet 370).
  // Name + HP bar at feet - s - 14; bar width per size; shadow s x s/4.
  layout: { party: { x0: 40, x1: 300, feet: 430 }, enemies: { x0: 400, x1: 690, feet: 430 }, big: 144, mid: 120, small: 96,
            three: { party: [240, 170, 100], enemies: [460, 545, 630] }, crowd: { front: [460, 545, 630], frontTwo: [470, 620], back: { feet: 370, size: 96, xs: [502, 588] } },
            barW: { 144: 84, 120: 80, 96: 64, 48: 48 }, frontMinFont: 10, backLabelW: 80, backMinFont: 9,
            bar: { y: 446, h: 82 }, commands: ["Attack", "Special", "Item", "Swap", "Run"] },
  fx: { hitAll: { frames: 3, ms: 80, src: B2 + "battle/fx/hit_all_96_f{f}.png", lift: 0.85 } }, // render-only burst on every creature an "all" move hits
  bgs: { drop_day: B2 + "battle/bg_drop_day_720x528.png", stream_room: B2 + "battle/bg_stream_room_720x528.png" },
  shadows: { 96: B2 + "battle/shadow_96x24.png", 48: B2 + "battle/shadow_48x16.png" }, // v0.4.6: shadow_96 scaled to s x s/4
  frameMs: 140, // boil animation ~7 fps
  // v0.4.1 grammar safety net for lines that name "You" (no player unit since v0.4.6; kept for writer lines like maxx_no_run)
  you: { name: "You", verbs: { is: "are", does: "do", dies: "die", skips: "skip", freezes: "freeze", swings: "swing", wants: "want", has: "have", was: "were", "\'s": "r" },
         their: "your" }
};
// Fighter art: 3 boil frames per size (144/120 v0.4.6 big creatures, 96/48 older). Party faces right (native); enemies are flipped in code.
// v0.4.6: creatures only (no player / Ricky / Unboxer / Thorne fighters). Maxx (boss, debug-only) sends his Clout Kraken (card art).
GAME_DATA.pb.fighters = {};
for (const id of Object.keys(GAME_DATA.cards)) GAME_DATA.pb.fighters[id] = B2 + "fighters/" + id + "_{s}_f{f}.png";
GAME_DATA.pb.fighterSizes = id => [144, 120, 96, 48]; // v0.4.6: creatures only (Maxx sends his Kraken; no maxx fighter)
for (const [id, pat] of Object.entries(GAME_DATA.pb.fighters)) for (const s of GAME_DATA.pb.fighterSizes(id)) for (let f = 0; f < 3; f++) GAME_DATA.sprites.images["ft_" + id + "_" + s + "_" + f] = pat.replace("{s}", s).replace("{f}", f);
for (let f = 0; f < GAME_DATA.pb.fx.hitAll.frames; f++) GAME_DATA.sprites.images["fx_hit_all_" + f] = GAME_DATA.pb.fx.hitAll.src.replace("{f}", f);
for (const [k, src] of Object.entries(GAME_DATA.pb.bgs)) GAME_DATA.sprites.images["bg_" + k] = src;
for (const [k, src] of Object.entries(GAME_DATA.pb.shadows)) GAME_DATA.sprites.images["shadow_" + k] = src;
