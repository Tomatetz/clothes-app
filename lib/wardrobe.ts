export type ClothingSlot = "top" | "outerTop" | "bottom" | "shoes" | "bag";

export type WardrobeItem = {
  id: string;
  name: string;
  category: string;
  brand: string;
  imageUrl: string;
  slots: ClothingSlot[];
};

export const slotLabels: Record<ClothingSlot, string> = {
  top: "Top",
  outerTop: "Layer",
  bottom: "Bottom",
  shoes: "Shoes",
  bag: "Bag"
};

export const categories = [
  "Coats",
  "Down Jackets",
  "Fur & Shearling",
  "Jackets",
  "Jeans",
  "Knitwear",
  "Overalls & Jumpsuits",
  "Pants",
  "Shirts",
  "Shorts",
  "Skirts",
  "Sweatshirts",
  "T-Shirts",
  "Underwear",
  "Sneakers",
  "Boots",
  "Loafers",
  "Bags",
  "Backpacks"
];

export const defaultSlotByCategory: Record<string, ClothingSlot[]> = {
  Coats: ["top", "outerTop"],
  "Down Jackets": ["top", "outerTop"],
  "Fur & Shearling": ["top", "outerTop"],
  Jackets: ["top", "outerTop"],
  Jeans: ["bottom"],
  Knitwear: ["top", "outerTop"],
  "Overalls & Jumpsuits": ["top", "bottom"],
  Pants: ["bottom"],
  Shirts: ["top", "outerTop"],
  Shorts: ["bottom"],
  Skirts: ["bottom"],
  Sweatshirts: ["top", "outerTop"],
  "T-Shirts": ["top"],
  Underwear: ["top", "bottom"],
  Sneakers: ["shoes"],
  Boots: ["shoes"],
  Loafers: ["shoes"],
  Bags: ["bag"],
  Backpacks: ["bag"]
};

export const starterItems: WardrobeItem[] = [
  {
    id: "sample-jumpsuit",
    name: "Denim Utility Jumpsuit",
    category: "Overalls & Jumpsuits",
    brand: "Ader",
    imageUrl: "/samples/jumpsuit.svg",
    slots: ["top", "bottom"]
  },
  {
    id: "sample-knit",
    name: "Rib Knit Sweater",
    category: "Knitwear",
    brand: "COS",
    imageUrl: "/samples/knitwear.svg",
    slots: ["top", "outerTop"]
  },
  {
    id: "sample-wool-coat",
    name: "Camel Wool Coat",
    category: "Coats",
    brand: "Max Mara",
    imageUrl: "/samples/coat.svg",
    slots: ["top", "outerTop"]
  },
  {
    id: "sample-down-jacket",
    name: "Silver Down Jacket",
    category: "Down Jackets",
    brand: "Uniqlo",
    imageUrl: "/samples/down-jacket.svg",
    slots: ["top", "outerTop"]
  },
  {
    id: "sample-shearling",
    name: "Cropped Shearling",
    category: "Fur & Shearling",
    brand: "Acne Studios",
    imageUrl: "/samples/shearling.svg",
    slots: ["top", "outerTop"]
  },
  {
    id: "sample-leather-jacket",
    name: "Black Leather Jacket",
    category: "Jackets",
    brand: "AllSaints",
    imageUrl: "/samples/jacket.svg",
    slots: ["top", "outerTop"]
  },
  {
    id: "sample-white-shirt",
    name: "White Oxford Shirt",
    category: "Shirts",
    brand: "Arket",
    imageUrl: "/samples/shirt.svg",
    slots: ["top", "outerTop"]
  },
  {
    id: "sample-linen-shirt",
    name: "Blue Linen Shirt",
    category: "Shirts",
    brand: "Massimo Dutti",
    imageUrl: "/samples/linen-shirt.svg",
    slots: ["top", "outerTop"]
  },
  {
    id: "sample-hoodie",
    name: "Grey Logo Hoodie",
    category: "Sweatshirts",
    brand: "Nike",
    imageUrl: "/samples/hoodie.svg",
    slots: ["top", "outerTop"]
  },
  {
    id: "sample-tee",
    name: "Boxy White T-Shirt",
    category: "T-Shirts",
    brand: "Everlane",
    imageUrl: "/samples/tshirt.svg",
    slots: ["top"]
  },
  {
    id: "sample-stripe-tee",
    name: "Striped Breton Tee",
    category: "T-Shirts",
    brand: "Saint James",
    imageUrl: "/samples/stripe-tee.svg",
    slots: ["top"]
  },
  {
    id: "sample-cardigan",
    name: "Merino Button Cardigan",
    category: "Knitwear",
    brand: "Toteme",
    imageUrl: "/samples/cardigan.svg",
    slots: ["top", "outerTop"]
  },
  {
    id: "sample-jeans",
    name: "Straight Blue Jeans",
    category: "Jeans",
    brand: "Levi's",
    imageUrl: "/samples/jeans.svg",
    slots: ["bottom"]
  },
  {
    id: "sample-boots",
    name: "Black City Boots",
    category: "Boots",
    brand: "Vagabond",
    imageUrl: "/samples/boots.svg",
    slots: ["shoes"]
  },
  {
    id: "sample-bag",
    name: "Small Leather Bag",
    category: "Bags",
    brand: "Mansur",
    imageUrl: "/samples/bag.svg",
    slots: ["bag"]
  }
];
