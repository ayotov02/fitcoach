'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, Calculator, Clock, Users, ChefHat, Save, Search, Sparkles } from 'lucide-react'
import { Recipe, RecipeIngredient, Food, NutritionData } from '@/lib/types/nutrition'
import { FoodDatabase } from '@/lib/utils/food-database'

interface RecipeBuilderProps {
  userId: string
  existingRecipe?: Recipe
  onRecipeSaved?: (recipe: Recipe) => void
  onCancel?: () => void
}

interface RecipeForm {
  name: string
  description: string
  instructions: string[]
  prep_time: number
  cook_time: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine: string
  dietary_tags: string[]
  image_url?: string
}

interface IngredientForm {
  food_id: string
  food_name: string
  quantity: number
  unit: string
  notes?: string
}

const DIETARY_TAGS = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'low-carb', 
  'high-protein', 'low-fat', 'heart-healthy', 'diabetic-friendly'
]

const CUISINE_TYPES = [
  'American', 'Italian', 'Mexican', 'Asian', 'Mediterranean', 'Indian', 'Thai', 
  'Japanese', 'French', 'Greek', 'Chinese', 'Korean', 'Spanish', 'Other'
]

const COMMON_UNITS = [
  'g', 'kg', 'oz', 'lb', 'ml', 'l', 'cup', 'tablespoon', 'teaspoon', 
  'piece', 'slice', 'clove', 'bunch', 'can', 'package'
]

export function RecipeBuilder({ userId, existingRecipe, onRecipeSaved, onCancel }: RecipeBuilderProps) {
  const [recipeForm, setRecipeForm] = useState<RecipeForm>({
    name: existingRecipe?.name || '',
    description: existingRecipe?.description || '',
    instructions: existingRecipe?.instructions || [''],
    prep_time: existingRecipe?.prep_time || 15,
    cook_time: existingRecipe?.cook_time || 30,
    servings: existingRecipe?.servings || 4,
    difficulty: existingRecipe?.difficulty || 'medium',
    cuisine: existingRecipe?.cuisine || '',
    dietary_tags: existingRecipe?.dietary_tags || [],
    image_url: existingRecipe?.image_url
  })

  const [ingredients, setIngredients] = useState<IngredientForm[]>([])
  const [foodSearchQuery, setFoodSearchQuery] = useState('')
  const [foodSearchResults, setFoodSearchResults] = useState<Food[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recipeNutrition, setRecipeNutrition] = useState<NutritionData>({
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0
  })
  const [isSaving, setIsSaving] = useState(false)
  const [nutritionPerServing, setNutritionPerServing] = useState<NutritionData>({
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0
  })

  const foodDatabase = FoodDatabase.getInstance()

  useEffect(() => {
    foodDatabase.initialize()
    if (existingRecipe) {
      loadExistingRecipeIngredients()
    }
  }, [existingRecipe])

  useEffect(() => {
    calculateRecipeNutrition()
  }, [ingredients, recipeForm.servings])

  const loadExistingRecipeIngredients = async () => {
    // In a real implementation, this would load ingredients from database
    // For now, using mock data
    const mockIngredients: IngredientForm[] = [
      {
        food_id: '4',
        food_name: 'Chicken Breast',
        quantity: 500,
        unit: 'g',
        notes: 'Boneless, skinless'
      }
    ]
    setIngredients(mockIngredients)
  }

  const searchFoods = useCallback(async (query: string) => {
    if (!query.trim()) {
      setFoodSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await foodDatabase.searchFoods({
        query,
        limit: 10,
        verified: true
      })
      setFoodSearchResults(results.foods)
    } catch (error) {
      console.error('Food search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }, [foodDatabase])

  const addIngredient = (food: Food, quantity: number = 100, unit: string = 'g') => {
    const newIngredient: IngredientForm = {
      food_id: food.id,
      food_name: food.name,
      quantity,
      unit,
      notes: ''
    }
    
    setIngredients(prev => [...prev, newIngredient])
    setFoodSearchQuery('')
    setFoodSearchResults([])
  }

  const updateIngredient = (index: number, field: keyof IngredientForm, value: any) => {
    setIngredients(prev => prev.map((ingredient, i) => 
      i === index ? { ...ingredient, [field]: value } : ingredient
    ))
  }

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index))
  }

  const addInstruction = () => {
    setRecipeForm(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }))
  }

  const updateInstruction = (index: number, value: string) => {
    setRecipeForm(prev => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) => 
        i === index ? value : instruction
      )
    }))
  }

  const removeInstruction = (index: number) => {
    setRecipeForm(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }))
  }

  const calculateRecipeNutrition = async () => {
    try {
      const nutritionPromises = ingredients.map(async (ingredient) => {
        const food = await foodDatabase.getFoodById(ingredient.food_id)
        if (!food) return { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }

        return foodDatabase.calculateNutritionForQuantity(food, ingredient.quantity, ingredient.unit)
      })

      const nutritionData = await Promise.all(nutritionPromises)
      const totalNutrition = foodDatabase.combineNutritionData(nutritionData)
      
      setRecipeNutrition(totalNutrition)
      
      // Calculate per serving
      const perServing: NutritionData = {
        calories: Math.round(totalNutrition.calories / recipeForm.servings),
        protein: Math.round((totalNutrition.protein / recipeForm.servings) * 10) / 10,
        carbohydrates: Math.round((totalNutrition.carbohydrates / recipeForm.servings) * 10) / 10,
        fat: Math.round((totalNutrition.fat / recipeForm.servings) * 10) / 10
      }
      
      // Add optional nutrients if they exist
      const optionalNutrients = ['fiber', 'sugar', 'sodium'] as const
      optionalNutrients.forEach(nutrient => {
        if (totalNutrition[nutrient] !== undefined) {
          ;(perServing as any)[nutrient] = Math.round(((totalNutrition[nutrient]! / recipeForm.servings)) * 10) / 10
        }
      })
      
      setNutritionPerServing(perServing)
    } catch (error) {
      console.error('Failed to calculate nutrition:', error)
    }
  }

  const toggleDietaryTag = (tag: string) => {
    setRecipeForm(prev => ({
      ...prev,
      dietary_tags: prev.dietary_tags.includes(tag)
        ? prev.dietary_tags.filter(t => t !== tag)
        : [...prev.dietary_tags, tag]
    }))
  }

  const saveRecipe = async () => {
    if (!recipeForm.name.trim()) {
      alert('Recipe name is required')
      return
    }

    if (ingredients.length === 0) {
      alert('Please add at least one ingredient')
      return
    }

    if (recipeForm.instructions.filter(i => i.trim()).length === 0) {
      alert('Please add at least one instruction')
      return
    }

    setIsSaving(true)
    try {
      const recipe: Recipe = {
        id: existingRecipe?.id || crypto.randomUUID(),
        name: recipeForm.name,
        description: recipeForm.description || undefined,
        instructions: recipeForm.instructions.filter(i => i.trim()),
        prep_time: recipeForm.prep_time,
        cook_time: recipeForm.cook_time,
        servings: recipeForm.servings,
        difficulty: recipeForm.difficulty,
        cuisine: recipeForm.cuisine || undefined,
        dietary_tags: recipeForm.dietary_tags,
        image_url: recipeForm.image_url,
        created_by: userId,
        created_at: existingRecipe?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // In a real implementation, save recipe and ingredients to database
      console.log('Saving recipe:', recipe)
      console.log('Recipe ingredients:', ingredients)
      console.log('Recipe nutrition:', recipeNutrition)

      onRecipeSaved?.(recipe)
      
      // Reset form if not editing
      if (!existingRecipe) {
        setRecipeForm({
          name: '',
          description: '',
          instructions: [''],
          prep_time: 15,
          cook_time: 30,
          servings: 4,
          difficulty: 'medium',
          cuisine: '',
          dietary_tags: [],
        })
        setIngredients([])
      }
    } catch (error) {
      console.error('Failed to save recipe:', error)
      alert('Failed to save recipe. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recipe Builder</h1>
          <p className="text-muted-foreground">
            Create recipes with automatic nutrition calculation
          </p>
        </div>
        
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={saveRecipe} disabled={isSaving}>
            {isSaving ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Recipe
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recipe Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recipe-name">Recipe Name *</Label>
                  <Input
                    id="recipe-name"
                    placeholder="e.g., Grilled Chicken Salad"
                    value={recipeForm.name}
                    onChange={(e) => setRecipeForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cuisine">Cuisine</Label>
                  <Select
                    value={recipeForm.cuisine}
                    onValueChange={(value) => setRecipeForm(prev => ({ ...prev, cuisine: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      {CUISINE_TYPES.map(cuisine => (
                        <SelectItem key={cuisine} value={cuisine}>
                          {cuisine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your recipe..."
                  value={recipeForm.description}
                  onChange={(e) => setRecipeForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    min="1"
                    value={recipeForm.servings}
                    onChange={(e) => setRecipeForm(prev => ({ 
                      ...prev, 
                      servings: parseInt(e.target.value) || 1 
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prep-time">Prep Time (min)</Label>
                  <Input
                    id="prep-time"
                    type="number"
                    min="0"
                    value={recipeForm.prep_time}
                    onChange={(e) => setRecipeForm(prev => ({ 
                      ...prev, 
                      prep_time: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cook-time">Cook Time (min)</Label>
                  <Input
                    id="cook-time"
                    type="number"
                    min="0"
                    value={recipeForm.cook_time}
                    onChange={(e) => setRecipeForm(prev => ({ 
                      ...prev, 
                      cook_time: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={recipeForm.difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                      setRecipeForm(prev => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Dietary Tags */}
              <div className="space-y-2">
                <Label>Dietary Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_TAGS.map(tag => (
                    <Badge
                      key={tag}
                      variant={recipeForm.dietary_tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleDietaryTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>
                Search and add ingredients to your recipe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Food Search */}
              <div className="space-y-2">
                <Label htmlFor="food-search">Search for ingredients</Label>
                <Input
                  id="food-search"
                  placeholder="e.g., chicken breast, onion, olive oil..."
                  value={foodSearchQuery}
                  onChange={(e) => {
                    setFoodSearchQuery(e.target.value)
                    searchFoods(e.target.value)
                  }}
                />
                
                {isSearching && (
                  <div className="text-sm text-muted-foreground">Searching...</div>
                )}
                
                {foodSearchResults.length > 0 && (
                  <div className="border rounded-lg max-h-40 overflow-y-auto">
                    {foodSearchResults.map((food) => (
                      <div
                        key={food.id}
                        className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                        onClick={() => addIngredient(food)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{food.name}</div>
                            {food.brand && (
                              <div className="text-sm text-muted-foreground">{food.brand}</div>
                            )}
                          </div>
                          <Plus className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ingredients List */}
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{ingredient.food_name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                        <Select
                          value={ingredient.unit}
                          onValueChange={(value) => updateIngredient(index, 'unit', value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMON_UNITS.map(unit => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Notes (optional)"
                          value={ingredient.notes || ''}
                          onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {ingredients.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No ingredients added yet. Search and add ingredients above.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>
                Step-by-step cooking instructions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recipeForm.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <Textarea
                      placeholder={`Step ${index + 1}: Describe what to do...`}
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      rows={2}
                    />
                  </div>
                  {recipeForm.instructions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInstruction(index)}
                      className="mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={addInstruction}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Nutrition Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Nutrition Facts
              </CardTitle>
              <CardDescription>
                Automatically calculated from ingredients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="per-serving" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="per-serving">Per Serving</TabsTrigger>
                  <TabsTrigger value="total">Total Recipe</TabsTrigger>
                </TabsList>
                
                <TabsContent value="per-serving" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Calories</span>
                      <span className="text-lg font-bold text-blue-600">
                        {nutritionPerServing.calories}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Protein</span>
                      <span className="font-medium">{nutritionPerServing.protein}g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Carbohydrates</span>
                      <span className="font-medium">{nutritionPerServing.carbohydrates}g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Fat</span>
                      <span className="font-medium">{nutritionPerServing.fat}g</span>
                    </div>
                    
                    {nutritionPerServing.fiber && (
                      <div className="flex justify-between items-center text-sm">
                        <span>Fiber</span>
                        <span>{nutritionPerServing.fiber}g</span>
                      </div>
                    )}
                    
                    {nutritionPerServing.sodium && (
                      <div className="flex justify-between items-center text-sm">
                        <span>Sodium</span>
                        <span>{nutritionPerServing.sodium}mg</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="total" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Calories</span>
                      <span className="text-lg font-bold text-blue-600">
                        {recipeNutrition.calories}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Protein</span>
                      <span className="font-medium">{recipeNutrition.protein}g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Carbs</span>
                      <span className="font-medium">{recipeNutrition.carbohydrates}g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Fat</span>
                      <span className="font-medium">{recipeNutrition.fat}g</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground text-center">
                  Nutrition updates automatically as you add ingredients
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipe Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recipe Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Total Time:</span>
                <span className="font-medium">
                  {recipeForm.prep_time + recipeForm.cook_time} min
                </span>
              </div>
              <div className="flex justify-between">
                <span>Prep Time:</span>
                <span className="font-medium">{recipeForm.prep_time} min</span>
              </div>
              <div className="flex justify-between">
                <span>Cook Time:</span>
                <span className="font-medium">{recipeForm.cook_time} min</span>
              </div>
              <div className="flex justify-between">
                <span>Servings:</span>
                <span className="font-medium">{recipeForm.servings}</span>
              </div>
              <div className="flex justify-between">
                <span>Difficulty:</span>
                <Badge variant="outline">
                  {recipeForm.difficulty}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Ingredients:</span>
                <span className="font-medium">{ingredients.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}