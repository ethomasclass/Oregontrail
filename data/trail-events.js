// Westward: trail events. These happen on the way between stops, generated from
// templates each time, so no two journeys are the same.
//
// How many happen is set by the clock: a group that is ahead of schedule meets
// more of trail life; a group that is behind meets none (see config.js).
//
// Each template:
//   id, weight (how likely), headline (shown big over the scene first), title, text,
//   lead (role at the mouse),
//   when: { terrain: [...], months: [...], route: "trail" | "sea" | "walk", has: { parts: 1 } }
//     terrain is one of: plains, river, mountains, desert, valley, goldfields, sea, town
//   react: what the diorama shows (stop, wheel, ox, storm, grave, goods, snow, dust, calm)
//   choices: like cards.js, or "outcome" for an event with no decision
// Slots filled in when the event happens:
//   {member} any living family member   {child} the youngest living member
//   {doctor} the family doctor          {ox} one of the oxen, by name
//   {next} the next stop                {family} the family name
// DRAFT: every event must match a documented experience; see research/.
window.WESTWARD = window.WESTWARD || {};

WESTWARD.oxNames = ["Buck", "Bright", "Duke", "Dime", "Star", "Brindle", "Old Tom", "Jerry", "Spot", "Berry"];

WESTWARD.trailEvents = [
  // ------------------------------------------------------------ the wagon
  {
    id: "loose-rims", headline: "The wheels are rattling apart!", weight: 3, lead: "quartermaster", react: "wheel",
    when: { route: "trail", terrain: ["plains", "mountains", "desert"] },
    title: "Loose wheel rims",
    text: "The dry air has shrunk the wooden wheels, and the iron rims are rattling loose. One more rut and a wheel could come apart.",
    choices: [
      { label: "Soak the wheels in the creek overnight", result: "By morning the wood has swelled tight against the iron. Lots of emigrants did this.", effects: { days: 1 } },
      { label: "Drive wooden wedges under the rims", outcomes: [
        { chance: 0.7, result: "The wedges hold. You roll on.", effects: {} },
        { chance: 0.3, result: "A wedge pops out and the rim slips off. Repairs take a day.", effects: { days: 1, parts: -1 } }
      ] }
    ]
  },
  {
    id: "broken-wheel", headline: "Crack! A wheel gives way.", weight: 3, lead: "quartermaster", react: "wheel",
    when: { route: "trail", terrain: ["plains", "mountains", "desert", "river"] },
    title: "A broken wheel",
    text: "A hidden rock catches the front wheel. Three spokes snap and the wagon lurches to a stop.",
    choices: [
      { label: "Put on the spare wheel", requires: { parts: 1 }, result: "The spare goes on in an hour. Worth every cent you paid in Independence.", effects: { parts: -1 } },
      { label: "Carve new spokes", result: "{member} whittles new spokes from a wagon bow. It takes two days.", effects: { days: 2 } }
    ]
  },
  {
    id: "broken-tongue", headline: "The wagon tongue splits!", weight: 2, lead: "quartermaster", react: "stop",
    when: { route: "trail", terrain: ["mountains", "plains"] },
    title: "The wagon tongue cracks",
    text: "Going down a steep bank, the long pole between the oxen and the wagon cracks.",
    choices: [
      { label: "Splice it with rope and rawhide", result: "Wet rawhide shrinks as it dries and grips like iron. It holds.", effects: { days: 1 } },
      { label: "Trade for a new tongue from another wagon", requires: { trade: 1 }, result: "A family going back east sells you theirs.", effects: { trade: -1 } }
    ]
  },
  {
    id: "steep-descent", headline: "The trail drops off a cliff.", weight: 2, lead: "navigator", react: "stop",
    when: { route: "trail", terrain: ["mountains"] },
    title: "A steep hill",
    text: "The trail drops down a slope so steep the wagon could run over the oxen.",
    choices: [
      { label: "Lock the wheels with chains and lower it by rope", result: "Slow, careful work. Everyone gets down safely.", effects: { days: 1 } },
      { label: "Drag a tree behind as a brake", outcomes: [
        { chance: 0.75, result: "The tree drags in the dirt and slows you down. It works.", effects: {} },
        { chance: 0.25, result: "The rope snaps. The wagon slams into a rock at the bottom.", effects: { parts: -1, food: -40 } }
      ] }
    ]
  },

  // ------------------------------------------------------------ the oxen
  {
    id: "lame-ox", headline: "{ox} stumbles and limps.", weight: 3, lead: "quartermaster", react: "ox",
    when: { route: "trail" },
    title: "{ox} is limping",
    text: "{ox} has a sore hoof from the rocky trail and can barely walk.",
    choices: [
      { label: "Rest {ox} for a day and wrap the hoof", result: "{ox} is walking again by evening.", effects: { days: 1 } },
      { label: "Keep going and hope", outcomes: [
        { chance: 0.6, result: "{ox} limps along and slowly gets better.", effects: {} },
        { chance: 0.4, result: "{ox} goes down and cannot get up. You leave {ox} behind.", effects: { oxen: -1 } }
      ] }
    ]
  },
  {
    id: "alkali-water", headline: "The water here is poison.", weight: 3, lead: "quartermaster", react: "ox",
    when: { route: "trail", terrain: ["desert", "plains", "mountains"] },
    title: "Bad water",
    text: "The pools here are white with alkali. Thirsty oxen will drink it, and it can kill them.",
    choices: [
      { label: "Keep the oxen away and push to the next good water", result: "A long thirsty day, but the oxen stay healthy.", effects: { days: 1 } },
      { label: "Let them drink", outcomes: [
        { chance: 0.5, result: "The oxen seem fine. You were lucky.", effects: {} },
        { chance: 0.5, result: "{ox} sickens from the alkali water and dies.", effects: { oxen: -1 } }
      ] }
    ]
  },
  {
    id: "stampede", headline: "Thunder! The oxen bolt!", weight: 2, lead: "navigator", react: "storm",
    when: { route: "trail", terrain: ["plains"] },
    title: "Stampede",
    text: "Thunder cracks overhead and the oxen bolt into the dark.",
    choices: [
      { label: "Go after them at first light", result: "{member} finds most of them miles away. It costs a day.", effects: { days: 1 } },
      { label: "Ask another wagon company to help search", result: "Together you round up every ox by noon.", effects: {} }
    ]
  },
  {
    id: "strayed-ox", headline: "{ox} is gone.", weight: 2, lead: "navigator", react: "ox",
    when: { route: "trail", terrain: ["plains", "valley", "mountains"] },
    title: "{ox} wandered off",
    text: "In the morning {ox} is gone, wandered off in the night looking for grass.",
    choices: [
      { label: "Search the creek bottoms", outcomes: [
        { chance: 0.7, result: "{member} finds {ox} chewing grass in a willow thicket.", effects: { days: 1 } },
        { chance: 0.3, result: "No sign of {ox}. You move on short one ox.", effects: { days: 1, oxen: -1 } }
      ] },
      { label: "Move on without {ox}", result: "The team pulls harder without {ox}.", effects: { oxen: -1 } }
    ]
  },

  // ------------------------------------------------------------ weather
  {
    id: "hailstorm", headline: "Hail!", weight: 2, lead: "doctor", react: "storm",
    when: { route: "trail", terrain: ["plains"], months: [4, 5, 6, 7] },
    title: "Hail",
    text: "The sky turns green-black. Hailstones the size of eggs drum on the wagon cover.",
    outcome: { result: "Everyone crowds under the wagon. The cover is torn, and some flour gets wet.", effects: { food: -30 } }
  },
  {
    id: "flooded-creek", headline: "The creek is a torrent.", weight: 2, lead: "navigator", react: "storm",
    when: { route: "trail", terrain: ["plains", "river", "valley"] },
    title: "A creek in flood",
    text: "Last night's rain has turned a small creek into a muddy torrent.",
    choices: [
      { label: "Wait for the water to drop", result: "By the next afternoon you can wade across.", effects: { days: 1 } },
      { label: "Raise the wagon bed on blocks and cross", outcomes: [
        { chance: 0.7, result: "Water laps at the wagon bed, but you make it.", effects: {} },
        { chance: 0.3, result: "Water pours in. The bacon is soaked.", effects: { food: -50 } }
      ] }
    ]
  },
  {
    id: "quicksand", headline: "The wheels are sinking!", weight: 1, lead: "navigator", react: "stop",
    when: { route: "trail", terrain: ["plains", "river"] },
    title: "Quicksand",
    text: "The wheels sink into the soft sand of the riverbed and the wagon will not move.",
    outcome: { result: "You double the team and dig for hours. The wagon finally comes free.", effects: { days: 1 } }
  },
  {
    id: "dust", headline: "A wall of dust.", weight: 2, lead: "doctor", react: "dust",
    when: { route: "trail", terrain: ["plains", "desert", "mountains"], months: [6, 7, 8] },
    title: "Dust",
    text: "Hundreds of wagons ahead have ground the trail to powder. Dust coats everything, even your teeth.",
    choices: [
      { label: "Drive off to the side of the trail", result: "Rougher ground, but you can breathe.", effects: { days: 1 } },
      { label: "Tie cloths over your faces and keep going", result: "Everyone coughs through the day.", effects: {} }
    ]
  },
  {
    id: "early-snow", headline: "Snow, and it is only fall.", weight: 2, lead: "doctor", react: "snow",
    when: { route: "trail", terrain: ["mountains"], months: [8, 9, 10] },
    title: "Snow in the mountains",
    text: "A cold wind brings snow. Everyone remembers the Donner Party.",
    choices: [
      { label: "Push hard to get through the pass", result: "Numb fingers and frozen feet, but you keep moving.", effects: { sick: { chance: 0.15, cause: "the cold" } } },
      { label: "Make camp and wait out the storm", result: "Two days by the fire. The snow melts on the trail.", effects: { days: 2, food: -20 } }
    ]
  },

  // ------------------------------------------------------------ health
  {
    id: "rattlesnake", headline: "A rattle in the sage!", weight: 2, lead: "doctor", react: "stop",
    when: { route: "trail", terrain: ["plains", "desert", "mountains"] },
    title: "Rattlesnake",
    text: "{child} jumps back from a rattlesnake coiled in the sagebrush.",
    outcome: { result: "No bite, just a scare. From now on, everyone watches where they step.", effects: {} }
  },
  {
    id: "crushed-foot", headline: "A scream from under the wagon.", weight: 2, lead: "doctor", react: "stop",
    when: { route: "trail" },
    title: "Under the wheel",
    text: "{member} slips while climbing down from the moving wagon, and a wheel rolls over a foot. Accidents like this were common.",
    choices: [
      { label: "{doctor} sets it and {member} rides in the wagon", result: "{member} rides for a week, sore but healing.", effects: { days: 1, sick: { chance: 0.1, cause: "an accident" } } },
      { label: "Use the medicine chest", requires: { medicine: 1 }, result: "{doctor} cleans and wraps the foot carefully.", effects: { medicine: -1 } }
    ]
  },
  {
    id: "mountain-fever", headline: "{member} is burning with fever.", weight: 2, lead: "doctor", react: "stop",
    when: { route: "trail", terrain: ["mountains", "desert"] },
    title: "Mountain fever",
    text: "{member} wakes up burning with fever and aching all over.",
    choices: [
      { label: "Rest a day", result: "{doctor} keeps {member} cool and fed. The fever breaks.", effects: { days: 1, sick: { chance: 0.15, cause: "mountain fever" } } },
      { label: "Use the medicine chest", requires: { medicine: 1 }, result: "{doctor} gives {member} medicine from the chest.", effects: { medicine: -1, sick: { chance: 0.05, cause: "mountain fever" } } }
    ]
  },
  {
    id: "lost-child", headline: "Where is {child}?", weight: 1, lead: "navigator", react: "stop",
    when: { route: "trail", terrain: ["plains", "valley"] },
    title: "{child} is missing",
    text: "At the noon stop, {child} wandered off to pick berries. Now no one can find them.",
    outcome: { result: "Everyone spreads out and calls. After an hour, {child} is found asleep in the tall grass.", effects: {} }
  },

  // ------------------------------------------------------------ the trail itself
  {
    id: "grave", headline: "A fresh grave.", weight: 3, lead: "journal", react: "grave",
    when: { route: "trail", terrain: ["plains", "mountains", "desert", "river"] },
    title: "A grave by the trail",
    text: "A wooden board marks a fresh grave. The name is carved by hand, with the words: died of cholera, aged 9 years.",
    outcome: { result: "{member} reads the name aloud. Some emigrants counted the graves they passed each day.", effects: {} }
  },
  {
    id: "bone-express", headline: "A message on a skull.", weight: 2, lead: "journal", react: "stop",
    when: { route: "trail", terrain: ["plains", "mountains"] },
    title: "The bone express",
    text: "A bison skull by the trail has writing on it: a message from one wagon company to another. Emigrants called these the bone express.",
    choices: [
      { label: "Write a message for the families behind you", result: "{member} writes the date and that all is well with the {family}.", effects: {} },
      { label: "Read it and move on", result: "The message says the grass is good for twenty miles ahead.", effects: {} }
    ]
  },
  {
    id: "discarded-goods", headline: "A trail of things left behind.", weight: 3, lead: "quartermaster", react: "goods",
    when: { route: "trail", terrain: ["plains", "mountains", "desert"] },
    title: "Things left behind",
    text: "The trail is littered with things other families threw away to lighten their wagons: a cookstove, a rocking chair, barrels of flour.",
    choices: [
      { label: "Pick up the flour", result: "Free food, but the wagon is heavier.", effects: { food: 60 } },
      { label: "Leave something of your own to lighten the load", result: "{member} leaves a trunk of good clothes by the trail. The oxen pull easier.", effects: { days: -1 } }
    ]
  },
  {
    id: "go-backs", headline: "A wagon heading the wrong way.", weight: 2, lead: "journal", react: "stop",
    when: { route: "trail", terrain: ["plains", "mountains"] },
    title: "Turning back",
    text: "A family passes going the other way, back east. They say they have had enough of the trail.",
    choices: [
      { label: "Ask what lies ahead", result: "They warn you about bad water near {next}.", effects: { flags: { warnedWater: true } } },
      { label: "Buy their spare supplies", requires: { money: 6 }, result: "They sell you flour cheap. They will not need it.", effects: { money: -6, food: 80 } }
    ]
  },
  {
    id: "buffalo-chips", headline: "Not a tree for fifty miles.", weight: 2, lead: "quartermaster", react: "stop",
    when: { route: "trail", terrain: ["plains"] },
    title: "No firewood",
    text: "There are no trees here, only grass. Other emigrants are collecting dried bison dung to burn.",
    outcome: { result: "{child} gathers a sack of buffalo chips. They burn hot and fast. Supper is cooked.", effects: {} }
  },
  {
    id: "good-day", headline: "A good day on the trail.", weight: 3, lead: "navigator", react: "none",
    when: { route: "trail", terrain: ["plains", "valley", "mountains"] },
    title: "A good day",
    text: "Firm ground, cool air, and good grass. The oxen walk well.",
    outcome: { result: "You make twenty miles before sunset.", effects: { days: -1 } }
  },
  {
    id: "native-traders", headline: "Riders approach.", weight: 2, lead: "quartermaster", react: "stop",
    when: { route: "trail", terrain: ["plains", "mountains", "river"] },
    title: "Traders on the trail",
    text: "A family from a nearby village rides up to trade. They offer fresh meat and moccasins.",
    choices: [
      { label: "Trade cloth and tools", requires: { trade: 1 }, result: "A fair trade. The fresh meat is the best food you have had in weeks.", effects: { trade: -1, food: 40 } },
      { label: "Trade some flour", result: "They accept flour. Everyone eats well tonight.", effects: { food: 10 } },
      { label: "Thank them and move on", result: "They ride on to the next wagon.", effects: {} }
    ]
  },
  {
    id: "mosquitoes", headline: "The air is thick with mosquitoes.", weight: 1, lead: "doctor", react: "stop",
    when: { route: "trail", terrain: ["river", "plains"], months: [5, 6, 7] },
    title: "Mosquitoes",
    text: "Clouds of mosquitoes rise from the river bottom. No one sleeps.",
    outcome: { result: "You build smoky fires and move on early, tired and itchy.", effects: {} }
  },

  // ------------------------------------------------------------ at sea
  {
    id: "sea-storm", headline: "Storm!", weight: 3, lead: "doctor", react: "storm",
    when: { route: "sea" },
    title: "Storm at sea",
    text: "Waves crash over the deck. The hatches are shut, and everyone below deck is thrown about in the dark.",
    outcome: { result: "Two days of storm. When it passes, everyone is bruised and seasick, but alive.", effects: { days: 2, sick: { chance: 0.08, cause: "the storm" } } }
  },
  {
    id: "becalmed", headline: "The wind dies.", weight: 2, lead: "quartermaster", react: "calm",
    when: { route: "sea" },
    title: "No wind",
    text: "The sails hang limp. The ship sits still on a glassy sea, and the water ration is cut.",
    outcome: { result: "Five days drifting. Then a breeze, and the ship moves again.", effects: { days: 5 } }
  },
  {
    id: "rain-water", headline: "Rain at last.", weight: 2, lead: "quartermaster", react: "storm",
    when: { route: "sea" },
    title: "Rain",
    text: "A warm rain squall passes over the ship.",
    outcome: { result: "{member} catches rainwater in every pot the cousins own. Fresh water, at last.", effects: {} }
  },
  {
    id: "crowded-hold", headline: "No air below deck.", weight: 2, lead: "doctor", react: "none",
    when: { route: "sea" },
    title: "Below deck",
    text: "Hundreds of passengers are packed below deck. The air is hot and stale.",
    choices: [
      { label: "Ask to take turns on deck", result: "The crew allows an hour each morning. It helps.", effects: {} },
      { label: "Share your herbal medicines", requires: { medicine: 1 }, result: "{doctor} helps sick passengers from your district. They will remember it.", effects: { medicine: -1, flags: { sharedMedicine: true } } }
    ]
  },

  // ------------------------------------------------------------ walking to and in the gold country
  {
    id: "river-rises", headline: "The river is rising!", weight: 2, lead: "navigator", react: "storm",
    when: { route: "walk", terrain: ["goldfields", "river"] },
    title: "The river rises",
    text: "Rain in the mountains sends the river over its banks, right where you were digging.",
    outcome: { result: "You save your tools, but the claim is underwater for days.", effects: { days: 3 } }
  },
  {
    id: "broken-rocker", headline: "The rocker splits.", weight: 2, lead: "quartermaster", react: "stop",
    when: { route: "walk", terrain: ["goldfields"] },
    title: "A broken rocker",
    text: "The wooden rocker you use to wash gold from gravel splits down the middle.",
    choices: [
      { label: "Repair it yourselves", result: "{member} rebuilds it in an evening.", effects: { days: 1 } },
      { label: "Buy lumber at mining-camp prices", requires: { money: 8 }, result: "Lumber costs a fortune here, but you are digging again by morning.", effects: { money: -8 } }
    ]
  },
  {
    id: "district-help", headline: "Voices from home.", weight: 2, lead: "journal", react: "none",
    when: { route: "walk" },
    title: "Men from home",
    text: "On the road you meet men from your own district. They share rice and news from home.",
    outcome: { result: "{member} writes a letter home and sends it with them.", effects: { food: 20 } }
  },
  {
    id: "hostile-miners", headline: "\"Foreigners, get out!\"", weight: 2, lead: "navigator", react: "stop",
    when: { route: "walk", terrain: ["goldfields"] },
    title: "Not welcome",
    text: "Miners at a camp shout that foreigners are not allowed to dig here.",
    choices: [
      { label: "Move on to another creek", result: "You walk on to a creek where other Chinese miners are working.", effects: { days: 1 } },
      { label: "Show your tax receipt", outcomes: [
        { chance: 0.5, result: "They grumble and let you pass.", effects: {} },
        { chance: 0.5, result: "They tear up the receipt. You move on.", effects: { days: 1 } }
      ] }
    ]
  }
];
