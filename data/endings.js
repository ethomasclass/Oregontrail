// Westward: endings and the "Who Decided?" ledger.
// The left column ("Your family") is built from the run: who survived, land, money.
// The text here adds the family's ending beat. The right column ("The people
// already here") is set by destination. Numbers are DRAFT until verified.
window.WESTWARD = window.WESTWARD || {};

WESTWARD.endings = {
  family: {
    "ohio-oregon": "You have a farm in the Willamette Valley in Oregon. The U.S. government gave you the land for free. For your family, the promise of the West came true.",
    "ohio-california": "You came for gold. Like most miners, you found only a little. California will be a state soon, and you plan to stay.",
    "irish-oregon": "You own land. No one in the Doyle family ever owned land back in Ireland. Some neighbors still treat you like outsiders because you are Irish and Catholic. It will take a generation for people to accept you.",
    "irish-california": "In the gold fields, you are white and you speak English. That protects you from most of the hate aimed at miners from Mexico, Chile, and China. You do not get rich, but you get by.",
    "black-oregon": "You traveled 2,000 miles to reach land you were not allowed to own. Oregon's laws said the West was not for Black families like yours.",
    "black-california": "California joins the United States as a free state, where slavery is not allowed. But its laws still limit what Black people can do. You work hard and save money. You keep your freedom papers close.",
    "chinese-california": "You send money home to your family in China. You still owe money for your ship ticket. The law makes you pay a special tax on your work. And if you go to court, the law will not let you speak against a white person."
  },

  // Extra lines added when a flag is set during the run.
  flagLines: {
    helpedDoyles: "You stood up for the Doyles.",
    expelledDoyles: "The Doyles were kicked out of your wagon group.",
    metBells: "You met the Bells. They were told Oregon would not let them stay.",
    metChans: "You met the Chan cousins, miners from China, when they came off the riverboat in Sacramento.",
    guidedChans: "You showed the Chan cousins the road to the gold fields.",
    soldChansFair: "You sold the Chan cousins flour at a fair price.",
    overchargedChans: "You charged the Chan cousins double for flour because they were new and did not know the prices.",
    helpedChans: "You spoke up when the tax collector cheated the Chan cousins.",
    testifiedForChans: "You testified in court for the Chan cousins. The law would not let them testify for themselves.",
    silentWitness: "You saw the Chan cousins get robbed and said nothing. Your word was the only one the court would have heard.",
    foundWitness: "The law would not let you testify for the Chan cousins, so you found a white neighbor who would.",
    warnedChans: "The law would not let you testify, so you told the Chan cousins what you saw. They warned other Chinese camps.",
    bellsKeptQuiet: "You saw the Chan cousins get robbed. The law would not let either of your families testify against a white man.",
    metCarvers: "You sold rice to the Carvers. They came across the country by wagon three years before you.",
    merchant: "Selling supplies paid better than digging for gold. Most people who sold supplies made more money than most miners.",
    wentNorth: "You moved north of the Columbia River, like George Washington Bush, a Black settler, did.",
    sparedBison: "You left the bison (buffalo) herd alone."
  },

  // Right column: what happened to the people already living there.
  others: {
    oregon: {
      title: "The people who already lived here",
      lines: [
        "The Kalapuya people had lived in the Willamette Valley for thousands of years. By the 1840s, diseases brought by outsiders had already killed most of them.",
        "A U.S. law gave settlers this land for free. In 1855, Kalapuya groups signed a treaty (an agreement) with the U.S. In 1856, they were forced to move to the Grand Ronde Reservation (an area the U.S. set aside and made Native people live on).",
        "Oregon's laws said Black people could not settle there. Oregon became a state in 1859. Its state constitution, written in 1857, kept that ban.",
        "The same 1857 constitution also targeted Chinese people. Any Chinese person who arrived after it was adopted could not own land or a mining claim in Oregon. That rule stayed in the constitution until 1946."
      ],
      sources: ["kalapuya-history", "donation-land-claim", "oregon-exclusion-laws", "oregon-constitution-1857"],
      draft: true
    },
    california: {
      title: "The people who already lived here",
      lines: [
        "In 1846, perhaps 150,000 Native people lived in California. By 1873, only about 30,000 were left. The number fell because of disease, hunger, and violence. Some were killed by U.S. soldiers and by armed groups that the state of California paid.",
        "Californios are Mexican Californians whose families lived there before the U.S. took over. A law passed in 1851 made them prove in court that they owned their land. Court costs were high, and squatters (people who moved onto the land without permission) moved in. Many families lost their ranchos (large ranches).",
        "About 20,000 Chinese people came to California in 1852 alone. Most came to mine. The Foreign Miners' Tax of 1852 made every miner who was not a citizen pay $3 a month, and U.S. law did not let Chinese immigrants become citizens.",
        "In 1854, in a case called People v. Hall, California's highest court ruled that Chinese people could not speak as witnesses against white people in court. A California law from 1850 already said the same about Black and Native people."
      ],
      sources: ["california-native-population", "land-act-1851", "chinese-arrivals", "foreign-miners-tax", "naturalization-white", "people-v-hall"],
      draft: true
    }
  },

  question: "Who decided what the West would become, and who had no say?",
  handoutPrompt: "Write one sentence on your handout to answer the question.",
  gastPrompt: "Look again at the painting from the start of the game. Whose idea of the West does it show?",
  teaser: "In 1849, people in California wrote a constitution (a plan for their government) that banned slavery. Then they asked to become a U.S. state. Congress (the lawmakers in Washington, D.C.) argued about it for most of 1850. Next time: when Americans can't agree, who should decide?"
};
