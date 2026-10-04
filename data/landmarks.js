// Westward: landmark vignettes. A painting, a few lines of context, and a real
// diary excerpt read aloud by the Journal keeper.
// Diary quotes must be exact, public domain, and listed in research/ with a source.
// Until a quote is verified, "quote" stays null and the game shows a placeholder.
window.WESTWARD = window.WESTWARD || {};

WESTWARD.landmarks = {
  "chimney-rock": {
    title: "Chimney Rock",
    art: "chimneyrock",
    text: "A spire of clay and sandstone rises above the North Platte. Emigrants could see it for days before they reached it, and many wrote about it.",
    quote: "Passed Court House Rock and Chimney Rock, both situated on the lower side of the river, and have been in sight for several days.",
    speaker: "Amelia Stewart Knight, June 2, 1853",
    sources: ["chimney-rock-knight"],
    draft: true
  },
  "independence-rock": {
    title: "Independence Rock",
    art: "independencerock",
    text: "Emigrants hoped to reach this granite dome by the Fourth of July to stay on schedule. Thousands carved or painted their names on it.",
    quote: "Came 19 miles today; passed Independence Rock this afternoon, and crossed Sweetwater River on a bridge. Paid 3 dollars a wagon and swam the stock across.",
    speaker: "Amelia Stewart Knight, June 15, 1853",
    sources: ["independence-rock-knight"],
    draft: true
  },
  "sacramento-letter": {
    title: "Sacramento",
    art: "river",
    text: "Steamboats carry miners up the river to Sacramento, the gateway to the gold fields. In 1852 a San Francisco restaurant owner named Norman Asing wrote an open letter to the governor defending Chinese immigrants.",
    quote: "The declaration of your independence, and all the acts of your government, your people, and your history are all against you.",
    speaker: "Norman Asing, 1852",
    sources: [],
    draft: true
  }
};

// The opening poster (Manifest Destiny), shown before outfitting.
WESTWARD.poster = {
  headline: "Go West!",
  quote: "our manifest destiny to overspread the continent allotted by Providence for the free development of our yearly multiplying millions",
  speaker: "John L. O'Sullivan, 1845",
  lines: [
    "Free land in Oregon!",
    "Gold in California!",
    "A fresh start for your family."
  ],
  question: "Who is this poster talking to? Who is left out?",
  sources: ["osullivan-1845"],
  draft: true
};

// The Chan cousins' opening, in place of the poster.
WESTWARD.seaPoster = {
  headline: "Gam Saan: Gold Mountain",
  lines: [
    "Crop failures and hard times have left your district in Guangdong poor.",
    "Ships' agents in Hong Kong promise gold in California.",
    "Families borrow, or brokers lend, to pay your passage. You will repay it from your earnings."
  ],
  question: "What pulled people from China to California? What pushed them?",
  sources: ["chinese-voyage"],
  draft: true
};
