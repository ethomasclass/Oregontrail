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
    text: "The dry air has shrunk the wooden wheels. Now the iron rims (the metal bands around the outside of each wheel) are rattling loose. One more bump and a wheel could fall apart.",
    choices: [
      { label: "Soak the wheels in a creek overnight", result: "By morning the wood has swelled up tight against the iron. Many travelers did this.", effects: { days: 1 } },
      { label: "Hammer wooden wedges under the rims", outcomes: [
        { chance: 0.7, result: "The wedges hold, and you keep rolling.", effects: {} },
        { chance: 0.3, result: "A wedge pops out and the rim slips off. Repairs take a day.", effects: { days: 1, parts: -1 } }
      ] }
    ]
  },
  {
    id: "broken-wheel", headline: "Crack! A wheel breaks.", weight: 3, lead: "quartermaster", react: "wheel",
    when: { route: "trail", terrain: ["plains", "mountains", "desert", "river"] },
    title: "A broken wheel",
    text: "The front wheel hits a hidden rock. Three spokes (the wooden bars inside the wheel) snap, and the wagon jerks to a stop.",
    choices: [
      { label: "Put on the spare wheel", requires: { parts: 1 }, result: "The spare wheel goes on in an hour. It was worth every cent you paid for it back in Independence, Missouri.", effects: { parts: -1 } },
      { label: "Carve new spokes", result: "{member} carves new spokes from a wagon bow (one of the wooden hoops that hold up the cloth cover). It takes two days.", effects: { days: 2 } }
    ]
  },
  {
    id: "broken-tongue", headline: "The wagon's front pole splits!", weight: 2, lead: "quartermaster", react: "stop",
    when: { route: "trail", terrain: ["mountains", "plains"] },
    title: "A cracked wagon tongue",
    text: "Going down a steep bank, the wagon tongue cracks. The tongue is the long wooden pole that connects the oxen to the wagon.",
    choices: [
      { label: "Tie it together with rope and rawhide", result: "You wrap the crack in wet rawhide (raw animal skin). It shrinks as it dries and grips like iron. The repair holds.", effects: { days: 1 } },
      { label: "Trade for another wagon's tongue", requires: { trade: 1 }, result: "A family going back east sells you theirs.", effects: { trade: -1 } }
    ]
  },
  {
    id: "steep-descent", headline: "The trail drops off a cliff.", weight: 2, lead: "navigator", react: "stop",
    when: { route: "trail", terrain: ["mountains"] },
    title: "A steep hill",
    text: "The trail goes down a slope so steep that the wagon could roll forward and run over the oxen.",
    choices: [
      { label: "Lock the wheels and lower it by rope", result: "You chain the wheels so they cannot turn. Then you let the wagon down slowly by rope. It is slow, careful work, but everyone gets down safely.", effects: { days: 1 } },
      { label: "Drag a tree behind as a brake", outcomes: [
        { chance: 0.75, result: "The tree drags in the dirt and slows the wagon down. It works.", effects: {} },
        { chance: 0.25, result: "The rope snaps. The wagon slams into a rock at the bottom.", effects: { parts: -1, food: -40 } }
      ] }
    ]
  },

  // ------------------------------------------------------------ the oxen
  {
    id: "lame-ox", headline: "{ox} stumbles and limps.", weight: 3, lead: "quartermaster", react: "ox",
    when: { route: "trail" },
    title: "{ox} is limping",
    text: "{ox}, one of the oxen that pull your wagon, has a sore hoof from the rocky trail. {ox} can barely walk.",
    choices: [
      { label: "Rest {ox} a day and wrap the hoof", result: "{ox} is walking again by evening.", effects: { days: 1 } },
      { label: "Keep going and hope", outcomes: [
        { chance: 0.6, result: "{ox} limps along and slowly gets better.", effects: {} },
        { chance: 0.4, result: "{ox} falls and cannot get up. You have to leave {ox} behind.", effects: { oxen: -1 } }
      ] }
    ]
  },
  {
    id: "alkali-water", headline: "The water here is poison.", weight: 3, lead: "quartermaster", react: "ox",
    when: { route: "trail", terrain: ["desert", "plains", "mountains"] },
    title: "Bad water",
    text: "The pools here are crusted white with alkali, a bitter salt from the ground. Thirsty oxen will drink it, and it can kill them.",
    choices: [
      { label: "Keep the oxen away and push on to good water", result: "It is a long, thirsty day, but the oxen stay healthy.", effects: { days: 1 } },
      { label: "Let them drink", outcomes: [
        { chance: 0.5, result: "The oxen seem fine. You were lucky.", effects: {} },
        { chance: 0.5, result: "{ox} gets sick from the alkali water and dies.", effects: { oxen: -1 } }
      ] }
    ]
  },
  {
    id: "stampede", headline: "Thunder! The oxen run off!", weight: 2, lead: "navigator", react: "storm",
    when: { route: "trail", terrain: ["plains"] },
    title: "Stampede",
    text: "Thunder cracks overhead. The scared oxen stampede (run away in a panic) into the dark.",
    choices: [
      { label: "Search for them at sunrise", result: "{member} finds most of them miles away. It costs a day.", effects: { days: 1 } },
      { label: "Ask another wagon group to help search", result: "Working together, you find every ox by noon.", effects: {} }
    ]
  },
  {
    id: "strayed-ox", headline: "{ox} is gone.", weight: 2, lead: "navigator", react: "ox",
    when: { route: "trail", terrain: ["plains", "valley", "mountains"] },
    title: "{ox} wandered off",
    text: "In the morning, {ox} is gone. One of your oxen wandered off in the night looking for grass.",
    choices: [
      { label: "Search the low ground by the creek", outcomes: [
        { chance: 0.7, result: "{member} finds {ox} eating grass in a patch of willow trees.", effects: { days: 1 } },
        { chance: 0.3, result: "There is no sign of {ox}. You move on with one less ox.", effects: { days: 1, oxen: -1 } }
      ] },
      { label: "Move on without {ox}", result: "The other oxen have to pull harder without {ox}.", effects: { oxen: -1 } }
    ]
  },

  // ------------------------------------------------------------ weather
  {
    id: "hailstorm", headline: "Hail!", weight: 2, lead: "doctor", react: "storm",
    when: { route: "trail", terrain: ["plains"], months: [4, 5, 6, 7] },
    title: "Hail",
    text: "The sky turns a greenish black. Hailstones as big as eggs pound on the wagon's cloth cover.",
    outcome: { result: "Everyone crowds under the wagon. The cover is torn, and some flour gets wet.", effects: { food: -30 } }
  },
  {
    id: "flooded-creek", headline: "The creek is flooding!", weight: 2, lead: "navigator", react: "storm",
    when: { route: "trail", terrain: ["plains", "river", "valley"] },
    title: "A flooded creek",
    text: "Last night's rain has turned a small creek into a fast, muddy flood.",
    choices: [
      { label: "Wait for the water to go down", result: "By the next afternoon, the water is low enough to walk across.", effects: { days: 1 } },
      { label: "Prop the wagon box up higher and cross", outcomes: [
        { chance: 0.7, result: "Water splashes at the bottom of the wagon box, but you make it.", effects: {} },
        { chance: 0.3, result: "Water pours in and soaks the bacon.", effects: { food: -50 } }
      ] }
    ]
  },
  {
    id: "quicksand", headline: "The wheels are sinking!", weight: 1, lead: "navigator", react: "stop",
    when: { route: "trail", terrain: ["plains", "river"] },
    title: "Quicksand",
    text: "The wheels sink into soft, wet sand in the riverbed. The wagon is stuck.",
    outcome: { result: "You hook up twice as many oxen and dig for hours. Finally, the wagon comes free.", effects: { days: 1 } }
  },
  {
    id: "dust", headline: "A wall of dust.", weight: 2, lead: "doctor", react: "dust",
    when: { route: "trail", terrain: ["plains", "desert", "mountains"], months: [6, 7, 8] },
    title: "Dust",
    text: "Hundreds of wagons ahead of you have ground the trail into powder. Dust covers everything, even your teeth.",
    choices: [
      { label: "Drive off to the side of the trail", result: "The ground is rougher, but you can breathe.", effects: { days: 1 } },
      { label: "Tie cloths over your faces and keep going", result: "Everyone coughs all day.", effects: {} }
    ]
  },
  {
    id: "early-snow", headline: "Snow, and it is only fall.", weight: 2, lead: "doctor", react: "snow",
    when: { route: "trail", terrain: ["mountains"], months: [8, 9, 10] },
    title: "Snow in the mountains",
    text: "A cold wind brings snow. Everyone thinks of the Donner Party, a group of travelers who got trapped by mountain snow in 1846. Many of them died.",
    choices: [
      { label: "Hurry through the mountain pass", result: "Your fingers go numb and your feet freeze, but you keep moving.", effects: { sick: { chance: 0.15, cause: "the cold" } } },
      { label: "Camp and wait for the storm to end", result: "You spend two days by the fire. Then the snow on the trail melts.", effects: { days: 2, food: -20 } }
    ]
  },

  // ------------------------------------------------------------ health
  {
    id: "rattlesnake", headline: "A rattle in the bushes!", weight: 2, lead: "doctor", react: "stop",
    when: { route: "trail", terrain: ["plains", "desert", "mountains"] },
    title: "Rattlesnake",
    text: "{child} jumps back from a rattlesnake coiled in the sagebrush (a low, gray bush that grows in dry land).",
    outcome: { result: "No bite, just a scare. From now on, everyone watches where they step.", effects: {} }
  },
  {
    id: "crushed-foot", headline: "A scream from under the wagon.", weight: 2, lead: "doctor", react: "stop",
    when: { route: "trail" },
    title: "Under the wheel",
    text: "{member} slips while climbing down from the moving wagon, and a wheel rolls over one foot. Accidents like this happened often on the trail.",
    choices: [
      { label: "Have {doctor} set the bones", result: "{doctor} puts the bones back in place. {member} rides in the wagon for a week, sore but healing.", effects: { days: 1, sick: { chance: 0.1, cause: "an accident" } } },
      { label: "Use the medicine chest", requires: { medicine: 1 }, result: "{doctor} cleans the foot and wraps it carefully.", effects: { medicine: -1 } }
    ]
  },
  {
    id: "mountain-fever", headline: "{member} is burning with fever.", weight: 2, lead: "doctor", react: "stop",
    when: { route: "trail", terrain: ["mountains", "desert"] },
    title: "Mountain fever",
    text: "{member} wakes up burning with fever and aching all over. Travelers called this sickness mountain fever.",
    choices: [
      { label: "Rest a day", result: "{doctor} keeps {member} cool and fed. The fever goes away.", effects: { days: 1, sick: { chance: 0.15, cause: "mountain fever" } } },
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
    text: "A wooden board marks a fresh grave. Someone carved a name by hand, with the words: died of cholera, aged 9 years. Cholera was a disease from dirty water that killed many travelers.",
    outcome: { result: "{member} reads the name out loud. Some travelers counted the graves they passed each day.", effects: {} }
  },
  {
    id: "bone-express", headline: "A message on a skull.", weight: 2, lead: "journal", react: "stop",
    when: { route: "trail", terrain: ["plains", "mountains"] },
    title: "The bone express",
    text: "A bison skull by the trail has writing on it. It is a message from one group of travelers to another. People called these messages the bone express.",
    choices: [
      { label: "Write a message for the families behind you", result: "{member} writes the date and that all is well with the {family}.", effects: {} },
      { label: "Read it and move on", result: "The message says the grass is good for the next twenty miles.", effects: {} }
    ]
  },
  {
    id: "discarded-goods", headline: "A trail of things left behind.", weight: 3, lead: "quartermaster", react: "goods",
    when: { route: "trail", terrain: ["plains", "mountains", "desert"] },
    title: "Things left behind",
    text: "Other families threw things away here to make their wagons lighter. A cookstove, a rocking chair, and barrels of flour lie along the trail.",
    choices: [
      { label: "Pick up the flour", result: "The food is free, but now the wagon is heavier.", effects: { food: 60 } },
      { label: "Leave something of yours to lighten the load", result: "{member} leaves a trunk of good clothes by the trail. The oxen pull more easily.", effects: { days: -1 } }
    ]
  },
  {
    id: "go-backs", headline: "A wagon heading the wrong way.", weight: 2, lead: "journal", react: "stop",
    when: { route: "trail", terrain: ["plains", "mountains"] },
    title: "Turning back",
    text: "A family passes going the other way, back east. They say they have had enough of the trail.",
    choices: [
      { label: "Ask what is up ahead", result: "They warn you about bad water near {next}.", effects: { flags: { warnedWater: true } } },
      { label: "Buy their extra supplies", requires: { money: 6 }, result: "They sell you flour cheap. They will not need it now.", effects: { money: -6, food: 80 } }
    ]
  },
  {
    id: "buffalo-chips", headline: "Not a tree for fifty miles.", weight: 2, lead: "quartermaster", react: "stop",
    when: { route: "trail", terrain: ["plains"] },
    title: "No firewood",
    text: "There are no trees here, only grass, so there is no wood for a fire. Other travelers are picking up dried bison dung to burn instead.",
    outcome: { result: "{child} gathers a sack of buffalo chips (dried bison dung). They burn hot and fast, and supper gets cooked.", effects: {} }
  },
  {
    id: "good-day", headline: "A good day on the trail.", weight: 3, lead: "navigator", react: "none",
    when: { route: "trail", terrain: ["plains", "valley", "mountains"] },
    title: "A good day",
    text: "Firm ground, cool air, and good grass. The oxen walk well.",
    outcome: { result: "You cover twenty miles by sunset.", effects: { days: -1 } }
  },
  {
    id: "native-traders", headline: "Riders are coming.", weight: 2, lead: "quartermaster", react: "stop",
    when: { route: "trail", terrain: ["plains", "mountains", "river"] },
    title: "Traders on the trail",
    text: "A family from a nearby Native village rides up to trade. They offer fresh meat and moccasins (soft leather shoes).",
    choices: [
      { label: "Trade cloth and tools", requires: { trade: 1 }, result: "It is a fair trade. The fresh meat is the best food you have had in weeks.", effects: { trade: -1, food: 40 } },
      { label: "Trade some flour", result: "They accept the flour. Everyone eats well tonight.", effects: { food: 10 } },
      { label: "Thank them and move on", result: "They ride on to the next wagon.", effects: {} }
    ]
  },
  {
    id: "mosquitoes", headline: "The air is thick with mosquitoes.", weight: 1, lead: "doctor", react: "stop",
    when: { route: "trail", terrain: ["river", "plains"], months: [5, 6, 7] },
    title: "Mosquitoes",
    text: "Clouds of mosquitoes rise from the wet, low ground by the river. No one can sleep.",
    outcome: { result: "You build smoky fires to keep them away, then leave early, tired and itchy.", effects: {} }
  },

  // ------------------------------------------------------------ at sea
  {
    id: "sea-storm", headline: "Storm!", weight: 3, lead: "doctor", react: "storm",
    when: { route: "sea" },
    title: "Storm at sea",
    text: "Waves crash over the ship's deck. The hatches (doors in the deck) are shut tight, and everyone below is thrown around in the dark.",
    outcome: { result: "The storm lasts two days. When it passes, everyone is bruised and seasick, but alive.", effects: { days: 2, sick: { chance: 0.08, cause: "the storm" } } }
  },
  {
    id: "becalmed", headline: "The wind dies.", weight: 2, lead: "quartermaster", react: "calm",
    when: { route: "sea" },
    title: "No wind",
    text: "The sails hang limp. The ship sits still on a flat, glassy sea. Each person now gets less drinking water to make it last.",
    outcome: { result: "The ship drifts for five days. Then a breeze comes, and the ship moves again.", effects: { days: 5 } }
  },
  {
    id: "rain-water", headline: "Rain at last.", weight: 2, lead: "quartermaster", react: "storm",
    when: { route: "sea" },
    title: "Rain",
    text: "A short, warm rain shower passes over the ship.",
    outcome: { result: "{member} catches rainwater in every pot the cousins own. Fresh water, at last.", effects: {} }
  },
  {
    id: "crowded-hold", headline: "No air below deck.", weight: 2, lead: "doctor", react: "none",
    when: { route: "sea" },
    title: "Below deck",
    text: "Hundreds of passengers are packed together below deck, in the ship's lower level. The air is hot and stale.",
    choices: [
      { label: "Ask to take turns up on deck", result: "The crew lets people up for an hour each morning. It helps.", effects: {} },
      { label: "Share your herbal medicines", requires: { medicine: 1 }, result: "{doctor} helps sick passengers from your home district in China. They will remember it.", effects: { medicine: -1, flags: { sharedMedicine: true } } }
    ]
  },

  // ------------------------------------------------------------ walking to and in the gold country
  {
    id: "river-rises", headline: "The river is rising!", weight: 2, lead: "navigator", react: "storm",
    when: { route: "walk", terrain: ["goldfields", "river"] },
    title: "The river rises",
    text: "Rain in the mountains makes the river flood over its banks, right where you were digging for gold.",
    outcome: { result: "You save your tools, but your claim (your spot to dig for gold) is underwater for days.", effects: { days: 3 } }
  },
  {
    id: "broken-rocker", headline: "The gold rocker splits.", weight: 2, lead: "quartermaster", react: "stop",
    when: { route: "walk", terrain: ["goldfields"] },
    title: "A broken gold rocker",
    text: "Your rocker splits down the middle. A rocker is a wooden box you rock back and forth to wash gold out of gravel.",
    choices: [
      { label: "Fix it yourselves", result: "{member} rebuilds it in one evening.", effects: { days: 1 } },
      { label: "Buy wood at mining-camp prices", requires: { money: 8 }, result: "Wood costs a fortune in the mining camps, but you are digging again by morning.", effects: { money: -8 } }
    ]
  },
  {
    id: "district-help", headline: "Voices from home.", weight: 2, lead: "journal", react: "none",
    when: { route: "walk" },
    title: "Men from home",
    text: "On the road you meet men from your own home district in China. They share rice and news from home.",
    outcome: { result: "{member} writes a letter home and sends it with them.", effects: { food: 20 } }
  },
  {
    id: "hostile-miners", headline: "\"Foreigners, get out!\"", weight: 2, lead: "navigator", react: "stop",
    when: { route: "walk", terrain: ["goldfields"] },
    title: "Not welcome",
    text: "Miners at a camp shout that foreigners are not allowed to dig for gold here. You have a receipt for the special tax that foreign miners had to pay.",
    choices: [
      { label: "Move on to another creek", result: "You walk to another creek where other Chinese miners are working.", effects: { days: 1 } },
      { label: "Show your tax receipt", outcomes: [
        { chance: 0.5, result: "They grumble but let you pass.", effects: {} },
        { chance: 0.5, result: "They tear up the receipt. You move on.", effects: { days: 1 } }
      ] }
    ]
  }
];
