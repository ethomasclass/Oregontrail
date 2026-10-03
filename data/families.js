// Westward: the four families. One per group, assigned by the teacher.
// "route" is "trail" (overland from Independence) or "sea" (ship to San Francisco).
// Members are listed in role order: navigator, quartermaster, journal, doctor.
window.WESTWARD = window.WESTWARD || {};

WESTWARD.families = [
  {
    id: "ohio",
    name: "The Carver family",
    short: "Carvers",
    from: "A farm in Ohio",
    route: "trail",
    startDate: "1849-05-01",
    startPlace: "independence",
    money: 600,
    summary: "You sold the farm in Ohio. You start with the most money and the best odds.",
    rules: "The classic journey. Nobody questions your right to be here.",
    members: [
      { name: "Samuel", role: "navigator", age: 40 },
      { name: "James", role: "quartermaster", age: 16 },
      { name: "Ruth", role: "journal", age: 14 },
      { name: "Martha", role: "doctor", age: 37 }
    ],
    draft: true
  },
  {
    id: "irish",
    name: "The Doyle family",
    short: "Doyles",
    from: "Irish Catholic immigrants, by way of St. Louis",
    route: "trail",
    startDate: "1849-05-01",
    startPlace: "independence",
    money: 300,
    summary: "You left Ireland during the famine and worked in St. Louis to save for this trip. Your budget is tight.",
    rules: "Less money. Some emigrants distrust Irish Catholics.",
    members: [
      { name: "Patrick", role: "navigator", age: 38 },
      { name: "Michael", role: "quartermaster", age: 17 },
      { name: "Nora", role: "journal", age: 13 },
      { name: "Bridget", role: "doctor", age: 35 }
    ],
    draft: true
  },
  {
    id: "black",
    name: "The Bell family",
    short: "Bells",
    from: "A free Black family from Missouri",
    route: "trail",
    startDate: "1849-05-01",
    startPlace: "independence",
    money: 450,
    summary: "You are free, and you carry papers to prove it. Missouri is a slave state, so you keep those papers close.",
    rules: "The same trail, with extra scrutiny at every stop.",
    members: [
      { name: "Isaac", role: "navigator", age: 41 },
      { name: "Daniel", role: "quartermaster", age: 16 },
      { name: "Clara", role: "journal", age: 12 },
      { name: "Hannah", role: "doctor", age: 36 }
    ],
    draft: true
  },
  {
    id: "chinese",
    name: "The Chan cousins",
    short: "Chan cousins",
    from: "Four cousins from Guangdong, China",
    route: "sea",
    startDate: "1852-03-01",
    startPlace: "hongkong",
    money: 60,
    summary: "Your village pooled money and borrowed more so you could sail to Gold Mountain. You owe that debt.",
    rules: "You skip the trail. You cross the Pacific and play the California half.",
    members: [
      { name: "Ah Sing", role: "navigator", age: 24 },
      { name: "Kwok", role: "quartermaster", age: 22 },
      { name: "Fook", role: "journal", age: 19 },
      { name: "Yau", role: "doctor", age: 27 }
    ],
    draft: true
  }
];
