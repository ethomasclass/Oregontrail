// Westward: "Talk to people." Short voices at each stop, read aloud by the Journal keeper.
//
// Two kinds of voices:
//   quote: true   exact words from a real person, public domain, with year and source.
//                 Some are from a few years after 1849; the year is always shown.
//   quote: false  a composite: an invented speaker whose words are built only from
//                 documented facts (listed in "basis"). The game labels these clearly.
// Native, Californio, Black, and Chinese speakers talk as equals with their own
// goals, never as hazards. Sources are in research/trail-facts.md and
// research/california-and-design.md.
window.WESTWARD = window.WESTWARD || {};

WESTWARD.voices = {
  independence: [
    { quote: false, who: "A storekeeper on the square", text: "Everybody wants flour, bacon, and oxen at once, and prices go up every week. The guidebooks say two hundred pounds of flour for every person. Most folks buy less and wish they hadn't.", basis: "Hastings 1845 guide; outfitting costs (trail-facts 3)" },
    { quote: false, who: "A free Black blacksmith", text: "I shoe your oxen, but I can't vote, and I have to carry a license just to live in this state. Missouri law says so. Mind how people out there treat the families who look like me.", basis: "Missouri 1835 license law (NPS)" }
  ],
  kansasriver: [
    { quote: false, who: "A ferryman at the Papin crossing", text: "The Papin family has run this ferry since 1843. One dollar a wagon. My wife's mother was Kaw; her people have lived along this river for generations, and now thousands of you pass through every spring.", basis: "Papin ferry, $1 a wagon (kansasriver.org)" },
    { quote: true, who: "Amelia Stewart Knight, emigrant", year: 1853, text: "In this way we have to cross everything a little at a time. Women and children last, and then swim the cattle and horses.", source: "Knight diary, May 8, 1853 (Oregon Pioneer Association Transactions)" }
  ],
  fortkearny: [
    { quote: false, who: "A Pawnee man near the trail", text: "These are our hunting grounds. Your oxen eat the grass our horses need, and your hunters drive the buffalo away from the river. When we ask for a toll, it is a small price for what you take.", basis: "Native tolls (Knight 1853; NPS); emigrant impact on grass and game (Grinnell, Isenberg)" },
    { quote: false, who: "A soldier at the new fort", text: "The Army built this fort last year to watch over the road. Most days the trouble is not raids. It is sickness, broken wagons, and people who bought too little food.", basis: "Fort Kearny founded 1848; NPS: disease was the top killer" }
  ],
  chimneyrock: [
    { quote: true, who: "Amelia Stewart Knight, emigrant", year: 1853, text: "Passed Court House Rock and Chimney Rock, both situated on the lower side of the river, and have been in sight for several days.", source: "Knight diary, June 2, 1853" },
    { quote: true, who: "Caleb Richey, emigrant", year: 1852, text: "There is a great deal of diarrhoea and cholera on the plains. We have seen hundreds of graves.", source: "Letter near Fort Laramie, June 20, 1852 (Oregon Pioneer Association Transactions, 1912)" }
  ],
  fortlaramie: [
    { quote: false, who: "A Lakota woman trading at the fort", text: "We come here to trade. Your women want our moccasins; we want bread, cloth, and kettles. Every summer there are more of you, and fewer buffalo near the river.", basis: "Knight 1853 trade near Fort Laramie; Richey 1852 on buffalo leaving the road" },
    { quote: true, who: "Amelia Stewart Knight, emigrant", year: 1853, text: "Some of the women had moccasins and beads, which they wanted to trade for bread.", source: "Knight diary, June 7, 1853" },
    { quote: true, who: "James Akin, Jr., emigrant", year: 1852, text: "We passed from five to eight fresh graves of a day. The people think the using of bad water is the cause of the sickness.", source: "Letter near Fort Laramie, June 19, 1852" }
  ],
  independencerock: [
    { quote: true, who: "Amelia Stewart Knight, emigrant", year: 1853, text: "Came 19 miles today; passed Independence Rock this afternoon, and crossed Sweetwater River on a bridge. Paid 3 dollars a wagon and swam the stock across.", source: "Knight diary, June 15, 1853" },
    { quote: false, who: "A family carving their name", text: "Everybody wants to be here by the Fourth of July. If you are late here, you may be in the mountains when the snow comes.", basis: "Independence Rock schedule (trail-facts 4)" }
  ],
  southpass: [
    { quote: true, who: "Amelia Stewart Knight, emigrant", year: 1853, text: "Take us all together we are a poor looking set, and all this for Oregon. I am thinking while I write, \"Oh, Oregon, you must be a wonderful country.\"", source: "Knight diary, June 1, 1853" },
    { quote: false, who: "A Shoshone horseman", text: "This pass crosses Shoshone country. We trade horses and fish with the wagons, and we show the fords. We are watching how much grass and game your people use.", basis: "NPS: Shoshoneans traded fish and resources; guides (Renshaw 1851)" }
  ],
  forthall: [
    { quote: false, who: "A Shoshone horse trader", text: "Your oxen are worn thin. A fresh horse costs more here than in Missouri, but you are not in Missouri. West of here, the Snake River runs fast, and you will want someone who knows the fords.", basis: "Fort Hall horse trade (Idaho State Historical Society); Renshaw 1851 hired a guide at the Snake" },
    { quote: false, who: "A clerk at the trading post", text: "Most of the wagons this year turn southwest for California. Only a few hundred keep on to Oregon. Gold has the whole country moving.", basis: "Unruh: about 450 to Oregon and 25,000 to California in 1849" }
  ],
  thedalles: [
    { quote: false, who: "A Chinookan river pilot", text: "The wagon road ends at this river. My people have guided canoes through these rapids for longer than anyone can count. Most of you hire us. The ones who don't are the ones we pull out of the water.", basis: "NPS: nearly all 1843 overlanders paid Chinookan people to get past the Cascades" },
    { quote: false, who: "A man collecting tolls for Barlow's road", text: "Five dollars a wagon and ten cents a head for stock. It is steep, especially down Laurel Hill, but it is cheaper than a boat and you keep your wagon.", basis: "NPS, The Barlow Road" }
  ],
  willamette: [
    { quote: false, who: "A Kalapuya elder", text: "Every late summer we burned these meadows so the camas and berries would grow and the oaks stayed open. Sickness came before your wagons did and took most of our people. Now you put fences across the camas fields.", basis: "Oregon History Project: Kalapuya burning; malaria epidemics from about 1830" },
    { quote: true, who: "Amelia Stewart Knight, emigrant", year: 1853, text: "Here husband traded two yoke of oxen for a half section of land with one-half acre planted to potatoes and a small log cabin and lean-to with no windows. This is the journey's end.", source: "Knight diary, September 1853" },
    { quote: false, who: "A Black emigrant family", text: "We crossed the same mountains you did. This fall the legislature passed a law saying people like us must leave the territory. Some families went north of the Columbia, where the law is harder to enforce.", basis: "Oregon exclusion law of September 21, 1849 (NPS); George Washington Bush settled north of the Columbia" }
  ],
  fortymile: [
    { quote: false, who: "A worn-out emigrant", text: "Do not try to cross by day. Walk at night and carry every drop of water you can. The trail is lined with dead oxen and wagons people left behind.", basis: "Nevada marker No. 26: an 1850 survey counted over 1,000 dead mules, 5,000 horses, 3,750 cattle, and 953 graves" }
  ],
  sierra: [
    { quote: false, who: "A man who knew the Donner Party", text: "Three years ago, families took a shortcut that was supposed to save time. They got here late, the snow came early, and they were trapped all winter. About forty of eighty-seven died. Get over before the snow.", basis: "NPS: Donner-Reed Party, 1846" }
  ],
  goldfields: [
    { quote: true, who: "Louise Clappe (\"Dame Shirley\"), miner's wife", year: 1852, text: "Gold-mining is nature's great lottery scheme. A man may work in a claim for many months, and be poorer at the end of the time than when he commenced, or he may take out thousands in a few hours.", source: "The Shirley Letters, April 10, 1852" },
    { quote: true, who: "Louise Clappe (\"Dame Shirley\"), on a rule banning foreign miners", year: 1852, text: "It seems to me that the above law is selfish, cruel, and narrow-minded in the extreme.", source: "The Shirley Letters, May 1, 1852" },
    { quote: false, who: "A Nisenan man", text: "Gold was found on Nisenan land, at the mill on our river. Since the miners came, my village has moved again and again. The fish are gone from the muddy water.", basis: "Gold discovered at Coloma on Nisenan land; mining fouled rivers (california-and-design 1, 7)" },
    { quote: true, who: "Mariano Guadalupe Vallejo, Californio", year: 1875, text: "\"¿A qué bien quejarnos? El mal está hecho y ya no tiene remedio.\" (What good is it to complain? The harm is done and cannot be undone.)", source: "Vallejo, Recuerdos, 1875 (Spanish original; translation by Westward)" }
  ],
  hongkong: [
    { quote: false, who: "A passage broker on the docks", text: "Crop failures have made your district poor, and there is gold across the ocean. If your family cannot pay the passage, someone will lend it. You will pay it back from what you dig.", basis: "PBS: crop failures in southern China; passage paid by family or loans" }
  ],
  sanfrancisco: [
    { quote: true, who: "Norman Asing, San Francisco restaurant owner", year: 1852, text: "I am a Chinaman, a republican, and a lover of free institutions.", source: "Open letter to Governor Bigler, Daily Alta California, May 1852" },
    { quote: false, who: "A man from the Sze Yup company", text: "Our company gives you a place to sleep, tells you where there is work, and helps you buy tools for the mines. Stay with men from home. It is safer.", basis: "PBS: district associations offered lodging, work, and help" }
  ],
  sacramento: [
    { quote: false, who: "A Chinese miner heading home", text: "The tax collector comes every month. If you are not a citizen, you pay, and the law says we can never become citizens. Keep your receipt where you can find it.", basis: "1852 Foreign Miners' Tax; naturalization limited to white persons" }
  ]
};
