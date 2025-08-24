'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Clock, Users, ChefHat, Filter, Star, Copy, Edit, Trash2, Utensils } from 'lucide-react'
import { MealTemplate, MealType, NutritionData, Food } from '@/lib/types/nutrition'
import { FoodDatabase } from '@/lib/utils/food-database'

interface MealTemplatesProps {
  userId: string
  onTemplateSelected?: (template: MealTemplate) => void
}

interface TemplateFilters {
  mealType?: MealType
  dietaryRestrictions: string[]
  maxCalories?: number
  maxPrepTime?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  searchQuery: string
}

const DIETARY_RESTRICTIONS = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 
  'low-carb', 'high-protein', 'mediterranean', 'diabetic-friendly'
]

const MEAL_TYPES: { value: MealType; label: string; icon: string }[] = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snacks', icon: '🍎' }
]

const TEMPLATE_TAGS = [
  'quick', 'make-ahead', 'budget-friendly', 'high-fiber', 'anti-inflammatory',
  'heart-healthy', 'muscle-building', 'weight-loss', 'energy-boosting'
]

const MOCK_TEMPLATES: MealTemplate[] = [
  {
    id: '1',
    name: 'Power Protein Bowl',
    description: 'High-protein breakfast bowl with Greek yogurt, berries, and nuts',
    meal_type: 'breakfast',
    dietary_restrictions: ['vegetarian', 'gluten-free'],
    target_calories: 350,
    target_protein: 25,
    difficulty: 'easy',
    prep_time: 5,
    ingredients: [
      { food_id: '5', quantity: 170, unit: 'g' }, // Greek yogurt
      { food_id: '4', quantity: 75, unit: 'g' },  // Blueberries
      { food_id: '15', quantity: 30, unit: 'g' }, // Almonds
    ],
    instructions: [
      'Add Greek yogurt to bowl',
      'Top with fresh blueberries',
      'Sprinkle sliced almonds on top',
      'Optional: drizzle with honey'
    ],
    tags: ['high-protein', 'quick', 'energy-boosting'],
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Mediterranean Quinoa Salad',
    description: 'Fresh and nutritious salad with quinoa, vegetables, and feta',
    meal_type: 'lunch',
    dietary_restrictions: ['vegetarian', 'mediterranean'],
    target_calories: 420,
    target_protein: 18,
    difficulty: 'medium',
    prep_time: 20,
    ingredients: [
      { food_id: '8', quantity: 100, unit: 'g' }, // Cooked quinoa
      { food_id: '11', quantity: 100, unit: 'g' }, // Cucumber
      { food_id: '10', quantity: 80, unit: 'g' },  // Tomatoes
      { food_id: '19', quantity: 50, unit: 'g' },  // Feta cheese
    ],
    instructions: [
      'Cook quinoa according to package directions and let cool',
      'Dice cucumber and tomatoes',
      'Mix quinoa with vegetables',
      'Crumble feta on top',
      'Dress with olive oil and lemon juice'
    ],
    tags: ['mediterranean', 'make-ahead', 'heart-healthy'],
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Keto Avocado Chicken Salad',
    description: 'Low-carb, high-fat meal perfect for keto diet',
    meal_type: 'lunch',
    dietary_restrictions: ['keto', 'low-carb', 'gluten-free'],
    target_calories: 520,
    target_protein: 35,
    difficulty: 'easy',
    prep_time: 10,
    ingredients: [
      { food_id: '4', quantity: 120, unit: 'g' }, // Chicken breast
      { food_id: '6', quantity: 100, unit: 'g' }, // Avocado
      { food_id: '9', quantity: 50, unit: 'g' },  // Spinach
      { food_id: '20', quantity: 15, unit: 'g' }, // Olive oil
    ],
    instructions: [
      'Grill or bake chicken breast and slice',
      'Mash half the avocado, dice the other half',
      'Mix chicken with mashed avocado',
      'Serve over fresh spinach',
      'Drizzle with olive oil'
    ],
    tags: ['keto', 'high-protein', 'low-carb', 'quick'],
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Veggie Power Smoothie',
    description: 'Nutrient-packed green smoothie for breakfast or snack',
    meal_type: 'breakfast',
    dietary_restrictions: ['vegan', 'gluten-free', 'dairy-free'],
    target_calories: 280,
    target_protein: 15,
    difficulty: 'easy',
    prep_time: 5,
    ingredients: [
      { food_id: '9', quantity: 40, unit: 'g' },  // Spinach
      { food_id: '2', quantity: 120, unit: 'g' }, // Banana
      { food_id: '16', quantity: 30, unit: 'g' }, // Protein powder
      { food_id: '17', quantity: 200, unit: 'ml' }, // Almond milk
    ],
    instructions: [
      'Add all ingredients to blender',
      'Blend until smooth',
      'Add ice if desired consistency is thicker',
      'Pour into glass and enjoy'
    ],
    tags: ['vegan', 'quick', 'energy-boosting', 'high-fiber'],
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Asian Sesame Tofu Bowl',
    description: 'Flavorful plant-based dinner with tofu and vegetables',
    meal_type: 'dinner',
    dietary_restrictions: ['vegan', 'dairy-free'],
    target_calories: 450,
    target_protein: 22,
    difficulty: 'medium',
    prep_time: 25,
    ingredients: [
      { food_id: '12', quantity: 150, unit: 'g' }, // Tofu
      { food_id: '7', quantity: 100, unit: 'g' },  // Brown rice
      { food_id: '3', quantity: 80, unit: 'g' },   // Broccoli
      { food_id: '8', quantity: 60, unit: 'g' },   // Bell peppers
    ],
    instructions: [
      'Press and cube tofu, then pan-fry until golden',
      'Steam broccoli and bell peppers',
      'Cook brown rice',
      'Toss tofu with sesame oil and soy sauce',
      'Serve over rice with vegetables'
    ],
    tags: ['vegan', 'high-protein', 'asian-inspired', 'balanced'],
    created_at: new Date().toISOString()
  }
]

export function MealTemplates({ userId, onTemplateSelected }: MealTemplatesProps) {
  const [templates, setTemplates] = useState<MealTemplate[]>(MOCK_TEMPLATES)
  const [filteredTemplates, setFilteredTemplates] = useState<MealTemplate[]>(MOCK_TEMPLATES)
  const [filters, setFilters] = useState<TemplateFilters>({
    dietaryRestrictions: [],
    searchQuery: ''
  })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<MealTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const foodDatabase = FoodDatabase.getInstance()

  useEffect(() => {
    foodDatabase.initialize()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, templates])

  const applyFilters = () => {
    let filtered = [...templates]

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Meal type
    if (filters.mealType) {
      filtered = filtered.filter(template => template.meal_type === filters.mealType)
    }

    // Dietary restrictions
    if (filters.dietaryRestrictions.length > 0) {
      filtered = filtered.filter(template =>
        filters.dietaryRestrictions.every(restriction =>
          template.dietary_restrictions.includes(restriction)
        )
      )
    }

    // Max calories
    if (filters.maxCalories) {
      filtered = filtered.filter(template =>
        (template.target_calories || 0) <= filters.maxCalories!
      )
    }

    // Max prep time
    if (filters.maxPrepTime) {
      filtered = filtered.filter(template =>
        (template.prep_time || 0) <= filters.maxPrepTime!
      )
    }

    // Difficulty
    if (filters.difficulty) {
      filtered = filtered.filter(template => template.difficulty === filters.difficulty)
    }

    setFilteredTemplates(filtered)
  }

  const calculateTemplateNutrition = async (template: MealTemplate): Promise<NutritionData> => {
    try {
      const nutritionPromises = template.ingredients.map(async (ingredient) => {
        const food = await foodDatabase.getFoodById(ingredient.food_id)
        if (!food) return { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }

        return foodDatabase.calculateNutritionForQuantity(food, ingredient.quantity, ingredient.unit)
      })

      const nutritionData = await Promise.all(nutritionPromises)
      return foodDatabase.combineNutritionData(nutritionData)
    } catch (error) {
      console.error('Failed to calculate template nutrition:', error)
      return { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
    }
  }

  const toggleDietaryRestriction = (restriction: string) => {
    setFilters(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }))
  }

  const clearFilters = () => {
    setFilters({
      dietaryRestrictions: [],
      searchQuery: ''
    })
  }

  const duplicateTemplate = (template: MealTemplate) => {
    const newTemplate: MealTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Copy)`,
      created_at: new Date().toISOString()
    }
    setTemplates(prev => [newTemplate, ...prev])
  }

  const deleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId))
    }
  }

  const getMealTypeIcon = (mealType: MealType) => {
    const type = MEAL_TYPES.find(t => t.value === mealType)
    return type?.icon || '🍽️'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meal Templates</h1>
          <p className="text-muted-foreground">
            Pre-designed meal templates for different dietary needs and goals
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Meal Template</DialogTitle>
              <DialogDescription>
                Design a reusable meal template with ingredients and instructions
              </DialogDescription>
            </DialogHeader>
            <div className="text-center text-muted-foreground py-8">
              Template creation form would go here
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Templates</Label>
              <Input
                id="search"
                placeholder="Search by name, ingredient, or tag..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meal-type">Meal Type</Label>
              <Select
                value={filters.mealType || ''}
                onValueChange={(value: MealType | '') => 
                  setFilters(prev => ({ ...prev, mealType: value || undefined }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All meal types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All meal types</SelectItem>
                  {MEAL_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-calories">Max Calories</Label>
              <Input
                id="max-calories"
                type="number"
                placeholder="e.g., 500"
                value={filters.maxCalories || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  maxCalories: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-prep">Max Prep Time (min)</Label>
              <Input
                id="max-prep"
                type="number"
                placeholder="e.g., 30"
                value={filters.maxPrepTime || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  maxPrepTime: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dietary Restrictions</Label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_RESTRICTIONS.map(restriction => (
                <Badge
                  key={restriction}
                  variant={filters.dietaryRestrictions.includes(restriction) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleDietaryRestriction(restriction)}
                >
                  {restriction.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredTemplates.length} of {templates.length} templates
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getMealTypeIcon(template.meal_type)}</span>
                  <Badge variant="outline" className="text-xs">
                    {template.meal_type}
                  </Badge>
                  <div className={`w-2 h-2 rounded-full ${getDifficultyColor(template.difficulty)}`} />
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardTitle className="text-lg">{template.name}</CardTitle>
              {template.description && (
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {template.target_calories && (
                  <div className="flex items-center gap-1">
                    <Utensils className="h-3 w-3" />
                    {template.target_calories} cal
                  </div>
                )}
                {template.prep_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.prep_time} min
                  </div>
                )}
                {template.target_protein && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    {template.target_protein}g protein
                  </div>
                )}
              </div>

              {/* Dietary Restrictions */}
              {template.dietary_restrictions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.dietary_restrictions.slice(0, 3).map(restriction => (
                    <Badge key={restriction} variant="secondary" className="text-xs">
                      {restriction.replace('-', ' ')}
                    </Badge>
                  ))}
                  {template.dietary_restrictions.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.dietary_restrictions.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Tags */}
              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <span>{getMealTypeIcon(template.meal_type)}</span>
                        {template.name}
                      </DialogTitle>
                      {template.description && (
                        <DialogDescription>{template.description}</DialogDescription>
                      )}
                    </DialogHeader>
                    
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                        <TabsTrigger value="instructions">Instructions</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-medium mb-2">Nutrition</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Calories:</span>
                                <span>{template.target_calories || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Protein:</span>
                                <span>{template.target_protein || 'N/A'}g</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Details</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Prep Time:</span>
                                <span>{template.prep_time || 'N/A'} min</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Difficulty:</span>
                                <span className="capitalize">{template.difficulty}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">Dietary Information</h4>
                          <div className="flex flex-wrap gap-1">
                            {template.dietary_restrictions.map(restriction => (
                              <Badge key={restriction} variant="secondary">
                                {restriction.replace('-', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="ingredients" className="space-y-4">
                        <div className="space-y-3">
                          {template.ingredients.map((ingredient, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">Food Item #{ingredient.food_id}</div>
                                <div className="text-sm text-muted-foreground">
                                  {ingredient.quantity} {ingredient.unit}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="instructions" className="space-y-4">
                        {template.instructions ? (
                          <div className="space-y-3">
                            {template.instructions.map((instruction, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                  {index + 1}
                                </div>
                                <p className="text-sm pt-1">{instruction}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            No instructions provided for this template
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                
                <Button
                  size="sm"
                  onClick={() => onTemplateSelected?.(template)}
                  className="flex-1"
                >
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
            <p className="text-muted-foreground mb-4">
              No meal templates match your current filters. Try adjusting your search criteria.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}