// Westward: the four families. One per group, assigned by the teacher.
// "route" is "trail" (overland from Independence) or "sea" (ship to San Francisco).
// Members are listed in role order: navigator, quartermaster, journal, doctor.
// "look" (man, woman, youth, girl, laborer) and "color" (clothing) shape the
// little figures who walk beside the wagon in the diorama.
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
      { name: "Samuel", role: "navigator", age: 40, look: "man", color: "#3e4a5e" },
      { name: "James", role: "quartermaster", age: 16, look: "youth", color: "#6a4b33" },
      { name: "Ruth", role: "journal", age: 14, look: "girl", color: "#6b8fb3" },
      { name: "Martha", role: "doctor", age: 37, look: "woman", color: "#8f5a48" }
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
      { name: "Patrick", role: "navigator", age: 38, look: "man", color: "#4f5a3e" },
      { name: "Michael", role: "quartermaster", age: 17, look: "youth", color: "#6b5a44" },
      { name: "Nora", role: "journal", age: 13, look: "girl", color: "#5f8f96" },
      { name: "Bridget", role: "doctor", age: 35, look: "woman", color: "#7a4a52" }
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
      { name: "Isaac", role: "navigator", age: 41, look: "man", color: "#5a4636" },
      { name: "Daniel", role: "quartermaster", age: 16, look: "youth", color: "#3e4a5e" },
      { name: "Clara", role: "journal", age: 12, look: "girl", color: "#c9a54e" },
      { name: "Hannah", role: "doctor", age: 36, look: "woman", color: "#5f6f8f" }
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
      { name: "Ah Sing", role: "navigator", age: 24, look: "laborer", color: "#4a5a6e" },
      { name: "Kwok", role: "quartermaster", age: 22, look: "laborer", color: "#5f6a5a" },
      { name: "Fook", role: "journal", age: 19, look: "laborer", color: "#3e4a5e" },
      { name: "Yau", role: "doctor", age: 27, look: "laborer", color: "#6a5a4a" }
    ],
    draft: true
  }
];
