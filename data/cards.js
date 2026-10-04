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
    text: "Fresh graves line the trail. Someone in the next camp has cholera (a disease spread through dirty water). Cholera killed more travelers on the trail than anything else.",
    choices: [
      { label: "Stop a day and boil all your water",
        result: "In 1849, nobody knows what causes cholera. Some travelers blame bad water. Boiling it protects you more than you know.",
        effects: { days: 1, sick: { chance: 0.15, cause: "cholera" } } },
      { label: "Use the medicine chest", requires: { medicine: 1 },
        result: "Medicine in 1849 could not cure cholera. But rest and care help a little.",
        effects: { medicine: -1, sick: { chance: 0.3, cause: "cholera" } } },
      { label: "Push on fast",
        result: "You hurry past the sick camp. You drink from the same river as everyone else.",
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
    text: "The wagon drops into a deep rut. The axle (the bar that holds the wheels) cracks. Accidents like this were some of the most common dangers on the trail. So were people falling under wagon wheels.",
    choices: [
      { label: "Use your spare parts", requires: { parts: 1 },
        result: "You swap in the spare. You are back on the trail by afternoon.",
        effects: { parts: -1 } },
      { label: "Cut wood and fix it",
        result: "Good wood is hard to find out here. The repair takes two days.",
        effects: { days: 2 } },
      { label: "Trade for a part from another wagon", requires: { trade: 1 },
        result: "Another family gives you an axle. You pay them with some of your goods.",
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
    text: "Pawnee riders meet the wagon train. The Pawnee are a Native nation who live and hunt on these plains. Thousands of wagons have crossed their hunting grounds. The wagons ate the grass and scared off the animals they hunt. The riders ask for payment to let you pass.",
    choices: [
      { label: "Pay in flour and goods",
        result: "You hand over flour and cloth. The Pawnee riders let the train pass. Many travelers paid tolls (fees to pass) like this. Most of these meetings were peaceful.",
        effects: { food: -50, trade: -1 } },
      { label: "Bargain through a trader who speaks Pawnee",
        result: "After a long talk, you agree on a smaller payment. On the trail, trading and talking were far more common than fighting.",
        effects: { food: -25, days: 1 } },
      { label: "Refuse and go around to the north",
        result: "Going around costs you three days. Your oxen are worn out.",
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
    text: "The wagons ahead have eaten all the grass along the river. Your oxen are hungry. That same grass fed the horses and bison (buffalo) that the Native nations here depend on.",
    choices: [
      { label: "Drive the oxen far from the trail to eat",
        result: "The oxen eat well, but it costs a day. Every wagon train did this. The damage spread for miles around the trail.",
        effects: { days: 1 } },
      { label: "Push on and hope for grass ahead",
        outcomes: [
          { chance: 0.6, result: "You find grass two days later. The oxen are thin but alive.", effects: {} },
          { chance: 0.4, result: "One ox falls down and cannot go on.", effects: { oxen: -1 } }
        ] }
    ],
    sources: ["emigrant-impact"],
    draft: true
  },
  {
    id: "bison",
    title: "Bison by the Platte River",
    lead: "navigator",
    vote: true,
    pools: ["plains"],
    art: "prairie",
    text: "A herd of bison (buffalo) eats grass across the river. The Lakota, Cheyenne, and Pawnee are Native nations of the plains. For them, bison are food, clothing, and shelter. Bison are also sacred (holy) to them. Travelers hunted bison for food, and often just for fun.",
    choices: [
      { label: "Hunt one bison and use all of it",
        result: "You take only what you can carry. You have fresh meat for a week.",
        effects: { food: 60, days: 1 } },
      { label: "Leave the herd alone",
        result: "{journal} writes about the herd in the journal. Within forty years, the huge herds would be almost gone.",
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
    text: "Someone pulls a loaded rifle out of the wagon, and it goes off. Almost every wagon carried guns. Accidental shootings were common. Attacks were rare.",
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
    text: "A Shoshone family offers dried meat and fresh horses. The Shoshone are a Native nation of these mountains. They also know where to find the next good water.",
    choices: [
      { label: "Trade goods for meat and advice", requires: { trade: 1 },
        result: "You trade cloth for dried meat. They show you a spring that the guidebooks miss.",
        effects: { trade: -1, food: 80, days: -1 } },
      { label: "Trade flour for dried meat",
        result: "A fair trade. Dried meat lasts longer than your flour.",
        effects: { food: 20 } },
      { label: "Say no politely",
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
    text: "A Shoshone guide offers to lead the train on a safer path with better grass. The Shoshone are a Native nation of these mountains. He asks to be paid.",
    choices: [
      { label: "Hire the guide ($10)", requires: { money: 10 },
        result: "The guide's route looks longer on the map, but it is faster. Travelers often paid Native guides to show them trails and safe places to cross rivers.",
        effects: { money: -10, days: -2 } },
      { label: "Use your guidebook instead",
        outcomes: [
          { chance: 0.6, result: "The guidebook route works, but it is slow.", effects: { days: 1 } },
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
    text: "A man selling guidebooks swears his shortcut saves 300 miles. In 1846, the Donner Party (a group of wagon families) tried a shortcut like this one. It cost them weeks. Then snow trapped them in the Sierra Nevada, the mountains on the way into California.",
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
    text: "Fort Laramie has been a trading post (a place to buy and trade goods) for fifteen years. Travelers, traders, and Lakota and Cheyenne families all meet here. This June, the U.S. Army bought it. Prices here are high.",
    choices: [
      { label: "Buy 100 lb of flour ($12)", requires: { money: 12 },
        result: "Flour costs far more here than in Independence, Missouri, the town where the trail starts. You pay it.",
        effects: { money: -12, food: 100 } },
      { label: "Trade with Lakota families for shoes and meat", requires: { trade: 1 },
        result: "The trade goes well. Moccasins (soft leather shoes) replace your worn-out shoes.",
        effects: { trade: -1, food: 40 } },
      { label: "Save your money and move on",
        result: "You rest your oxen and keep going.",
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
    text: "The captain of your wagon company (the group of wagons traveling together) calls a meeting. Some families do not want \"papists\" traveling with them. \"Papists\" was an insult for Catholics. In the 1840s, many Americans hated or feared Catholics.",
    choices: [
      { label: "Stay, keep quiet, and take the worst campsites",
        result: "You stay. You camp at the back of the line, where the grass is already eaten.",
        effects: { oxen: -1 } },
      { label: "Leave and find another group",
        result: "It takes two days to find a wagon company that will take you.",
        effects: { days: 2 } },
      { label: "Ask the families who know you to speak up",
        outcomes: [
          { chance: 0.5, result: "A farmer you helped at the river speaks up for you. The vote goes your way.", effects: { flags: { madeAllies: true } } },
          { chance: 0.5, result: "Nobody speaks up. You leave the group.", effects: { days: 2 } }
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
    text: "A man at the fort says he is looking for people who escaped slavery. He demands to see your free papers (documents that prove you are free, not enslaved). Without them, a Black family could be kidnapped and sold into slavery.",
    choices: [
      { label: "Show the papers",
        result: "He reads them slowly, hands them back, and walks away. After this, you keep the papers sewn inside {doctor}'s coat.",
        effects: { days: 1, flags: { showedPapers: true } } },
      { label: "Ask the wagon captain to speak for you",
        outcomes: [
          { chance: 0.6, result: "The captain tells the man to move along. Now you owe the captain a favor.", effects: { flags: { captainVouched: true } } },
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
    text: "At Fort Laramie, the wagon captain wants to kick the Doyles out of the group. They are an Irish Catholic family. In the 1840s, many Americans hated or feared Catholics. The captain asks every family to vote. Your family's vote counts.",
    choices: [
      { label: "Vote to let the Doyles stay",
        result: "The Doyles stay by two votes. That night, Bridget Doyle brings you bread.",
        effects: { flags: { helpedDoyles: true } } },
      { label: "Vote with the captain",
        result: "The Doyles leave the group and travel alone. You never see them again.",
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
    text: "At South Pass (a wide, low path through the Rocky Mountains), you camp beside the Bells. They are a free Black family from Missouri. Isaac Bell says they are going to Oregon to get land. Another traveler says: \"Oregon doesn't want Black settlers. They passed a law against it once, and they'll do it again.\" He means Oregon has already made a law to keep Black people out.",
    choices: [
      { label: "Ask Isaac Bell what he plans to do",
        result: "Isaac says they will find a way, or go somewhere that will take them. {journal} writes his words in the journal.",
        effects: { flags: { metBells: true } } },
      { label: "Say nothing",
        result: "The Bells leave early the next morning.",
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
    text: "At Fort Laramie, you share a campfire with the Bells. They are a free Black family from Missouri, a state where slavery was legal. Daniel Bell asks {quartermaster} if Irish families get treated as Americans out here.",
    choices: [
      { label: "Tell the truth: \"Not always.\"",
        result: "The two families trade stories late into the night. Both know what it feels like to be watched.",
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
    text: "An Irish family, the Doyles, camps at the edge of the wagon train, just like you do. Bridget Doyle's youngest child is sick. She asks {doctor} for help.",
    choices: [
      { label: "Share medicine", requires: { medicine: 1 },
        result: "The child gets better. Patrick Doyle helps {navigator} fix a wheel the next week.",
        effects: { medicine: -1, parts: 1, flags: { helpedDoyles: true } } },
      { label: "Share advice and soup",
        result: "{doctor} stays up with the child all night. The Doyles never forget it.",
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
    text: "Past Fort Hall, at the Raft River, the trail splits in two. This year, almost everyone is heading for the gold fields in California. Only a few hundred families keep going west to farm in Oregon. Everyone votes.",
    choices: [
      { label: "Oregon: land to farm",
        result: "You keep going west, toward the Columbia River and the farmland of the Willamette Valley. This is the land you came for.",
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
    text: "At The Dalles, a stop on the Columbia River, the wagon road ends. You can ride a raft down the river through the rapids (fast, rocky water). Or you can pay a toll (a fee) to take the Barlow Road over the side of Mount Hood.",
    choices: [
      { label: "Raft with Chinookan river guides ($8)", requires: { money: 8 }, minigame: "raft", pilot: true, who: "navigator",
        outcomes: [
          { chance: 0.75, result: "The Chinookan guides are Native people of this river. They know every rock. You reach the Willamette Valley fast.", effects: { money: -8 } },
          { chance: 0.25, result: "A rapid floods the raft. You save the family, but the river takes some of your supplies.", effects: { money: -8, food: -100, sick: { chance: 0.3, cause: "drowning" } } }
        ] },
      { label: "Build your own raft and run the river", minigame: "raft", pilot: false, who: "navigator",
        outcomes: [
          { chance: 0.5, result: "Somehow you make it through the rapids. Everyone is soaked and shaking.", effects: { parts: -1 } },
          { chance: 0.5, result: "The raft slams into the rocks. You lose much of what you own.", effects: { parts: -1, food: -200, sick: { chance: 0.5, cause: "drowning" } } }
        ] },
      { label: "Pay the Barlow Road toll ($5 plus 10 cents per animal)", requires: { money: 6 },
        result: "The road is steep, especially going down Laurel Hill. But it is solid ground. It takes about a week.",
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
    text: "The Willamette Valley is green and wide. Under the Donation Land Claim law, a married couple can claim 640 acres. The land is free to white settlers who live on it and farm it for four years. Half is in {doctor}'s name. It was one of the first U.S. laws to let married women own land. This is the promise that brought you west.",
    choices: [
      { label: "Claim land near the river",
        result: "You drive stakes into rich black soil to mark your land. On paper, the land is yours.",
        effects: { land: 640, flags: { claimedLand: true } } },
      { label: "Claim land up in the hills, away from others",
        result: "The soil is poorer, but nobody fights you for it.",
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
    text: "In Oregon City, a clerk tells {navigator} that Oregon law bans Black people from settling here. You traveled 2,000 miles. Now the land you were promised is closed to you by law.",
    choices: [
      { label: "Ask white neighbors to let you farm their land",
        result: "A neighbor agrees. But you own nothing, and the law could be used against you any day.",
        effects: { flags: { stayedQuietly: true } } },
      { label: "Keep going north of the Columbia River",
        result: "North of the river is still part of Oregon Territory, so the law applies there too. But it is rarely enforced there. George Washington Bush, a Black farmer, settled there in 1845. You pack up again.",
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
    text: "A Kalapuya family walks past the stakes that mark your land. The Kalapuya are the Native people of the Willamette Valley. For many generations, they burned the valley each late summer. The fires kept the meadows open and helped camas grow. (Camas is a plant with a bulb they ate.) Now settlers are fencing it in.",
    choices: [
      { label: "Ask them about the land",
        result: "A neighbor speaks Chinook Jargon, a trade language used all over the Northwest. Through him, you learn this meadow was a camas field. Disease had already killed most of the Kalapuya before you came.",
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
    title: "Catholic in Oregon",
    lead: "journal",
    vote: false,
    families: ["irish"],
    art: "valley",
    text: "You have land now. But at the store, a neighbor says Oregon was meant for \"real Americans.\" He asks if the Pope sent you. (The Pope is the head of the Catholic Church. Some Americans claimed Catholics were loyal to the Pope, not to the U.S.)",
    choices: [
      { label: "Be polite and stay quiet",
        result: "You have land, but people do not fully accept you. That will take years.",
        effects: { flags: { notAccepted: true } } },
      { label: "Look for other Catholics nearby",
        result: "A small Catholic church meets on Sundays. You are not alone.",
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
    text: "You hear about George Washington Bush. He is a Black farmer who came west on the trail in 1844. Oregon's law kept Black people out. So he settled north of the Columbia River. Over time, his neighbors came to depend on him.",
    choices: [
      { label: "Remember his story",
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
    text: "The Humboldt River disappears into the sand. Ahead are forty miles with no good water. Dead oxen and wagons people left behind line the trail.",
    choices: [
      { label: "Cross at night and carry water",
        result: "You walk all night under the stars. Everyone makes it to the Truckee River.",
        effects: { days: 2, food: -30 } },
      { label: "Make the wagon lighter and cross by day",
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
    text: "The Sierra Nevada mountains rise like a wall. It is fall. Everyone remembers the Donner Party, a group of wagon families trapped here when snow came early in 1846.",
    choices: [
      { label: "Rush over the pass now",
        result: "You pull the wagon up the steep rocks with ropes. It is terrifying, but the weather holds.",
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
    text: "Everyone came for gold. A pan of gravel might hold a few dollars of gold, or none. Boots, shovels, and food cost many times more than back east.",
    choices: [
      { label: "Dig for gold in the river", minigame: "pan", who: "quartermaster",
        result: "Weeks of cold river work. One miner's wife wrote that gold mining is \"nature's great lottery scheme.\" She meant it is like a lottery. A few people get rich, and most get little or nothing.",
        effects: { sick: { chance: 0.15, cause: "fever" } } },
      { label: "Sell supplies to miners instead",
        result: "You sell flour, shovels, and boots at gold rush prices. This quietly pays better than mining.",
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
    text: "Don Ignacio is a Californio (from a Mexican family that lived in California before it became part of the U.S.). His family has owned this rancho (a large ranch) for decades. Now he watches squatters (people who settle on land they do not own) build cabins on it. A new U.S. law, the Land Act of 1851, will make him prove in court that the land is his. With appeals, these cases took 17 years on average.",
    choices: [
      { label: "Ask him what will happen",
        result: "He says the case could take years. Paying lawyers could cost him the land. Many Californio families lost their ranchos this way.",
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
    text: "By 1850, miners in camp talk about militias (armed groups of men). The state of California pays them to attack Native villages in the hills. The number of Native people in California is dropping fast. They are dying from disease, hunger, and violence.",
    choices: [
      { label: "Listen and write it down",
        result: "The journal entry is short. Some things are hard to write.",
        effects: { flags: { heardMilitia: true } } },
      { label: "Ask a Nisenan man who trades in camp",
        result: "The Nisenan are a Native people of these hills. He says his village has moved three times since the miners came.",
        effects: { flags: { heardMilitia: true, askedNisenan: true } } }
    ],
    sources: ["california-native-population", "militia-payments"],
    draft: true
  },
  {
    id: "chans-arrive",
    teacherNote: "Invented scene built on documented facts: Chinese arrivals peaked in 1852 (about 20,000), most from Guangdong; many borrowed for the fare; district associations met ships and helped with work. Overland families often stopped in Sacramento, near Sutter's Fort, for supplies.",
    year: "1852",
    title: "Off the riverboat",
    lead: "journal",
    vote: true,
    families: ["ohio", "irish", "black"],
    art: "river",
    text: "Sacramento is a busy river town near Sutter's Fort. Your family comes here to buy supplies for the gold fields. On one trip, in 1852, a riverboat from San Francisco unloads four young men: Chan Ah Sing and his cousins Kwok, Fook, and Yau. They come from Guangdong, a province (a region) in southern China. Their families borrowed money to pay for the ship, and the cousins must pay it back. They spent about two months below deck crossing the Pacific Ocean. Men from their home district (their home area in China) are helping them find work.",
    choices: [
      { label: "Show them the road to the diggings",
        result: "{journal} draws the road on a scrap of paper. Ah Sing thanks you. He says they will work together as a group, the way men from home do.",
        effects: { days: 1, flags: { metChans: true, guidedChans: true } } },
      { label: "Sell them flour at a fair price", requires: { food: 50 },
        result: "You sell them flour for the same price the stores in town charge. Kwok counts the coins carefully. Every dollar they spend makes it harder to pay back what they owe.",
        effects: { food: -50, money: 20, flags: { metChans: true, soldChansFair: true } } },
      { label: "Sell them flour at a high price", requires: { food: 50 },
        result: "You charge them double what the stores charge. They are new here and do not know the prices yet. Yau pays without a word.",
        effects: { food: -50, money: 40, flags: { metChans: true, overchargedChans: true } } },
      { label: "Walk past them",
        result: "You load your wagon and leave. The cousins ask someone else for help.",
        effects: { flags: { metChans: true } } }
    ],
    sources: ["chinese-arrivals", "chinese-voyage", "chinese-district-associations"],
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
    text: "Later in 1852, the Chan cousins you met in Sacramento are mining a claim (a mining spot) downstream. A tax collector rides up. Under the Foreign Miners' Tax of 1852, every miner who is not a U.S. citizen must pay $3 a month. U.S. law let only white immigrants become citizens, so Chinese miners could never stop paying. Ah Sing has already paid this month. The collector demands more anyway.",
    choices: [
      { label: "Speak up for the Chan cousins",
        result: "The collector tells you to mind your own business. But he leaves without making them pay twice.",
        effects: { flags: { helpedChans: true } } },
      { label: "Stay out of it",
        result: "Ah Sing pays again. That evening, the cousins move farther upstream.",
        effects: {} }
    ],
    sources: ["foreign-miners-tax", "naturalization-white"],
    draft: true
  },
  {
    id: "chans-witness",
    teacherNote: "Invented scene built on People v. Hall, 4 Cal. 399 (1854), which barred Chinese testimony against white people in California courts.",
    year: "1854",
    title: "The only witness",
    lead: "navigator",
    vote: true,
    families: ["ohio", "irish"],
    art: "goldfields",
    text: "It is 1854. A white miner points a gun at the Chan cousins and takes their gold. Your family sees it all. This year, in a case called People v. Hall, California's top court ruled that Chinese people cannot testify (speak as a witness) in court against a white person. So the Chans cannot tell a judge what happened. Your family is the only witness whose word counts.",
    choices: [
      { label: "Testify in court",
        outcomes: [
          { chance: 0.5, result: "You tell the judge what you saw. The man must give back the gold. Some neighbors stop talking to you. They say you took the side of Chinese miners against a white man.", effects: { days: 2, flags: { testifiedForChans: true } } },
          { chance: 0.5, result: "You tell the judge what you saw. The jury lets the man go anyway. Some neighbors stop talking to you. But Ah Sing knows you spoke.", effects: { days: 2, flags: { testifiedForChans: true } } }
        ] },
      { label: "Stay quiet",
        result: "You say nothing. With no witness, there is no case. The man keeps the gold, and the cousins move their camp again.",
        effects: { flags: { silentWitness: true } } }
    ],
    sources: ["people-v-hall"],
    draft: true
  },
  {
    id: "chans-witness-bell",
    teacherNote: "Invented scene built on section 14 of California's 1850 Act Concerning Crimes and Punishments (no Black, mulatto, or Indian testimony against a white man) and People v. Hall (1854).",
    year: "1854",
    title: "Two witnesses who don't count",
    lead: "navigator",
    vote: true,
    families: ["black"],
    art: "goldfields",
    text: "It is 1854. A white miner points a gun at the Chan cousins and takes their gold. Your family sees it all. This year, California's top court ruled that Chinese people cannot testify (speak as a witness) in court against a white person. A California law from 1850 already said the same about Black people and Native Americans. So your family saw the robbery, but the law will not let you tell a judge.",
    choices: [
      { label: "Find a white neighbor to testify",
        outcomes: [
          { chance: 0.4, result: "A storekeeper who also saw it agrees to speak. The man must give back part of the gold.", effects: { days: 1, flags: { foundWitness: true } } },
          { chance: 0.6, result: "Each neighbor you ask says no. Nobody wants trouble. The gold is gone.", effects: { days: 1 } }
        ] },
      { label: "Tell the Chans what you saw",
        result: "{navigator} describes the man to Ah Sing. The cousins warn other Chinese camps to watch for him. Your two families start looking out for each other.",
        effects: { flags: { warnedChans: true } } },
      { label: "Stay quiet",
        result: "You keep quiet. Your word would not count in court. Speaking up could bring trouble to your own family.",
        effects: { flags: { bellsKeptQuiet: true } } }
    ],
    sources: ["people-v-hall"],
    draft: true
  },

  // ------------------------------- sea route (Chans; kept for reference, unused)
  {
    id: "pacific-voyage",
    title: "Crossing the Pacific",
    lead: "doctor",
    vote: false,
    art: "sea",
    text: "The ship is crowded below deck. The trip across the ocean to San Francisco takes two to three months. Fever spreads among the passengers.",
    choices: [
      { label: "Use your herbal medicines", requires: { medicine: 1 },
        result: "{doctor}'s medicines help. The cousins stay well.",
        effects: { medicine: -1, sick: { chance: 0.1, cause: "fever at sea" } } },
      { label: "Stay up on deck in the fresh air",
        result: "At night the crew makes you go back below. You hope for the best.",
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
    text: "San Francisco's harbor is a forest of ship masts. Chinese travelers call California \"Gold Mountain.\" Men from your home district (your home area in China) meet the ship. Their district group, the Sze Yup company, helps people from your area. It offers you a place to stay, help finding work, and tools for the mines.",
    choices: [
      { label: "Join a mining group from your district",
        result: "You head for the mines with men who speak your home dialect. The company sends you off with rice for the road. There is safety in numbers.",
        effects: { food: 120, flags: { company: true } } },
      { label: "Go out on your own",
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
    text: "A tax collector rides into camp. Since May 1852, every miner who is not a U.S. citizen must buy a license for $3 a month. U.S. law lets only white immigrants become citizens. So Chinese miners can never stop paying.",
    choices: [
      { label: "Pay the tax", requires: { gold: 3 },
        result: "You pay. The collector writes a receipt. Some collectors came back and made miners pay again.",
        effects: { gold: -12 } },
      { label: "Move to a spot American miners left",
        result: "You work old claims (mining spots) that nobody else wants. Chinese miners often did this, and they still had to pay the tax.",
        effects: { gold: -6, days: 3 } }
    ],
    sources: ["foreign-miners-tax"],
    draft: true
  },
  // Unused now: written from the Chans' point of view for the sea route, which no
  // playable family takes. Kept for reference.
  {
    id: "cross-chan-overlanders",
    title: "New arrivals",
    lead: "journal",
    vote: false,
    families: ["chinese"],
    art: "goldfields",
    text: "Wagon families come down from the Sierra Nevada mountains, thin and worn out from the trail. Some are kind. Others shout that California's gold belongs to Americans.",
    choices: [
      { label: "Sell them food",
        result: "The Carvers came west by wagon three years ago. They buy your rice and thank you. Their daughter asks {journal} to teach her a word of Cantonese, your Chinese language.",
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
    text: "Two men take your gold at gunpoint. You saw their faces. In 1854, California's top court will rule in a case called People v. Hall. The court says Chinese people cannot be witnesses in court against white people. By then, cases like yours go nowhere.",
    choices: [
      { label: "Report it anyway",
        result: "The sheriff writes nothing down. Your word does not count in court, so there is no case.",
        effects: { gold: -40 } },
      { label: "Ask a white store owner who saw it to speak",
        outcomes: [
          { chance: 0.3, result: "He agrees to be a witness. The thieves give back part of the gold.", effects: { gold: -20 } },
          { chance: 0.7, result: "He says he doesn't want trouble. The gold is gone.", effects: { gold: -40 } }
        ] }
    ],
    sources: ["people-v-hall"],
    draft: true
  }
];
