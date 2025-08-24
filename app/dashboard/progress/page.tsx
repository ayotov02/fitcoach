'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  Activity,
  Weight,
  Ruler,
  Heart,
  Trophy,
  Camera,
  Download,
  Share
} from 'lucide-react'
import { AIProgressAnalyzer } from '@/components/ai/AIProgressAnalyzer'

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock progress data - in real app this would come from the database
  const progressStats = {
    currentWeight: 175,
    targetWeight: 160,
    weightChange: -8,
    bodyFatPercentage: 15.2,
    muscleGain: 3.5,
    workoutsCompleted: 28,
    workoutStreak: 7,
    nutritionAdherence: 85
  }

  const weeklyProgress = [
    { week: 'Week 1', weight: 183, bodyFat: 18.5 },
    { week: 'Week 2', weight: 181, bodyFat: 17.8 },
    { week: 'Week 3', weight: 179, bodyFat: 17.2 },
    { week: 'Week 4', weight: 177, bodyFat: 16.5 },
    { week: 'Week 5', weight: 175, bodyFat: 15.2 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Progress Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your fitness journey with comprehensive progress analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share Progress
          </Button>
          <Button size="sm">
            <Camera className="h-4 w-4 mr-2" />
            Add Progress Photo
          </Button>
        </div>
      </div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Weight className="h-4 w-4" />
              Weight Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressStats.currentWeight} lbs</div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-green-600">{progressStats.weightChange} lbs</span>
              <span className="text-muted-foreground">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Body Fat %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressStats.bodyFatPercentage}%</div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-green-600">-3.3%</span>
              <span className="text-muted-foreground">from start</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressStats.workoutsCompleted}</div>
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-3 w-3 text-yellow-600" />
              <span className="text-yellow-600">{progressStats.workoutStreak} day streak</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Adherence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressStats.nutritionAdherence}%</div>
            <Progress value={progressStats.nutritionAdherence} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="photos">Progress Photos</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weight Progress</CardTitle>
                <CardDescription>Track your weight changes over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyProgress.map((week, index) => (
                    <div key={week.week} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{week.week}</p>
                        <p className="text-sm text-muted-foreground">
                          Body Fat: {week.bodyFat}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{week.weight} lbs</p>
                        {index > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            {week.weight < weeklyProgress[index - 1].weight ? (
                              <TrendingDown className="h-3 w-3 text-green-600" />
                            ) : (
                              <TrendingUp className="h-3 w-3 text-red-600" />
                            )}
                            <span className={week.weight < weeklyProgress[index - 1].weight ? 'text-green-600' : 'text-red-600'}>
                              {(week.weight - weeklyProgress[index - 1].weight).toFixed(1)} lbs
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goals Progress</CardTitle>
                <CardDescription>Your progress towards fitness goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Weight Loss Goal</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.abs(progressStats.weightChange)} / {progressStats.currentWeight - progressStats.targetWeight + Math.abs(progressStats.weightChange)} lbs
                      </span>
                    </div>
                    <Progress 
                      value={(Math.abs(progressStats.weightChange) / (progressStats.currentWeight - progressStats.targetWeight + Math.abs(progressStats.weightChange))) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Monthly Workouts</span>
                      <span className="text-sm text-muted-foreground">{progressStats.workoutsCompleted} / 30</span>
                    </div>
                    <Progress value={(progressStats.workoutsCompleted / 30) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Nutrition Adherence</span>
                      <span className="text-sm text-muted-foreground">{progressStats.nutritionAdherence}%</span>
                    </div>
                    <Progress value={progressStats.nutritionAdherence} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Celebrate your progress milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Trophy className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-semibold">7-Day Streak!</p>
                    <p className="text-sm text-green-700">Consistent workouts</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-semibold">8 lbs Lost</p>
                    <p className="text-sm text-blue-700">Halfway to goal</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <Activity className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-semibold">Body Fat Down</p>
                    <p className="text-sm text-purple-700">3.3% reduction</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Measurements Tab */}
        <TabsContent value="measurements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Body Measurements</CardTitle>
              <CardDescription>Track detailed body measurements and composition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Ruler className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Measurement tracking feature coming soon. Add body measurements to get detailed progress insights.
                </p>
                <Button>
                  <Ruler className="h-4 w-4 mr-2" />
                  Add Measurements
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Photos Tab */}
        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Photos</CardTitle>
              <CardDescription>Visual tracking of your transformation journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No progress photos yet. Start documenting your transformation journey!
                </p>
                <Button>
                  <Camera className="h-4 w-4 mr-2" />
                  Upload First Photo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="ai-analysis" className="space-y-4">
          <AIProgressAnalyzer
            userId="current-user-id" // This would be dynamic
            userRole="client"
            onRecommendationGenerated={(rec) => console.log('Progress recommendation:', rec)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}