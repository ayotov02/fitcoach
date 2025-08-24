import { Food, FoodCategory, NutritionData } from '@/lib/types/nutrition'

export interface FoodSearchOptions {
  query?: string
  category?: FoodCategory
  brand?: string
  verified?: boolean
  allergenFree?: string[]
  dietaryTags?: string[]
  nutritionFilters?: {
    maxCalories?: number
    minProtein?: number
    maxCarbs?: number
    maxFat?: number
    maxSodium?: number
  }
  limit?: number
  offset?: number
}

export interface FoodSearchResult {
  foods: Food[]
  total: number
  hasMore: boolean
}

export class FoodDatabase {
  private static instance: FoodDatabase
  private foods: Food[] = []
  private initialized = false

  private constructor() {}

  static getInstance(): FoodDatabase {
    if (!FoodDatabase.instance) {
      FoodDatabase.instance = new FoodDatabase()
    }
    return FoodDatabase.instance
  }

  async initialize() {
    if (this.initialized) return
    
    // In a real implementation, this would load from Supabase
    // For now, we'll simulate with the core foods
    await this.loadCoreFood()
    this.initialized = true
  }

  private async loadCoreFood() {
    // This would typically fetch from your Supabase database
    // For demonstration, including core foods that would be in the database
    this.foods = [
      // Fruits
      {
        id: '1',
        name: 'Apple',
        category: 'fruits',
        serving_size: 182,
        serving_unit: 'g',
        nutrition_per_serving: {
          calories: 95,
          protein: 0.5,
          carbohydrates: 25,
          fat: 0.3,
          fiber: 4.4,
          sugar: 19,
          sodium: 2,
          vitamin_c: 8.4,
          potassium: 195
        },
        verified: true,
        allergens: [],
        dietary_tags: ['vegan', 'gluten-free', 'dairy-free'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Banana',
        category: 'fruits',
        serving_size: 118,
        serving_unit: 'g',
        nutrition_per_serving: {
          calories: 105,
          protein: 1.3,
          carbohydrates: 27,
          fat: 0.4,
          fiber: 3.1,
          sugar: 14,
          sodium: 1,
          vitamin_c: 10.3,
          potassium: 422,
          vitamin_b6: 0.4
        },
        verified: true,
        allergens: [],
        dietary_tags: ['vegan', 'gluten-free', 'dairy-free'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // Vegetables
      {
        id: '3',
        name: 'Broccoli',
        category: 'vegetables',
        serving_size: 91,
        serving_unit: 'g',
        nutrition_per_serving: {
          calories: 25,
          protein: 3,
          carbohydrates: 5,
          fat: 0.3,
          fiber: 2.6,
          sugar: 1.5,
          sodium: 33,
          vitamin_c: 89.2,
          vitamin_k: 101.6,
          folate: 63
        },
        verified: true,
        allergens: [],
        dietary_tags: ['vegan', 'gluten-free', 'dairy-free'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // Proteins
      {
        id: '4',
        name: 'Chicken Breast',
        category: 'protein',
        serving_size: 85,
        serving_unit: 'g',
        nutrition_per_serving: {
          calories: 165,
          protein: 31,
          carbohydrates: 0,
          fat: 3.6,
          saturated_fat: 1,
          cholesterol: 85,
          sodium: 74,
          phosphorus: 228,
          selenium: 27
        },
        verified: true,
        allergens: [],
        dietary_tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Greek Yogurt',
        brand: 'Generic',
        category: 'protein',
        serving_size: 170,
        serving_unit: 'g',
        nutrition_per_serving: {
          calories: 100,
          protein: 17,
          carbohydrates: 9,
          fat: 0,
          sugar: 9,
          sodium: 65,
          calcium: 200
        },
        verified: true,
        allergens: ['milk'],
        dietary_tags: ['vegetarian'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  async searchFoods(options: FoodSearchOptions = {}): Promise<FoodSearchResult> {
    let filteredFoods = [...this.foods]

    // Apply text search
    if (options.query) {
      const query = options.query.toLowerCase()
      filteredFoods = filteredFoods.filter(food =>
        food.name.toLowerCase().includes(query) ||
        food.brand?.toLowerCase().includes(query) ||
        food.description?.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (options.category) {
      filteredFoods = filteredFoods.filter(food => food.category === options.category)
    }

    // Apply brand filter
    if (options.brand) {
      filteredFoods = filteredFoods.filter(food => food.brand === options.brand)
    }

    // Apply verified filter
    if (options.verified !== undefined) {
      filteredFoods = filteredFoods.filter(food => food.verified === options.verified)
    }

    // Apply allergen-free filter
    if (options.allergenFree && options.allergenFree.length > 0) {
      filteredFoods = filteredFoods.filter(food =>
        !options.allergenFree!.some(allergen =>
          food.allergens.includes(allergen)
        )
      )
    }

    // Apply dietary tags filter
    if (options.dietaryTags && options.dietaryTags.length > 0) {
      filteredFoods = filteredFoods.filter(food =>
        options.dietaryTags!.every(tag =>
          food.dietary_tags.includes(tag)
        )
      )
    }

    // Apply nutrition filters
    if (options.nutritionFilters) {
      const filters = options.nutritionFilters
      filteredFoods = filteredFoods.filter(food => {
        const nutrition = food.nutrition_per_serving
        return (
          (!filters.maxCalories || nutrition.calories <= filters.maxCalories) &&
          (!filters.minProtein || nutrition.protein >= filters.minProtein) &&
          (!filters.maxCarbs || nutrition.carbohydrates <= filters.maxCarbs) &&
          (!filters.maxFat || nutrition.fat <= filters.maxFat) &&
          (!filters.maxSodium || (nutrition.sodium || 0) <= filters.maxSodium)
        )
      })
    }

    // Apply pagination
    const total = filteredFoods.length
    const offset = options.offset || 0
    const limit = options.limit || 50
    const paginatedFoods = filteredFoods.slice(offset, offset + limit)

    return {
      foods: paginatedFoods,
      total,
      hasMore: offset + limit < total
    }
  }

  async getFoodById(id: string): Promise<Food | null> {
    return this.foods.find(food => food.id === id) || null
  }

  async getFoodsByIds(ids: string[]): Promise<Food[]> {
    return this.foods.filter(food => ids.includes(food.id))
  }

  async getFoodsByCategory(category: FoodCategory): Promise<Food[]> {
    return this.foods.filter(food => food.category === category)
  }

  async getPopularFoods(limit = 20): Promise<Food[]> {
    // In a real implementation, this would be based on usage statistics
    return this.foods
      .filter(food => food.verified)
      .slice(0, limit)
  }

  async getFoodsByBrand(brand: string): Promise<Food[]> {
    return this.foods.filter(food => food.brand === brand)
  }

  async searchByBarcode(barcode: string): Promise<Food | null> {
    return this.foods.find(food => food.barcode === barcode) || null
  }

  // Utility methods for nutrition calculations
  calculateNutritionForQuantity(food: Food, quantity: number, unit?: string): NutritionData {
    const ratio = this.calculateServingRatio(food, quantity, unit)
    const baseNutrition = food.nutrition_per_serving

    const scaledNutrition: NutritionData = {
      calories: Math.round(baseNutrition.calories * ratio),
      protein: Math.round(baseNutrition.protein * ratio * 10) / 10,
      carbohydrates: Math.round(baseNutrition.carbohydrates * ratio * 10) / 10,
      fat: Math.round(baseNutrition.fat * ratio * 10) / 10
    }

    // Scale optional nutrients if they exist
    const optionalNutrients = [
      'fiber', 'sugar', 'sodium', 'cholesterol', 'saturated_fat', 'trans_fat',
      'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
      'thiamin', 'riboflavin', 'niacin', 'vitamin_b6', 'folate', 'vitamin_b12',
      'biotin', 'pantothenic_acid', 'choline', 'calcium', 'iron', 'magnesium',
      'phosphorus', 'potassium', 'zinc', 'copper', 'manganese', 'selenium',
      'chromium', 'molybdenum', 'iodine'
    ] as const

    optionalNutrients.forEach(nutrient => {
      if (baseNutrition[nutrient] !== undefined) {
        ;(scaledNutrition as any)[nutrient] = Math.round((baseNutrition[nutrient]! * ratio) * 10) / 10
      }
    })

    return scaledNutrition
  }

  private calculateServingRatio(food: Food, quantity: number, unit?: string): number {
    if (!unit || unit === food.serving_unit) {
      return quantity / food.serving_size
    }

    // Unit conversion logic would go here
    // For now, assume same unit
    return quantity / food.serving_size
  }

  // Auto-complete suggestions
  async getSuggestions(query: string, limit = 10): Promise<string[]> {
    if (!query || query.length < 2) return []

    const suggestions = new Set<string>()
    const lowerQuery = query.toLowerCase()

    this.foods.forEach(food => {
      if (food.name.toLowerCase().includes(lowerQuery)) {
        suggestions.add(food.name)
      }
      if (food.brand && food.brand.toLowerCase().includes(lowerQuery)) {
        suggestions.add(food.brand)
      }
    })

    return Array.from(suggestions).slice(0, limit)
  }

  // Get nutrition summary for multiple foods
  combineNutritionData(nutritionData: NutritionData[]): NutritionData {
    const combined: NutritionData = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0
    }

    nutritionData.forEach(nutrition => {
      combined.calories += nutrition.calories
      combined.protein += nutrition.protein
      combined.carbohydrates += nutrition.carbohydrates
      combined.fat += nutrition.fat

      // Combine optional nutrients
      const optionalNutrients = [
        'fiber', 'sugar', 'sodium', 'cholesterol', 'saturated_fat', 'trans_fat',
        'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
        'thiamin', 'riboflavin', 'niacin', 'vitamin_b6', 'folate', 'vitamin_b12',
        'biotin', 'pantothenic_acid', 'choline', 'calcium', 'iron', 'magnesium',
        'phosphorus', 'potassium', 'zinc', 'copper', 'manganese', 'selenium',
        'chromium', 'molybdenum', 'iodine'
      ] as const

      optionalNutrients.forEach(nutrient => {
        if (nutrition[nutrient] !== undefined) {
          if ((combined as any)[nutrient] === undefined) {
            ;(combined as any)[nutrient] = 0
          }
          ;(combined as any)[nutrient] += nutrition[nutrient]!
        }
      })
    })

    // Round all values
    Object.keys(combined).forEach(key => {
      const value = (combined as any)[key]
      if (typeof value === 'number') {
        ;(combined as any)[key] = Math.round(value * 10) / 10
      }
    })

    return combined
  }
}