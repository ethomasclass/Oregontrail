// Westward: game settings.
// Teachers can change these numbers without touching the game code.
window.WESTWARD = window.WESTWARD || {};

WESTWARD.config = {
  title: "Westward",
  subtitle: "A family, a wagon, and a promise",

  // Pacing (minutes from the moment a group picks its family).
  totalMinutes: 40,
  // How far behind schedule a group can fall before optional stops are skipped.
  slackMinutes: 1.5,

  // Trail events between stops (data/trail-events.js). Each one takes a group about
  // eventMinutes; a group only meets them when it is ahead of schedule.
  maxTripEvents: 2,
  maxEventsPerRun: 8,
  eventMinutes: 0.4,
  eventReserveMinutes: 1.0,
  minutesPerStop: 2.8,   // how long a group usually spends on one stop
  eventChance: 0.85,
  // How long the wagon takes to cross between stops on screen (seconds).
  travelSeconds: { min: 4, max: 8, per100Miles: 0.8 },

  // No early game over: at most this many family members can die in one run.
  maxDeaths: 2,

  // Travel and supplies (DRAFT numbers, verify against the fact sheet).
  milesPerDay: 15,
  foodPerPersonPerDay: 2, // pounds
  minOxen: 4,

  // Title painting (your version of Gast's "American Progress"). Put the image file
  // in assets/ and set its path here, for example "assets/american-progress.jpg".
  // It appears on the title screen and again at the end of the game.
  titleImage: null,

  // Show a small "DRAFT" stamp on any text not yet checked against sources.
  showDraftStamps: true
};

// The four student jobs. The mouse rotates between them.
WESTWARD.roles = [
  { id: "navigator", name: "Navigator", job: "Route choices: river crossings, shortcuts, the fork." },
  { id: "quartermaster", name: "Quartermaster", job: "Money and supplies. Leads every trade." },
  { id: "journal", name: "Journal keeper", job: "Reads diary voices aloud. Fills in the handout." },
  { id: "doctor", name: "Family doctor", job: "Health events: sickness and accidents." }
];
