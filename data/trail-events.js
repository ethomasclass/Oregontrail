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
    id: "broken-wheel", headline: "Crack! A wheel breaks.", weight: 2, lead: "quartermaster", react: "wheel",
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
    id: "lame-ox", headline: "{ox} stumbles and limps.", weight: 2, lead: "quartermaster", react: "ox",
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
        { chance: 0.3, result: "There is no sign of {ox}. You move on with one less ox.", effects: { days: 1, oxen: -1, flags: { lostOx: true } } }
      ] },
      { label: "Move on without {ox}", result: "The other oxen have to pull harder without {ox}.", effects: { oxen: -1, flags: { lostOx: true } } }
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
    id: "crushed-foot", headline: "A scream from under the wagon.", weight: 1, lead: "doctor", react: "stop",
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
    id: "grave", headline: "A fresh grave.", weight: 2, lead: "journal", react: "grave",
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

  // ------------------------------------------------------------ animals (added October 2026)
  {
    id: "bison-herd", headline: "The ground is shaking!", weight: 20, lead: "navigator", react: "herd",
    when: { route: "trail", terrain: ["plains"], months: [4, 5, 6, 7], to: ["fortkearny", "chimneyrock", "fortlaramie", "independencerock"] },
    title: "A bison herd",
    text: "A herd of bison, thousands of them, pours across the trail ahead. The dust rises like smoke. The herd will take hours to pass.",
    choices: [
      { label: "Wait for the herd to pass", result: "You sit and watch until the last bison is gone. It is a sight {child} will never forget.", effects: { days: 1, flags: { sparedBison: true } } },
      { label: "Push through the edge of the herd", outcomes: [
        { chance: 0.7, result: "The bison move aside, and you slip past the edge of the herd.", effects: {} },
        { chance: 0.3, result: "The oxen panic and run. {ox} is hurt in the crush and cannot go on.", effects: { oxen: -1 } }
      ] },
      { label: "Hunt one for meat", result: "{member} brings down a young bison. Fresh meat for days. Many travelers shot far more bison than they could eat. Year by year, the herds along the Platte River got smaller.", effects: { food: 100 } }
    ]
  },
  {
    id: "grizzly", headline: "Something is in camp!", weight: 10, lead: "quartermaster", react: "bear",
    when: { route: "trail", to: ["forthall", "threeisland", "thedalles", "sierra"] },
    title: "A grizzly bear",
    text: "In the middle of the night, the oxen bellow. A grizzly bear is in camp, sniffing at the wagon. It smells the bacon.",
    choices: [
      { label: "Bang pots and shout", outcomes: [
        { chance: 0.75, result: "The noise is too much for the bear. It turns and lumbers off into the dark.", effects: {} },
        { chance: 0.25, result: "The bear grabs a side of bacon and runs off with it.", effects: { food: -30 } }
      ] },
      { label: "Hang the food in a tree and keep watch", result: "You pull the food sacks up into a tree. The bear gets a few scraps, then leaves. Everyone is tired the next day.", effects: { food: -20 } },
      { label: "Move camp", result: "You pack up in the dark and move a few miles down the trail. You lose most of a day.", effects: { days: 1 } }
    ]
  },
  {
    id: "wolves", headline: "Howling in the dark.", weight: 2, lead: "navigator", react: "stop",
    when: { route: "trail", terrain: ["plains", "mountains"] },
    title: "Wolves",
    text: "Wolves howl around camp all night. In the morning, a family in the next wagon finds their calf is gone.",
    choices: [
      { label: "Take turns standing watch", result: "{member} stays up by the fire with the animals. Nothing else goes missing, but everyone is sleepy.", effects: {} },
      { label: "Go to sleep", outcomes: [
        { chance: 0.8, result: "The wolves keep their distance. Your animals are safe.", effects: {} },
        { chance: 0.2, result: "The wolves scare the oxen, and they scatter. It takes all morning to find them.", effects: { days: 1 } }
      ] }
    ]
  },
  {
    id: "prairie-dogs", headline: "{ox} goes down!", weight: 2, lead: "quartermaster", react: "ox",
    when: { route: "trail", terrain: ["plains"] },
    title: "Prairie dog town",
    text: "The trail runs through a prairie dog town. Prairie dogs are small animals that live in holes in the ground. {ox} steps in a hole and stumbles.",
    choices: [
      { label: "Rest {ox} and check the leg", result: "The leg is only sprained. After a day of rest, {ox} can walk again.", effects: { days: 1 } },
      { label: "Keep going slowly", outcomes: [
        { chance: 0.7, result: "{ox} limps for a while, then walks fine.", effects: {} },
        { chance: 0.3, result: "The leg is broken. You have to leave {ox} behind.", effects: { oxen: -1 } }
      ] }
    ]
  },
  {
    id: "antelope", headline: "Antelope!", weight: 2, lead: "quartermaster", react: "none",
    when: { route: "trail", terrain: ["plains"] },
    title: "Curious antelope",
    text: "A small herd of pronghorn antelope watches you from a hill. They are very fast, but also very curious. Hunters waved a flag or a cloth to get them to come closer.",
    choices: [
      { label: "Wave a cloth and hunt", outcomes: [
        { chance: 0.6, result: "An antelope walks closer to look. {member} gets it. There is fresh meat for supper.", effects: { food: 40 } },
        { chance: 0.4, result: "The antelope run off faster than any horse. No meat today.", effects: {} }
      ] },
      { label: "Let them be", result: "You watch them race across the plains. Then they are gone.", effects: {} }
    ]
  },
  {
    id: "mormon-crickets", headline: "The ground is moving.", weight: 1, lead: "quartermaster", react: "ox",
    when: { route: "trail", to: ["greenriver", "forthall"] },
    title: "A swarm of crickets",
    text: "Huge black insects cover the ground for miles. People called them Mormon crickets. They have eaten almost all the grass.",
    choices: [
      { label: "Drive on to find grass", result: "You push the oxen hard all day until you find good grass. They are tired and thin.", effects: { days: 1 } },
      { label: "Let the oxen eat what is left", outcomes: [
        { chance: 0.6, result: "The oxen find a few patches of grass the crickets missed. They will be fine.", effects: {} },
        { chance: 0.4, result: "The oxen go hungry and grow weak. You have to travel slowly for a few days.", effects: { days: 2 } }
      ] }
    ]
  },
  {
    id: "ox-returns", headline: "Is that our ox?", weight: 2, lead: "navigator", react: "ox",
    when: { route: "trail", has: { lostOx: true } },
    title: "A lost ox comes back",
    text: "Another wagon train passes with its loose cattle. {member} looks twice. Your lost ox is walking along with their herd.",
    outcome: { result: "The other train's herders say it joined them days ago. They are glad to give it back.", effects: { oxen: 1, flags: { lostOx: false } } }
  },

  // ------------------------------------------------------------ weather and land (added October 2026)
  {
    id: "lightning", headline: "Lightning!", weight: 14, lead: "navigator", react: "lightning",
    when: { route: "trail", terrain: ["plains"], months: [4, 5, 6, 7], to: ["fortkearny", "chimneyrock", "fortlaramie"] },
    title: "A night storm on the Platte",
    text: "A thunderstorm rolls in after dark. Lightning lights up the whole river valley. Travelers on the Platte River wrote about lightning killing oxen, and sometimes people.",
    choices: [
      { label: "Chain the oxen to the wagons", outcomes: [
        { chance: 0.8, result: "The oxen pull at their chains all night, but they stay put. By morning the storm is gone.", effects: {} },
        { chance: 0.2, result: "A bolt hits close by. In the morning, you find {ox} dead in the mud.", effects: { oxen: -1 } }
      ] },
      { label: "Let them loose to drift", outcomes: [
        { chance: 0.7, result: "The oxen stampede (run away in a panic). It takes a day to round them up.", effects: { days: 1 } },
        { chance: 0.3, result: "The oxen stampede. You find all but {ox}.", effects: { days: 1, oxen: -1, flags: { lostOx: true } } }
      ] }
    ]
  },
  {
    id: "prairie-fire", headline: "Smoke on the horizon.", weight: 1, lead: "navigator", react: "dust",
    when: { route: "trail", terrain: ["plains"], months: [6, 7, 8] },
    title: "Prairie fire",
    text: "A line of smoke rises on the horizon. The dry grass is on fire, and the wind is blowing it toward you.",
    choices: [
      { label: "Set a backfire", result: "You burn a strip of grass around the wagons on purpose. When the big fire arrives, it has nothing left to burn there. This trick was called a backfire.", effects: {} },
      { label: "Hurry to the river", outcomes: [
        { chance: 0.7, result: "You reach the river and wait in the shallow water. The fire passes by.", effects: {} },
        { chance: 0.3, result: "Sparks land on the wagon cover. You put them out, but some of the food is burned.", effects: { food: -30 } }
      ] }
    ]
  },
  {
    id: "night-travel", headline: "Too hot to move.", weight: 2, lead: "navigator", react: "dust",
    when: { route: "trail", to: ["fortymile"] },
    title: "Traveling at night",
    text: "The sun is burning hot, and there is no shade. Many travelers rested in the day and moved at night, when it was cooler.",
    choices: [
      { label: "Travel by night", result: "You walk by moonlight. It is strange and quiet, but the oxen stay strong.", effects: { days: 1 } },
      { label: "Push on in the heat", outcomes: [
        { chance: 0.6, result: "It is a hard, hot day, but the oxen make it.", effects: {} },
        { chance: 0.4, result: "{ox} falls in the heat and will not get up. You have to leave {ox} behind.", effects: { oxen: -1 } }
      ] }
    ]
  },

  // ------------------------------------------------------------ places on the trail (added October 2026)
  {
    id: "soda-springs", headline: "The water is fizzing!", weight: 20, lead: "doctor", react: "spring",
    when: { route: "trail", to: ["forthall"] },
    title: "Soda Springs",
    text: "At Soda Springs, the water bubbles up out of the ground. It tastes like soda water. Nearby, a spring called Steamboat Spring hisses and spouts like a steam engine.",
    choices: [
      { label: "Mix it with sugar", result: "{child} stirs in some sugar. Now it is a real fizzy drink! Many travelers made soda this way.", effects: { food: -5, heal: true } },
      { label: "Drink and rest a while", result: "The cool, bubbly water makes everyone feel better.", effects: { heal: true } }
    ]
  },
  {
    id: "cutoff", headline: "A shortcut?", weight: 20, lead: "navigator", react: "stop",
    when: { route: "trail", to: ["greenriver", "forthall"] },
    title: "Sublette's Cutoff",
    text: "The trail splits. The left path is Sublette's Cutoff, a shortcut. It skips Fort Bridger and saves days. But it crosses about 45 to 50 miles with no water. In 1846 the Donner Party took a different shortcut, the Hastings Cutoff, and many of them died. Travelers feared shortcuts after that.",
    choices: [
      { label: "Take the cutoff", outcomes: [
        { chance: 0.75, result: "You fill every keg and walk all night. The oxen are wild with thirst when they smell the Green River, but you make it.", effects: { days: -3, flags: { tookCutoff: true } } },
        { chance: 0.25, result: "The dry stretch is too long. {ox} dies of thirst before you reach the Green River.", effects: { days: -3, oxen: -1, flags: { tookCutoff: true } } }
      ] },
      { label: "Stay on the main trail", result: "You go the long way, by Fort Bridger. There is water and grass all the way.", effects: { days: 1, flags: { skippedCutoff: true } } }
    ]
  },
  {
    id: "cutoff-rumor", headline: "News from the cutoff.", weight: 3, lead: "journal", react: "stop",
    when: { route: "trail", has: { skippedCutoff: true }, to: ["forthall"] },
    title: "News from the shortcut",
    text: "A man from another wagon train tells his story. His group took Sublette's Cutoff (the shortcut you skipped). They ran out of water in the dry stretch.",
    outcome: { result: "They lost cattle to thirst along the way. {member} is glad you took the long way.", effects: {} }
  },
  {
    id: "mormon-ferry", headline: "A ferry on the North Platte.", weight: 8, lead: "quartermaster", react: "stop",
    when: { route: "trail", to: ["independencerock", "southpass"] },
    title: "The Mormon ferry",
    text: "Mormon settlers from Salt Lake City run a ferry (a flat boat) across the North Platte River here. They charge each wagon a fee.",
    choices: [
      // Ferry fees changed from year to year; the $3 figure needs checking.
      { label: "Pay for the ferry ($3)", requires: { money: 3 }, result: "The ferrymen pull your wagon across on their boat. Easy.", effects: { money: -3 } },
      { label: "Cross on your own", outcomes: [
        { chance: 0.6, result: "You float the wagon box across and swim the oxen over. It takes all day, but everyone makes it.", effects: { days: 1 } },
        { chance: 0.4, result: "The current tips the wagon box. You save it, but some flour washes away.", effects: { days: 1, food: -40 } }
      ] }
    ]
  },
  {
    id: "salmon-falls", headline: "Salmon jumping in the falls!", weight: 10, lead: "quartermaster", react: "stop",
    when: { route: "trail", to: ["threeisland"] },
    title: "Salmon Falls",
    text: "At Salmon Falls on the Snake River, Shoshone fishermen are spearing salmon. They have plenty, and they offer to trade.",
    choices: [
      { label: "Trade for salmon", requires: { trade: 1 }, result: "You trade cloth for fresh salmon. It is the best meal in weeks.", effects: { trade: -1, food: 60 } },
      { label: "Fish with their advice", minigame: "fish", fish: "salmon", result: "The fishermen show {member} where the salmon rest. Then it is up to you.", effects: {} },
      { label: "Keep moving", result: "You thank them and move on down the river.", effects: {} }
    ]
  },
  {
    id: "trout", headline: "Fish in the river!", weight: 10, lead: "quartermaster", react: "calm",
    when: { route: "trail", to: ["independencerock", "southpass"] },
    title: "The Sweetwater River",
    text: "The trail follows the Sweetwater River for many miles. The water is clear and cold. {child} spots fish in a deep pool.",
    choices: [
      { label: "Go fishing", minigame: "fish", fish: "trout", result: "{member} cuts a willow pole and ties on a line.", effects: {} },
      { label: "Keep moving", result: "No time for fishing today. You roll on.", effects: {} }
    ]
  },
  {
    id: "wild-berries", headline: "Berries!", weight: 2, lead: "doctor", react: "calm",
    when: { route: "trail", terrain: ["plains", "valley"], months: [5, 6] },
    title: "Wild berries",
    text: "{child} finds wild berries growing by the creek. There are wild strawberries and currants (small, sour berries).",
    outcome: { result: "Everyone picks until their fingers are red. Fresh fruit is a treat after weeks of bacon and bread.", effects: { food: 20, heal: true } }
  },

  // ------------------------------------------------------------ people on the trail (added October 2026)
  {
    id: "fourth-of-july", headline: "Happy Fourth of July!", weight: 20, lead: "journal", react: "dance",
    when: { route: "trail", months: [6], days: [1, 10] },
    title: "The Fourth of July",
    text: "It is the Fourth of July. Travelers hoped to reach Independence Rock by this day. Wagon trains all along the trail are planning a party.",
    choices: [
      { label: "Stop and celebrate", result: "There are speeches, songs, and a special supper. Someone fires a gun into the air, and {child} cheers.", effects: { days: 1, heal: true } },
      { label: "Keep moving", result: "You wave to the other camps and keep rolling. The trail is quiet today.", effects: { days: -1 } }
    ]
  },
  {
    id: "new-baby", headline: "A baby is coming!", weight: 6, lead: "doctor", react: "calm",
    when: { route: "trail", terrain: ["plains", "mountains"] },
    title: "A new baby",
    text: "A woman in the next wagon is about to have a baby. Babies were born on the trail all the time. Her family asks the train to stop.",
    choices: [
      { label: "Stop a day so {doctor} can help", result: "{doctor} helps all night. By morning, there is a healthy baby girl. Her parents are very thankful.", effects: { days: 1, flags: { helpedBirth: true } } },
      { label: "Keep going", result: "You wish them well and move on. Their wagon catches up two days later, with a new baby inside.", effects: {} }
    ]
  },
  {
    id: "stranded-traveler", headline: "A man alone.", weight: 2, lead: "quartermaster", react: "wheel",
    when: { route: "trail", terrain: ["plains", "mountains"] },
    title: "A stranded traveler",
    text: "A man sits by a broken wagon at the side of the trail. His axle (the bar that holds the wheels) is cracked, and his group went on without him.",
    choices: [
      { label: "Share food and fix his wagon", result: "You give him food and help him fix the axle. He shakes {member}'s hand and says he won't forget it.", effects: { food: -30, days: 1, flags: { helpedStranger: true } } },
      { label: "Point him to the next fort", result: "You tell him he can get help at {next}. He nods and starts walking.", effects: {} }
    ]
  },
  {
    id: "stranger-returns", headline: "A familiar face.", weight: 3, lead: "quartermaster", react: "stop",
    when: { route: "trail", has: { helpedStranger: true }, to: ["fortlaramie", "forthall", "thedalles", "fortymile", "sierra"] },
    title: "An old friend",
    text: "A man waves at you. It is the stranded traveler you helped! His wagon made it, and he wants to pay you back.",
    choices: [
      { label: "Take some flour", result: "He gives you a sack of flour. \"Now we're even,\" he says.", effects: { food: 60, flags: { helpedStranger: false } } },
      { label: "Take some money", result: "He presses ten dollars into your hand.", effects: { money: 10, flags: { helpedStranger: false } } }
    ]
  },
  {
    id: "fiddle-night", headline: "Music in camp!", weight: 2, lead: "journal", react: "dance",
    when: { route: "trail", terrain: ["plains", "mountains"] },
    title: "A night of music",
    text: "Someone in the wagon train takes out a fiddle (a violin). Soon there is music, and people are dancing around the campfire.",
    outcome: { result: "{member} dances until late. For one night, everyone forgets how tired they are.", effects: { heal: true } }
  },
  {
    id: "thief-trial", headline: "Someone stole flour.", weight: 2, lead: "journal", react: "stop",
    when: { route: "trail", terrain: ["plains", "mountains"] },
    title: "A trial on the trail",
    text: "A man in your wagon train was caught taking flour from another family. There are no courts out here, so the wagon train holds its own trial. Who should decide what happens to him?",
    choices: [
      { label: "Vote to make him leave", result: "The group votes. He must leave the wagon train and travel on his own. Wagon trains sometimes punished people this way.", effects: {} },
      { label: "Forgive him and share", result: "He says his family was hungry. You share some of your food, and he promises to pay it back.", effects: { food: -20 } },
      { label: "Let the captain decide", result: "The captain (the elected leader of the wagon train) makes him pay back the flour and do extra guard duty.", effects: {} }
    ]
  },
  {
    id: "trail-wedding", headline: "A wedding on the trail!", weight: 1, lead: "journal", react: "dance",
    when: { route: "trail", terrain: ["plains", "mountains", "river"] },
    title: "A trail wedding",
    text: "Two young travelers from different wagons have fallen in love. A preacher in the wagon train agrees to marry them tonight.",
    outcome: { result: "There is a short service by the wagons, then music and dancing. {member} gives the couple a small gift.", effects: { heal: true } }
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
