window.GAME_DATA = window.GAME_DATA || {};
// Party battles (v0.4.0, DESIGN v0.4 §6-§9, locked). All numbers live here; src/partybattle.js reads them.
const B2 = "assets/style2/";
GAME_DATA.pb = {
  // §3 locked type loop for cards: Gale > Ember > Stone > Gale (2.0 / 0.5); Neutral 1.0 both ways. (The legacy chart in types.js is not used.)
  typeChart: { Gale: { Ember: 2, Stone: 0.5 }, Ember: { Stone: 2, Gale: 0.5 }, Stone: { Gale: 2, Ember: 0.5 } },
  stab: 1.5, randMin: 0.85, randMax: 1.0,
  activeCards: 2, deckSize: 6,                         // §6: player + up to 2 active cards; deck 6 (4 bench)
  player: { name: "You", type: "Neutral", base: { hp: 60, atk: 50, def: 50, spd: 50 }, baseXP: 70 },
  stamina: { start: 3, perRound: 1, cap: 5 },
  runChance: 0.75,
  potionHeal: 0.40,
  // §6 timed presses (ms from the cue). Wide windows double both.
  press: { perfect: 50, good: 120, attack: { perfect: 1.5, good: 1.2, miss: 1.0 }, block: { perfect: 0.4, good: 0.7, miss: 1.0 },
           attackCueMs: 500, blockCueMin: 400, blockCueMax: 900, wideMult: 2,
           // v0.4.5 Battle Timing setting (Off / Easy / Normal, default Off). Off: no timing step, flat damage = the Good multipliers (the sim average).
           // Easy: 3x wider windows and slower cues. Normal: the numbers above.
           flat: "good", easy: { mult: 3, attackCueMs: 1000, blockCueMin: 1100, blockCueMax: 1700 } },
  // v0.4.5 pacing: battle text never auto-advances; a line can be advanced after minMs and once every HP bar has finished draining.
  pace: { minMs: 220, drainMs: 650, drainMinPerSec: 40, settleMs: 150 },
  mods: { cheer: 1.25, guard: 0.70, multiTarget: 0.75 },
  // §7 statuses. turns tick at the end of the affected unit's own turn.
  status: {
    burnout:   { name: "Burnout",   tag: "BRN",  turns: 2, atk: 0.75 },
    cringe:    { name: "Cringe",    tag: "CRG",  skip: true },
    pooped_on: { name: "Pooped On", tag: "POOP", turns: 3, def: 0.75, noHeal: true },
    rugged:    { name: "Rugged",    tag: "RUG",  turns: 2 /* buff lock */ },
    brainrot:  { name: "Brainrot",  tag: "BRT",  turns: 2, wrongTarget: 0.33 },
    gross_out: { name: "Gross-Out", tag: "GRS",  turns: 3, dot: 0.06, maxStacks: 3 }
  },
  skipCap: { max: 0.40, bossMult: 0.5, bossMax: 0.20, bossSecondMult: 0.5, numbTurns: 1 },
  buffs: { cheer: { turns: 2 }, guard: { untilNextTurn: true } },
  // Moves. Card basics are "strike" (DESIGN gives the player Strike 40 Neutral; card basics have no numbers -> same).
  moves: {
    strike:             { name: "Strike", power: 40, type: "Neutral" },                       // player basic (Director: stays 40 Neutral)
    card_basic:         { name: "Attack", power: 45, type: "own" },                           // v0.4.1 Director: card basic = 45 in the card's own type
    viral_flare:        { name: "Viral Flare", power: 30, type: "Ember", all: true, status: "burnout", chance: 0.30, bark: "hypewick_move" },
    ring_light:         { name: "Ring Light", power: 40, type: "Gale", status: "cringe", chance: 0.30, bark: "influencorn_move" },
    rug_pull:           { name: "Rug Pull", power: 40, type: "Stone", status: "rugged", chance: 1.0, bark: "grumblet_move" },
    ratio:              { name: "Ratio", power: 40, type: "Neutral", perBuff: 10, maxPower: 80, status: "brainrot", chance: 0.30, bark: "slug_move" },
    never_skip_leg_day: { name: "Never Skip Leg Day", power: 70, type: "Gale", status: "pooped_on", chance: 0.35, bark: "goose_move" },
    // v0.4.3 batch 2 specials (docs/cards_batch2_stats.md). selfBuff: cheer/guard on the user for 1 turn; healSelf: % max HP; hits: random-target hits.
    cloud_chase:     { name: "Cloud Chase", power: 35, type: "Gale", bark: "vapebat_move" },
    grindset:        { name: "Grindset", power: 30, type: "Neutral", selfBuff: "cheer", bark: "hustle_hamster_move" },
    story_post:      { name: "Story Post", power: 35, type: "Gale", bark: "thirst_trout_move" },
    big_bite:        { name: "Big Bite", power: 35, type: "Stone", status: "gross_out", chance: 0.20, bark: "mukbang_mole_move" },
    ctrl_v:          { name: "Ctrl+V", power: 30, type: "Neutral", bark: "copypasta_cat_move" },
    actually:        { name: "Actually", power: 35, type: "Stone", status: "burnout", chance: 0.20, bark: "reply_guy_rat_move" },
    beauty_mode:     { name: "Beauty Mode", power: 30, type: "Gale", selfBuff: "guard", bark: "filter_frog_move" },
    alt_attack:      { name: "Alt Attack", power: 35, type: "Ember", bark: "burner_beetle_move" },
    don_t_break_it:  { name: "Don't Break It", power: 45, type: "Stone", bark: "streak_snail_move" },
    limited_drop:    { name: "Limited Drop", power: 40, type: "Ember", status: "burnout", chance: 0.25, bark: "merch_moth_move" },
    just_asking:     { name: "Just Asking", power: 40, type: "Gale", status: "brainrot", chance: 0.25, bark: "podcast_parrot_move" },
    play_dead:       { name: "Play Dead", power: 40, type: "Neutral", selfBuff: "guard", bark: "prankster_possum_move" },
    gasp_cam:        { name: "Gasp Cam", power: 45, type: "Ember", bark: "reaction_raccoon_move" },
    chill_beat:      { name: "Chill Beat", power: 40, type: "Stone", healSelf: 0.10, bark: "lo_fi_lizard_move" },
    passive_income:  { name: "Passive Income", power: 55, type: "Ember", status: "rugged", chance: 0.30, bark: "guru_gecko_move" },
    receipts:        { name: "Receipts", power: 55, type: "Gale", perBuff: 10, maxPower: 75, bark: "cancel_crow_move" },
    pump_it:         { name: "Pump It", power: 50, type: "Stone", status: "rugged", chance: 0.30, bark: "pump_pug_move" },
    triple_threat:   { name: "Triple Threat", power: 30, type: "Ember", hits: 3, bark: "hype_hydra_move" },
    mass_follow:     { name: "Mass Follow", power: 60, type: "Neutral", all: true, status: "brainrot", chance: 0.25, bark: "clout_kraken_move" },
    back_in_my_day:  { name: "Back In My Day", power: 80, type: "Stone", status: "burnout", chance: 0.30, bark: "final_boss_boomer_move" },
    // player specials (§6)
    cheer: { name: "Cheer", support: "cheer", stamina: 1 },
    guard: { name: "Guard", support: "guard", stamina: 1 },
    // enemies (v0.4.1 PROPOSAL, see enemies.js)
    selfie_jab:        { name: "Selfie Jab", power: 35, type: "Neutral", bark: "ricky_selfie_jab" },
    ring_light_flash:  { name: "Ring Light Flash", power: 30, type: "Neutral", status: "cringe", chance: 0.25, bark: "ricky_flash" },
    box_cutter:        { name: "Box Cutter", power: 35, type: "Stone", bark: "unboxer_box_cutter" },
    peanut_barrage:    { name: "Packing Peanut Barrage", power: 40, type: "Stone", status: "pooped_on", chance: 0.20, bark: "unboxer_peanuts" },
    hot_take:          { name: "Hot Take", power: 45, type: "Ember", bark: "maxx_hot_take" },
    chat_spam:         { name: "Chat Spam", power: 30, type: "Ember", all: true, status: "burnout", chance: 0.30, bark: "maxx_chat_spam" },
    donation_goal:     { name: "Donation Goal", power: 45, type: "Neutral", status: "cringe", chance: 0.20, bark: "maxx_donation" }
  },
  // §9 XP
  baseXP: { C: 50, U: 65, R: 80, E: 100, L: 120 }, benchXp: 0.5,
  // §5 coins: sum(5 + 3L), x1.5 boss, x1.25 if every press was Good or better
  coins: { flat: 5, perLevel: 3, boss: 1.5, allGood: 1.25 },
  // Bark key prefix per card id (battle_text.md "Battle barks")
  barkPrefix: { hypewick: "hypewick", influencorn: "influencorn", crypto_grumblet: "grumblet", doomscroll_slug: "slug", gym_bro_goose: "goose",
    vapebat: "vapebat", hustle_hamster: "hustle_hamster", thirst_trout: "thirst_trout", mukbang_mole: "mukbang_mole", copypasta_cat: "copypasta_cat", reply_guy_rat: "reply_guy_rat", filter_frog: "filter_frog", burner_beetle: "burner_beetle", streak_snail: "streak_snail", merch_moth: "merch_moth", podcast_parrot: "podcast_parrot", prankster_possum: "prankster_possum", reaction_raccoon: "reaction_raccoon", lo_fi_lizard: "lo_fi_lizard", guru_gecko: "guru_gecko", cancel_crow: "cancel_crow", pump_pug: "pump_pug", hype_hydra: "hype_hydra", clout_kraken: "clout_kraken", final_boss_boomer: "final_boss_boomer" }, // v0.4.3 batch 2: prefix = id
  // Layout (decided): floor y330-446, party x40-300, enemies x400-690, command bar y446-528.
  layout: { frontLabelW: 78, frontMinFont: 10, party: { x0: 40, x1: 300, feet: 430, size: 96 }, enemies: { x0: 400, x1: 690 }, front: { feet: 430, size: 96 }, back: { feet: 340, size: 48, xs: [496, 594], labelW: 92, minFont: 9 }, bossSize: 144, // v0.4.1 back row: HP bars ~y278
            bar: { y: 446, h: 82 }, commands: ["Attack", "Special", "Item", "Swap", "Run"] },
  bgs: { drop_day: B2 + "battle/bg_drop_day_720x528.png", stream_room: B2 + "battle/bg_stream_room_720x528.png" },
  shadows: { 96: B2 + "battle/shadow_96x24.png", 48: B2 + "battle/shadow_48x16.png" },
  frameMs: 140, // boil animation ~7 fps
  // v0.4.1 grammar: the player's battle name is "You". Lines that put {target}/{user}/{name} = "You" get 2nd-person verbs.
  you: { name: "You", verbs: { is: "are", does: "do", dies: "die", skips: "skip", freezes: "freeze", swings: "swing", wants: "want", has: "have", was: "were", "\'s": "r" },
         their: "your" }
};
// Fighter art: 3 boil frames per size. Party faces right (native); enemies are flipped in code.
GAME_DATA.pb.fighters = {
  player: B2 + "player_{s}_f{f}.png", ricky: B2 + "ricky_{s}_f{f}.png", unboxer: B2 + "unboxer_{s}_f{f}.png",
  hypewick: B2 + "hypewick_side_{s}_f{f}.png", influencorn: B2 + "fighters/influencorn_{s}_f{f}.png", crypto_grumblet: B2 + "fighters/crypto_grumblet_{s}_f{f}.png",
  doomscroll_slug: B2 + "fighters/doomscroll_slug_{s}_f{f}.png", gym_bro_goose: B2 + "fighters/gym_bro_goose_{s}_f{f}.png"
  , vapebat: B2 + "fighters/vapebat_{s}_f{f}.png", hustle_hamster: B2 + "fighters/hustle_hamster_{s}_f{f}.png", thirst_trout: B2 + "fighters/thirst_trout_{s}_f{f}.png", mukbang_mole: B2 + "fighters/mukbang_mole_{s}_f{f}.png", copypasta_cat: B2 + "fighters/copypasta_cat_{s}_f{f}.png", reply_guy_rat: B2 + "fighters/reply_guy_rat_{s}_f{f}.png", filter_frog: B2 + "fighters/filter_frog_{s}_f{f}.png", burner_beetle: B2 + "fighters/burner_beetle_{s}_f{f}.png", streak_snail: B2 + "fighters/streak_snail_{s}_f{f}.png", merch_moth: B2 + "fighters/merch_moth_{s}_f{f}.png", podcast_parrot: B2 + "fighters/podcast_parrot_{s}_f{f}.png", prankster_possum: B2 + "fighters/prankster_possum_{s}_f{f}.png", reaction_raccoon: B2 + "fighters/reaction_raccoon_{s}_f{f}.png", lo_fi_lizard: B2 + "fighters/lo_fi_lizard_{s}_f{f}.png", guru_gecko: B2 + "fighters/guru_gecko_{s}_f{f}.png", cancel_crow: B2 + "fighters/cancel_crow_{s}_f{f}.png", pump_pug: B2 + "fighters/pump_pug_{s}_f{f}.png", hype_hydra: B2 + "fighters/hype_hydra_{s}_f{f}.png", clout_kraken: B2 + "fighters/clout_kraken_{s}_f{f}.png", final_boss_boomer: B2 + "fighters/final_boss_boomer_{s}_f{f}.png" // v0.4.3 batch 2 (all 48+96 f0-2 on disk)
  , maxx: B2 + "fighters/maxx_{s}_f{f}.png" // 96 + 144 (boss size)
};
for (const [id, pat] of Object.entries(GAME_DATA.pb.fighters)) for (const s of id === "maxx" ? [96, 144] : [96, 48]) for (let f = 0; f < 3; f++) GAME_DATA.sprites.images["ft_" + id + "_" + s + "_" + f] = pat.replace("{s}", s).replace("{f}", f);
for (const [k, src] of Object.entries(GAME_DATA.pb.bgs)) GAME_DATA.sprites.images["bg_" + k] = src;
for (const [k, src] of Object.entries(GAME_DATA.pb.shadows)) GAME_DATA.sprites.images["shadow_" + k] = src;
