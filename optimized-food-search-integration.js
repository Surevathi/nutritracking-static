// OPTIMIZED FOOD SEARCH INTEGRATION
// Replaces USDA API calls with fast local database searches
// Supports offline functionality and eliminates rate limits

class OptimizedFoodSearch {
  constructor() {
    this.database = new UnifiedFoodDatabase();
    this.searchCache = new Map();
    this.CACHE_SIZE = 1000;
    this.isInitialized = false;
  }

  // Initialize the search system
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🚀 Initializing Optimized Food Search...');
    
    // Preload the unified database
    await this.database.loadUnifiedDatabase();
    
    // Setup search optimization
    this.setupSearchOptimization();
    
    this.isInitialized = true;
    console.log('✅ Food Search System Ready');
  }

  // Setup search optimization features
  setupSearchOptimization() {
    // Implement search result caching
    this.originalSearch = this.database.searchFoods.bind(this.database);
    this.database.searchFoods = this.cachedSearch.bind(this);
    
    // Setup IndexedDB for large dataset storage (if needed)
    this.setupIndexedDB();
  }

  // Cached search function
  async cachedSearch(query, pageSize = 50) {
    const cacheKey = `${query.toLowerCase().trim()}_${pageSize}`;
    
    // Check cache first
    if (this.searchCache.has(cacheKey)) {
      console.log(`📦 Cache hit for: ${query}`);
      return this.searchCache.get(cacheKey);
    }
    
    // Perform search
    const results = await this.originalSearch(query, pageSize);
    
    // Cache results (with size limit)
    if (this.searchCache.size >= this.CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = this.searchCache.keys().next().value;
      this.searchCache.delete(firstKey);
    }
    
    this.searchCache.set(cacheKey, results);
    console.log(`🔍 Search completed for: ${query} (${results.length} results)`);
    
    return results;
  }

  // Setup IndexedDB for very large datasets
  setupIndexedDB() {
    if (!('indexedDB' in window)) {
      console.log('IndexedDB not supported, using memory storage');
      return;
    }

    const request = indexedDB.open('FoodSearchDB', 1);
    
    request.onerror = () => {
      console.log('IndexedDB setup failed, falling back to memory');
    };
    
    request.onsuccess = (event) => {
      this.indexedDB = event.target.result;
      console.log('📀 IndexedDB ready for large dataset storage');
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store for foods
      if (!db.objectStoreNames.contains('foods')) {
        const foodStore = db.createObjectStore('foods', { keyPath: 'id' });
        foodStore.createIndex('name', 'name', { unique: false });
        foodStore.createIndex('category', 'category', { unique: false });
        foodStore.createIndex('region', 'region', { unique: false });
      }
    };
  }

  // Advanced search with filters
  async advancedSearch(query, filters = {}) {
    await this.initialize();
    
    let results = await this.database.searchFoods(query, 200);
    
    // Apply filters
    if (filters.category) {
      results = results.filter(food => 
        food.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    
    if (filters.region) {
      results = results.filter(food => 
        food.region.toLowerCase().includes(filters.region.toLowerCase())
      );
    }
    
    if (filters.maxCalories) {
      results = results.filter(food => 
        food.nutrients.energy <= filters.maxCalories
      );
    }
    
    if (filters.minProtein) {
      results = results.filter(food => 
        food.nutrients.protein >= filters.minProtein
      );
    }
    
    return results.slice(0, filters.limit || 50);
  }

  // Get food by ID
  async getFoodById(id) {
    await this.initialize();
    
    if (this.database.localData) {
      return this.database.localData.find(food => food.id === id);
    }
    
    return null;
  }

  // Get suggestions for autocomplete
  async getSuggestions(query, limit = 10) {
    if (!query || query.length < 2) return [];
    
    await this.initialize();
    
    const results = await this.database.searchFoods(query, limit * 2);
    
    // Extract unique food names for suggestions
    const suggestions = [...new Set(results.map(food => food.name))]
      .slice(0, limit);
    
    return suggestions;
  }

  // Get nutrition comparison data
  async getNutritionComparison(foodIds) {
    await this.initialize();
    
    const foods = [];
    for (const id of foodIds) {
      const food = await this.getFoodById(id);
      if (food) foods.push(food);
    }
    
    return foods.map(food => ({
      name: food.name,
      calories: food.nutrients.energy,
      protein: food.nutrients.protein,
      carbs: food.nutrients.carbohydrates,
      fat: food.nutrients.fat,
      fiber: food.nutrients.fiber,
      vitamins: {
        c: food.nutrients.vitamin_c,
        d: food.nutrients.vitamin_d,
        b12: food.nutrients.vitamin_b12
      },
      minerals: {
        calcium: food.nutrients.calcium,
        iron: food.nutrients.iron,
        potassium: food.nutrients.potassium
      }
    }));
  }

  // Get category-based recommendations
  async getCategoryRecommendations(category, limit = 20) {
    await this.initialize();
    
    if (!this.database.localData) return [];
    
    return this.database.localData
      .filter(food => food.category.toLowerCase() === category.toLowerCase())
      .sort((a, b) => b.nutrients.energy - a.nutrients.energy) // Sort by calories desc
      .slice(0, limit);
  }

  // Get regional foods
  async getRegionalFoods(region, limit = 30) {
    await this.initialize();
    
    if (!this.database.localData) return [];
    
    return this.database.localData
      .filter(food => food.region.toLowerCase() === region.toLowerCase())
      .slice(0, limit);
  }

  // Search with nutrition focus
  async searchByNutrient(nutrient, minValue, limit = 20) {
    await this.initialize();
    
    if (!this.database.localData) return [];
    
    return this.database.localData
      .filter(food => food.nutrients[nutrient] >= minValue)
      .sort((a, b) => b.nutrients[nutrient] - a.nutrients[nutrient])
      .slice(0, limit);
  }

  // Get database statistics
  async getStats() {
    await this.initialize();
    return this.database.getStats();
  }

  // Clear all caches
  clearCache() {
    this.searchCache.clear();
    localStorage.removeItem('unified_foods_cache_v2');
    localStorage.removeItem('unified_foods_last_updated');
    console.log('🧹 All caches cleared');
  }

  // Check system health
  async healthCheck() {
    const stats = await this.getStats();
    const cacheSize = this.searchCache.size;
    const memoryUsage = this.estimateMemoryUsage();
    
    return {
      status: stats.total > 0 ? 'healthy' : 'degraded',
      totalFoods: stats.total,
      regions: stats.regions.length,
      categories: stats.categories.length,
      cacheSize: cacheSize,
      memoryUsage: memoryUsage,
      lastUpdate: localStorage.getItem('unified_foods_last_updated'),
      indexedDBSupport: 'indexedDB' in window
    };
  }

  // Estimate memory usage
  estimateMemoryUsage() {
    if (!this.database.localData) return '0 MB';
    
    const jsonString = JSON.stringify(this.database.localData);
    const bytes = new Blob([jsonString]).size;
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    
    return `${mb} MB`;
  }
}

// Integration with existing food search
class FoodSearchIntegration {
  constructor() {
    this.optimizedSearch = new OptimizedFoodSearch();
    this.isReady = false;
  }

  // Replace existing searchFoods function
  async searchFoods(query, pageSize = 50) {
    if (!this.isReady) {
      await this.optimizedSearch.initialize();
      this.isReady = true;
    }
    
    return await this.optimizedSearch.cachedSearch(query, pageSize);
  }

  // Replace existing food database calls
  async getFoodById(id) {
    return await this.optimizedSearch.getFoodById(id);
  }

  // Enhanced search with filters
  async searchWithFilters(query, filters) {
    return await this.optimizedSearch.advancedSearch(query, filters);
  }

  // Get autocomplete suggestions
  async getAutocompleteSuggestions(query) {
    return await this.optimizedSearch.getSuggestions(query);
  }
}

// Export for global use
window.OptimizedFoodSearch = OptimizedFoodSearch;
window.FoodSearchIntegration = FoodSearchIntegration;

// Initialize global instances
window.optimizedFoodSearch = new OptimizedFoodSearch();
window.foodSearchIntegration = new FoodSearchIntegration();

// Replace any existing food search functions
if (window.searchFoods) {
  window.searchFoods = window.foodSearchIntegration.searchFoods.bind(window.foodSearchIntegration);
}

console.log('🎯 Optimized Food Search Integration Ready - No more API limits!');