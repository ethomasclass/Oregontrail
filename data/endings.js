// Westward: endings and the "Who Decided?" ledger.
// The left column ("Your family") is built from the run: who survived, land, money.
// The text here adds the family's ending beat. The right column ("The people
// already here") is set by destination. Numbers are DRAFT until verified.
window.WESTWARD = window.WESTWARD || {};

WESTWARD.endings = {
  family: {
    "ohio-oregon": "You have a farm in the Willamette Valley, given free by the government. For your family, the promise of the West came true.",
    "ohio-california": "You came for gold. Like most miners, you found a little. California will be a state soon, and you plan to stay.",
    "irish-oregon": "You own land, something no Doyle ever did in Ireland. Some neighbors still treat you as outsiders. Acceptance will take a generation.",
    "irish-california": "In the gold fields, being white and speaking English shields you from most of the hostility aimed at Mexican, Chilean, and Chinese miners. You do not get rich, but you get by.",
    "black-oregon": "You crossed 2,000 miles to reach land you were not allowed to own. Oregon's laws said the West was not for you.",
    "black-california": "California enters the Union as a free state, but its laws still limit Black residents. You work hard and save, and you keep your papers close.",
    "chinese-california": "You send money home, and you still owe on your passage. The law taxes your work and will not hear your voice in court."
  },

  // Extra lines added when a flag is set during the run.
  flagLines: {
    helpedDoyles: "You stood up for the Doyles.",
    expelledDoyles: "The Doyles were pushed out of your wagon company.",
    metBells: "You met the Bells, who were told Oregon would not let them stay.",
    helpedChans: "You spoke up when the tax collector cheated the Chan cousins.",
    metCarvers: "You sold rice to the Carvers, who came overland three years before you.",
    merchant: "Selling supplies paid better than mining. Most merchants did better than most miners.",
    wentNorth: "You moved north of the Columbia River, as George Washington Bush did.",
    sparedBison: "You left the bison herd alone."
  },

  // Right column: what happened to the people already living there.
  others: {
    oregon: {
      title: "The people already here",
      lines: [
        "The Kalapuya people had lived in the Willamette Valley for thousands of years. Disease brought by outsiders had already killed most of them by the 1840s.",
        "Settlers received land under federal law. Kalapuya bands signed a treaty in 1855 and were forced onto the Grand Ronde Reservation in 1856.",
        "Oregon's laws barred Black people from settling, and its 1857 constitution, in force from statehood in 1859, kept that ban."
      ],
      sources: ["kalapuya-history", "donation-land-claim", "oregon-exclusion-laws"],
      draft: true
    },
    california: {
      title: "The people already here",
      lines: [
        "California's Native population fell from perhaps 150,000 in 1846 to about 30,000 by 1873, from disease, starvation, and violence, including attacks by state-paid militias and U.S. soldiers.",
        "Under the Land Act of 1851, Californio families had to prove their land titles in court. Many lost their ranchos to legal costs and squatters.",
        "Chinese miners paid the Foreign Miners' Tax, and after People v. Hall (1854) could not testify against white people in court."
      ],
      sources: ["california-native-population", "land-act-1851", "foreign-miners-tax", "people-v-hall"],
      draft: true
    }
  },

  question: "Who decided what the West would become, and who had no say?",
  handoutPrompt: "Write one sentence on your handout to answer the question.",
  gastPrompt: "Look again at the painting from the start of the game. Whose view of the West does it show?",
  teaser: "In 1849, Californians wrote a constitution banning slavery and asked to join the Union. Congress fought over it for most of 1850. Tomorrow: when Americans can't agree, who should decide?"
};
