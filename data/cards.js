// Westward: event cards.
//
// Each card:
//   id, title, lead (which role holds the mouse), vote (true = group vote),
//   text (read aloud), choices, pools (for random draws), families (optional limit),
//   requires (optional: a choice only shows if the family has this flag or stat),
//   year (optional: shown on the card when it happens after 1849),
//   teacherNote (optional: shown in the teacher panel, e.g. that a scene is invented),
// Text can name the player's own family by role: {navigator}, {quartermaster},
// {journal}, {doctor} (students type their own names for the family).
//   art (optional: the scene shown behind the card; see data/scenes.js),
//   minigame on a choice ("raft" or "pan"): a short skill break decides the outcome.
// Each choice has "result" text and "effects", or "outcomes" (a list with chance,
// result, effects) when luck decides.
//
// Effects: money, food, oxen, parts, medicine, trade, days, gold, land,
//   flags: { name: true },
//   sick: { chance, cause }   one family member may fall ill (and may die),
//   heal: true                the sickest family member recovers a step.
//
// Deaths are brief and never graphic. Nothing here turns suffering into points.
// DRAFT: every fact needs a source in research/ before the lesson.
window.WESTWARD = window.WESTWARD || {};

WESTWARD.cards = [
  // ---------------------------------------------------------------- trail
  {
    id: "cholera",
    title: "Cholera in camp",
    lead: "doctor",
    vote: false,
    pools: ["plains", "mountains"],
    art: "camp",
    text: "Fresh graves line the trail. Someone in the next camp has cholera, the disease that killed more emigrants than anything else. It spreads through dirty water.",
    choices: [
      { label: "Stop a day and boil all your water",
        result: "Nobody in 1849 knows what causes cholera, but some emigrants blame bad water. Boiling it protects you more than you could know.",
        effects: { days: 1, sick: { chance: 0.15, cause: "cholera" } } },
      { label: "Use the medicine chest", requires: { medicine: 1 },
        result: "The medicines of 1849 could not cure cholera, but rest and care help a little.",
        effects: { medicine: -1, sick: { chance: 0.3, cause: "cholera" } } },
      { label: "Push on quickly",
        result: "You hurry past the sick camp and drink from the same river everyone else does.",
        effects: { sick: { chance: 0.55, cause: "cholera" } } }
    ],
    sources: ["cholera-deaths"],
    draft: true
  },
  {
    id: "wagon-accident",
    title: "A broken axle",
    lead: "quartermaster",
    vote: false,
    pools: ["plains", "mountains"],
    art: "prairie",
    text: "The wagon drops into a rut and the axle cracks. Accidents like this, and people falling under wagon wheels, were among the most common dangers on the trail.",
    choices: [
      { label: "Use your spare parts", requires: { parts: 1 },
        result: "You swap in the spare. Back on the trail by afternoon.",
        effects: { parts: -1 } },
      { label: "Cut timber and repair it",
        result: "Good timber is scarce out here. The repair takes two days.",
        effects: { days: 2 } },
      { label: "Trade for a part from another wagon", requires: { trade: 1 },
        result: "Another family trades you an axle for some of your goods.",
        effects: { trade: -1 } }
    ],
    sources: ["trail-accidents"],
    draft: true
  },
  {
    id: "pawnee-toll",
    title: "Pawnee land",
    lead: "quartermaster",
    vote: true,
    pools: ["plains"],
    art: "prairie",
    text: "Pawnee riders meet the wagon train. Thousands of wagons have crossed their hunting grounds, eaten the grass, and scared off the game. They ask for payment to pass.",
    choices: [
      { label: "Pay in flour and goods",
        result: "You hand over flour and cloth. The Pawnee riders let the train pass. Many emigrants paid tolls like this, and most crossings were peaceful.",
        effects: { food: -50, trade: -1 } },
      { label: "Negotiate through a trader who speaks Pawnee",
        result: "After a long talk you agree on a smaller payment. Trade and talk were far more common on the trail than fighting.",
        effects: { food: -25, days: 1 } },
      { label: "Refuse and detour north",
        result: "The detour costs you three days of travel and worn-out oxen.",
        effects: { days: 3 } }
    ],
    sources: ["native-tolls", "unruh-violence"],
    draft: true
  },
  {
    id: "grass-gone",
    title: "No grass left",
    lead: "quartermaster",
    vote: false,
    pools: ["plains", "mountains"],
    art: "prairie",
    text: "The wagons ahead have stripped the grass along the river. Your oxen are hungry. The same grass fed the horses and the bison that Native nations here depend on.",
    choices: [
      { label: "Drive the oxen far from the trail to graze",
        result: "The oxen eat well, but it costs a day. Every wagon train did this, and the damage spread miles from the trail.",
        effects: { days: 1 } },
      { label: "Push on and hope for grass ahead",
        outcomes: [
          { chance: 0.6, result: "You find grass two days later. The oxen are thin but alive.", effects: {} },
          { chance: 0.4, result: "One ox collapses and cannot go on.", effects: { oxen: -1 } }
        ] }
    ],
    sources: ["emigrant-impact"],
    draft: true
  },
  {
    id: "bison",
    title: "Bison on the Platte",
    lead: "navigator",
    vote: true,
    pools: ["plains"],
    art: "prairie",
    text: "A herd of bison grazes across the river. For the Lakota, Cheyenne, and Pawnee, bison are food, clothing, shelter, and sacred. Emigrants hunted them for food, and often for sport.",
    choices: [
      { label: "Hunt one bison for meat and use all of it",
        result: "You take only what you can carry. Fresh meat for a week.",
        effects: { food: 60, days: 1 } },
      { label: "Leave the herd alone",
        result: "{journal} writes about the herd in the journal. Within forty years, the great herds would be nearly gone.",
        effects: { flags: { sparedBison: true } } }
    ],
    sources: ["bison-decline"],
    draft: true
  },
  {
    id: "accidental-gunshot",
    title: "A loaded rifle",
    lead: "doctor",
    vote: false,
    pools: ["mountains"],
    art: "camp",
    text: "A rifle stored loaded in the wagon goes off when someone pulls it out. Almost every wagon carried guns. Accidental shootings were common; attacks were rare.",
    choices: [
      { label: "Treat the wound and rest two days",
        result: "With rest and care, the wound starts to heal.",
        effects: { days: 2, sick: { chance: 0.2, cause: "a gunshot accident" } } },
      { label: "Bandage it and keep moving",
        result: "You keep moving. The wound is slow to heal.",
        effects: { sick: { chance: 0.45, cause: "a gunshot accident" } } }
    ],
    sources: ["trail-accidents", "unruh-violence"],
    draft: true
  },
  {
    id: "shoshone-trade",
    title: "Shoshone traders",
    lead: "quartermaster",
    vote: false,
    pools: ["mountains"],
    art: "river",
    text: "A Shoshone family offers dried meat and fresh horses. They also know where the next good water is.",
    choices: [
      { label: "Trade goods for meat and advice", requires: { trade: 1 },
        result: "You trade cloth for dried meat, and they show you a spring the guidebooks miss.",
        effects: { trade: -1, food: 80, days: -1 } },
      { label: "Trade flour for dried meat",
        result: "A fair trade. The dried meat keeps better than your flour.",
        effects: { food: 20 } },
      { label: "Decline politely",
        result: "You move on with what you have.",
        effects: {} }
    ],
    sources: ["shoshone-trade"],
    draft: true
  },
  {
    id: "native-guide",
    title: "A guide offers help",
    lead: "navigator",
    vote: true,
    pools: ["mountains"],
    art: "mountains",
    text: "A Shoshone guide offers to lead the train along a safer path with better grass, for a price.",
    choices: [
      { label: "Hire the guide ($10)", requires: { money: 10 },
        result: "The guide's route is longer on the map but faster in practice. Emigrants often paid Native guides to show them fords and trails.",
        effects: { money: -10, days: -2 } },
      { label: "Follow the guidebook instead",
        outcomes: [
          { chance: 0.6, result: "The guidebook route works, slowly.", effects: { days: 1 } },
          { chance: 0.4, result: "The guidebook was wrong about the water. The oxen suffer.", effects: { days: 2, oxen: -1 } }
        ] }
    ],
    sources: ["native-guides"],
    draft: true
  },
  {
    id: "hastings-cutoff",
    title: "A shortcut?",
    lead: "navigator",
    vote: true,
    pools: ["mountains"],
    art: "mountains",
    text: "A man selling guidebooks swears his cutoff saves 300 miles. In 1846, the Donner Party tried a shortcut like this one. It cost them weeks, and they were trapped by snow in the Sierra Nevada.",
    choices: [
      { label: "Stay on the main trail",
        result: "You stay with the wagons you know. Slow and steady.",
        effects: {} },
      { label: "Take the shortcut",
        result: "The shortcut is rough, dry, and longer than promised. You lose more than a week.",
        effects: { days: 8, oxen: -1, sick: { chance: 0.2, cause: "exhaustion" } } }
    ],
    sources: ["donner-party"],
    draft: true
  },
  {
    id: "fort-laramie-trade",
    title: "Fort Laramie",
    lead: "quartermaster",
    vote: false,
    art: "fort",
    text: "Fort Laramie has been a trading post for fifteen years, where emigrants, traders, and Lakota and Cheyenne families all meet. This June, the U.S. Army bought it. Prices here are high.",
    choices: [
      { label: "Buy 100 lb of flour ($12)", requires: { money: 12 },
        result: "Flour costs far more than it did in Independence. You pay it.",
        effects: { money: -12, food: 100 } },
      { label: "Trade goods with Lakota families for moccasins and meat", requires: { trade: 1 },
        result: "The trade goes well. Your worn-out shoes are replaced.",
        effects: { trade: -1, food: 40 } },
      { label: "Save your money and move on",
        result: "You rest your oxen and press on.",
        effects: {} }
    ],
    sources: ["fort-laramie"],
    draft: true
  },

  // --------------------------------------------- family-specific (trail)
  {
    id: "nativist-company",
    teacherNote: "Invented scene. No documented case of a wagon company voting out an Irish Catholic family; it is built on real 1840s nativist attitudes.",
    title: "Not welcome",
    lead: "navigator",
    vote: true,
    families: ["irish"],
    art: "camp",
    text: "The captain of your wagon company calls a meeting. Some families do not want \"papists\" traveling with them. Anti-Catholic feeling is strong in the 1840s.",
    choices: [
      { label: "Stay, keep quiet, and take the worst campsites",
        result: "You stay. You camp at the end of the line, where the grass is already eaten.",
        effects: { oxen: -1 } },
      { label: "Leave and find another company",
        result: "It takes two days to find a company that will take you.",
        effects: { days: 2 } },
      { label: "Ask the families who know you to speak up",
        outcomes: [
          { chance: 0.5, result: "A farmer you helped at the river speaks for you. The vote goes your way.", effects: { flags: { madeAllies: true } } },
          { chance: 0.5, result: "Nobody speaks up. You leave the company.", effects: { days: 2 } }
        ] }
    ],
    sources: ["nativism-1840s"],
    draft: true
  },
  {
    id: "free-papers",
    title: "Show your papers",
    lead: "navigator",
    vote: true,
    families: ["black"],
    art: "fort",
    text: "A man at the fort says he is looking for people who escaped slavery. He demands to see your free papers. Without them, a Black family could be kidnapped and sold.",
    choices: [
      { label: "Show the papers",
        result: "He reads them slowly, hands them back, and walks away. You keep the papers sewn into {doctor}'s coat after this.",
        effects: { days: 1, flags: { showedPapers: true } } },
      { label: "Ask the wagon captain to vouch for you",
        outcomes: [
          { chance: 0.6, result: "The captain tells the man to move along. You owe him a favor now.", effects: { flags: { captainVouched: true } } },
          { chance: 0.4, result: "The captain says it is not his business. You show the papers anyway.", effects: { days: 1 } }
        ] }
    ],
    sources: ["free-papers-missouri"],
    draft: true
  },

  // ------------------------------------------- crossovers (meet the others)
  {
    id: "cross-ohio-doyles",
    teacherNote: "Invented scene. No documented case of a wagon company voting out an Irish Catholic family; it is built on real 1840s nativist attitudes.",
    title: "The Doyles",
    lead: "journal",
    vote: true,
    families: ["ohio"],
    art: "fort",
    text: "At Fort Laramie, the wagon captain wants to expel the Doyles, an Irish Catholic family, from the company. He asks every family to vote. Your family's vote counts.",
    choices: [
      { label: "Vote to let the Doyles stay",
        result: "The Doyles stay by two votes. Bridget Doyle brings you bread that night.",
        effects: { flags: { helpedDoyles: true } } },
      { label: "Vote with the captain",
        result: "The Doyles leave the company and travel alone. You never see them again.",
        effects: { flags: { expelledDoyles: true } } },
      { label: "Don't vote",
        result: "The vote passes without you. The Doyles leave.",
        effects: { flags: { expelledDoyles: true } } }
    ],
    sources: ["nativism-1840s"],
    draft: true
  },
  {
    id: "cross-ohio-bells",
    title: "The Bells",
    lead: "journal",
    vote: false,
    families: ["ohio"],
    art: "mountains",
    text: "At South Pass you camp beside the Bells, a free Black family from Missouri. Isaac Bell says they are headed to Oregon for land. Another emigrant says: \"Oregon doesn't want Black settlers. They passed a law against it once, and they'll do it again.\"",
    choices: [
      { label: "Ask Isaac Bell what he means to do",
        result: "Isaac says they will find a way, or go somewhere that will have them. {journal} writes his words in the journal.",
        effects: { flags: { metBells: true } } },
      { label: "Say nothing",
        result: "The Bells pull out early the next morning.",
        effects: { flags: { metBells: true } } }
    ],
    sources: ["oregon-exclusion-laws"],
    draft: true
  },
  {
    id: "cross-irish-bells",
    teacherNote: "Invented scene. No documented case of a wagon company voting out an Irish Catholic family; it is built on real 1840s nativist attitudes.",
    title: "The Bells",
    lead: "journal",
    vote: false,
    families: ["irish"],
    art: "fort",
    text: "At Fort Laramie you share a campfire with the Bells, a free Black family from Missouri. Daniel Bell asks {quartermaster} if Irish families get treated as Americans out here.",
    choices: [
      { label: "Tell the truth: \"Not always.\"",
        result: "The two families trade stories late into the night. Both know what it is like to be watched.",
        effects: { flags: { metBells: true }, food: 20 } },
      { label: "Keep to yourselves",
        result: "You eat apart. The trail is long, and trust is hard.",
        effects: { flags: { metBells: true } } }
    ],
    sources: ["nativism-1840s", "free-papers-missouri"],
    draft: true
  },
  {
    id: "cross-bell-doyles",
    teacherNote: "Invented scene. No documented case of a wagon company voting out an Irish Catholic family; it is built on real 1840s nativist attitudes.",
    title: "The Doyles",
    lead: "journal",
    vote: false,
    families: ["black"],
    art: "fort",
    text: "An Irish family, the Doyles, camps at the edge of the train like you do. Bridget Doyle's youngest is sick, and she asks {doctor} for help.",
    choices: [
      { label: "Share medicine", requires: { medicine: 1 },
        result: "The child recovers. Patrick Doyle helps {navigator} fix a wheel the next week.",
        effects: { medicine: -1, parts: 1, flags: { helpedDoyles: true } } },
      { label: "Share advice and broth",
        result: "{doctor} sits up with the child all night. The Doyles never forget it.",
        effects: { food: -20, flags: { helpedDoyles: true } } }
    ],
    sources: [],
    draft: true
  },

  // ------------------------------------------------------- Fort Hall fork
  {
    id: "fork",
    title: "The fork at Fort Hall",
    lead: "navigator",
    vote: true,
    art: "fort",
    text: "Past Fort Hall, at the Raft River, the trail splits. This year almost everyone is bound for the gold fields; only a few hundred families keep west toward Oregon's farmland. Everyone votes.",
    choices: [
      { label: "Oregon: farmland in the Willamette Valley",
        result: "You keep west, toward the Columbia River and the land you came for.",
        effects: { flags: { branch: "oregon" } } },
      { label: "California: gold",
        result: "You turn southwest, toward the Humboldt River and the gold fields.",
        effects: { flags: { branch: "california" } } }
    ],
    sources: ["gold-discovery", "trail-split"],
    draft: true
  },

  // ---------------------------------------------------------- Oregon
  {
    id: "columbia-or-barlow",
    title: "The last hard choice",
    lead: "navigator",
    vote: true,
    art: "river",
    text: "At The Dalles, the wagon road ends at the Columbia River. You can raft down the river through the rapids, or pay the toll for Barlow's road over the shoulder of Mount Hood.",
    choices: [
      { label: "Raft down with Chinookan pilots ($8)", requires: { money: 8 }, minigame: "raft", pilot: true, who: "navigator",
        outcomes: [
          { chance: 0.75, result: "The pilots know every rock. You reach the Willamette Valley fast.", effects: { money: -8 } },
          { chance: 0.25, result: "A rapid swamps the raft. You save the family, but lose supplies to the river.", effects: { money: -8, food: -100, sick: { chance: 0.3, cause: "drowning" } } }
        ] },
      { label: "Build your own raft and run the river", minigame: "raft", pilot: false, who: "navigator",
        outcomes: [
          { chance: 0.5, result: "Somehow you make it through the rapids. Everyone is soaked and shaking.", effects: { parts: -1 } },
          { chance: 0.5, result: "The raft slams into the rocks. You lose much of what you own.", effects: { parts: -1, food: -200, sick: { chance: 0.5, cause: "drowning" } } }
        ] },
      { label: "Pay the Barlow Road toll ($5 and 10 cents a head of stock)", requires: { money: 6 },
        result: "The road is steep, especially down Laurel Hill, but it is solid ground. It takes about a week.",
        effects: { money: -6, days: 7 } }
    ],
    sources: ["barlow-road", "columbia-pilots"],
    draft: true
  },
  {
    id: "oregon-land-claim",
    title: "Your land claim",
    lead: "quartermaster",
    vote: false,
    families: ["ohio", "irish"],
    art: "valley",
    text: "The Willamette Valley is green and wide. A married couple can claim 640 acres, free to white settlers who live on it and farm it for four years. Half is in {doctor}'s name, one of the first U.S. laws to let married women own land. This is the promise that brought you west.",
    choices: [
      { label: "Claim land near the river",
        result: "You drive stakes into rich black soil. The land is yours on paper.",
        effects: { land: 640, flags: { claimedLand: true } } },
      { label: "Claim land in the hills where nobody else is",
        result: "Poorer soil, but nobody disputes your stakes.",
        effects: { land: 640, flags: { claimedLand: true } } }
    ],
    sources: ["donation-land-claim"],
    draft: true
  },
  {
    id: "oregon-exclusion",
    title: "You cannot stay",
    lead: "navigator",
    vote: true,
    families: ["black"],
    art: "valley",
    text: "In Oregon City, a clerk tells {navigator} that Oregon law forbids Black people from settling here. You traveled 2,000 miles, and the land you were promised is closed to you by law.",
    choices: [
      { label: "Ask white neighbors to let you farm quietly on their land",
        result: "A neighbor agrees, but you own nothing, and the law could be used against you any day.",
        effects: { flags: { stayedQuietly: true } } },
      { label: "Keep going north of the Columbia River",
        result: "North of the river is still Oregon Territory, so the law applies there too, but it is rarely enforced. George Washington Bush settled there in 1845. You pack up again.",
        effects: { days: 10, flags: { wentNorth: true } } }
    ],
    sources: ["oregon-exclusion-laws"],
    draft: true
  },
  {
    id: "kalapuya-neighbors",
    title: "Whose valley?",
    lead: "journal",
    vote: false,
    art: "valley",
    text: "A Kalapuya family walks past your stakes. For generations, they burned this valley each late summer to grow camas and keep the meadows open. Now settlers are fencing it.",
    choices: [
      { label: "Ask them about the land",
        result: "Through a neighbor who speaks Chinook Jargon, you learn this meadow was a camas field. Disease had already killed most of the Kalapuya before you arrived.",
        effects: { flags: { askedKalapuya: true } } },
      { label: "Go back to work",
        result: "You keep building your fence. The family walks on.",
        effects: {} }
    ],
    sources: ["kalapuya-history"],
    draft: true
  },
  {
    id: "oregon-irish-welcome",
    title: "A Catholic in Oregon",
    lead: "journal",
    vote: false,
    families: ["irish"],
    art: "valley",
    text: "You have land now. But at the store, a neighbor says Oregon was meant for \"real Americans,\" and asks if the Pope sent you.",
    choices: [
      { label: "Answer politely and keep your head down",
        result: "You have land, but not full acceptance. That will take years.",
        effects: { flags: { notAccepted: true } } },
      { label: "Find the other Catholic families nearby",
        result: "A small mission church gathers on Sundays. You are not alone.",
        effects: { flags: { foundCommunity: true } } }
    ],
    sources: ["nativism-1840s"],
    draft: true
  },
  {
    id: "oregon-bush-news",
    title: "News from the north",
    lead: "journal",
    vote: false,
    families: ["black"],
    art: "valley",
    text: "You hear about George Washington Bush, a Black farmer who came over the trail in 1844. Oregon's law barred him, so he settled north of the Columbia, where neighbors grew to depend on him.",
    choices: [
      { label: "Hold on to his story",
        result: "{journal} copies his name into the journal. It helps to know others found a way.",
        effects: { flags: { heardBush: true } } }
    ],
    sources: ["george-bush"],
    draft: true
  },

  // ------------------------------------------------------- California trail
  {
    id: "forty-mile-desert",
    title: "The Forty Mile Desert",
    lead: "doctor",
    vote: true,
    art: "desert",
    text: "The Humboldt River sinks into the sand. Ahead lie forty miles without good water. The trail is lined with dead oxen and abandoned wagons.",
    choices: [
      { label: "Cross at night and carry water",
        result: "You walk all night under the stars. Everyone makes it to the Truckee River.",
        effects: { days: 2, food: -30 } },
      { label: "Lighten the wagon and cross by day",
        outcomes: [
          { chance: 0.5, result: "You dump furniture and tools in the sand, but you make it.", effects: { parts: -1, days: 2 } },
          { chance: 0.5, result: "The heat is brutal. You lose an ox.", effects: { oxen: -1, days: 2, sick: { chance: 0.2, cause: "heat and thirst" } } }
        ] }
    ],
    sources: ["forty-mile-desert"],
    draft: true
  },
  {
    id: "sierra-crossing",
    title: "The Sierra Nevada",
    lead: "navigator",
    vote: true,
    art: "mountains",
    text: "The mountains rise like a wall. It is autumn, and everyone remembers what happened to the Donner Party when the snow came early.",
    choices: [
      { label: "Rush over the pass now",
        result: "You haul the wagon up with ropes. It is terrifying, but the weather holds.",
        effects: { days: 3, oxen: -1 } },
      { label: "Rest two days, then cross",
        outcomes: [
          { chance: 0.7, result: "The rested oxen pull hard. You cross safely.", effects: { days: 5 } },
          { chance: 0.3, result: "A storm hits the pass. You make it through, cold and hungry.", effects: { days: 6, food: -50, sick: { chance: 0.25, cause: "cold" } } }
        ] }
    ],
    sources: ["donner-party"],
    draft: true
  },

  // ------------------------------------------------------- California
  {
    id: "making-a-living",
    title: "Gold fever",
    lead: "quartermaster",
    vote: true,
    art: "goldfields",
    text: "Everyone came for gold. A pan of gravel might hold a few dollars of gold, or none. Boots, shovels, and food cost many times what they did back east.",
    choices: [
      { label: "Work a claim on the river", minigame: "pan", who: "quartermaster",
        result: "Weeks of cold river work. Gold-mining, one miner's wife wrote, is \"nature's great lottery scheme.\"",
        effects: { sick: { chance: 0.15, cause: "fever" } } },
      { label: "Sell supplies to miners instead",
        result: "You sell flour, shovels, and boots at gold-rush prices. Quietly, this pays better than mining.",
        effects: { gold: 150, flags: { merchant: true } } }
    ],
    sources: ["miner-earnings", "merchants", "shirley-lottery"],
    draft: true
  },
  {
    id: "californio-rancho",
    year: "1851",
    title: "The rancho",
    lead: "journal",
    vote: false,
    art: "rancho",
    text: "Don Ignacio, a Californio ranchero, watches squatters build cabins on land his family has held for decades. Soon a federal law, the Land Act of 1851, will make him prove his title before a land commission and the courts. With appeals, cases took 17 years on average.",
    choices: [
      { label: "Ask him what will happen",
        result: "He says the case could take years and cost him the land in lawyers' fees. Many Californio families lost their ranchos this way.",
        effects: { flags: { heardCalifornio: true } } },
      { label: "Camp on the rancho like everyone else",
        result: "You camp by the creek. You are one more squatter on someone else's land.",
        effects: { flags: { squatted: true } } }
    ],
    sources: ["land-act-1851"],
    draft: true
  },
  {
    id: "militia-news",
    year: "1850",
    title: "News from the hills",
    lead: "journal",
    vote: false,
    art: "goldfields",
    text: "By 1850, miners in camp talk about militia companies paid by the state to attack Native villages in the foothills. California's Native population is collapsing from disease, starvation, and violence.",
    choices: [
      { label: "Listen and write it down",
        result: "The journal entry is short. Some things are hard to write.",
        effects: { flags: { heardMilitia: true } } },
      { label: "Ask a Nisenan man who trades in camp",
        result: "He says his village has moved three times since the miners came.",
        effects: { flags: { heardMilitia: true, askedNisenan: true } } }
    ],
    sources: ["california-native-population", "militia-payments"],
    draft: true
  },
  {
    id: "cross-chan-tax",
    year: "1852",
    title: "The tax collector",
    lead: "journal",
    vote: false,
    families: ["ohio", "irish", "black"],
    art: "goldfields",
    text: "Three years later, in 1852, a tax collector rides up to a camp of Chinese miners downstream. He demands the new Foreign Miners' Tax. One of them, Chan Ah Sing, has already paid, but the collector demands more.",
    choices: [
      { label: "Speak up for the Chan cousins",
        result: "The collector tells you to mind your business. But he leaves without collecting twice.",
        effects: { flags: { helpedChans: true } } },
      { label: "Stay out of it",
        result: "Ah Sing pays again. That evening, the cousins move farther upstream.",
        effects: {} }
    ],
    sources: ["foreign-miners-tax"],
    draft: true
  },

  // ------------------------------------------------------ sea route (Chans)
  {
    id: "pacific-voyage",
    title: "Crossing the Pacific",
    lead: "doctor",
    vote: false,
    art: "sea",
    text: "The ship is crowded below deck. The voyage to San Francisco takes two to three months. Fever spreads among the passengers.",
    choices: [
      { label: "Use your herbal medicines", requires: { medicine: 1 },
        result: "{doctor}'s medicines help. The cousins stay well.",
        effects: { medicine: -1, sick: { chance: 0.1, cause: "fever at sea" } } },
      { label: "Stay on deck in the fresh air as much as allowed",
        result: "The crew drives you below at night. You hope for the best.",
        effects: { sick: { chance: 0.35, cause: "fever at sea" } } }
    ],
    sources: ["chinese-voyage"],
    draft: true
  },
  {
    id: "sf-arrival",
    title: "Gold Mountain",
    lead: "navigator",
    vote: true,
    art: "harbor",
    text: "San Francisco is a forest of ship masts. Men from your home district meet the ship. Their district association, the Sze Yup company, offers lodging, help finding work, and tools for the mines.",
    choices: [
      { label: "Join a mining company from your district",
        result: "You head for the mines with men who speak your dialect. The company sends you off with rice for the road. There is safety in numbers.",
        effects: { food: 120, flags: { company: true } } },
      { label: "Strike out on your own",
        result: "You travel lighter, but alone.",
        effects: { money: 10 } }
    ],
    sources: ["chinese-district-associations"],
    draft: true
  },
  {
    id: "tax-collector",
    year: "1852",
    title: "The Foreign Miners' Tax",
    lead: "quartermaster",
    vote: true,
    families: ["chinese"],
    art: "goldfields",
    text: "A tax collector rides into camp. Since May 1852, every miner who is not a U.S. citizen must buy a license for $3 a month. U.S. law lets only white immigrants become citizens, so Chinese miners can never stop paying.",
    choices: [
      { label: "Pay the tax", requires: { gold: 3 },
        result: "You pay. The collector writes a receipt. Some collectors came back and demanded payment again.",
        effects: { gold: -12 } },
      { label: "Move to a claim the Americans abandoned",
        result: "You work leftover claims nobody else wants. Chinese miners often did this, and still made them pay.",
        effects: { gold: -6, days: 3 } }
    ],
    sources: ["foreign-miners-tax"],
    draft: true
  },
  {
    id: "cross-chan-overlanders",
    title: "New arrivals",
    lead: "journal",
    vote: false,
    families: ["chinese"],
    art: "goldfields",
    text: "Wagon families come down from the Sierra, thin and worn out from the trail. Some are kind. Others shout that California's gold belongs to Americans.",
    choices: [
      { label: "Sell them food",
        result: "The Carvers, who came overland three years ago, buy your rice and thank you. Their daughter asks {journal} to teach her a word of Cantonese.",
        effects: { gold: 15, flags: { metCarvers: true } } },
      { label: "Keep your distance",
        result: "You watch from upstream as the camp fills with newcomers.",
        effects: {} }
    ],
    sources: [],
    draft: true
  },
  {
    id: "no-testimony",
    year: "1854",
    title: "Robbed",
    lead: "navigator",
    vote: true,
    families: ["chinese"],
    art: "goldfields",
    text: "Two men take your gold at gunpoint. You saw their faces. In 1854 the California Supreme Court will rule in People v. Hall that Chinese witnesses cannot testify against white people. By then, cases like yours go nowhere.",
    choices: [
      { label: "Report it anyway",
        result: "The sheriff writes nothing down. Without your testimony, there is no case.",
        effects: { gold: -40 } },
      { label: "Ask a white merchant who saw it to testify",
        outcomes: [
          { chance: 0.3, result: "He agrees. The thieves return part of the gold.", effects: { gold: -20 } },
          { chance: 0.7, result: "He says he doesn't want trouble. The gold is gone.", effects: { gold: -40 } }
        ] }
    ],
    sources: ["people-v-hall"],
    draft: true
  }
];
