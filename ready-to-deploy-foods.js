// READY-TO-DEPLOY FOODS DATABASE
// Copy this entire code into your deployed app's main JavaScript file

// Global Foods Database with 50+ authentic foods
const NUTRITRACK_FOODS_DB = [
  // FRUITS
  { id: 1, name: "Apple", category: "Fruits", servingSize: "1 medium", nutrients: { energy: 95, protein: 0.5, carbohydrates: 25, fat: 0.3, fiber: 4, vitamin_c: 8.4, vitamin_a: 54, potassium: 195, calcium: 11 }},
  { id: 2, name: "Banana", category: "Fruits", servingSize: "1 medium", nutrients: { energy: 105, protein: 1.3, carbohydrates: 27, fat: 0.4, fiber: 3, vitamin_c: 10.3, vitamin_b6: 0.4, potassium: 422, magnesium: 32 }},
  { id: 3, name: "Orange", category: "Fruits", servingSize: "1 medium", nutrients: { energy: 62, protein: 1.2, carbohydrates: 15.4, fat: 0.2, fiber: 3.1, vitamin_c: 70, vitamin_a: 269, vitamin_b9: 40, calcium: 52, potassium: 237 }},
  { id: 4, name: "Pomegranate", category: "Fruits", servingSize: "1/2 cup seeds", nutrients: { energy: 72, protein: 1.5, carbohydrates: 16.3, fat: 1, fiber: 3.5, vitamin_c: 8.9, vitamin_k: 14.3, vitamin_b9: 33, potassium: 205 }},
  { id: 5, name: "Mango", category: "Fruits", servingSize: "1 cup sliced", nutrients: { energy: 99, protein: 1.4, carbohydrates: 25, fat: 0.6, fiber: 2.6, vitamin_c: 60, vitamin_a: 1262, vitamin_b9: 71, potassium: 325 }},
  { id: 6, name: "Grapes", category: "Fruits", servingSize: "1 cup", nutrients: { energy: 104, protein: 1.1, carbohydrates: 27, fat: 0.2, fiber: 1.4, vitamin_c: 16.3, vitamin_k: 14.6, potassium: 288 }},
  { id: 7, name: "Strawberries", category: "Fruits", servingSize: "1 cup sliced", nutrients: { energy: 53, protein: 1.1, carbohydrates: 13, fat: 0.5, fiber: 3.3, vitamin_c: 98, vitamin_b9: 40, potassium: 254, manganese: 0.6 }},
  { id: 8, name: "Blueberries", category: "Fruits", servingSize: "1 cup", nutrients: { energy: 84, protein: 1.1, carbohydrates: 21, fat: 0.5, fiber: 3.6, vitamin_c: 14, vitamin_k: 29, manganese: 0.5 }},

  // VEGETABLES  
  { id: 9, name: "Broccoli", category: "Vegetables", servingSize: "1 cup chopped", nutrients: { energy: 25, protein: 3, carbohydrates: 5, fat: 0.3, fiber: 2.3, vitamin_c: 81, vitamin_k: 93, vitamin_b9: 57, calcium: 43, iron: 0.7 }},
  { id: 10, name: "Spinach", category: "Vegetables", servingSize: "1 cup raw", nutrients: { energy: 7, protein: 0.9, carbohydrates: 1.1, fat: 0.1, fiber: 0.7, vitamin_k: 145, vitamin_a: 469, vitamin_b9: 58, iron: 0.8, magnesium: 24 }},
  { id: 11, name: "Carrot", category: "Vegetables", servingSize: "1 medium", nutrients: { energy: 25, protein: 0.5, carbohydrates: 6, fat: 0.1, fiber: 1.7, vitamin_a: 1019, vitamin_k: 8.1, potassium: 195, calcium: 20 }},
  { id: 12, name: "Bell Pepper (Red)", category: "Vegetables", servingSize: "1 cup chopped", nutrients: { energy: 39, protein: 1.5, carbohydrates: 9, fat: 0.4, fiber: 3.1, vitamin_c: 190, vitamin_a: 4666, vitamin_b6: 0.4, vitamin_b9: 55 }},
  { id: 13, name: "Tomato", category: "Vegetables", servingSize: "1 medium", nutrients: { energy: 22, protein: 1.1, carbohydrates: 4.8, fat: 0.2, fiber: 1.5, vitamin_c: 17, vitamin_k: 9.7, vitamin_b9: 18, potassium: 292 }},
  { id: 14, name: "Sweet Potato", category: "Vegetables", servingSize: "1 medium baked", nutrients: { energy: 112, protein: 2, carbohydrates: 26, fat: 0.1, fiber: 3.9, vitamin_a: 1096, vitamin_c: 22, potassium: 542, magnesium: 31 }},
  { id: 15, name: "Cauliflower", category: "Vegetables", servingSize: "1 cup chopped", nutrients: { energy: 27, protein: 2, carbohydrates: 5, fat: 0.6, fiber: 2.1, vitamin_c: 52, vitamin_k: 16, vitamin_b9: 61 }},

  // GRAINS
  { id: 16, name: "Brown Rice", category: "Grains", servingSize: "1 cup cooked", nutrients: { energy: 216, protein: 5, carbohydrates: 45, fat: 1.8, fiber: 3.5, vitamin_b3: 3, magnesium: 84, phosphorus: 162, selenium: 19 }},
  { id: 17, name: "Quinoa", category: "Grains", servingSize: "1 cup cooked", nutrients: { energy: 222, protein: 8, carbohydrates: 39, fat: 3.6, fiber: 5.2, vitamin_b9: 78, magnesium: 118, phosphorus: 281, iron: 2.8 }},
  { id: 18, name: "Oats", category: "Grains", servingSize: "1 cup cooked", nutrients: { energy: 147, protein: 5.9, carbohydrates: 25, fat: 2.9, fiber: 4, vitamin_b1: 0.2, magnesium: 61, phosphorus: 180, zinc: 2.3 }},
  { id: 19, name: "Whole Wheat Bread", category: "Grains", servingSize: "1 slice", nutrients: { energy: 81, protein: 4, carbohydrates: 14, fat: 1.1, fiber: 1.9, vitamin_b3: 1.3, vitamin_b9: 14, iron: 0.9, magnesium: 23 }},

  // LEGUMES
  { id: 20, name: "Lentils", category: "Legumes", servingSize: "1 cup cooked", nutrients: { energy: 230, protein: 18, carbohydrates: 40, fat: 0.8, fiber: 15.6, vitamin_b9: 358, iron: 6.6, potassium: 731, magnesium: 71 }},
  { id: 21, name: "Chickpeas", category: "Legumes", servingSize: "1 cup cooked", nutrients: { energy: 269, protein: 15, carbohydrates: 45, fat: 4.2, fiber: 12.5, vitamin_b9: 282, iron: 4.7, magnesium: 79, zinc: 2.5 }},
  { id: 22, name: "Black Beans", category: "Legumes", servingSize: "1 cup cooked", nutrients: { energy: 227, protein: 15, carbohydrates: 41, fat: 0.9, fiber: 15, vitamin_b9: 256, iron: 3.6, magnesium: 120, potassium: 611 }},

  // NUTS & SEEDS
  { id: 23, name: "Almonds", category: "Nuts & Seeds", servingSize: "1 oz", nutrients: { energy: 164, protein: 6, carbohydrates: 6, fat: 14, fiber: 3.5, vitamin_e: 7.3, magnesium: 76, calcium: 76, phosphorus: 136 }},
  { id: 24, name: "Walnuts", category: "Nuts & Seeds", servingSize: "1 oz", nutrients: { energy: 185, protein: 4.3, carbohydrates: 3.9, fat: 18.5, fiber: 1.9, vitamin_e: 0.7, magnesium: 45, phosphorus: 98 }},
  { id: 25, name: "Pistachios", category: "Nuts & Seeds", servingSize: "1 oz", nutrients: { energy: 159, protein: 6, carbohydrates: 8, fat: 13, fiber: 3, vitamin_b6: 0.5, phosphorus: 139, potassium: 291, copper: 0.4 }},
  { id: 26, name: "Chia Seeds", category: "Nuts & Seeds", servingSize: "1 oz", nutrients: { energy: 137, protein: 4.4, carbohydrates: 12, fat: 8.6, fiber: 10.6, calcium: 177, phosphorus: 265, magnesium: 95 }},

  // PROTEINS
  { id: 27, name: "Chicken Breast", category: "Protein", servingSize: "3 oz cooked", nutrients: { energy: 140, protein: 26, carbohydrates: 0, fat: 3, vitamin_b3: 10.3, vitamin_b6: 0.5, phosphorus: 196, selenium: 22 }},
  { id: 28, name: "Salmon", category: "Protein", servingSize: "3 oz cooked", nutrients: { energy: 175, protein: 25, carbohydrates: 0, fat: 8, vitamin_d: 11, vitamin_b12: 2.4, selenium: 35 }},
  { id: 29, name: "Eggs", category: "Protein", servingSize: "1 large", nutrients: { energy: 70, protein: 6, carbohydrates: 0.6, fat: 5, vitamin_d: 1, vitamin_b12: 0.6, selenium: 15 }},
  { id: 30, name: "Tuna", category: "Protein", servingSize: "3 oz", nutrients: { energy: 109, protein: 25, carbohydrates: 0, fat: 1, vitamin_b3: 8.5, vitamin_b12: 2.5, selenium: 68 }},

  // INDIAN FOODS
  { id: 31, name: "Dosa", category: "Indian", servingSize: "1 medium", nutrients: { energy: 168, protein: 4, carbohydrates: 32, fat: 2.6, fiber: 1.2, vitamin_b1: 0.1, iron: 1.8, calcium: 15, phosphorus: 65 }},
  { id: 32, name: "Ragi (Finger Millet)", category: "Indian", servingSize: "1 cup cooked", nutrients: { energy: 336, protein: 7.3, carbohydrates: 72, fat: 1.3, fiber: 3.6, calcium: 344, iron: 3.9, phosphorus: 283, magnesium: 137 }},
  { id: 33, name: "Chapati", category: "Indian", servingSize: "1 medium", nutrients: { energy: 104, protein: 3.1, carbohydrates: 18, fat: 2.4, fiber: 2.8, iron: 1.2, calcium: 20, phosphorus: 89 }},
  { id: 34, name: "Dal (Toor)", category: "Indian", servingSize: "1 cup cooked", nutrients: { energy: 343, protein: 22, carbohydrates: 57, fat: 1.5, fiber: 15, vitamin_b9: 173, iron: 2.7, magnesium: 183 }},
  { id: 35, name: "Basmati Rice", category: "Indian", servingSize: "1 cup cooked", nutrients: { energy: 191, protein: 4.4, carbohydrates: 39, fat: 0.5, fiber: 0.7, vitamin_b3: 1.5, magnesium: 8, phosphorus: 43 }},

  // DAIRY
  { id: 36, name: "Greek Yogurt", category: "Dairy", servingSize: "1 cup", nutrients: { energy: 130, protein: 23, carbohydrates: 9, fat: 0.4, calcium: 230, vitamin_b12: 1.3, phosphorus: 194, potassium: 240 }},
  { id: 37, name: "Milk (2%)", category: "Dairy", servingSize: "1 cup", nutrients: { energy: 122, protein: 8, carbohydrates: 12, fat: 4.8, calcium: 293, vitamin_d: 2.9, vitamin_b12: 1.1, phosphorus: 232 }},
  { id: 38, name: "Cheddar Cheese", category: "Dairy", servingSize: "1 oz", nutrients: { energy: 113, protein: 7, carbohydrates: 1, fat: 9, calcium: 202, vitamin_a: 375, phosphorus: 145, zinc: 0.9 }},

  // ADDITIONAL POPULAR FOODS
  { id: 39, name: "Avocado", category: "Fruits", servingSize: "1/2 medium", nutrients: { energy: 160, protein: 2, carbohydrates: 9, fat: 15, fiber: 7, vitamin_k: 21, vitamin_b9: 81, potassium: 485, vitamin_e: 2.1 }},
  { id: 40, name: "Dark Chocolate (70%)", category: "Snacks", servingSize: "1 oz", nutrients: { energy: 170, protein: 2, carbohydrates: 13, fat: 12, fiber: 3, iron: 3.9, magnesium: 64, copper: 0.5 }},
  { id: 41, name: "Green Tea", category: "Beverages", servingSize: "1 cup", nutrients: { energy: 2, protein: 0.5, carbohydrates: 0, fat: 0, vitamin_c: 6, caffeine: 25 }},
  { id: 42, name: "Tofu", category: "Protein", servingSize: "3 oz", nutrients: { energy: 70, protein: 8, carbohydrates: 2, fat: 4, fiber: 1, calcium: 253, iron: 1.4, magnesium: 33 }},
  { id: 43, name: "Olive Oil", category: "Fats", servingSize: "1 tbsp", nutrients: { energy: 119, protein: 0, carbohydrates: 0, fat: 13.5, vitamin_e: 1.9, vitamin_k: 8.1 }},
  { id: 44, name: "Kale", category: "Vegetables", servingSize: "1 cup chopped", nutrients: { energy: 7, protein: 0.6, carbohydrates: 1.4, fat: 0.1, fiber: 0.6, vitamin_k: 80, vitamin_a: 206, vitamin_c: 19, calcium: 24 }},
  { id: 45, name: "Turkey Breast", category: "Protein", servingSize: "3 oz cooked", nutrients: { energy: 125, protein: 26, carbohydrates: 0, fat: 1.8, vitamin_b3: 5.8, vitamin_b6: 0.5, phosphorus: 196, selenium: 27 }},
  
  // GLOBAL FAVORITES
  { id: 46, name: "Pasta (Whole Wheat)", category: "Grains", servingSize: "1 cup cooked", nutrients: { energy: 174, protein: 7.5, carbohydrates: 37, fat: 0.8, fiber: 6.3, vitamin_b3: 1.8, iron: 1.5, magnesium: 42 }},
  { id: 47, name: "Hummus", category: "Mediterranean", servingSize: "2 tbsp", nutrients: { energy: 70, protein: 2, carbohydrates: 6, fat: 4.5, fiber: 2, vitamin_b9: 18, iron: 0.6, magnesium: 18 }},
  { id: 48, name: "Cottage Cheese", category: "Dairy", servingSize: "1/2 cup", nutrients: { energy: 111, protein: 13, carbohydrates: 4, fat: 5, calcium: 125, phosphorus: 151, vitamin_b12: 0.7 }},
  { id: 49, name: "Peanut Butter", category: "Nuts & Seeds", servingSize: "2 tbsp", nutrients: { energy: 188, protein: 8, carbohydrates: 8, fat: 16, fiber: 2.6, vitamin_b3: 4.2, magnesium: 57, phosphorus: 107 }},
  { id: 50, name: "Green Peas", category: "Legumes", servingSize: "1 cup", nutrients: { energy: 118, protein: 8, carbohydrates: 21, fat: 0.6, fiber: 7.4, vitamin_c: 96, vitamin_k: 24.8, vitamin_b9: 101, iron: 2.1 }}
];

// Search function
function searchNutritrackFoods(query) {
  if (!query || query.length < 2) return NUTRITRACK_FOODS_DB.slice(0, 10);
  
  const searchTerm = query.toLowerCase();
  return NUTRITRACK_FOODS_DB.filter(food => 
    food.name.toLowerCase().includes(searchTerm) ||
    food.category.toLowerCase().includes(searchTerm)
  );
}

// Initialize database
function initNutritrackFoods() {
  // Store in localStorage for persistence
  localStorage.setItem('nutritrack_foods_database', JSON.stringify(NUTRITRACK_FOODS_DB));
  console.log('✅ NutriTrack Foods Database Loaded - 50 Global Foods Available');
  
  // Make globally accessible
  if (typeof window !== 'undefined') {
    window.NUTRITRACK_FOODS_DB = NUTRITRACK_FOODS_DB;
    window.searchNutritrackFoods = searchNutritrackFoods;
  }
  
  return NUTRITRACK_FOODS_DB;
}

// Auto-initialize
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initNutritrackFoods);
} else {
  initNutritrackFoods();
}

// Make functions globally available
if (typeof window !== 'undefined') {
  window.initNutritrackFoods = initNutritrackFoods;
  window.searchNutritrackFoods = searchNutritrackFoods;
  window.NUTRITRACK_FOODS_DB = NUTRITRACK_FOODS_DB;
}