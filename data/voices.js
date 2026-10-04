// Westward: "Talk to people." Short voices at each stop, read aloud by the Journal keeper.
//
// Two kinds of voices:
//   quote: true   exact words from a real person, public domain, with year and source.
//                 Some are from a few years after 1849; the year is always shown.
//                 "plain" is a modern-English version for students; "text" never changes.
//   quote: false  a composite: an invented speaker whose words are built only from
//                 documented facts (listed in "basis"). The game labels these clearly.
// Native, Californio, Black, and Chinese speakers talk as equals with their own
// goals, never as hazards. Sources are in research/trail-facts.md and
// research/california-and-design.md.
window.WESTWARD = window.WESTWARD || {};

WESTWARD.voices = {
  independence: [
    { quote: false, who: "A man who runs a store in Independence, Missouri", text: "Everybody wants flour, bacon, and oxen at the same time, so prices go up every week. The guidebooks say to bring 200 pounds of flour for each person. Most people buy less. Later they wish they hadn't.", basis: "Hastings 1845 guide; outfitting costs (trail-facts 3)" },
    { quote: false, who: "A free Black blacksmith", text: "I put iron shoes on your oxen. But I can't vote. Missouri law also says I need a special license just to live in this state. Out on the trail, watch how people treat families who look like me.", basis: "Missouri 1835 license law (NPS)" }
  ],
  kansasriver: [
    { quote: false, who: "A man who runs a ferry (a flat boat that carries wagons) on the Kansas River", text: "The Papin family has run this ferry since 1843. We charge one dollar a wagon. My wife's mother was Kaw. The Kaw are the Native nation the Kansas River is named for. Her people have lived along this river for generations. Now thousands of you pass through every spring.", basis: "Papin ferry, $1 a wagon (kansasriver.org)" },
    { quote: true, who: "Amelia Stewart Knight, a mother on her way to Oregon", year: 1853, text: "In this way we have to cross everything a little at a time. Women and children last, and then swim the cattle and horses.", plain: "We have to take everything across the river a little at a time. The women and children go last. Then the cattle and horses swim across.", source: "Knight diary, May 8, 1853 (Oregon Pioneer Association Transactions)" }
  ],
  fortkearny: [
    { quote: false, who: "A Pawnee man near the trail (the Pawnee are a Native nation of the plains)", text: "These are our hunting grounds. Your oxen eat the grass our horses need. Your hunters scare the buffalo away from the river. When we ask you to pay a toll to cross, it is a small price for what you take.", basis: "Native tolls (Knight 1853; NPS); emigrant impact on grass and game (Grinnell, Isenberg)" },
    { quote: false, who: "A U.S. Army soldier at Fort Kearny", text: "The Army built this fort last year to keep watch over the trail. Most days the trouble is not attacks. It is sickness, broken wagons, and people who did not buy enough food.", basis: "Fort Kearny founded 1848; NPS: disease was the top killer" }
  ],
  chimneyrock: [
    { quote: true, who: "Amelia Stewart Knight, a mother on her way to Oregon", year: 1853, text: "Passed Court House Rock and Chimney Rock, both situated on the lower side of the river, and have been in sight for several days.", plain: "Today we passed Courthouse Rock and Chimney Rock. Both are on the far side of the river. We could see them for several days before we got here.", source: "Knight diary, June 2, 1853" },
    { quote: true, who: "Caleb Richey, a man on his way to Oregon", year: 1852, text: "There is a great deal of diarrhoea and cholera on the plains. We have seen hundreds of graves.", plain: "Lots of people on the plains are sick with diarrhea and cholera (a deadly disease spread by dirty water). We have seen hundreds of graves.", source: "Letter near Fort Laramie, June 20, 1852 (Oregon Pioneer Association Transactions, 1912)" }
  ],
  fortlaramie: [
    { quote: false, who: "A Lakota woman at Fort Laramie (the Lakota are a Native nation of the plains)", text: "We come here to trade. Your women want our moccasins (soft leather shoes). We want bread, cloth, and cooking pots. Every summer more of you come, and there are fewer buffalo near the river.", basis: "Knight 1853 trade near Fort Laramie; Richey 1852 on buffalo leaving the road" },
    { quote: true, who: "Amelia Stewart Knight, a mother on her way to Oregon", year: 1853, text: "Some of the women had moccasins and beads, which they wanted to trade for bread.", plain: "Some Native women had moccasins (soft leather shoes) and beads. They wanted to trade them for our bread.", source: "Knight diary, June 7, 1853" },
    { quote: true, who: "James Akin, Jr., a young man on his way to Oregon", year: 1852, text: "We passed from five to eight fresh graves of a day. The people think the using of bad water is the cause of the sickness.", plain: "Every day we passed five to eight new graves. People think drinking bad water is what makes them sick.", source: "Letter near Fort Laramie, June 19, 1852" }
  ],
  independencerock: [
    { quote: true, who: "Amelia Stewart Knight, a mother on her way to Oregon", year: 1853, text: "Came 19 miles today; passed Independence Rock this afternoon, and crossed Sweetwater River on a bridge. Paid 3 dollars a wagon and swam the stock across.", plain: "We went 19 miles today. This afternoon we passed Independence Rock. We crossed the Sweetwater River on a bridge. We paid 3 dollars for each wagon, and our animals swam across.", source: "Knight diary, June 15, 1853" },
    { quote: false, who: "A family carving their name on the rock", text: "Everybody wants to get here by the Fourth of July. If you get here late, you may still be in the mountains when the snow comes.", basis: "Independence Rock schedule (trail-facts 4)" }
  ],
  southpass: [
    { quote: true, who: "Amelia Stewart Knight, a mother on her way to Oregon", year: 1853, text: "Take us all together we are a poor looking set, and all this for Oregon. I am thinking while I write, \"Oh, Oregon, you must be a wonderful country.\"", plain: "All together, we look pretty worn out and shabby. And we are doing all this just to get to Oregon. As I write, I think, \"Oregon, you had better be an amazing place.\"", source: "Knight diary, June 1, 1853" },
    { quote: false, who: "A Shoshone man on horseback (the Shoshone are a Native nation of the mountains)", text: "This pass goes through Shoshone land. We trade horses and fish with the wagons. We show you the safe places to cross the rivers. We are watching how much grass and game your people use up.", basis: "NPS: Shoshoneans traded fish and resources; guides (Renshaw 1851)" }
  ],
  forthall: [
    { quote: false, who: "A Shoshone horse trader (the Shoshone are a Native nation of the mountains)", text: "Your oxen are worn thin. A fresh horse costs more here than in Missouri, but you are not in Missouri now. West of here, the Snake River runs fast. You will want someone who knows the safe places to cross.", basis: "Fort Hall horse trade (Idaho State Historical Society); Renshaw 1851 hired a guide at the Snake" },
    { quote: false, who: "A worker at Fort Hall, a trading post", text: "Most wagons this year turn southwest toward California. Only a few hundred keep going to Oregon. People found gold in California, and now the whole country is on the move.", basis: "Unruh: about 450 to Oregon and 25,000 to California in 1849" }
  ],
  thedalles: [
    { quote: false, who: "A Chinookan river guide (a Native man from the Columbia River)", text: "The wagon road ends at this river. My people have guided canoes through these rapids for longer than anyone can remember. Most of you hire us. The ones who don't are the ones we pull out of the water.", basis: "NPS: nearly all 1843 overlanders paid Chinookan people to get past the Cascades" },
    { quote: false, who: "A man collecting fees for the Barlow Road (a private road over the mountains)", text: "It costs five dollars a wagon and ten cents for each animal. The road is steep, especially going down Laurel Hill. But it costs less than a boat, and you get to keep your wagon.", basis: "NPS, The Barlow Road" }
  ],
  willamette: [
    { quote: false, who: "A Kalapuya elder (a Native leader from this valley)", text: "Every late summer we burned these meadows. The fire helped the camas (a plant with a root we eat) and berries grow, and it kept the oak woods open. Sickness came before your wagons did and killed most of our people. Now you build fences across our camas fields.", basis: "Oregon History Project: Kalapuya burning; malaria epidemics from about 1830" },
    { quote: true, who: "Amelia Stewart Knight, a mother on her way to Oregon", year: 1853, text: "Here husband traded two yoke of oxen for a half section of land with one-half acre planted to potatoes and a small log cabin and lean-to with no windows. This is the journey's end.", plain: "Here my husband traded four oxen for 320 acres of land. It came with half an acre of potatoes already planted and a small log cabin with a shed on the side. It has no windows. This is the end of our trip.", source: "Knight diary, September 1853" },
    { quote: false, who: "A Black family who came on the trail", text: "We crossed the same mountains you did. This fall, Oregon's lawmakers passed a law saying Black people like us must leave. Some families moved north of the Columbia River, where the law is harder to enforce.", basis: "Oregon exclusion law of September 21, 1849 (NPS); George Washington Bush settled north of the Columbia" }
  ],
  fortymile: [
    { quote: false, who: "A worn-out traveler", text: "Don't try to cross this desert during the day. Walk at night, and carry every drop of water you can. Dead oxen and wagons people left behind line the trail.", basis: "Nevada marker No. 26: an 1850 survey counted over 1,000 dead mules, 5,000 horses, 3,750 cattle, and 953 graves" }
  ],
  sierra: [
    { quote: false, who: "A man who knew the Donner Party (a group of travelers trapped by snow)", text: "Three years ago, some families took a shortcut that was supposed to save time. They got here late, the snow came early, and they were trapped all winter. About 40 of the 87 people died. Get over the mountains before the snow.", basis: "NPS: Donner-Reed Party, 1846" }
  ],
  goldfields: [
    { quote: true, who: "Louise Clappe, a miner's wife who wrote letters as \"Dame Shirley\"", year: 1852, text: "Gold-mining is nature's great lottery scheme. A man may work in a claim for many months, and be poorer at the end of the time than when he commenced, or he may take out thousands in a few hours.", plain: "Mining for gold is like a giant lottery. A man can dig in his spot for months and end up poorer than when he started. Or he can dig up thousands of dollars in a few hours.", source: "The Shirley Letters, April 10, 1852" },
    { quote: true, who: "Louise Clappe (\"Dame Shirley\"), writing about a rule that banned miners from other countries", year: 1852, text: "It seems to me that the above law is selfish, cruel, and narrow-minded in the extreme.", plain: "I think this law is extremely selfish, cruel, and unfair.", source: "The Shirley Letters, May 1, 1852" },
    { quote: false, who: "A Nisenan man (the Nisenan are the Native people where gold was first found)", text: "Gold was found on Nisenan land, at the mill on our river. Since the miners came, my village has had to move again and again. The mining has made the water muddy, and the fish are gone.", basis: "Gold discovered at Coloma on Nisenan land; mining fouled rivers (california-and-design 1, 7)" },
    { quote: true, who: "Mariano Vallejo, a Californio (a Mexican Californian whose family was here before the U.S. took over)", year: 1875, text: "\"¿A qué bien quejarnos? El mal está hecho y ya no tiene remedio.\" (What good is it to complain? The harm is done and cannot be undone.)", plain: "Why complain? The damage is done, and nothing can fix it now.", source: "Vallejo, Recuerdos, 1875 (Spanish original; translation by Westward)" }
  ],
  hongkong: [
    { quote: false, who: "A man on the Hong Kong docks who arranges ship tickets", text: "Crops have failed, and your district is poor. Across the ocean, in California, there is gold. If your family can't pay for the trip, someone will lend you the money. You will pay it back with the gold you dig.", basis: "PBS: crop failures in southern China; passage paid by family or loans" }
  ],
  sanfrancisco: [
    { quote: true, who: "Norman Asing, a Chinese man who ran a restaurant in San Francisco", year: 1852, text: "I am a Chinaman, a republican, and a lover of free institutions.", plain: "I am a Chinese man. I believe in a republic, where people choose their own leaders. And I love freedom and fair laws. (\"Chinaman\" was a common word then. Today it is an insult.)", source: "Open letter to Governor Bigler, Daily Alta California, May 1852" },
    { quote: false, who: "A man from the Sze Yup company (a group that helps people from the same part of China)", text: "Our company gives you a place to sleep. We tell you where to find work, and we help you buy tools for the mines. Stay with men from home. It is safer.", basis: "PBS: district associations offered lodging, work, and help" }
  ],
  sacramento: [
    { quote: false, who: "A man who sells mining supplies by the river in Sacramento", text: "A year ago there was almost nothing here but Sutter's Fort and a boat landing. Now boats come up the river from San Francisco every day. Every wagon family that comes down from the mountains stops here for flour, pans, and shovels. My prices are high, but the diggings charge even more.", basis: "Sacramento laid out by John Sutter Jr. near Sutter's Fort, 1848 to 1849; riverboats from San Francisco from 1849; gold rush prices (california-and-design 2)" },
    { quote: false, who: "A Nisenan woman near Sutter's Fort (the Nisenan are the Native people of this valley)", text: "John Sutter built his fort on Nisenan land ten years ago. Many of our people were made to work his fields. Now the miners have come, and this town grows bigger every week on land where our villages stood.", basis: "Sutter's Fort founded 1839 in Nisenan homeland; Sutter relied on Native labor, much of it forced (California State Parks; Hurtado, Indian Survival on the California Frontier)" },
    { quote: false, who: "A Chinese miner going home to China after three years", text: "By 1852, a tax collector comes to the Chinese camps every month. If you are not a U.S. citizen, you must pay. And the law says we can never become citizens. I paid what I owed for my ship ticket. Now I am going home.", basis: "1852 Foreign Miners' Tax; naturalization limited to white persons; many Chinese miners repaid passage loans and returned (california-and-design 3, 4)" }
  ]
};
