# The Oregon Trail (MECC): a mechanical and UI teardown

Prepared for the design of **Westward**, a 40-minute, 4-students-per-laptop browser game about westward expansion.

Focus: the 1985 Apple II design by R. Philip Bouchard and its near-identical 1990 MS-DOS port (the version most students know from oregontrail.ws). Differences with the 1971/1975/1978 BASIC game, Oregon Trail Deluxe (1992) and the 2021 Gameloft remake are noted where relevant.

## How to read this document

* Every specific number or claim is followed by a bracketed source link. The link list is at the bottom.
* **[A2-code]** marks facts I read directly from the game's own Applesoft BASIC program. I extracted it from the archive.org disk image of *The Oregon Trail v1.4* (MECC A-157, 1985; program header "UPDATE 86/02/20 JJK") by parsing the DOS 3.3 catalog and detokenizing the BASIC files (`OREGON TRAIL`, `RIVER.LIB`, `BUY.LIB`, `TRADE.LIB`, `LF.LIB`, `PART.LIB`, `HUNT.LIB`, `TOMB.LIB`, `END.LIB`, `WIN`, `FLOAT`, `MENU`, `BUY SUPPLIES`, plus the `VAR.BIN` data file). The formulas are exact. The *meaning* I give each variable is my interpretation from context and screen text. Where an interpretation is shaky, it is marked **(interpretation)**.
* **[DOS-exe]** marks text I took from the 1990 MS-DOS release (archive.org copy, "Version 2.0"). I unpacked its LZEXE-compressed `OREGON.EXE` and read the strings and the landmark table. I also read `DIALOGS.REC`, `HISCORES.REC` and `TOMB.REC` from that release.
* **(uncertain)** marks claims where sources conflict or are weak.
* The 1985 and 1990 versions share the same design and models. Bouchard calls the DOS release "essentially identical to the Apple II version" except for redrawn graphics [B-history]. The DOS strings and landmark distances below match the Apple code.

---

## 0. The big picture: the structure Bouchard invented

* **Two nested cycles.** The journey is about **16 landmark-to-landmark segments** ("beads on a string"), and inside them is a **daily cycle** that recomputes speed, location, weather, food and health every day. Random events can fire on any day [B-imagine].
* **Auto-play with pause.** Between landmarks the days tick by on their own. The player can press a key at any time to stop and "size up the situation". The game also stops by itself at landmarks and for notable events [B-imagine]. Bouchard rejected a design that would have stopped "150 times" in a typical 5-month trip [B-imagine].
* **Reusable, data-driven modules.** Hunting, river crossing, store, talk and trade are generic modules fed with per-location data, so each use feels different [B-imagine].
* **Target length.** Bouchard designed around "the 40-minute gameplay I was targeting" and a 280K floppy disk [B-imagine]. The 1985 teacher's manual says a student working alone needs "at least twenty-five minutes" to reach Oregon City, and more if they die and restart [Manual-1985].
* **Earlier versions were very different.** The 1971 to 1984 game ran in fixed **two-week turns** with no geography: each turn asked whether to hunt and how well to eat, then rolled random events [B-early] [1978-src].

---

## 1. Setup

### 1.1 Occupation, money and score multiplier

| Choice (exact menu text) | Starting cash | Score multiplier |
|---|---|---|
| 1. Be a banker from Boston | $1,600 | x1 |
| 2. Be a carpenter from Ohio | $800 | x2 ("doubled") |
| 3. Be a farmer from Illinois | $400 | x3 ("tripled") |

Sources: [A2-code] (`MENU` line 4030 sets cash 1600/800/400; `WIN` multiplies the score by the occupation number) [DOS-exe] [Manual-1985].

* Option 4, "Find out the differences between these choices", explains: "Traveling to Oregon isn't easy! But if you're a banker, you'll have more money ... However, the harder you have to try, the more points you deserve! Therefore, the farmer earns the greatest number of points and the banker earns the least." [A2-code] [DOS-exe]
* The scoring screen justifies the multiplier in-world: "Because more farmers and carpenters were needed than bankers, you receive double points upon arriving in Oregon as a carpenter, and triple points for arriving as a farmer." [A2-code] [DOS-exe]
* **Design intent:** occupation is the *only* difficulty setting. Bouchard: "one factor alone could make a huge difference: how much money the player started with", which let him avoid building three versions of the game. He deliberately disguised the difficulty choice as a socio-economic role (teammate Shirley Keran's idea) and later trimmed each option to five words. "Shopkeeper" became "carpenter" to avoid confusion with the store [B-store].
* 1971/1978: no occupation. Everyone had $700 (the 1978 text says you saved $900 and paid $200 for the wagon) [1978-src]. The 1978 game added a self-rated shooting skill instead ("ACE MARKSMAN" to "SHAKY KNEES") [1978-src] [DDG-410].

### 1.2 Naming the party

* Prompts: "What is the first name of the wagon leader?" then "What are the first names of the four other members in your party?" with "(Enter names or press Return)". The game confirms with "Are these names correct?" and lets you edit any slot [A2-code] [DOS-exe].
* Names can be up to 9 characters (letters, space, period, apostrophe, hyphen) [A2-code].
* If you press Return, the game fills empty slots with random defaults: Zeke, Jed, Anna, Mary, Joey, Beth, John, Sara, Henry, Emily [A2-code].
* The party is always 5 people [A2-code] (Matt: "I see that you have 5 people in all").
* **The leader is protected.** When the code picks a victim for illness, injury or drowning, it skips slot 0 (the leader) while anyone else is alive [A2-code] (`OREGON TRAIL` line 11505 and `RIVER.LIB` line 50175). So the named "you" is always the last to die, and the tombstone always shows the leader's name.
* Design intent: "To make the experience more personal, my design requires each player to provide four additional names as traveling companions. If you make bad decisions or encounter a streak of bad luck, then members of your family will die." [B-imagine]
* The 1985 manual explicitly suggests classroom "Oregon teams" of five, where "each Oregon team chooses a wagon leader and includes the four names of the other team members" [Manual-1985].

### 1.3 Departure month

* Screen: "It is 1848. Your jumping off place for Oregon is Independence, Missouri. You must decide which month to leave Independence." Options: 1. March, 2. April, 3. May, 4. June, 5. July, 6. Ask for advice [A2-code] [DOS-exe].
* Advice: "You attend a public meeting held for 'folks with the California - Oregon fever.' You're told: If you leave too early, there won't be any grass for your oxen to eat. If you leave too late, you may not get to Oregon before winter comes. If you leave at just the right time, there will be green grass and the weather will still be cool." [A2-code] [DOS-exe]
* The journey always starts on the 1st of the chosen month [A2-code] (`BUY SUPPLIES` line 6000 sets day 1).
* Mechanical effects [A2-code] (`OREGON TRAIL` line 29000-29004) **(interpretation of variable names)**:
  * A March start begins with random snow on the ground (0 to 12 units). Snow cuts speed by (snow/40), so 12 units means up to 30% slower until it melts.
  * Accumulated rainfall starts at "7 minus month number" plus a random 0 to 1. March starts around 4 to 5 and July around 0 to 1. Rainfall drives river depth (see section 9), so early starts mean deeper rivers. The manual agrees: "River levels start at very high levels in March and April and tend to fall off during the summer." [Manual-1985]
  * Late starts risk winter in the mountains, where snow accumulates and can stop the wagon (section 7).
* Design history: the alpha offered February 1 to July 1. Kids almost always picked February 1, the first item, and "soon dies of poor health, but the kids never understood what had happened". So Bouchard limited the menu to the five months real emigrants might choose [B-store].
* 1971/1978: fixed start of March 29, 1847 [1978-src] [B-early].

---

## 2. Matt's General Store

### 2.1 Items, prices, limits and Matt's advice (Independence)

| Item | Unit and price | Max in wagon | Matt's advice (exact wording) |
|---|---|---|---|
| Oxen | $40 per yoke (2 oxen) | 20 oxen | "There are 2 oxen in a yoke; I recommend at least 3 yoke. I charge $40 a yoke." |
| Food | $0.20 per pound | 2,000 lb | "I recommend you take at least 200 pounds of food for each person in your family. I see that you have 5 people in all. You'll need flour, sugar, bacon, and coffee. My price is 20 cents a pound." |
| Clothing | $10.00 per set | none found | "You'll need warm clothing in the mountains. I recommend taking at least 2 sets of clothes per person. Each set is $10.00." |
| Ammunition | $2.00 per box of 20 bullets | none found | "I sell ammunition in boxes of 20 bullets. Each box costs $2.00." |
| Spare parts | wagon wheel $10, wagon axle $10, wagon tongue $10 | 3 of each | "It's a good idea to have a few spare parts for your wagon." |

Sources: [A2-code] (`BUY SUPPLIES`, `BUY.LIB`) [DOS-exe] [DDG-412].

* Matt's opening line: "Hello, I'm Matt. So you're going to Oregon! I can fix you up with what you need: a team of oxen to pull your wagon, clothing for both summer and winter, plenty of food for the trip, ammunition for your rifles, spare parts for your wagon." [A2-code] [DOS-exe]
* Before the store the game says: "You have $X in cash, but you don't have to spend it all now." [A2-code]
* UI: the screen shows the five categories with a running cost, a "Total bill" and "Amount you have". You pick a number 1 to 5 to change a line, and SPACE BAR to leave [A2-code] [Manual-1985]. Bouchard changed "Money remaining" to "Bill so far" because no money is spent until you leave [B-store]. Kids were confused by the word "outfits", so it became "sets of clothes" [B-store].
* Guard rails: if the bill exceeds your cash, Matt says "Okay, that comes to a total of $X. But I see that you only have $Y. We'd better go over the list again." If you buy no oxen: "Don't forget, you'll need oxen to pull your wagon." Exit line: "Well then, you're ready to start. Good luck! You have a long and difficult journey ahead of you." [A2-code]
* Following all of Matt's minimums (3 yoke, 1,000 lb food, 10 sets of clothes, 2 of each part) costs $480, which is more than a farmer's $400 [DDG-412].
* Bouchard's goal was for questions to come from a character, and to buy in real quantities rather than dollar amounts as in the old game ("How much do you want to spend on oxen?") [B-store].

### 2.2 Prices at later forts

Fort stores multiply every base price by **1 + 0.25 x Q**, where Q counts forts passed [A2-code] (`BUY.LIB` line 50003):

| Store | Price multiplier |
|---|---|
| Independence (Matt's) | x1.00 |
| Fort Kearney | x1.25 |
| Fort Laramie | x1.50 |
| Fort Bridger | x1.75 |
| Fort Hall | x2.00 |
| Fort Boise | x2.25 |
| Fort Walla Walla | x2.50 |

* At forts, oxen are sold one at a time (base $20 per ox), not by the yoke [A2-code] (`VAR.BIN` price table: oxen 20, clothing 10, ammunition box 2.00, wheel/axle/tongue 10, food 0.20). Fan-recorded fort prices match: Fort Kearney $25 per ox, $12.50 per set of clothes, $2.50 per box, $0.25 per lb; Fort Laramie $0.30 per lb and $15 per set [UG-wiki]. A player at Fort Hall noted "Everything costs double what it did in Missouri!" [DDG-won].
* The same caps apply (20 oxen, 2,000 lb food, 3 of each part) [A2-code].
* In-game voice of this mechanic, Aunt Rebecca: "At every fort along the trail, prices have been higher than at the previous fort! This is outrageous! ... If I had the chance to do it again, I'd buy more supplies in Independence." [DOS-exe] [A2-code]
* 1978 version: at forts, every dollar spent buys only 2/3 as much, and stopping costs 45 miles of progress [1978-src].

---

## 3. The travel screen and the "size up the situation" menu

### 3.1 What is shown

* Top: a tiny animated ox pulling a wagon, anchored on the right of a mostly black screen under a horizon line. The background is green prairie in the first half and purple mountains in the second (two backgrounds only) [B-travel].
* The next landmark is a small icon that slides in from the left as you approach. Charolyn Kapplinger drew an icon for each of the 16 landmarks [B-travel].
* Under the animation, a band of color reflects ground conditions: **green** for normal, **orange** for drought, **white** for snow [B-travel] [Manual-1985]. The manual notes the color "is only updated at certain points, not every day" [Manual-1985].
* Then the prompt "Press RETURN to size up the situation" (DOS: "Press ENTER to size up the situation") [A2-code] [DOS-exe]. The wording took "many tries"; "Press S to stop" tested poorly, and the prompt was moved up between the color band and the data [B-travel].
* Then a single centered column, labels left and values right [B-travel] [A2-code]:
  * Date: (e.g. "April 12, 1848")
  * Weather: (very cold, cold, cool, warm, hot, very hot, rainy, snowy, very rainy, very snowy)
  * Health: (good, fair, poor, very poor)
  * Food: (N pounds)
  * Next landmark: (N miles, a distance, not a name, by design [B-travel])
  * Miles traveled: (N miles)
* Some events have special graphics on this screen: the wagon breaking down, a thunderstorm and a thief in the night [B-travel].
* Bouchard's caveats: the animation shows a single ox and implies the wagon travels alone, both historically misleading, but "the disadvantages were trivial compared to the advantages" [B-travel].

### 3.2 How time passes

* "Approximately every two seconds, the date ... advances to the next day, and all the other data on the screen updates accordingly." [B-travel]
* One tick equals one day. The whole daily model runs each tick: weather, health, food consumption, random events and mileage [A2-code] (`OREGON TRAIL` lines 3100-3499).
* The animation speed reflects progress. The manual says the wagon "will move faster or slower depending on the number of oxen pulling it and the pace traveled" [Manual-1985].
* The game pauses automatically for any event message and at each landmark [B-imagine] [A2-code].
* A typical trip takes about 150 days [B-imagine].

### 3.3 Miles per day

Base speed per segment, from the landmark table [A2-code] (`VAR.BIN` array LM) [DOS-exe]:

* **20 miles/day** for the first five segments (Independence to Fort Laramie, the plains).
* **12 miles/day** from Fort Laramie onward (mountains, desert and beyond).

Daily distance = base x pace factor x oxen factor x sickness factor x snow factor [A2-code] (`OREGON TRAIL` lines 650-660 and 3244-3245) [Manual-1985]:

| Factor | Value |
|---|---|
| Pace | steady x1, strenuous x1.5, grueling x2 |
| Oxen | (healthy oxen / 4), capped at 1. A sick or injured ox counts as half an ox |
| Sick or injured party members | minus 10% per sick person |
| Snow on ground | x (1 - snow depth / 40); 40 units stops you |
| Resting, hunting, trading | 0 miles that day |

* Observed in play: grueling on the plains gives 40 miles/day; grueling in Wyoming gives 24; with one ox dead (3.5 effective oxen of 4) it gives 21 [DDG-412] [DDG-won]. These match the formula exactly.
* The manual describes mountains as "x 0.5". The code instead uses a 12-mile base from Fort Laramie, which is x0.6 **(the manual simplifies)** [Manual-1985] [A2-code].
* Events such as "Impassable trail", "Lose trail" and "Wrong trail" can halt progress for several days [Manual-1985] [A2-code].

### 3.4 The "size up the situation" menu

On the trail, between landmarks [A2-code] [DOS-exe] [Manual-1985]:

1. Continue on trail
2. Check supplies
3. Look at map
4. Change pace
5. Change food rations
6. Stop to rest
7. Attempt to trade
8. Hunt for food

At a landmark, option 8 becomes **Talk to people**, and at forts and Independence a 9th option, **Buy supplies**, appears. Hunting is only possible between landmarks [A2-code] [B-imagine].

The menu screen header shows the date, Weather, Health, Pace and Rations, then "You may:" and the numbered list [A2-code] [DOS-exe].

| Option | What it does (exact behavior) |
|---|---|
| Continue on trail | Resumes the travel screen. If a broken part or missing oxen block you: "You must trade for a(n) X to be able to continue." [A2-code] |
| Check supplies | "Your Supplies": oxen, sets of clothing, bullets, wagon wheels, wagon axles, wagon tongues, pounds of food, money left [A2-code] |
| Look at map | Map of the route with your path drawn so far [A2-code] (`MAP.LIB`) |
| Change pace | steady / strenuous / grueling, plus option 4 "find out what these different paces mean" (section 4) |
| Change food rations | filling / meager / bare bones with descriptions (section 4) |
| Stop to rest | "How many days would you like to rest?" 0 to 9 days [A2-code] [Manual-1985] |
| Attempt to trade | One random trade offer per attempt, costs 1 day (section 11) |
| Talk to people | One of 3 monologues for this landmark (section 11) |
| Buy supplies | The store at fort prices (section 2.2) |
| Hunt for food | The hunting minigame, costs 1 day (section 10) |

Esc twice quits; Control-S toggles sound [DOS-exe] [Manual-1985].

---

## 4. Pace and rations: exact effects

### 4.1 Pace

On-screen descriptions [A2-code] [DOS-exe]:

* **steady**: "You travel about 8 hours a day, taking frequent rests. You take care not to get too tired."
* **strenuous**: "You travel about 12 hours a day, starting just after sunrise and stopping shortly before sunset. You stop to rest only when necessary. You finish each day feeling very tired."
* **grueling**: "You travel about 16 hours a day, starting before sunrise and continuing until dark. You almost never stop to rest. You do not get enough sleep at night. You finish each day feeling absolutely exhausted, and your health suffers."

| Pace | Speed factor | Daily health penalty (added to H) |
|---|---|---|
| resting (implicit) | 0 | 0 |
| steady | x1 | +2 |
| strenuous | x1.5 | +4 |
| grueling | x2 | +6 |

Sources: [A2-code] (`OREGON TRAIL` lines 660 and 3220: health term ZP = 2 x pace) [Manual-1985].

The manual also says over-pacing, neglecting rest and eating poorly "will increase the likelihood of accidents and poor health" [Manual-1985]. In the code, accident chances do not depend directly on pace. Pace raises the health number, and daily illness chance rises with that number (section 5) [A2-code]. Wikipedia says pace affects "the likelihood of ... oxen going lame" [WP-1985]. I found no direct pace term in the ox-injury probability **(uncertain; possibly true only indirectly)**.

### 4.2 Rations

On-screen descriptions [A2-code] [DOS-exe]:

* **filling**: "meals are large and generous."
* **meager**: "meals are small, but adequate."
* **bare bones**: "meals are very small; everyone stays hungry."

| Rations | Food per living person per day | Daily health penalty |
|---|---|---|
| filling | 3 lb | 0 |
| meager | 2 lb | +2 |
| bare bones | 1 lb | +4 |
| out of food | 0 | +8, plus a growing starvation term (section 5) |

Sources: [A2-code] (line 660: food consumed = people x (4 - rations); food term = 2 x (rations - 1); 8 if no food) [moral].

The default settings (steady, filling) are "those which are least damaging to health" [Manual-1985].

Rough planning numbers: 5 people on filling eat 15 lb/day. Matt's 1,000 lb lasts about 67 days at filling, 100 at meager and 200 at bare bones [A2-code arithmetic].

---

## 5. Health system

### 5.1 The hidden number

* The party has one shared health value H, from 0 (ideal) to 140 ("the threshold of death") [Manual-1985]. Each person also has their own illness or injury state [Manual-1985] [A2-code].
* Displayed label = H divided by 35, rounded down [A2-code] [Manual-1985]:

| H | Label |
|---|---|
| 0-34 | good |
| 35-69 | fair |
| 70-104 | poor |
| 105-139 | very poor |
| 140+ | "remaining party members all die within a few days" [Manual-1985] |

### 5.2 Daily update formula (1985 code)

Each day [A2-code] (`OREGON TRAIL` lines 3200-3235; also decompiled independently by [moral]):

```
H = 0.9 * H + ZT + ZC + ZF + ZP + FS + H0 + HR      (capped at 139 for display)
```

| Term | Meaning | Values |
|---|---|---|
| 0.9 x H | natural recovery, "decremented by 10%" [Manual-1985] | |
| ZT | temperature discomfort | 0 for cool or warm; 1 for cold or hot; 2 for very cold or very hot |
| ZC | clothing shortfall in cold | max(0, 5 - 2 x tempClass - setsOfClothingPerPerson). tempClass is 0 very cold, 1 cold, 2 cool, 3+ warm. With 1 set/person, cool is fine (ZC 0) but cold gives +2. Cold needs 3 sets/person and very cold needs 5 sets/person to reach 0 |
| ZF | rations | filling 0, meager 2, bare bones 4, no food 8 |
| ZP | pace and wet weather | 2 x pace (steady 2, strenuous 4, grueling 6; 0 while resting), +1 if rainy or snowy, +2 if very rainy or very snowy |
| FS | exposure/starvation accumulator | if out of food OR clothing is inadequate (ZC > 0.5): FS = FS + 0.8 every day (it keeps growing). Otherwise FS halves every day |
| H0 | number of party members currently sick or injured | +1 per sick person per day |
| HR | event hardship this day | +20 when someone falls ill or on "Bad water"; +10 on "Very little water" or "Rough trail" |

**Key consequence: steady states.** Because H loses 10% per day, any constant daily load S settles at **H = 10 x S**. Some worked examples in dry, warm weather with no sickness (my arithmetic from the formula):

| Pace + rations | Daily load S | Settles at H | Label |
|---|---|---|---|
| steady + filling | 2 | 20 | good |
| strenuous + filling | 4 | 40 | fair |
| grueling + filling | 6 | 60 | fair |
| grueling + meager | 8 | 80 | poor |
| steady + bare bones | 6 | 60 | fair |
| grueling + bare bones | 10 | 100 | poor |
| grueling + bare bones, very hot, raining | 13 | 130 | very poor |
| rest + filling | 0 | decays toward 0 | good |

This matches observed play: "a grueling pace advances 40 miles in a day but also degrades our health to 'fair'" [DDG-412]. It also matches the speedrunner's discovery of "exponential decay": "the unhealthier you are, the more beneficial rest is" [DDG-better]. Cold weather without enough clothing, or running out of food, is what pushes H past 140, because FS grows without limit [A2-code].

### 5.3 Illness and injury

* **Daily illness roll:** probability = 0.01 + H/1500. That is 1% per day at H=0, about 3% at 35, 6% at 70, 8% at 105 and about 10% at 139 [A2-code] (line 3160). The manual describes a combined daily chance of illness or injury of "0% to 40%, depending upon the general health of the party" [Manual-1985], which presumably adds the injury events below **(the manual's 40% figure does not match the 1985 code I read; uncertain)**.
* When the illness roll fires, a random non-leader member is picked. If that person is **already sick or injured, they die**. Otherwise they get one of six illnesses with equal odds: **exhaustion, typhoid, cholera, measles, dysentery, a fever** [A2-code] (line 10300; illness names in `VAR.BIN`) [Manual-1985]. Bouchard: "five diseases or symptoms often named by travelers... (You have died of dysentery.)" (he lists six) [B-imagine].
* Injuries come from other events: "a broken arm", "a broken leg" (the 4%/7% accident event) and "a snakebite" (0.7% per day in warm or hotter weather) [A2-code].
* Recovery: "Ten days are required to recover from illness and thirty days from injury." [Manual-1985] [A2-code] (counters of 10 and 30 days; snakebite also uses 10).
* Each sick person adds +1 to H per day and slows the wagon by 10% [A2-code] [Manual-1985].
* **Death spiral:** if H exceeds 139, the game forces the illness routine every single day, so someone gets sick, and anyone already sick dies [A2-code] (line 3235).
* **Mercy rule:** whenever a party member dies, H is capped at 105 ("very poor" but below the death line) [A2-code] (`TOMB.LIB` line 50000).
* Messages are short and personal, e.g. "Zeke has dysentery." and later "Zeke has died." [A2-code]. DOS uses the same pattern ("has died.") [DOS-exe]. The exact sentence "You have died of dysentery" does **not** appear in the 1985 v1.4 code or the 1990 DOS strings I examined **(the meme's exact wording may come from a later version, or from memory; uncertain)**.
* A speedrunner reported that "People are unlikely to die from their illnesses unless your overall health drops down to 'very poor'", while also seeing one member "randomly died while the party was in good health" [DDG-better]. Both fit the formula: deaths need two illness rolls on the same person within 10 days, which is rare at low H but always possible.

### 5.4 How resting helps

* Resting (1 to 9 days) runs the daily model with pace = 0, so the pace term disappears and H decays by 10% a day toward the remaining load [A2-code] (line 4505).
* **No random events happen while resting, hunting or trading** (events are skipped on these "stopped" days) [A2-code] (line 3180). So the daily illness roll is also skipped. One player noticed "bad stuff only happens to the wagon while traveling - not while resting" [DDG-412].
* Food is still eaten each rest day [A2-code].
* Hunting counts as a rest day plus food, so experts "rest" by hunting [DDG-412] [DDG-better].

### 5.5 Comparison

* 1971/1978: no persistent health. Illness is a random event whose chance depends on how well you chose to eat that turn: 100% for "poorly", 75% for "moderately" and 50% for "well" **(interpretation of the code)**. Recovery needs "miscellaneous supplies" (medicine) and a $20 doctor; death comes from running out of food, medicine, cash or bullets [1978-src] [B-early].
* Bouchard removed the medicine-and-doctor system as historically inaccurate and added named diseases [WP-1985].

---

## 6. Random events

### 6.1 Full list with per-day probabilities (1985 Apple II code)

Probabilities are rolled each traveling day, in this order. Rest, hunt and trade days skip them [A2-code] (`OREGON TRAIL` lines 3060-3180 and 10000-11420; "zone 3+" means from Fort Hall westward **(interpretation of the zone index)**).

| # | Event (on-screen text) | Per-day chance | Effect |
|---|---|---|---|
| 0 | "Snow bound" | 100% when snow depth > 30 | lose 1 to 10 days |
| 1 | "[Name] has a snakebite." | 0.7%, only if weather is warm or hotter | 10-day affliction |
| 3 | Illness, or death if already sick | 1% + H/1500 | see section 5.3; HR +20 |
| 4 | "You pass a gravesite. Would you like to look closer?" | when you pass the stored tombstone position | shows a previous player's tombstone (section 13) |
| 5 | "Indians help find food." | 5%, only when food = 0 | +30 lb food |
| 6 | "Severe thunderstorm" / "Severe blizzard" | 100% if very rainy or very snowy; +15% if cold or very cold; never in cool or warm | lose 1 day; rain or snow added |
| 7 | "Heavy fog" (west of Fort Hall, not very hot) or "Hail storm" (up to Fort Hall, when very hot) | 6% | fog: 50% chance to lose 1 day |
| 8 | Breakdown / ox / injury | 4% (7% from Fort Hall on) | 1/3 "Broken wagon wheel/axle/tongue"; else 1/2 "One of the oxen is injured" (half an ox lost; "has died" if that completes a whole ox); else "[Name] has a broken arm/leg" (30 days) |
| 9 | "Lose trail" / "Wrong trail" | 2% | lose 1 to 5 days |
| 10 | "Rough trail" (50%) / "Impassible trail" (50%) | 5%, from Fort Hall on | rough: HR +10; impassable: lose 1 to 10 days |
| 11 | "Find wild fruit." | 4%, May through September | +20 lb food |
| 12 | Fire / lost person / ox wanders off (1/3 each) | 1% | fire: each of clothing, bullets, wheels, axles, tongues and food has a 50% chance of losing a random amount; "[Name] is lost": lose 1 to 5 days; "Ox wanders off": lose 1 to 3 days |
| 13 | Thief (50%) / abandoned wagon (50%) | 2% | "A thief comes during the night and steals" up to 100 of one random item (oxen, clothing, bullets or food); "You find an abandoned wagon" is empty or has 1 to 3 of several items (21 to 63 bullets) |
| 14 | Drought: "Bad water" (20%) / "Very little water" (40%) / "Inadequate grass" (40%) | 50% when recent rainfall < 0.1 | bad water HR +20; little water HR +10; grass is a warning |

Other notes:

* **Broken parts** prompt "Broken wagon X. Would you like to try to repair it?" A repair attempt succeeds 50% of the time. Otherwise a spare is used, and with no spare: "Since you don't have a spare X, you must trade for one." [A2-code] (`PART.LIB`). This is the strongest reason to trade.
* **No oxen:** "You are unable to continue your journey. You have no oxen to pull the wagon." You must trade for one [A2-code].
* The 1985 manual lists the same events and says "the probability of these events occurring is not fixed but depends upon the current circumstances" [Manual-1985].
* **No Native attacks** exist in 1985: "Events which had a low incidence, such as unprovoked attacks by Indians, do not appear among the simulated events." [Manual-1985]
* Rawitsch, revising the 1975 version, tied event odds to diaries and to places, e.g. "the South Pass through the Rockies occurs at 950 miles along the trail" [Smithsonian].

### 6.2 The 1978 event table, for comparison

Fixed per-turn (two-week) probabilities from the 1978 BASIC source (cumulative `DATA 6,11,13,15,17,22,32,35,37,42,44,54,64,69,95`) [1978-src]:

| Event | Chance per turn |
|---|---|
| Wagon breaks down | 6% |
| Ox injures leg | 5% |
| Daughter breaks arm | 2% |
| Ox wanders off | 2% |
| Son gets lost | 2% |
| Unsafe water | 5% |
| Heavy rains (cold weather past 950 mi) | 10% |
| Bandits attack | 3% |
| Fire in wagon | 2% |
| Lost in heavy fog | 5% |
| Poisonous snake | 2% |
| Wagon swamped fording river | 10% |
| Wild animals attack | 10% |
| Hail storm | 5% |
| Illness check (depends on eating) | 26% |
| Helpful Indians show food | 5% |

Separately, "riders" appear with a mileage-dependent chance (80% hostile), and mountains past 950 miles bring blizzards and lost-trail checks [1978-src].

---

## 7. Weather and terrain

### 7.1 Weather model (1985)

* Weather is generated "based on actual average monthly temperature and rainfall tables for six current-day locations near the historic trail: Kansas City, North Platte, Casper, Lander, Boise, Portland" [Manual-1985].
* The code uses **5 climate zones** that switch at landmarks: (1) Independence to Big Blue, (2) Fort Kearney to Fort Laramie, (3) Independence Rock to Soda Springs, (4) Fort Hall to Fort Boise, (5) Blue Mountains onward [A2-code] (line 1000) **(the zone-to-city pairing is my interpretation)**.
* Each day there is a 50% chance the temperature is re-rolled: monthly base + random 0 to 40 F [A2-code] (line 3205). Then precipitation is rolled at a monthly rate. 30% of precipitation days are "very" rainy or snowy, and it is snow if the temperature is cold or very cold [A2-code].
* Temperature labels: very hot above 90 F, hot 70 to 90, warm 50 to 70, cool 30 to 50, cold 10 to 30, very cold below 10 [Manual-1985].
* Decoded monthly climate table [A2-code] (`VAR.BIN` string array WC$; mean = base + 20 F; zone order is my interpretation):

| Zone (likely station) | Jan mean F | Apr | Jul | Oct | Precip chance/day, spring peak |
|---|---|---|---|---|---|
| 1 Kansas City | 23 | 49 | 75 | 51 | about 9-10% in May-June |
| 2 North Platte | 23 | 42 | 71 | 47 | about 6% in May |
| 3 Wyoming (Casper/Lander) | 19 | 43 | 69 | 46 | about 7% in Apr-May |
| 4 Boise | 30 | 50 | 74 | 52 | about 4% |
| 5 Portland | 38 | 51 | 66 | 54 | 17-19% in Nov-Jan, 1.5% in July |

* Rain and snow accumulate. Rain drives river depth and drought; snow accumulates, slowly decays (3% per day) and melts on warm days [Manual-1985] [A2-code].

### 7.2 Terrain and how it matters

* Travel speed base: 20 mi/day on the plains, 12 from Fort Laramie onward [A2-code].
* Hunting landscapes change across five terrain zones: Eastern forest (deciduous trees, grass), plains (grass), Rocky Mountains (conifers, rocks), desert (cacti, shrubs, rocks), Western forest (conifers) [B-hunt].
* Breakdowns, rough or impassable trail and fog are more common or only possible west of Fort Hall [A2-code].
* Snow: "up to 100% loss of speed, depending on snow depth" [Manual-1985]. The mountain-man monologue warns: "Many a traveler crossing the mountains too late in the year has gotten snowbound and died!" [DOS-exe]
* 1978: the mountains start at mile 950; blizzards strike at South Pass (80% chance unless you clear it) and at the Blue Mountains around mile 1,700; and if you are still traveling after December 20, "YOUR FAMILY DIES IN THE FIRST BLIZZARD OF WINTER" [1978-src].

---

## 8. Landmarks

### 8.1 Route table (1985 Apple II and 1990 DOS, identical)

Segment distances and base speeds come from the game data [A2-code] (`VAR.BIN` array LM) [DOS-exe] (landmark records in `OREGON.EXE`). Cumulative miles are my sums. They match a logged playthrough: 185, 304, 554, 830, 1057, 1219, 1458, 1572, 1732 [DDG-better].

| # | Landmark | Type | Miles from previous | Cumulative (via Fort Bridger) | Base mi/day after it |
|---|---|---|---|---|---|
| 0 | Independence, Missouri | town, store | 0 | 0 | 20 |
| 1 | Kansas River crossing | river (ferry) | 102 | 102 | 20 |
| 2 | Big Blue River crossing | river (no ferry) | 83 | 185 | 20 |
| 3 | Fort Kearney | fort | 119 | 304 | 20 |
| 4 | Chimney Rock | scenery | 250 | 554 | 20 |
| 5 | Fort Laramie | fort | 86 | 640 | 12 |
| 6 | Independence Rock | scenery | 190 | 830 | 12 |
| 7 | South Pass | scenery, **fork** | 102 | 932 | 12 |
| 8a | Green River crossing (shortcut) | river (ferry) | 57 from South Pass | 989 | 12 |
| 8b | Fort Bridger (detour) | fort | 125 from South Pass | 1,057 | 12 |
| 9 | Soda Springs | scenery | 144 from Green River / 162 from Fort Bridger | 1,133 / 1,219 | 12 |
| 10 | Fort Hall | fort | 57 | 1,190 / 1,276 | 12 |
| 11 | Snake River crossing | river (Shoshoni guide) | 182 | 1,372 / 1,458 | 12 |
| 12 | Fort Boise | fort | 114 | 1,486 / 1,572 | 12 |
| 13 | Blue Mountains | scenery, **fork** | 160 | 1,646 / 1,732 | 12 |
| 14a | Fort Walla Walla (detour) | fort | 55 | 1,787 (via Bridger) | 12 |
| 14b | The Dalles (direct) | **final fork** | 125 from Blue Mountains / 120 from Walla Walla | 1,857 direct / 1,907 via Walla Walla | 12 |
| 15 | Willamette Valley, Oregon | goal | 100 by Barlow Road (or the raft game) | about 1,957 | |

* Shortest full route by road: about 1,871 miles (Green River + direct to The Dalles + Barlow Road). Longest: about 2,007 miles **(my sums)**. The game's own blurb says "2000 miles" [A2-code]; the manual's history notes use 2,400 miles from the Missouri River to the Willamette Valley [Manual-1985]. The 1971/1978 game used 2,040 miles [1978-src].
* The manual says "seventeen" landmarks are included [Manual-1985]. The data has 18 nodes counting Independence and the Willamette Valley [A2-code]. Bouchard designed "around 16 segments" [B-imagine].
* Forts (with stores): Kearney, Laramie, Bridger, Hall, Boise, Walla Walla, plus Independence [A2-code] [Manual-1985].

### 8.2 The landmark screen UI

1. On the travel screen: "You are now at [landmark]. Would you like to look around?" [A2-code] [DOS-exe]
2. Yes shows a full-screen color picture with the name and date in a box beneath [A2-code] [B-travel]. The manual counts "twenty-two full color graphics" based on period paintings, lithographs and photos [Manual-1985].
3. Each landmark plays "a different melody... every melody is an actual tune that was popular at the time" (e.g. "Flow Gently, Sweet Afton") [B-imagine] [Manual-1985]. Bouchard admits this could be "more annoying than helpful... on the Apple II, which has no volume control" [B-imagine].
4. Then the menu (section 3.4) with Talk to people and, at forts, Buy supplies.
5. Leaving: "From [landmark] it is N miles to [next landmark]." [A2-code]
6. Bouchard deliberately made the travel screen look different from landmark pictures so that "the arrival at the next landmark would seem like an important event" [B-travel].
7. The manual's one-computer classroom tip uses this rhythm: always look around at landmarks, and "the full screen graphic of the location will signal the next student's turn" [Manual-1985].

### 8.3 Route choices

* Fork screen: "The trail divides here. You may: 1. head for [A] 2. head for [B] 3. see the map" [A2-code] [DOS-exe].
* **South Pass:** Green River crossing (57 mi, a deep river, then 144 mi) vs Fort Bridger (125 mi, a fort and no river, then 162 mi). The shortcut saves 86 miles but forces a dangerous crossing [A2-code]. Aunt Rebecca at Fort Bridger: "We should've taken the Sublette Cutoff! Not enough at this fort worth the time it took to get here." [DOS-exe] The manual suggests using this fork as a group decision prompt: "if you want to take a short cut, such as the Green River instead of Fort Bridger, and your partner does not, how is the decision to continue made?" [Manual-1985]
* **Blue Mountains:** Fort Walla Walla (55 + 120 = 175 mi, a fort) vs The Dalles directly (125 mi) [A2-code].
* **The Dalles:** "1. float down the Columbia River 2. take the Barlow Toll Road" [A2-code] [DOS-exe]. The toll is **$5 plus $0.50 per ox** [A2-code] (`END.LIB` line 50020); with 6 oxen that is $8.00 **(DOS fee not confirmed)**. Without the cash: "You do not have enough cash." The Barlow Road is 100 more miles of normal travel. The raft is the arcade finale (section 12).

---

## 9. River crossings

### 9.1 The four rivers and their data

River conditions = fixed minimums plus recent rainfall (AR) [A2-code] (`RIVER.LIB` line 50150; values from `VAR.BIN` array RC) [Manual-1985] [B-rivers]:

* depth = base depth + 2 x AR (feet, 1 decimal)
* width = base width + 15 x AR (feet)
* swiftness = base swiftness + AR (hidden)

| River | Base depth (ft) | Base width (ft) | Base swiftness | Bottom | Extra option |
|---|---|---|---|---|---|
| Kansas | 1 | 600 | 3 | smooth | ferry |
| Big Blue | 1 | 220 | 2 | muddy | none |
| Green | 20 | 400 | 5 | rocky | ferry |
| Snake | 6 | 1,000 | 7 | rocky | Shoshoni guide |

**(Column meanings are my interpretation of the RC array. The ferry/guide column matches the manual exactly. The Green River at 20+ feet explains why players say "Well, we're not fording that" [DDG-won].)**

### 9.2 The screen

"You must cross the river in order to continue. The river at this point is currently N feet across, and N feet deep in the middle." Then it shows Weather, River width and River depth, and the options [A2-code] [DOS-exe]:

1. attempt to ford the river
2. caulk the wagon and float it across
3. take a ferry across / hire an Indian to help (only where available)
4. wait to see if conditions improve
5. get more information

"Get more information" explains fording ("pull your wagon across a shallow part of the river, with the oxen still attached"), caulking ("seal it so that no water can get in. The wagon can then be floated across like a boat") and ferries [A2-code].

Waiting: "You camp near the river for a day." The river is recomputed from the changing rainfall [A2-code]. A bug in this option lets the party wait without health updates, which a streamer used to wait for centuries [moral].

### 9.3 Outcome math (1985 code)

Sources: [A2-code] (`RIVER.LIB`) [Manual-1985] [B-rivers]. "Each item" means each of clothing, bullets, wheels, axles, tongues and food; a hit loses a random portion of that item.

**Ford:**

* Depth under 2.5 ft: "You made the crossing successfully." Exceptions: a muddy bottom gives a 40% chance of "You become stuck in the mud. Lose 1 day."; a rocky bottom gives a 16% chance that "The wagon tipped over", with each item at 10 to 40% risk of loss.
* 2.5 to 3 ft: "Your supplies got wet. Lose 1 day." (no losses). Bouchard added this band during tuning [B-rivers].
* Over 3 ft: "The river is too deep to ford. You lose:" Each item is lost with probability depth/10. Each ox drowns with probability (depth - 1)/10. Each non-leader person drowns with probability (depth - 2.5)/10. At 4 ft, that is 40% per item, 30% per ox and 15% per person. At the Green River's 20+ ft, fording means near-total loss.

**Caulk and float:**

* Needs at least 1.5 ft of water ("The river is too shallow to float across."). Always costs 1 day.
* At 2.5 ft or less it is perfectly safe.
* Above 2.5 ft, tip-over chance = swiftness/20 (e.g. 25 to 40% at the Green River and 35 to 50% at the Snake). On a tip: each item lost with probability 0.4 + swiftness/25, and each person drowns with probability (swiftness - 3)/15. Message: "The wagon tipped over while floating. You lose:"

**Ferry (Kansas, Green):**

* "The ferry operator says that he will charge you $5.00 and that you will have to wait N days." The wait is 2 to 6 days.
* Not available below 2.5 ft: "The ferry is not operating today because the river is too shallow."
* Accident chance: 0% if swiftness is 5 or less, 5% above 5, 15% above 10. On an accident ("The ferry broke loose from moorings."): each item has an 80% loss chance, each ox 50% and each person 20%.

**Shoshoni guide (Snake):**

* "A Shoshoni guide says that he will take your wagon across the river in exchange for N sets of clothing." N is 2 or 3.
* The guide fords if depth is 2.4 ft or less, otherwise floats.
* All risks are divided by 5, the "80%" reduction. Bouchard raised it from 50% because players "concluded that hiring a guide was useless" [B-rivers] [Manual-1985].
* Bouchard's original design had the guide warn you or refuse in bad conditions. That was cut, so "the guide never opts to wait a few days before crossing" [B-rivers].

**Animations:** a 45-degree view of a blue field. Only two outcomes are animated, reaching the far shore or overturning, and text explains swamping or getting stuck [B-rivers].

**Significance:** Bouchard calls river crossings "the second most exciting part of the product, eclipsed only by the hunting activity" [B-rivers]. The 1971/1978 game had no river decisions; swamping was just a random event [1978-src] [DDG-410].

---

## 10. Hunting minigame

* **Access:** "Hunt for food" from the trail menu only. It always costs one day [A2-code] [Manual-1985].
* **Controls (Apple II and DOS):** Return (DOS: Enter) starts or stops walking; arrow keys point the rifle for "novice hunters"; another key set does it for "expert hunters"; the Space Bar fires [A2-code] [DOS-exe]. Joystick support in DOS [DOS-exe]. The hunter is a third-person figure who can face and walk in 8 directions [B-hunt].
* **Landscape:** randomly scattered 4 to 6 obstacles drawn from the current terrain zone's object types; trees and rocks block movement [B-hunt].
* **Animals:** reduced from 18 candidates to 11 to **6 species** for memory reasons, with 3-frame animation [B-hunt]. Which species appear depends on the trail position [A2-code] (the hunt routine receives zone flags) [Manual-1985]. The manual cites a "two-pound rabbit on the prairie or a 400-pound bear in the mountains" and buffalo and antelope "weigh a lot more than the hundred pounds that can be carried back" [Manual-1985]. One player: the limit "can be attained from two deer or one buffalo" [DDG-412]. Squirrels and rabbits are barely worth a bullet [DDG-412].
* **Dead animals flip upside down.** The dead-state art was late, so the programmer flipped the sprite; "the kids loved it", so it shipped [B-hunt].
* **Meat math** [A2-code] (`HUNT.LIB`):
  1. The hunt returns the total weight shot. The game keeps half of it (whole amount if under 3 lb) **(interpretation: dressed-meat yield)**.
  2. "From the animals you shot, you got N pounds of meat."
  3. If over 100: "However, you were only able to carry 100 pounds back to the wagon."
  4. The wagon cap of 2,000 lb also applies ("However, your wagon is full.").
  5. Bullets used are subtracted.
* **Why 100 lb:** Bouchard wanted realism (hauling meat back miles on foot) and "wanted the kids to think about the concept of wastefulness, without explicitly mentioning it". In testing, "many of them decided that they would never shoot more than one bison" [B-hunt]. The in-game Fort Kearney scout reinforces it: "Folks shoot the game for sport, take a small piece, and let the rest rot in the sun." [DOS-exe]
* **Difficulty:** deliberately not dumbed down despite adult complaints; kids became proficient "after only 3 or 4 hunting trips" [B-hunt].
* **Overhunting:** I found **no depletion mechanic** in the 1985 code; species and spawns depend only on location and randomness [A2-code]. Players do report sessions with no game or cluttered grounds [DDG-412] **(any "game is scarce" message belongs to a later version; uncertain)**.
* **Later versions:** the limit was raised to 200 lb [B-hunt] (Wikipedia: if at least two party members are alive [WP-series]). Deluxe (1992) uses mouse crosshair hunting [WP-series].
* **1971/1978:** type "BANG" (1978: a random word from BANG, BLAM, POW, WHAM) as fast as possible. Under about 1 second is a guaranteed hit and over 7 is a guaranteed miss [DDG-410]. A good shot gave about 52 to 57 lb of food and used 10 to 14 bullets [1978-src]. Bill Heinemann: "The faster they typed, the more meat they got." [Vice]
* **Popularity:** hunting was "by far the best known part of the game, and the main reason that many kids (especially boys) enjoyed playing" the 1980 version [B-hunt].

---

## 11. Trading and talking to people

### 11.1 Trading (1985 code)

How a trade is generated [A2-code] (`TRADE.LIB`):

1. Two different random goods are picked from the 7 store goods (oxen, clothing, bullets, wheels, axles, tongues, food): one the stranger wants and one they offer.
2. The exchange rate is the ratio of store values, worsened by a random factor between 1.0 and 2.2. **Trades are never better than store value.**
3. Bullets-for-food swaps are multiplied by 50 to make sensible quantities.
4. 5% of the time, or if the offer would exceed your carrying caps: "No one wants to trade with you today."
5. Text: "You meet another emigrant who wants N X. He/She will trade you N Y. Are you willing to trade?" (She 33% of the time.) If you lack the goods: "You don't have this."
6. **Each attempt costs one day** [A2-code] [Manual-1985].

* The real value is as the **only fix for a broken part with no spare, or for no oxen**, since repair or replacement is required before continuing [A2-code]. Bouchard: "quite helpful... especially if a crucial wagon part has broken. However, this module is a pale shadow of the trading system I had intended to include." [B-imagine]

### 11.2 Talk to people

* At every landmark there are **3 monologues**. Each "Talk to people" shows the next one, rotating from a random start [A2-code] (`TALK.LIB`; 768 bytes = 3 speeches per landmark in `OREGON1.SEQ`/`OREGON2.SEQ`).
* UI: "[Speaker] tells you:" followed by a quoted paragraph and a decorative border [A2-code].
* Speakers mix recurring fictional characters with historical diarists and Native voices [DOS-exe] [A2-code]. Examples (exact text):
  * Big Louie, a trail driver: "Be careful you don't push those animals too hard! Keep 'em moving but set them a fair pace... A lame ox is about as good to you as a dead one!" (a hint about pace)
  * A ferry operator: "Don't try to ford any river deeper than the wagon bed -- about two and a half feet. You'll swamp your wagon and lose your supplies." (the exact game threshold, section 9.3)
  * A town resident: "Some folks seem to think that two oxen are enough to get them to Oregon!... I wouldn't go overland with less than six." (a hint about oxen)
  * Celinda Hines (a real 1853 diarist): "Chimney Rock by moonlight is awfully sublime. Many Indians came to our wagon with fish to exchange for clothing."
  * Alonzo Delano (a real diarist): "About noon yesterday we came in sight of Chimney Rock looming up in the distance like the lofty tower of some town."
  * A Sioux brave: "All I ask from the white man is to leave me alone, and to leave my buffalo alone."
  * An Arapaho Indian: "When the white man first crossed our lands their wagons were few. Now they crowd the trail in great numbers. The land is overgrazed..."
  * A Shoshoni Indian: "Now there are too many white men and too little land for grazing."
  * A Cayuse Indian: "You ask about the Whitman massacre. I ask you why Doctor Whitman's medicine did not cure my people's children? Many caught the measles from the strangers."
  * A tired-looking woman: "One child drowned in a swollen creek east of Fort Laramie. My husband died of typhoid near Independence Rock. Now I travel alone with my five children."
  * A young girl: "My father is very sick and we are resting here until he gets better. We have been pushing too hard and our health has suffered." (a hint about rest)
* **Teaching role:** speeches deliver hints that map directly onto mechanics (fording depth, oxen count, pace, clothing for trade, prices rising), plus geography and multiple perspectives. Bouchard: "an important method for obtaining helpful hints and discovering historical and geographic details... it makes the game seem much more human" [B-imagine]. The manual's study guides note that some answers are found "only in the 'Attempt to trade' and 'Talk to people' options... which may be overlooked by student travelers who are in a hurry", and it builds a character-sketch writing assignment around the monologues [Manual-1985].

---

## 12. The Columbia River rafting minigame

* Chosen at The Dalles instead of the Barlow Road. Two instruction screens: "Use the arrow keys to guide your raft through the rushing waters of the Columbia River." and "After passing the third direction sign, land your raft at the trail to the Willamette Valley." [A2-code] [B-raft] [DOS-exe]
* Mechanics [A2-code] (`FLOAT`, by Steven Splinter, 07/18/85):
  * A 45-degree view; the raft moves across 18 lateral positions with drift momentum.
  * Up to 2 rocks on screen, each spawning with a 15% chance per tick.
  * Direction signs appear at ticks 60, 120 and 170. The landing window opens after tick 205; overshooting past tick 225 means "The raft has missed the landing."
* Losses:
  * Hitting a rock: each non-leader person 60% drown, each ox 60%, each item 70%.
  * Hitting the shore: 15% / 30% / 50%.
  * Missing the landing: each item 50%.
  * If more than 9 loss lines result: "The raft is destroyed; everything has been lost."
  * Bouchard concedes these losses "seem excessive" and "out of whack" [B-raft].
* History: cut in March 1985, then revived late "with strict conditions": extremely simple, written in Applesoft BASIC (hence jerky), no portaging and no guides. Bouchard revived it because without it "the final leg of the journey might end up feeling anticlimactic"; it became "a powerful finale" [B-raft].
* Players find it easy and preferable: "no negative consequences can befall you as long as you perform well. And it's really easy." [DDG-won]

---

## 13. Tombstones

* When the **entire party** has died, the game shows a tombstone reading "Here lies [leader's name]" [A2-code]. Because the leader is excluded from random deaths while others live (section 1.2), it is effectively always the player's own name.
* "Would you like to write an epitaph?" accepts up to 29 characters (letters, digits, space and , . ' -), with a chance to edit. Then: "All of the people in your party have died." [A2-code] (`TOMB.LIB`) [DOS-exe]
* **Persistence:** the record (segment, exact mile position, name, epitaph) is written to the disk file `TOMB.SEQ`. The disk stores **two** tombstones, one per disk side (first and second half of the trail); a new death on that half overwrites the old one [A2-code] [DOS-exe] [Manual-1985]. The DOS management screen: "There may be one tombstone on the first half of the trail and one tombstone on the second half." [DOS-exe] The game asks you to remove the write-protect sticker if needed [A2-code].
* **Encounter:** when a later party reaches the same spot, the event fires: "You pass a gravesite. Would you like to look closer?" and shows the earlier player's name and epitaph [A2-code].
* Teachers can clear tombstones and reset the Top Ten from a hidden menu (Control-A at the main menu) [Manual-1985] [A2-code].
* **Why it matters:** Bouchard: "This humorous interlude compensates for the player's failure to complete the journey. But the real hook is that we store the tombstone data on the game disk, so that the next player who uses the same disk can see the tombstone." [B-imagine] It turns a shared school disk into a message board between students.
* **Evidence of use:** the archived disk images still hold real leftovers. The 1985 v1.4 image contains "WE TRIED AND WE DIED. 1 MILE" and "JOHN WAS HERE" [A2-code]. The 1990 DOS copy contains "Hey Hey Hey! Come out and play" [DOS-exe]. A widely circulated 1985 copy is famous for the epitaph "peperony and chease" [DDG-412] [moral].
* 1971/1978 equivalent: a mock letter from "THE OREGON CITY CHAMBER OF COMMERCE" asking "WOULD YOU LIKE A MINISTER?", "WOULD YOU LIKE A FANCY FUNERAL?" and mentioning "YOUR AUNT SADIE IN ST. LOUIS" [1978-src]. Death was already played for dark humor.

---

## 14. Scoring and the Oregon Top Ten

### 14.1 Formula (1985 code; identical table in DOS)

Points are counted on arrival [A2-code] (`WIN` lines 130-140, `MENU` data) [DOS-exe] [PerfectPacman]:

| Item | Points |
|---|---|
| Each surviving person | 500 (good), 400 (fair), 300 (poor), 200 (very poor). Health is the **shared party health at arrival**, applied to everyone |
| Wagon | 50 |
| Each ox | 4 |
| Each spare wagon part | 2 |
| Each set of clothing | 2 |
| Bullets | 1 per 50 (rounded down) |
| Food | 1 per 25 lb (rounded down) |
| Cash | 1 per $5 (rounded down) |
| **Occupation** | then x2 for carpenter, x3 for farmer |

* **Time is not scored.** No term for days taken or arrival date exists in the code [A2-code], although some secondary sources claim speed counts (e.g. [GiantBomb]) **(those claims appear wrong for 1985/1990)**. Speed matters only indirectly through food eaten and risk exposure.
* **Rating:** 6,000+ = "Trail guide", 3,000 to 5,999 = "Adventurer", under 3,000 = "Greenhorn" [A2-code] (`WIN` line 630).
* **Example:** a banker arriving with 5 people in good health (2,500), the wagon (50), 6 oxen (24), 3 parts (6), 4 clothes (8), 200 bullets (4), 300 lb food (12) and $100 (20) scores 2,624, a Greenhorn. The same arrival as a farmer scores 7,872, a Trail guide [my arithmetic]. **People dominate the score, so keeping the family alive and resting before the finish is the core strategy.** Players do this: "We rest up to good health - this makes a big difference in your final score" [DDG-won].
* The scoring screen explains itself: "Your most important resource is the people you have with you... you receive more points if they arrive in good health!" and "The resources you arrive with will help you get started in the new land." [A2-code] [DOS-exe]

### 14.2 The Oregon Top Ten

* The list is pre-populated with historical trail names over a wide spread of scores "as another motivator" [B-imagine]. Original list on the v1.4 disk [A2-code] (`HISCORE.SEQ`):

| Name | Points | Rating |
|---|---|---|
| Stephen Meek | 7,650 | Trail guide |
| David Hastings | 5,694 | Adventurer |
| Andrew Sublette | 4,138 | Adventurer |
| Celinda Hines | 2,945 | Greenhorn |
| Ezra Meeker | 2,052 | Greenhorn |
| William Vaughn | 1,401 | Greenhorn |
| Mary Bartlett | 937 | Greenhorn |
| William Wiggins | 615 | Greenhorn |
| Charles Hopper | 396 | Greenhorn |
| Elijah White | 250 | Greenhorn |

* The October 1985 manual's screenshot shows a slightly different bottom of the list ("Joshua ..." 960, Charles Hopper 527) [Manual-1985]. The 1990 DOS list has the same names and scores with a different name order at the top (Celinda Hines second) [DOS-exe]. **(Minor version differences.)**
* If you beat the 10th score: "Congratulations! Type your name as you would like to see it on the Oregon Top Ten list." Otherwise: "You have accumulated N points. This is not enough to qualify for the Oregon Top Ten." [A2-code] The list is saved to disk, like tombstones. The archived DOS copy still carries players' entries such as "Jiffer Lawson" and "Kevin Kriebel" [DOS-exe].
* The main menu offers "3. See the Oregon Top Ten", where players can also see how points are earned [A2-code] [Manual-1985].
* The menu blurb encourages replay: "If for some reason you don't survive -- your wagon burns, or thieves steal your oxen, or you run out of provisions, or you die of cholera -- don't give up! Try again...and again...until your name is up with the others on The Oregon Top Ten." [A2-code] [DOS-exe]
* 1971/1978: no score; you just got a congratulations note from President Polk [1978-src] [B-imagine].

---

## 15. UI and presentation

### 15.1 Screen layout and art

* Apple II hi-res: 280x192 with six colors. Bouchard notes the hunting game was hard "on the Apple II, which had only six colors and a fairly low resolution" [B-hunt].
* DOS 1990: separate CGA (4-color) and MCGA/VGA 256-color art sets (`OTCGA.PCL`, `OTMCGA.PCL`), requiring at least 512K and CGA [DOS-exe]. Its art was redrawn with a different palette [B-history].
* Recurring screen grammar [A2-code]:
  * Black backgrounds.
  * White text in bordered boxes: a 3-pixel double-line frame with rounded corners, drawn over the current scene.
  * Inverse (highlighted) title bars for place name and date.
  * Large color pictures for landmarks; small icons and sprites for travel.
* Typography: a custom proportional bitmap font on the Apple (the code switches text spacing with an `&HSP` routine) [A2-code] **(interpretation)**; an 8x8 bitmap font file in DOS (`BIT8X8.GFT`) [DOS-exe]. Text is mixed case, plain and sentence-length.
* The travel screen is the brand: "when people think of The Oregon Trail, the first image that comes to mind is usually the travel screen" [B-travel].

### 15.2 Sound

* Period melodies at landmarks, an Apple II one-voice beeper (DOS stores the tunes as music strings in `SONGS.TXT`) [B-imagine] [DOS-exe].
* Sound on/off from the main menu or Control-S at any time [A2-code] [Manual-1985].
* Short beep sequences for crashes in the raft game [A2-code].

### 15.3 Input methods

* Almost everything is a **single keypress from a numbered menu**: "What is your choice?" [A2-code]
* Y/N questions accept Y or N [A2-code].
* "Press SPACE BAR to continue" after nearly every message [A2-code] [Manual-1985].
* Return/Enter to "size up the situation" on the travel screen [A2-code].
* Typed input only for names, quantities at the store, epitaphs and the Top Ten name [A2-code].
* Arrow keys and space bar in the two arcade games; joystick optional in DOS [DOS-exe].

### 15.4 Chunking and pacing of information

* **One message per box, one box per keypress.** Event text is 1 to 2 lines ("Broken wagon axle. Would you like to try to repair it?", "Find wild fruit.", "Bad water") [A2-code].
* **Time-cost events state the cost** in the same sentence ("Lose trail. Lose 3 days.") [A2-code] (line 550).
* **Status is always five numbers** on the travel screen, and the full state (weather, health, pace, rations) heads every menu [A2-code].
* **Health is a word, not a number** (good/fair/poor/very poor), which hides the formula but keeps it legible [A2-code].
* **The animation is constant feedback:** Bouchard says that with the alpha's data-only screen, watching was "rather boring". With the ox animation, "Instead of being bored with this screen, kids paid very close attention to it... most kids watch the animation more closely than the data, but at least they remain fully engaged." [B-travel]
* **Days tick about every 2 seconds** [B-travel]. A 12-mile-per-day mountain segment of 160 miles is about 13 days, so roughly 30 seconds of watching between decisions.

### 15.5 The iconic text

* In the 1985/1990 code, illness messages are "[Name] has dysentery." and deaths are "[Name] has died." [A2-code] [DOS-exe]. The meme "You have died of dysentery" is now on T-shirts [WP-series]; see the caveat in section 5.3.
* Other remembered lines: "you were only able to carry 100 pounds back to the wagon", "Here lies...", "Press SPACE BAR to continue", "The trail divides here." [A2-code]

---

## 16. Play length and number of decisions

* **Design target** about 40 minutes [B-imagine]. **Manual estimate** at least 25 minutes alone [Manual-1985]. In-game, about 150 days [B-imagine].
* **1971/1978:** about 12 to 14 two-week turns, each with two decisions (hunt? eat how well?) plus timed shooting [B-early] [DDG-410]. A competent player finishes the 1978 version "in less than two minutes" after the first turns [DDG-410].
* **Rough decision count for a 1985/1990 game (my estimate from the code's flow):**
  * Setup: about 12 to 20 inputs (occupation, 5 names, month, 5 to 8 store lines).
  * Landmarks: about 16 "look around?" answers plus menu choices at each (talk, buy, rest, pace).
  * River crossings: 4 decisions, often with waits or extra information.
  * Route forks: 3.
  * Event responses: about 5 to 15 (repair Y/N, gravesite Y/N and so on).
  * Voluntary stops between landmarks: about 10 to 30 for rest, hunting, rations and pace.
  * Total: about 60 to 100 inputs in a careful game, of which perhaps 25 to 40 are meaningful tradeoffs. Unplanned deaths often end it early, which encourages replay.
* **Arcade segments:** hunting, as often as the player wants at 1 day each, and the single rafting run [B-hunt] [B-raft].

---

## 17. Version differences at a glance

| Aspect | 1971/1975/1978 BASIC | 1985 Apple II / 1990 DOS | Deluxe 1992 (DOS/Mac), Windows 1993 | 2021 Gameloft remake |
|---|---|---|---|---|
| Structure | 2-week turns, 2,040 mi, no geography [1978-src] | 16 landmark segments + daily cycle [B-imagine] | same models and structure, mouse interface, "augmented details" [B-history] | party of 4 with professions, skills and traits; 15 "journeys" (story, survival, challenge) [WGG-party] [WGG-journeys] |
| Money and difficulty | $700 fixed; shooting skill self-rated [1978-src] | banker/carpenter/farmer, $1,600/$800/$400, x1/x2/x3 [A2-code] | same [B-history] | professions give items and skills; in-game Banker gives $50 [WGG-party] |
| Health | no persistent health; medicine and $20 doctor [1978-src] | hidden 0 to 140 party value + named diseases [A2-code] | same model [B-history] | per-character health, morale, injuries like gunshot wounds, burns, starvation [WGG-ill] |
| Hunting | type BANG/BLAM/POW/WHAM fast [1978-src] | 8-direction keyboard arcade, 100 lb carry [B-hunt] | mouse crosshair, 200 lb (if 2+ alive) [WP-series] [B-hunt] | hunting and fishing minigames [WGG-2021] |
| Rivers | random "swamped" event [1978-src] | ford/float/ferry/guide with depth model [A2-code] | same [B-history] | present |
| Native peoples | "hostile riders" fights, helpful Indians event [1978-src] | no attacks; trade, guide, monologues [Manual-1985] | same | Native playable characters and storylines; consultants; opening message "not an adventure but an invasion" [KQED] [WP-series] |

The 1971 team's own reflection on attacks, Bill Heinemann: "If any students of Native American ancestry played the game (and I'm sure there were plenty), they would be put in the position of constantly battling themselves." [Vice]

---

## What drives engagement (with evidence)

1. **Your classmates are the cast.** Requiring four named companions was a deliberate personalization device [B-imagine]. The manual's classroom model makes the five names the five students on the team [Manual-1985]. Players widely remember naming parties after friends [Upworthy]. The leader-protection rule makes the group's own name the one on the tombstone [A2-code]. *For Westward:* name the party after the 4 students at the laptop plus one, and let each student "own" a character.

2. **Shared failure is a story, not a fail state.** Deaths are terse, personal, and often absurd ("Zeke has died."). Total failure yields a tombstone and an epitaph, which Bouchard designed to "compensate for the player's failure" [B-imagine]. The 1970s version already used gallows humor (the Aunt Sadie funeral letter) [1978-src]. Twenty-five years of "you have died of dysentery" memes are themselves evidence that failure stories travel [WP-series].

3. **Persistence across players (tombstones and the Top Ten).** "The real hook is that we store the tombstone data on the game disk" [B-imagine]. Archived disks still hold students' graffiti epitaphs and Top Ten names decades later [A2-code] [DOS-exe]. *For Westward:* a class-wide graveyard and leaderboard (shared state) would recreate this.

4. **Visible progress with constant motion.** The ox animation kept kids' attention where a data screen bored them [B-travel]. Landmarks give a goal every few minutes, and arrival gets a full-screen reward [B-travel] [B-imagine].

5. **Readable scarcity tradeoffs.** Pace vs health, rations vs food, money now vs later at 25% mark-ups, spares vs food, ferry cost and wait vs ford risk, shortcut vs fort. Each is one menu choice with a visible consequence [A2-code]. The steady-state health rule (H settles at 10x daily load) makes those tradeoffs learnable by feel [A2-code] [DDG-better]. Bouchard aimed for a game where players "succeed in more than one way" [B-imagine].

6. **Unpredictability that is mostly fair.** Events are tied to place, weather and season, and most have a counter-play: spares for breakdowns, clothes for cold, rest for illness, trade as a last resort [A2-code] [Manual-1985]. Players who learn the system can win reliably, but "nothing can completely safeguard you" [DDG-better]. Rawitsch built event odds from real diaries [Smithsonian] [B-history].

7. **Skill breaks: hunting and rafting.** Hunting was the best-known and most-loved part from 1980 on [B-hunt]. It is a real arcade skill that kids master in 3 or 4 tries [B-hunt]. River crossings are "the second most exciting part" [B-rivers]. Rafting was revived specifically to avoid an anticlimactic ending [B-raft]. *For Westward:* short skill interludes between decision stretches.

8. **Ethical nudges without lectures.** The 100-lb carry limit made kids discuss waste and limit their shooting, without any text telling them to [B-hunt]. Monologues seed the hints and the multiple perspectives [DOS-exe] [Manual-1985]. Bouchard's principle: education and entertainment should both come "from immersing the player in a historically accurate experience" [B-imagine] [WP-1985].

9. **Reading for survival and group roles.** Heinemann: "I remember watching 7th and 8th grade kids improve in reading. Their 'lives' depended on it." Rawitsch: "Each group found the best typist and sat him or her in front of the teletype." Dillenberger: "kids would gather around to watch what was typed out on the paper." [Vice] The 1971 game was played by teams taking turns, and kids kept playing on their own time [B-early].

10. **Score competition with a visible target.** The pre-filled historical leaderboard and the occupation multiplier invite "farmer mode" bragging rights [B-imagine] [DDG-412]. Ratings (Greenhorn, Adventurer, Trail guide) give labels to beat [A2-code].

11. **Short, legible feedback loops.** One-line messages, a single keypress, five status lines and a stated time cost for each mishap [A2-code]. This suits shared screens where four students read together.

---

## Criticisms and pitfalls

1. **Portrayal of Native Americans and the settler frame.**
   * The 1985/1990 game removed attacks and included trade, guides and Native monologues that voice displacement (Arapaho, Shoshoni, Cayuse) [Manual-1985] [DOS-exe]. But Native people still appear mainly as helpers, guides and traders in a story about white emigrants, and the player is always a settler [ICT] [WP-series].
   * Educator Bill Bigelow (1997) criticized the series' "insensitivity to Indian cultures": "It's a white thing...you can't choose your race. If you play the game, you are white." He called its ideology individualistic, with players "oblivious to the mayhem and misery" of the westward trek. His critique targeted later editions, including Oregon Trail II [ICT] [UO-curriculum].
   * Some monologues use dated diction ("Indians", "a Sioux brave") [DOS-exe]. Later commercial spin-offs used war-bonnet and tomahawk stereotypes [ICT].
   * The 2021 remake opens by acknowledging earlier versions failed to portray Native "presence, point of view, and cultures respectfully", stating "For Indigenous Peoples, westward expansion was not an adventure but an invasion." It added Native playable characters and storylines with consultants including Margaret Huettl and David Lewis (Confederated Tribes of Grand Ronde) [KQED] [WP-series]. A Native former student recalled discomfort seeing Indigenous people as antagonists in older versions [KQED].
   * Both Bigelow and Rawitsch advise using the game as a "springboard to other resources" [ICT].

2. **Death as a joke.** The humor (upside-down animals, tombstone graffiti, "has died" with no ceremony) is a big engagement driver [B-hunt] [B-imagine]. But it can trivialize real mortality from cholera, drowning and starvation, which the in-game widow's monologue treats seriously [DOS-exe]. Epitaph fields invite inappropriate graffiti (the archived disks show juvenile examples) [A2-code] [DOS-exe]. *Pitfall for a classroom browser game:* moderate free-text epitaphs or offer preset ones.

3. **Historical simplifications acknowledged by the designer.**
   * One ox and a lone wagon on the travel screen, when emigrants used several yoke and traveled in trains [B-travel].
   * Only 4 rivers modeled [B-rivers].
   * A guide who never waits or refuses [B-rivers].
   * The rafting game is cheap and its losses are "out of whack" [B-raft].
   * Trading is "a pale shadow" of the plan [B-imagine].
   * Bouchard called the lack of complex interactions with Native Americans "his biggest regret" [WP-1985].

4. **Simplifications I found in the code:**
   * Party health is a single shared number, and everyone's arrival points use it [A2-code].
   * Score ignores time, so a slow, safe crawl is never penalized beyond food [A2-code].
   * Resting and hunting suspend all random events, which experts exploit: "Don't rest - hunt instead" [A2-code] [DDG-412].
   * Trading is always at or below store value [A2-code].
   * The manual's model summary (e.g. mountains x0.5, illness odds up to 40%) does not exactly match the code (x0.6, about 10% per day) [Manual-1985] [A2-code].

5. **Randomness can feel unfair.** A thief can steal all your bullets and doom a farmer; spontaneous deaths happen even in good health [DDG-better]. Some critics found the old BASIC version too easy: "I did not need to make difficult decisions even once" [DDG-410].

6. **What it teaches.** A blogger's verdict on the 1985 game: "As a history lesson, it just works... students can immerse themselves... without being lectured to." But "the space of gameplay possibilities... is pretty small. You either make it to Oregon or you don't." [DDG-better] Another view: kids "spend the entire session hunting buffalo and squirrels. Either way, little history was learned" [DDG-410].

---

## Source list

* **[A2-code]** *The Oregon Trail* v1.4 (MECC A-157, 1985), Apple II disk images (4am crack), archive.org: https://archive.org/details/MECC_A157_v14_4amCrack. BASIC programs by John Krenz (main, store, menu, win), Steven Splinter (`FLOAT`). Decompiled for this report.
* **[DOS-exe]** *The Oregon Trail* (MECC, MS-DOS 1990, "Version 2.0"), archive.org: https://archive.org/details/msdos_Oregon_Trail_The_1990. `OREGON.EXE` unpacked; `DIALOGS.REC`, `HISCORES.REC`, `TOMB.REC` read.
* **[Manual-1985]** MECC, *The Oregon Trail* teacher's manual, October 1985 (incl. Appendix B "Summary of the Underlying Model"): https://archive.org/details/MECC_a-157_oregon_trail. Second scan: https://archive.org/details/A2_MECC_A157_The_Oregon_Trail_manual
* **[B-imagine]** R. Philip Bouchard, "Imagining the New 1985 Design": https://www.died-of-dysentery.com/stories/imagining-appleII.html
* **[B-travel]** Bouchard, "The Travel Screen": https://www.died-of-dysentery.com/stories/travel-screen.html
* **[B-hunt]** Bouchard, "The Hunting Activity": https://www.died-of-dysentery.com/stories/hunting.html
* **[B-rivers]** Bouchard, "Crossing Rivers": https://www.died-of-dysentery.com/stories/crossing-rivers.html
* **[B-store]** Bouchard, "Matt's General Store": https://www.died-of-dysentery.com/stories/matts-store.html
* **[B-raft]** Bouchard, "Rafting Down the Columbia River": https://www.died-of-dysentery.com/stories/rafting-columbia.html
* **[B-early]** Bouchard, "The Earliest Versions of the Game": https://www.died-of-dysentery.com/stories/early-versions.html
* **[B-history]** Bouchard, "A Brief History of the Oregon Trail Game": https://www.died-of-dysentery.com/stories/brief-history.html
* **[1978-src]** Rawitsch, Heinemann and Dillenberger, OREGON, as published in *Creative Computing* May-June 1978; character-exact transcription with the magazine PDF: https://github.com/zstauber/oregon (file `info/source.bas`)
* **[moral]** moralrecordings, "Can you complete the Oregon Trail if you wait at a river for 14272 years" (independent decompile of the health code): https://moral.net.au/writing/2025/01/11/waiting_for_oregon/
* **[DDG-410]** Data Driven Gamer, "Game 410: Oregon" (1975/1978 versions): https://datadrivengamer.blogspot.com/2024/05/game-410-oregon.html
* **[DDG-412]** Data Driven Gamer, "Game 412: The Oregon Trail": https://datadrivengamer.blogspot.com/2024/05/game-412-oregon-trail.html
* **[DDG-won]** Data Driven Gamer, "The Oregon Trail: Won!": https://datadrivengamer.blogspot.com/2024/05/the-oregon-trail-won.html
* **[DDG-better]** Data Driven Gamer, "The Oregon Trail: Won better!": https://datadrivengamer.blogspot.com/2024/05/the-oregon-trail-won-better.html
* **[PerfectPacman]** "Is there a 'perfect game' of Oregon Trail?": https://perfectpacman.com/2025/08/23/oregon-trail/
* **[UG-wiki]** Ultimate Gaming wiki, "The Oregon trail" (fort prices): https://ultimate-gaming.fandom.com/wiki/The_Oregon_trail
* **[WP-1985]** Wikipedia, "The Oregon Trail (1985 video game)": https://en.wikipedia.org/wiki/The_Oregon_Trail_(1985_video_game)
* **[WP-series]** Wikipedia, "The Oregon Trail (series)": https://en.wikipedia.org/wiki/The_Oregon_Trail_(series)
* **[GiantBomb]** Giant Bomb, "The Oregon Trail": https://www.giantbomb.com/the-oregon-trail/3030-17852/
* **[Vice]** Vice, "The Forgotten History of 'The Oregon Trail,' As Told By Its Creators": https://www.vice.com/en/article/the-forgotten-history-of-the-oregon-trail-as-told-by-its-creators/
* **[Smithsonian]** Smithsonian Magazine, "How You Wound Up Playing The Oregon Trail in Computer Class": https://www.smithsonianmag.com/innovation/how-you-wound-playing-em-oregon-trailem-computer-class-180959851/
* **[KQED]** KQED MindShift / NPR, "An Updated Oregon Trail Gives Native Americans Better Representation": https://www.kqed.org/mindshift/57853/an-updated-oregon-trail-gives-native-americans-better-representation
* **[ICT]** ICT News, "'It's a White Thing': Oregon Trail Game Doesn't Tell Complete History": https://ictnews.org/archive/white-thing-oregon-trail-game-doesnt-tell-complete-history/
* **[UO-curriculum]** University of Oregon, Oregon Trail Curriculum Project: https://blogs.uoregon.edu/otcurriculumproject/?p=62
* **[Upworthy]** Upworthy, "Millennial teacher shares Oregon Trail with her Gen Alpha students": https://www.upworthy.com/millennial-teacher-shares-oregon-trail-with-her-gen-alpha-students-and-the-trauma-is-real
* **[WGG-2021]** Oregon Trail Wiki (wiki.gg), "The Oregon Trail (2021)": https://oregontrail.wiki.gg/wiki/The_Oregon_Trail_(2021)
* **[WGG-party]** Oregon Trail Wiki (wiki.gg), "Party": https://oregontrail.wiki.gg/wiki/Party
* **[WGG-journeys]** Oregon Trail Wiki (wiki.gg), "Journeys": https://oregontrail.wiki.gg/wiki/Journeys
* **[WGG-ill]** Oregon Trail Wiki (wiki.gg), "Illness and Injuries": https://oregontrail.wiki.gg/wiki/Illness_and_Injuries

[A2-code]: https://archive.org/details/MECC_A157_v14_4amCrack
[DOS-exe]: https://archive.org/details/msdos_Oregon_Trail_The_1990
[Manual-1985]: https://archive.org/details/MECC_a-157_oregon_trail
[B-imagine]: https://www.died-of-dysentery.com/stories/imagining-appleII.html
[B-travel]: https://www.died-of-dysentery.com/stories/travel-screen.html
[B-hunt]: https://www.died-of-dysentery.com/stories/hunting.html
[B-rivers]: https://www.died-of-dysentery.com/stories/crossing-rivers.html
[B-store]: https://www.died-of-dysentery.com/stories/matts-store.html
[B-raft]: https://www.died-of-dysentery.com/stories/rafting-columbia.html
[B-early]: https://www.died-of-dysentery.com/stories/early-versions.html
[B-history]: https://www.died-of-dysentery.com/stories/brief-history.html
[1978-src]: https://github.com/zstauber/oregon
[moral]: https://moral.net.au/writing/2025/01/11/waiting_for_oregon/
[DDG-410]: https://datadrivengamer.blogspot.com/2024/05/game-410-oregon.html
[DDG-412]: https://datadrivengamer.blogspot.com/2024/05/game-412-oregon-trail.html
[DDG-won]: https://datadrivengamer.blogspot.com/2024/05/the-oregon-trail-won.html
[DDG-better]: https://datadrivengamer.blogspot.com/2024/05/the-oregon-trail-won-better.html
[PerfectPacman]: https://perfectpacman.com/2025/08/23/oregon-trail/
[UG-wiki]: https://ultimate-gaming.fandom.com/wiki/The_Oregon_trail
[WP-1985]: https://en.wikipedia.org/wiki/The_Oregon_Trail_(1985_video_game)
[WP-series]: https://en.wikipedia.org/wiki/The_Oregon_Trail_(series)
[GiantBomb]: https://www.giantbomb.com/the-oregon-trail/3030-17852/
[Vice]: https://www.vice.com/en/article/the-forgotten-history-of-the-oregon-trail-as-told-by-its-creators/
[Smithsonian]: https://www.smithsonianmag.com/innovation/how-you-wound-playing-em-oregon-trailem-computer-class-180959851/
[KQED]: https://www.kqed.org/mindshift/57853/an-updated-oregon-trail-gives-native-americans-better-representation
[ICT]: https://ictnews.org/archive/white-thing-oregon-trail-game-doesnt-tell-complete-history/
[UO-curriculum]: https://blogs.uoregon.edu/otcurriculumproject/?p=62
[Upworthy]: https://www.upworthy.com/millennial-teacher-shares-oregon-trail-with-her-gen-alpha-students-and-the-trauma-is-real
[WGG-2021]: https://oregontrail.wiki.gg/wiki/The_Oregon_Trail_(2021)
[WGG-party]: https://oregontrail.wiki.gg/wiki/Party
[WGG-journeys]: https://oregontrail.wiki.gg/wiki/Journeys
[WGG-ill]: https://oregontrail.wiki.gg/wiki/Illness_and_Injuries
