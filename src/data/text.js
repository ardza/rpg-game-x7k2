// All player-facing strings. T(key, vars) fills {slot}s.
// Lines marked [writer] come from story/battle_text.md (tone approved).
// All lines are from story/battle_text.md except where marked interim.
window.GAME_DATA = window.GAME_DATA || {};
GAME_DATA.text = {
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
window.T = function (key, vars = {}) { return (GAME_DATA.text[key] || key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? ""); };
