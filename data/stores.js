// Westward: outfitting stores. Prices are DRAFT until verified.
// "stat" is the game value an item adds to; "per" is how much one purchase adds.
window.WESTWARD = window.WESTWARD || {};

WESTWARD.stores = {
  independence: {
    title: "Outfitting in Independence",
    intro: "Your wagon is bought. Now the Quartermaster spends the rest. Guidebooks say to buy plenty of food and at least two yoke of oxen.",
    items: [
      { id: "oxen", name: "Yoke of oxen (2 oxen)", price: 50, stat: "oxen", per: 2, min: 2, recommended: 3, max: 4 },
      { id: "flour", name: "Flour, 100 lb sack", price: 4, stat: "food", per: 100, recommended: 6, max: 10 },
      { id: "bacon", name: "Bacon, 50 lb", price: 5, stat: "food", per: 50, recommended: 6, max: 10 },
      { id: "parts", name: "Spare wheel and axle", price: 15, stat: "parts", per: 1, recommended: 1, max: 3 },
      { id: "medicine", name: "Medicine chest", price: 10, stat: "medicine", per: 1, recommended: 1, max: 2 },
      { id: "trade", name: "Trade goods (cloth, tools)", price: 10, stat: "trade", per: 1, recommended: 2, max: 4 }
    ],
    draft: true
  },
  hongkong: {
    title: "Leaving from Hong Kong",
    intro: "Your passage is paid on credit. You must repay it from what you earn in California. The Quartermaster decides what else to bring.",
    items: [
      { id: "rice", name: "Rice and dried fish for the voyage", price: 4, stat: "food", per: 50, min: 1, recommended: 2, max: 4 },
      { id: "medicine", name: "Herbal medicines", price: 5, stat: "medicine", per: 1, recommended: 1, max: 2 },
      { id: "tools", name: "Mining tools (pan and rocker)", price: 12, stat: "parts", per: 1, min: 1, recommended: 1, max: 2 },
      { id: "trade", name: "Goods to sell in California", price: 10, stat: "trade", per: 1, recommended: 1, max: 3 }
    ],
    draft: true
  }
};
