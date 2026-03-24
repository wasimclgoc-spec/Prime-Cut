import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';

const products = [
  // Bachat Packs
  {
    name: "Traditional Meal Box ~5.5KG",
    category: "Deals",
    pricePerKg: 10500,
    image: "https://www.themeathub.com/cdn/shop/files/2_cd808db3-0098-4fb5-8d90-ba805ecccd62.png",
    description: "Traditional Meal Box ~5.5KG",
    minQty: 1,
    maxQty: 10,
    isFeatured: true,
    stockStatus: "In Stock",
    homeSection: "bachatPacks"
  },
  {
    name: "Royal Feast Box ~12KG",
    category: "Deals",
    pricePerKg: 22000,
    image: "https://www.themeathub.com/cdn/shop/files/4.png",
    description: "Royal Feast Box ~12KG",
    minQty: 1,
    maxQty: 10,
    isFeatured: true,
    stockStatus: "In Stock",
    homeSection: "bachatPacks"
  },
  {
    name: "Grill and BBQ Box ~8.5KG",
    category: "Deals",
    pricePerKg: 15500,
    image: "https://www.themeathub.com/cdn/shop/files/3_36b9df15-a2a8-4140-a5a3-b6ef59bf4732.png",
    description: "Grill and BBQ Box ~8.5KG",
    minQty: 1,
    maxQty: 10,
    isFeatured: true,
    stockStatus: "In Stock",
    homeSection: "bachatPacks"
  },
  // Best Cuts
  {
    name: "Fresh Chicken Karahi Cut",
    category: "Chicken",
    pricePerKg: 650,
    image: "https://www.themeathub.com/cdn/shop/files/PLTR010FreshChickenKarahiCut1100g.png",
    description: "Fresh Chicken Karahi Cut",
    minQty: 1,
    maxQty: 10,
    isFeatured: true,
    stockStatus: "In Stock",
    homeSection: "bestCuts"
  },
  {
    name: "Boneless Beef Cubes",
    category: "Beef",
    pricePerKg: 1250,
    image: "https://www.themeathub.com/cdn/shop/files/PKBF002BonelessBeefCubes.png",
    description: "Boneless Beef Cubes",
    minQty: 0.5,
    maxQty: 10,
    isFeatured: true,
    stockStatus: "In Stock",
    homeSection: "bestCuts"
  },
  {
    name: "Fresh Chicken Without Skin",
    category: "Chicken",
    pricePerKg: 680,
    image: "https://www.themeathub.com/cdn/shop/files/PLTR005FreshChickenWithoutSkin1100g.png",
    description: "Fresh Chicken Without Skin",
    minQty: 1,
    maxQty: 10,
    isFeatured: true,
    stockStatus: "In Stock",
    homeSection: "bestCuts"
  },
  {
    name: "Fresh Mutton Chops Local",
    category: "Mutton",
    pricePerKg: 2400,
    image: "https://www.themeathub.com/cdn/shop/files/HBMTN009FreshMuttonChops.png",
    description: "Fresh Mutton Chops Local",
    minQty: 0.5,
    maxQty: 10,
    isFeatured: true,
    stockStatus: "In Stock",
    homeSection: "bestCuts"
  },
  // Mutton Choice
  {
    name: "Fresh Mutton Ground Coarse",
    category: "Mutton",
    pricePerKg: 2200,
    image: "https://www.themeathub.com/cdn/shop/files/PKMTN004FreshMuttonGroundCoarse.png",
    description: "Fresh Mutton Ground Coarse",
    minQty: 0.5,
    maxQty: 10,
    isFeatured: true,
    stockStatus: "In Stock",
    homeSection: "muttonChoice"
  },
  {
    name: "Fresh Mutton Shoulder Diced",
    category: "Mutton",
    pricePerKg: 2300,
    image: "https://www.themeathub.com/cdn/shop/files/PKMTN006FreshMuttonShoulderDiced.png",
    description: "Fresh Mutton Shoulder Diced",
    minQty: 0.5,
    maxQty: 10,
    isFeatured: true,
    stockStatus: "In Stock",
    homeSection: "muttonChoice"
  },
  {
    name: "Fresh Mutton Boneless Small Cubes",
    category: "Mutton",
    pricePerKg: 2600,
    image: "https://www.themeathub.com/cdn/shop/files/PKMTN001FreshMuttonBonelessSmallCubes..png",
    description: "Fresh Mutton Boneless Small Cubes",
    minQty: 0.5,
    maxQty: 10,
    isFeatured: true,
    stockStatus: "In Stock",
    homeSection: "muttonChoice"
  },
  {
    name: "Fresh Mutton Leg Diced",
    category: "Mutton",
    pricePerKg: 2400,
    image: "https://www.themeathub.com/cdn/shop/files/PKMTN005FreshMuttonLegDiced.png",
    description: "Fresh Mutton Leg Diced",
    minQty: 0.5,
    maxQty: 10,
    isFeatured: true,
    stockStatus: "In Stock",
    homeSection: "muttonChoice"
  },
  // Fresh Cuts
  {
    name: "Fresh Mutton With Biryani Cut Local",
    category: "Mutton",
    pricePerKg: 2100,
    image: "https://www.themeathub.com/cdn/shop/files/HBMTN011FreshMuttonWithBiryaniCut.png",
    description: "Fresh Mutton With Biryani Cut Local",
    minQty: 0.5,
    maxQty: 10,
    isFeatured: true,
    stockStatus: "In Stock",
    homeSection: "freshCuts"
  },
  {
    name: "Fresh Mutton Loin Local",
    category: "Mutton",
    pricePerKg: 2500,
    image: "https://www.themeathub.com/cdn/shop/files/HBMTN010FreshMuttonLoin.png",
    description: "Fresh Mutton Loin Local",
    minQty: 0.5,
    maxQty: 10,
    isFeatured: true,
    stockStatus: "In Stock",
    homeSection: "freshCuts"
  },
  {
    name: "Fresh Mutton Leg Diced Local",
    category: "Mutton",
    pricePerKg: 2300,
    image: "https://www.themeathub.com/cdn/shop/files/HBMTN005FreshMuttonLegDicedLocal.png",
    description: "Fresh Mutton Leg Diced Local",
    minQty: 0.5,
    maxQty: 10,
    isFeatured: true,
    stockStatus: "In Stock",
    homeSection: "freshCuts"
  },
  {
    name: "Fresh Mutton With Karahi Cut",
    category: "Mutton",
    pricePerKg: 2200,
    image: "https://www.themeathub.com/cdn/shop/files/HBMTN008FreshMuttonWithKarahiCut.png",
    description: "Fresh Mutton With Karahi Cut",
    minQty: 0.5,
    maxQty: 10,
    isFeatured: true,
    stockStatus: "In Stock",
    homeSection: "freshCuts"
  }
];

const offers = [
  {
    title: "Premium Local Mutton",
    description: "Freshly sourced local mutton delivered to your doorstep daily.",
    image: "input_file_2.png",
    discount: "FRESH DAILY",
    isActive: true
  },
  {
    title: "Fresh Farm Chicken",
    description: "100% organic, hormone-free chicken processed with strict hygiene.",
    image: "input_file_1.png",
    discount: "HYGIENIC",
    isActive: true
  },
  {
    title: "Fresh Mutton Kleji",
    description: "Nutrient-rich fresh goat liver, tender and delicious.",
    image: "input_file_3.png",
    discount: "HEALTHY",
    isActive: true
  },
  {
    title: "Beef Paye (Feet)",
    description: "Traditional beef paye, cleaned and ready for slow cooking.",
    image: "input_file_0.png",
    discount: "TRADITIONAL",
    isActive: true
  }
];

export const seedInitialData = async (force = false) => {
  console.log("Starting seedInitialData, force:", force);
  if (!force) {
    const productsSnap = await getDocs(query(collection(db, 'products'), limit(1)));
    if (!productsSnap.empty) {
      console.log("Products already exist, skipping seed.");
      return;
    }
  }
  
  try {
    console.log("Adding products...");
    for (const p of products) {
      await addDoc(collection(db, 'products'), p);
    }
    console.log("Adding offers...");
    for (const o of offers) {
      await addDoc(collection(db, 'offers'), o);
    }
    console.log("Initial data seeded successfully!");
  } catch (error) {
    console.error("Error in seedInitialData:", error);
    throw error;
  }
};
