// All player-facing strings. T(key, vars) fills {slot}s.
// Lines marked [writer] come from story/battle_text.md (tone approved).
// All lines are from story/battle_text.md except where marked interim.
window.GAME_DATA = window.GAME_DATA || {};
GAME_DATA.text = {
  // [writer] battle_text.md Battle barks / Goon move lines / Boss (v0.4.0)
  hypewick_enter: "It's giving main character!",
  hypewick_move: "Hypewick went viral! Everyone's tired of it already.",
  hypewick_ko: "Hypewick posted 'taking a break' and left.",
  influencorn_enter: "Influencorn checks its angles.",
  influencorn_move: "Ring Light! Too cringe to move: {target}.",
  influencorn_ko: "Influencorn lost its blue check. Devastating.",
  grumblet_enter: "Crypto Grumblet: 'Have you heard of my coin?'",
  grumblet_move: "Rug Pull! {target}'s buffs are gone. So is the dev.",
  grumblet_ko: "Grumblet: 'It's not a loss until I sell!'",
  slug_enter: "Doomscroll Slug hasn't blinked in 9 hours.",
  slug_move: "Ratio! Brainrot hits {target}. Swinging at anything now.",
  slug_ko: "Doomscroll Slug finally hit the end of the feed.",
  goose_enter: "Gym Bro Goose: 'You even lift, bro?'",
  goose_move: "Gym Bro Goose pooped on {target}. That's a protein shake now.",
  goose_ko: "Gym Bro Goose: 'Rest day. Totally planned.'",
  ricky_move: "Ricky cranked the ring light. Blinded: {target}.",
  unboxer_move: "Unboxing Kid threw packaging at {target}! It's 90% air.",
  ricky_selfie_jab: "Selfie stick to the face for {target}. Front camera. Brutal.",
  ricky_flash: "Ring Light Flash! Pores exposed: {target}. Cringe.",
  unboxer_box_cutter: "Unboxing Kid swung the box cutter. 'Careful, this is a collab!'",
  unboxer_peanuts: "Packing peanuts everywhere! Pooped On: {target}.",
  maxx_intro: ["Day 900 of the stream, chat! We got a VISITOR!", "Say hi to 12 viewers. Say it louder. LOUDER."],
  maxx_hot_take: "Maxx dropped a scorching take. Aimed right at {target}.",
  maxx_chat_spam: "CHAT SPAM! The chat's on fire. Literally. He set it on fire.",
  maxx_donation: "Donation Goal! '$5 for a dance from {target}!' Frozen: {target}.",
  maxx_low_hp: "CHAT, CLIP THAT!",
  maxx_ko: ["Maxx Volume: 'Stream's... ending... early...'", "He hasn't slept in 900 days. He's asleep now."],
  maxx_no_run: "You can't leave. You're on stream.",
  ricky_enter: "Hold on, my lighting's off.", ricky_ko: "Don't forget to like... this...",
  unboxer_enter: "This video is NOT sponsored. (It's sponsored.)", unboxer_ko: "Mom said it's not a real job!",
  pbSwap: "Tag out! {out} to the bench, {in} takes the shot.", pbSwapNone: "Bench is empty. Nobody wants this collab.", pbSwapPlayer: "You can't bench yourself. You're the main character.", // v0.4.1 swap lines (Story Writer)
  // [writer] v0.4.0 party battle system lines (story/battle_text.md)
  pbStart: "{n} wants smoke!",
  pbWin: "W. +{coins} coins, +{xp} XP.",
  pbLose: "Lights out. Mom dragged you home. Again.",
  pbRun: "Got away! Nobody clipped it.",
  pbRunFail: "Can't leave. Too many witnesses.",
  pbSkip: "Cringe! {name}: skipping this turn to recover.",
  pbHit: "{move} from {user}! {target}: -{dmg} HP.",
  pbMiss: "{press}!",
  pbFaint: "KO! {name}: logged off.",
  pbHeal: "Healed! {target}: +{n} HP.",
  pbNoHeal: "Pooped On. {target}: too gross to heal.",
  pbNoStamina: "Out of stamina. Hydrate.",
  pbNoPotion: "No Potions. Should've stocked up.",
  pbCheer: "Hyped! {target}: ATK up.",
  pbGuard: "Guard up! {target}: blocking the haters.",
  pbStatus: "{status}! {target} got hit with it.",
  pbWrong: "Brainrot! {user} swung at {target} instead.",
  pbDrop: "Maxx dropped a {pack}! Finders keepers.",
  pbLevel: "Level up! {name}: now Lv{n}.",
  encounter:      "{name} wandered into your calendar. Unscheduled.",       // [writer] battle start (wild)
  usedMove:       "{name} used {move}. Bold strategy.",                                    // [writer v0.2 fill]
  missed:         "{move} missed. It was a learning experience.",          // [writer]
  superEffective: "That one's going on the highlight reel.",               // [writer]
  notEffective:   "Technically that counts as an attack.",                 // [writer]
  faintWild:      "{name} has left the chat.",                             // [writer]
  faintOwn:       "{name} is out of office. Auto-reply enabled.",          // [writer]
  win:            "You won. Somewhere, a stat tracker cares.",             // [writer]
  blackout:       "Your whole team clocked out. Wren drags you home and invoices you.", // [writer] lose
  gainedXp:       "{name} gained {n} XP. Experience is its own reward. Literally.",                                  // [writer v0.2 fill]
  levelUp:        "{name} grew to Lv{lv}. No raise, though.",              // [writer]
  grew:           "{name} grew into {to}. New title, same desk.",                                 // [writer v0.2 fill]
  ranAway:        "You left. Strategically.",                              // [writer] run success
  noEscape:       "Can't escape. The meeting continues.",                  // [writer] run fail
  goNext:         "{name}, you're up. Try to look busy.",                                     // [writer v0.2 fill]
  chooseNext:     "Who's covering this shift?",                                   // [writer v0.2 fill]
  recruited:      "{name} signed the contract. No take-backs.",            // [writer] catch success
  recruitFail:    "{name} read the fine print and left.",                  // [writer] catch fail (bond < 100; it stays in battle)
  bondLost:       "{name} has unfollowed you.",                                 // [writer v0.2 fill]
  partyFull:      "Party's full. Even friendship has a headcount.",        // [writer]
  noStamina:      "Not enough stamina. You're running on fumes and cold coffee.",                                    // [writer v0.2 fill]
  trainerUsed:    "One command per turn. That's policy.",                  // [writer v0.2 fill]
  cheer:          "You cheer {name} on. ATK up. Morale is mandatory.",                           // [writer v0.2 fill]
  guard:          "{name} braces for impact, like it's another reorg.",                              // [writer v0.2 fill]
  calm:           "You speak calmly to {name}. It feels heard.",                            // [writer v0.2 fill]
  potion:         "{name} recovered {hp} HP. Self-care.",                  // [writer]
  noPotion:       "No potions left. Have you tried resilience?",                                       // [writer v0.2 fill]
  bondChange:     "Bond {sign}{n} ({total}/100)",                           // [writer v0.2 fill]
  choosePartner:  "Choose your partner. Legal says 'partner.'",                                    // [writer v0.2 fill]
  saved:          "Game saved. Unlike the bridges.",                                            // [writer v0.2 fill]
  saveFailed:     "Save failed. IT has been notified. IT does not care.",                         // [writer v0.2 fill]
  grunt:          "Stillwater Holdings. Drifting is for losers. Please step off the premium lot.",                                                    // [writer v0.2 fill]
  noRun:          "You can't leave. This meeting could not have been an email.",                     // from story/battle_text.md cantRun
  sign:           "GO VIRAL OR GO HOME. (Most people go home.)",                // [writer] battle_text.md Overworld v0.3.1
  // --- v0.3.0 card direction. [writer v3.1] = story/pitch_v3.md. [interim] = programmer placeholder, needs a writer line.
  // v0.4.3 batch 2 barks (story/battle_text.md, Story Writer)
  vapebat_enter: "Vapebat floats in. Smells like a gas station.",
  vapebat_move: "Cloud Chase! {target}: lost in the mist.",
  vapebat_ko: "Vapebat ran out of juice.",
  hustle_hamster_enter: "Hustle Hamster is here. Ask about the course.",
  hustle_hamster_move: "Grindset! Sleep is for the poor.",
  hustle_hamster_ko: "Hustle Hamster: 'This is a learning experience.'",
  thirst_trout_enter: "Thirst Trout posted a pic. Like it. Now.",
  thirst_trout_move: "Story Post! Eyes on {target}. Closer. Too close.",
  thirst_trout_ko: "Thirst Trout deleted the post.",
  mukbang_mole_enter: "Mukbang Mole came hungry. Always.",
  mukbang_mole_move: "Big Bite! Chewing sounds at {target}. So loud.",
  mukbang_mole_ko: "Mukbang Mole: food coma. Stream over.",
  copypasta_cat_enter: "Copypasta Cat is here. Copypasta Cat is here.",
  copypasta_cat_move: "Ctrl+V! Same move as last time. Still works.",
  copypasta_cat_ko: "Copypasta Cat: [deleted]",
  reply_guy_rat_enter: "Reply Guy Rat: 'Well actually, I'm here.'",
  reply_guy_rat_move: "Actually! Unasked opinions for {target}.",
  reply_guy_rat_ko: "Reply Guy Rat logged off to cool down.",
  filter_frog_enter: "Filter Frog looks flawless. Don't zoom in.",
  filter_frog_move: "Beauty Mode! Smoothed out every flaw.",
  filter_frog_ko: "Filter's off. Nobody recognizes Filter Frog.",
  burner_beetle_enter: "Burner Beetle is definitely not Burner Beetle.",
  burner_beetle_move: "Alt Attack! Account #14 jumps on {target}.",
  burner_beetle_ko: "Burner Beetle got IP-banned.",
  streak_snail_enter: "Streak Snail: day 401. Let's go. Slowly.",
  streak_snail_move: "Don't Break It! Desperation hits {target}.",
  streak_snail_ko: "Streak broken. Streak Snail is in shambles.",
  merch_moth_enter: "Merch Moth wears its own hoodie. All six.",
  merch_moth_move: "Limited Drop! Cheap hoodie to the face for {target}.",
  merch_moth_ko: "Merch Moth: back in stock never.",
  podcast_parrot_enter: "Podcast Parrot: 'Welcome back to the pod.'",
  podcast_parrot_move: "Just Asking! Three hours of questions for {target}.",
  podcast_parrot_ko: "Podcast Parrot: 'Smash that... subscribe...'",
  prankster_possum_enter: "Prankster Possum: 'Camera's rolling!'",
  prankster_possum_move: "Play Dead! It's just a prank, bro.",
  prankster_possum_ko: "Prankster Possum is actually down. Not a prank.",
  reaction_raccoon_enter: "Reaction Raccoon is reacting to being here.",
  reaction_raccoon_move: "Gasp Cam! Face cam blasts {target}. NO WAY.",
  reaction_raccoon_ko: "Reaction Raccoon: speechless. First time ever.",
  lo_fi_lizard_enter: "Lo-Fi Lizard is vibing. Rain sounds on.",
  lo_fi_lizard_move: "Chill Beat. Healed up. Stayed chill.",
  lo_fi_lizard_ko: "Lo-Fi Lizard fell asleep. Fair.",
  guru_gecko_enter: "Guru Gecko: 'Here in my rented mansion...'",
  guru_gecko_move: "Passive Income! {target} just bought the course.",
  guru_gecko_ko: "Guru Gecko: 'Refunds are a mindset.'",
  cancel_crow_enter: "Cancel Crow has receipts. So many receipts.",
  cancel_crow_move: "Receipts! An old post from {target}. 2014.",
  cancel_crow_ko: "Cancel Crow got canceled. Ironic.",
  pump_pug_enter: "Pump Pug: 'Buy now. Ask later.'",
  pump_pug_move: "Pump It! Bags left on {target}.",
  pump_pug_ko: "Pump Pug: down 100%. HODL.",
  hype_hydra_enter: "Hype Hydra: three heads, zero original ideas.",
  hype_hydra_move: "Triple Threat! Stream, react, repost.",
  hype_hydra_ko: "Hype Hydra: all three heads unsubscribed.",
  clout_kraken_enter: "Clout Kraken followed you. Don't follow back.",
  clout_kraken_move: "Mass Follow! Notifications flood everyone.",
  clout_kraken_ko: "Clout Kraken: 0 followers. Rock bottom.",
  final_boss_boomer_enter: "Final Boss Boomer: 'Who are you? Get off my lawn.'",
  final_boss_boomer_move: "Back In My Day! A long story for {target}. Very long.",
  final_boss_boomer_ko: "Final Boss Boomer: 'Fine. I'll go nap.'",
  cheatGold: "+50,000 coins. Mom thinks you got a job.", cheatUnknown: "Unknown code", // DEV-CHEATS (Story Writer)
};
GAME_DATA.momIntro = [ // [writer v3.1] story/pitch_v3.md "Mom's intro"
  { who: "MOM", line: "Honey, you're 19 and your only hobby is watching strangers open card packs online." },
  { who: "MOM", line: "Here's 50 coins. One Basic Pack. Do NOT livestream it." },
  { who: "MOM", line: "Your father bought a 'limited edition' card for 4,000 coins. It was a sticker. He lives in the shed now." },
  { who: "DAD (from shed)", line: "It's gonna be worth something!" },
  { who: "MOM", line: "Go outside. Touch grass. Literally, there are cards in it." }
];
Object.assign(GAME_DATA.text, {
  momCoins:     "Got {n} coins. Mom's watching your screen time.",  // [writer v3.1]
  oldSave:      "New patch dropped. Your old save got deleted, like your ex's posts.",  // [writer v3.1]
  foundCard:    "You found {name}! Somebody just left it lying there. Their loss.",  // [writer] fallback (battle_text.md)
  binderTitle:  "BINDER",                                                    // title, kept
  binderEmpty:  "Your binder is empty. Go touch grass, there are cards in it.",  // [writer v3.1]
  shopTitle:    "PACK SHOP",                                                 // title, kept
  packSummary:  "Your pulls. Rate them in the comments.",           // [writer]
  packConfirm:  "Open the {pack}? No take-backs. No refunds. No dignity.",  // [writer] v0.4.1
  packHint:     "Z: next   X: skip to the end",                   // [interim, programmer] v0.3.3
  packClose:    "Z: back to the binder",                         // [interim, programmer] v0.3.3
  packNone:     "No packs. Your wallet called. It's crying.",       // [writer]
  packOpen:      "Ripping it open. Chat is NOT here for this.",          // [writer] pull reactions
  packCommon:    "{name}. A Common. Classic.",
  packRarePlus:  "{name}! Act casual. Don't scream.",
  packUncommon:  "{name}. Uncommon. Not bad, not content.",
  packOpenAnother: "Open another? Your wallet says no. Your heart says yes.",
  packHolo:      "IT'S SHINY. {name} is holo!",
  packLegendary: "LEGENDARY {name}! Dad is crying in the shed.",
  roomBed:          "Your bed. Unmade since the last pack drop.",            // [writer] Room inspect lines
  roomPc:           "Your PC. 47 tabs of pack openings. Close them? No.",
  roomPoster:       "A poster of a guy pointing at a card. You don't know who he is.",
  roomShopExit:     "Come back when you're richer. Or never.",            // [writer] shop_exit
  roomShopEntry:    "Welcome to the Pack Shack. No refunds. No feelings.",
  roomShelfSoldout: "SOLD OUT. Restock in 1 hour. (It's always 1 hour.)",
  shopBought:   "Bought a {pack}! Open it in your Bag. Do NOT livestream it.",  // [writer v3.1]
  shopPoor:     "You're broke. Ask Mom. Or sell Dad's sticker.",  // [writer v3.1]
  shopLocked:   "Members only. Get more clout.",  // [writer v3.1]
  noCombat:     "Fights are in beta. The server mod promised soon™.",  // [writer v3.1]
  foundHypewick:    "You found Hypewick in the dirt! Already trending. Already burnt out.",    // [writer] per-spot line
  foundInfluencorn: "Influencorn was hiding in the wall. Best lighting in town, apparently.", // [writer] per-spot line
  npcRicky:     "Don't walk in my shot! ...Okay, you can be in it. For exposure.",  // [writer] Overworld v0.3.1
  npcUnboxer:   "I opened 300 packs today. My mom thinks I'm at school.",          // [writer] Overworld v0.3.1
  npcMom1:      "Did you touch grass yet? I can tell when you're lying.",            // [writer] battle_text.md npc_mom
  npcMom2:      "If you open a pack in the house, open a window. The hype smells.",  // [writer] npc_mom
  npcMom3:      "No, I won't watch your unboxing. I've seen your dad's.",           // [writer] npc_mom
  npcDad1:      "Can't talk. Guarding the investment.",                            // [writer] npc_dad
  npcDad2:      "That sticker's gonna be worth millions. Mark my words.",          // [writer] npc_dad
  npcDad3:      "Tell your mom the shed has wifi now. I'm never coming back.",     // [writer] npc_dad
  shopNoCommons:    "A Common? I can't even give these away. Bring me 50 and I'll trade you a pack.", // [writer] Shopkeeper
  shopNoCommonsAlt: "That's not a card, that's a coaster.",                        // [writer] Shopkeeper (repeat refusal)
  shopNoHoloCommon: "Shiny garbage is still garbage. Trade-in pile.",              // [writer] Shopkeeper
  shopTradeIn:      "50 Commons? Ugh, fine. One Basic Pack. Now leave.",           // [writer] Shopkeeper
  shopTradeShort:   "You've got {n} Commons. I need 50. Keep grinding.",           // [writer] Shopkeeper
  shopSell:         "I'll give you {n} coins for that. Take it or leave it.",      // [writer] Shopkeeper (offer; Z again to accept)
  shopSold:         "+{n} coins.",                                                 // UI label
  shopInDeck:       "That one's in your deck. I don't buy cards off people mid-relationship.",
  shopTabs:         "BUY   SELL   TRADE-IN",                                     // UI label
  coins:        "Coins: {n}"                                                 // title, kept
});
window.T = function (key, vars = {}) { const v = GAME_DATA.text[key]; return (Array.isArray(v) ? v.join(" ") : (v || key)).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? ""); };
window.TL = function (key, vars = {}) { const v = GAME_DATA.text[key]; return (Array.isArray(v) ? v : [v || key]).map(s => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "")); };
