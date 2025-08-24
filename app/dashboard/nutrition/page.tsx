'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  Plus, 
  TrendingUp, 
  Target,
  Calendar,
  Camera,
  BookOpen,
  Utensils,
  ChefHat,
  Calculator,
  Brain
} from 'lucide-react'
import { NutritionDashboard } from '@/components/nutrition/nutrition-dashboard'
import { FoodLogger } from '@/components/nutrition/food-logger'
import { MealPlanner } from '@/components/nutrition/meal-planner'
import { RecipeBuilder } from '@/components/nutrition/recipe-builder'
import { MacroTracker } from '@/components/nutrition/macro-tracker'
import { NutritionGoals } from '@/components/nutrition/nutrition-goals'
import { MealTemplates } from '@/components/nutrition/meal-templates'
import { NutritionAnalytics } from '@/components/nutrition/nutrition-analytics'

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  
  // Mock user data - in real implementation, this would come from authentication
  const userId = 'mock-user-id'

  return (
    <div className="container mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nutrition Center</h1>
            <p className="text-muted-foreground">
              Comprehensive nutrition tracking, meal planning, and analytics
            </p>
          </div>
        </div>

        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="logger" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Log Food</span>
          </TabsTrigger>
          <TabsTrigger value="planner" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Meal Plan</span>
          </TabsTrigger>
          <TabsTrigger value="recipes" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            <span className="hidden sm:inline">Recipes</span>
          </TabsTrigger>
          <TabsTrigger value="tracker" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Macros</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Goals</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <NutritionDashboard 
            userId={userId} 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </TabsContent>

        <TabsContent value="logger">
          <FoodLogger 
            userId={userId} 
            selectedDate={selectedDate}
          />
        </TabsContent>

        <TabsContent value="planner">
          <MealPlanner userId={userId} />
        </TabsContent>

        <TabsContent value="recipes">
          <RecipeBuilder userId={userId} />
        </TabsContent>

        <TabsContent value="tracker">
          <MacroTracker 
            userId={userId} 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </TabsContent>

        <TabsContent value="goals">
          <NutritionGoals userId={userId} />
        </TabsContent>

        <TabsContent value="templates">
          <MealTemplates userId={userId} />
        </TabsContent>

        <TabsContent value="analytics">
          <NutritionAnalytics userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}