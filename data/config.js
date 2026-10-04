// Westward: game settings.
// Teachers can change these numbers without touching the game code.
window.WESTWARD = window.WESTWARD || {};

WESTWARD.config = {
  title: "Westward",
  subtitle: "A family, a wagon, and a promise",

  // Pacing (minutes from the moment a group picks its family).
  totalMinutes: 40,
  // How far behind schedule a group can fall before optional stops are skipped.
  slackMinutes: 0.5,

  // Trail events between stops (data/trail-events.js). Each one takes a group about
  // eventMinutes; a group only meets them when it is ahead of schedule.
  maxTripEvents: 2,
  maxEventsPerRun: 6,
  eventMinutes: 0.4,
  eventReserveMinutes: 1.0,
  // How long a group usually spends at each kind of stop (minutes).
  minutesByType: { store: 3, card: 2.4, draw: 2.4, fork: 2, river: 1.6, landmark: 1.2, ending: 0 },
  // The journey between stops on screen: travel, the arrival title, any build-up.
  travelMinutesPerLeg: 0.3,
  eventChance: 0.85,
  // How long the wagon takes to cross between stops on screen (seconds).
  travelSeconds: { min: 8, max: 12, per100Miles: 1.1 },

  // Illness, after the 1985 Oregon Trail: the daily chance is illnessBase plus
  // health / illnessPerH (the original used 0.01 and 1500, and +20 health load per
  // illness). Gentler here, because a class plays once instead of restarting.
  illnessBase: 0.006,
  illnessPerH: 2200,
  illnessHardship: 12,

  // No early game over: at most this many family members can die in one run.
  maxDeaths: 2,

  // Travel (the 1985 Oregon Trail's numbers): miles a day at a steady pace,
  // 20 on the plains and 12 from Fort Laramie on. Pace multiplies it.
  milesPerDayPlains: 20,
  milesPerDayMountains: 12,
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
  { id: "navigator", name: "Navigator", job: "Picks the route: how to cross rivers, whether to take shortcuts, and which way to go where the trail splits." },
  { id: "quartermaster", name: "Quartermaster", job: "In charge of money and supplies. Leads every trade." },
  { id: "journal", name: "Journal keeper", job: "Reads the diary quotes and voices out loud. Fills in the handout." },
  { id: "doctor", name: "Family doctor", job: "Handles health problems, like sickness and injuries." }
];
