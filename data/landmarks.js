// Westward: landmark vignettes. A painting, a few lines of context, and a real
// diary excerpt read aloud by the Journal keeper.
// Diary quotes must be exact, public domain, and listed in research/ with a source.
// Until a quote is verified, "quote" stays null and the game shows a placeholder.
window.WESTWARD = window.WESTWARD || {};

WESTWARD.landmarks = {
  "chimney-rock": {
    title: "Chimney Rock",
    art: "chimneyrock",
    text: "A tall, thin tower of clay and sandstone rises above the North Platte River. Travelers could see it for days before they got there. Many of them wrote about it in their diaries.",
    quote: "Passed Court House Rock and Chimney Rock, both situated on the lower side of the river, and have been in sight for several days.",
    quotePlain: "Today we passed Courthouse Rock and Chimney Rock. Both are on the far side of the river. We could see them for several days before we got here.",
    speaker: "Amelia Stewart Knight, June 2, 1853",
    sources: ["chimney-rock-knight"],
    draft: true
  },
  "independence-rock": {
    title: "Independence Rock",
    art: "independencerock",
    text: "Travelers hoped to reach this huge, rounded rock by the Fourth of July. Getting here by then meant they were on schedule. Thousands of people carved or painted their names on it.",
    quote: "Came 19 miles today; passed Independence Rock this afternoon, and crossed Sweetwater River on a bridge. Paid 3 dollars a wagon and swam the stock across.",
    quotePlain: "We went 19 miles today. This afternoon we passed Independence Rock. We crossed the Sweetwater River on a bridge. We paid 3 dollars for each wagon, and our animals swam across.",
    speaker: "Amelia Stewart Knight, June 15, 1853",
    sources: ["independence-rock-knight"],
    draft: true
  },
  "sacramento-letter": {
    title: "Sacramento",
    art: "river",
    text: "Steamboats carry miners up the river to Sacramento. From there, they head to the gold fields. In 1852, Norman Asing ran a restaurant in San Francisco. He was a Chinese man. He wrote an open letter (a letter printed for everyone to read) to the governor of California. In it, he stood up for Chinese immigrants (people who moved here from China).",
    quote: "The declaration of your independence, and all the acts of your government, your people, and your history are all against you.",
    quotePlain: "Your own Declaration of Independence proves you wrong. So does everything your government, your people, and your history have done.",
    speaker: "Norman Asing, 1852",
    sources: [],
    draft: true
  }
};

// The opening poster (Manifest Destiny), shown before outfitting.
WESTWARD.poster = {
  headline: "Go West!",
  quote: "our manifest destiny to overspread the continent allotted by Providence for the free development of our yearly multiplying millions",
  quotePlain: "It is our manifest destiny to spread over this whole land. Manifest destiny is the idea that God meant Americans to spread across the continent. God gave us this land so our fast-growing population can live free and grow.",
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
    "Crops have failed and times are hard. Your home district in Guangdong, a province in southern China, is poor.",
    "In Hong Kong, men who sell ship tickets promise gold in California. People call California Gam Saan, which means Gold Mountain.",
    "Your family borrows money for your ticket, or a lender loans it to you. You will pay it back from what you earn."
  ],
  question: "What pulled people from China to California? What pushed them to leave home?",
  sources: ["chinese-voyage"],
  draft: true
};
