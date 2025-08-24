'use client';

import { useState } from 'react';
import { ClientWorkout, ExerciseLog, WorkoutStats } from '@/types/workouts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Award,
  Activity,
  Clock,
  Zap,
  Users,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  Share
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutAnalyticsProps {
  clientId?: string;
  workouts: ClientWorkout[];
  exerciseLogs: ExerciseLog[];
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange?: (range: 'week' | 'month' | 'quarter' | 'year') => void;
}

// Mock data - in real app would come from props/API
const mockWorkoutStats: WorkoutStats = {
  totalWorkouts: 47,
  totalDuration: 2340, // minutes
  totalVolume: 125000, // kg
  averageWorkoutDuration: 49.8,
  favoriteExercises: [
    { exercise_id: '1', count: 23, name: 'Push-ups' },
    { exercise_id: '2', count: 19, name: 'Squats' },
    { exercise_id: '3', count: 17, name: 'Deadlifts' },
    { exercise_id: '4', count: 15, name: 'Pull-ups' },
    { exercise_id: '5', count: 12, name: 'Bench Press' }
  ],
  strengthProgress: [
    { exercise_id: '3', progress: 25.5 }, // Deadlifts +25.5%
    { exercise_id: '5', progress: 18.2 }, // Bench Press +18.2%
    { exercise_id: '4', progress: 15.0 }, // Pull-ups +15%
    { exercise_id: '1', progress: 12.8 }, // Push-ups +12.8%
    { exercise_id: '2', progress: 8.5 }   // Squats +8.5%
  ],
  completionRate: 92.3,
  currentStreak: 5,
  bestStreak: 12
};

const weeklyData = [
  { week: 'Week 1', workouts: 3, duration: 135, volume: 8500 },
  { week: 'Week 2', workouts: 4, duration: 180, volume: 11200 },
  { week: 'Week 3', workouts: 3, duration: 142, volume: 9100 },
  { week: 'Week 4', workouts: 4, duration: 195, volume: 12800 },
];

export function WorkoutAnalytics({ 
  clientId,
  workouts = [], 
  exerciseLogs = [], 
  timeRange = 'month',
  onTimeRangeChange 
}: WorkoutAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState('volume');

  const getCompletedWorkouts = () => {
    return workouts.filter(w => w.status === 'completed');
  };

  const calculateTotalVolume = () => {
    return exerciseLogs.reduce((total, log) => {
      if (log.reps_completed && log.weight_used) {
        return total + (log.reps_completed * log.weight_used);
      }
      return total;
    }, 0);
  };

  const getAverageWorkoutDuration = () => {
    const completed = getCompletedWorkouts();
    if (completed.length === 0) return 0;
    
    const totalDuration = completed.reduce((sum, workout) => 
      sum + (workout.actual_duration || workout.workout_template?.estimated_duration || 0), 0
    );
    
    return Math.round(totalDuration / completed.length);
  };

  const getWorkoutFrequency = () => {
    const completed = getCompletedWorkouts();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const thisWeek = completed.filter(w => 
      w.completed_at && new Date(w.completed_at) >= oneWeekAgo
    ).length;
    
    return thisWeek;
  };

  const getMostImprovedExercise = () => {
    // This would normally calculate from exercise logs
    return mockWorkoutStats.strengthProgress[0];
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'quarter': return 'Last 3 Months';
      case 'year': return 'This Year';
      default: return 'This Month';
    }
  };

  const stats = {
    totalWorkouts: getCompletedWorkouts().length,
    totalDuration: getCompletedWorkouts().reduce((sum, w) => 
      sum + (w.actual_duration || w.workout_template?.estimated_duration || 0), 0
    ),
    totalVolume: calculateTotalVolume(),
    averageWorkoutDuration: getAverageWorkoutDuration(),
    weeklyFrequency: getWorkoutFrequency(),
    completionRate: workouts.length > 0 ? 
      (getCompletedWorkouts().length / workouts.length) * 100 : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workout Analytics</h2>
          <p className="text-gray-600">Track your fitness progress and performance</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Workouts</p>
                <p className="text-3xl font-bold text-primary">{stats.totalWorkouts}</p>
                <p className="text-xs text-gray-500 mt-1">{getTimeRangeLabel()}</p>
              </div>
              <Target className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-3xl font-bold text-primary">
                  {Math.floor(stats.totalDuration / 60)}h {stats.totalDuration % 60}m
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% vs last period
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Volume</p>
                <p className="text-3xl font-bold text-primary">
                  {(stats.totalVolume / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18% vs last period
                </p>
              </div>
              <Activity className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-primary">
                  {stats.completionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5% vs last period
                </p>
              </div>
              <Award className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="consistency">Consistency</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2" />
                    Weekly Progress
                  </CardTitle>
                  <CardDescription>Your workout activity over time</CardDescription>
                </div>
                
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volume">Volume</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="workouts">Workouts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Simple bar chart representation */}
              <div className="space-y-4">
                {weeklyData.map((week, index) => (
                  <div key={week.week} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{week.week}</span>
                      <span className="font-medium">
                        {selectedMetric === 'volume' && `${(week.volume / 1000).toFixed(1)}k kg`}
                        {selectedMetric === 'duration' && `${week.duration} min`}
                        {selectedMetric === 'workouts' && `${week.workouts} workouts`}
                      </span>
                    </div>
                    <Progress 
                      value={
                        selectedMetric === 'volume' ? (week.volume / 15000) * 100 :
                        selectedMetric === 'duration' ? (week.duration / 200) * 100 :
                        (week.workouts / 5) * 100
                      } 
                      className="h-3"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Workout Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {mockWorkoutStats.currentStreak}
                </div>
                <p className="text-sm text-gray-600">days current</p>
                <p className="text-xs text-gray-500 mt-2">
                  Best: {mockWorkoutStats.bestStreak} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Avg. Workout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stats.averageWorkoutDuration}
                </div>
                <p className="text-sm text-gray-600">minutes</p>
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3 min vs last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Weekly Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {stats.weeklyFrequency}
                </div>
                <p className="text-sm text-gray-600">workouts this week</p>
                <p className="text-xs text-gray-500 mt-2">
                  Target: 4/week
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* Strength Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Strength Progress
              </CardTitle>
              <CardDescription>
                Improvement in your key exercises over time
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {mockWorkoutStats.strengthProgress.map((exercise, index) => (
                <div key={exercise.exercise_id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {mockWorkoutStats.favoriteExercises.find(e => e.exercise_id === exercise.exercise_id)?.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-medium">+{exercise.progress}%</span>
                      <Badge variant="secondary">{index + 1}</Badge>
                    </div>
                  </div>
                  <Progress value={Math.min(exercise.progress * 2, 100)} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Personal Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Recent Personal Records
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {[
                { exercise: 'Deadlift', previous: '135 kg', current: '142.5 kg', date: '3 days ago' },
                { exercise: 'Bench Press', previous: '80 kg', current: '82.5 kg', date: '1 week ago' },
                { exercise: 'Pull-ups', previous: '8 reps', current: '10 reps', date: '2 weeks ago' }
              ].map((pr, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-green-800">{pr.exercise}</h4>
                    <p className="text-sm text-green-600">
                      {pr.previous} → {pr.current}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">New PR!</Badge>
                    <p className="text-xs text-green-600 mt-1">{pr.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-6">
          {/* Favorite Exercises */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Most Performed Exercises
              </CardTitle>
              <CardDescription>
                Your top exercises by frequency
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {mockWorkoutStats.favoriteExercises.map((exercise, index) => (
                <div key={exercise.exercise_id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{exercise.name}</span>
                    </div>
                    <span className="text-gray-600">{exercise.count} times</span>
                  </div>
                  <Progress value={(exercise.count / mockWorkoutStats.favoriteExercises[0].count) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Exercise Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Workout Distribution
              </CardTitle>
              <CardDescription>
                Time spent on different exercise categories
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { category: 'Strength', percentage: 45, color: 'bg-blue-500' },
                  { category: 'Cardio', percentage: 25, color: 'bg-red-500' },
                  { category: 'Flexibility', percentage: 20, color: 'bg-green-500' },
                  { category: 'Functional', percentage: 10, color: 'bg-purple-500' }
                ].map((cat) => (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{cat.category}</span>
                      <span className="text-sm text-gray-600">{cat.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${cat.color} h-2 rounded-full`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consistency" className="space-y-6">
          {/* Workout Consistency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Workout Consistency
              </CardTitle>
              <CardDescription>
                Your workout schedule and adherence patterns
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="font-medium text-gray-600">{day}</div>
                  ))}
                </div>
                
                {/* Calendar grid representation */}
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 28 }, (_, i) => {
                    const hasWorkout = Math.random() > 0.4; // Mock data
                    return (
                      <div
                        key={i}
                        className={cn(
                          'aspect-square rounded-md flex items-center justify-center text-xs',
                          hasWorkout 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-100 text-gray-400'
                        )}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Workout completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-100 rounded"></div>
                    <span>Rest day</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streaks & Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievement Streaks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Current Streak</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-orange-600">
                      {mockWorkoutStats.currentStreak}
                    </span>
                    <span className="text-gray-600">days</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Best Streak</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600">
                      {mockWorkoutStats.bestStreak}
                    </span>
                    <span className="text-gray-600">days</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>This Month</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-blue-600">18</span>
                    <span className="text-gray-600">workouts</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Workouts (Target: 4)</span>
                    <span className="font-medium">{stats.weeklyFrequency}/4</span>
                  </div>
                  <Progress value={(stats.weeklyFrequency / 4) * 100} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Duration (Target: 180min)</span>
                    <span className="font-medium">165/180</span>
                  </div>
                  <Progress value={(165 / 180) * 100} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Volume (Target: 15k kg)</span>
                    <span className="font-medium">12.8k/15k</span>
                  </div>
                  <Progress value={(12.8 / 15) * 100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Performance Insights
              </CardTitle>
              <CardDescription>
                AI-powered analysis of your workout patterns
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {[
                {
                  type: 'positive',
                  title: 'Excellent Consistency',
                  description: 'You\'ve maintained a 5-day workout streak. Keep it up!',
                  confidence: 95
                },
                {
                  type: 'improvement',
                  title: 'Strength Gains Accelerating',
                  description: 'Your deadlift has improved 25% this month. Consider progressive overload.',
                  confidence: 88
                },
                {
                  type: 'warning',
                  title: 'Potential Overtraining',
                  description: 'Your workout intensity has been high for 10 days. Consider a rest day.',
                  confidence: 72
                },
                {
                  type: 'suggestion',
                  title: 'Add Cardio Variety',
                  description: 'You mainly do strength training. Adding cardio could improve overall fitness.',
                  confidence: 81
                }
              ].map((insight, index) => (
                <div key={index} className={cn(
                  'p-4 rounded-lg border-l-4',
                  insight.type === 'positive' && 'bg-green-50 border-green-500',
                  insight.type === 'improvement' && 'bg-blue-50 border-blue-500',
                  insight.type === 'warning' && 'bg-orange-50 border-orange-500',
                  insight.type === 'suggestion' && 'bg-purple-50 border-purple-500'
                )}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {insight.confidence}% confident
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Personalized suggestions to improve your fitness journey
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {[
                {
                  category: 'Strength',
                  recommendation: 'Increase your bench press weight by 2.5kg next session',
                  priority: 'high'
                },
                {
                  category: 'Recovery',
                  recommendation: 'Schedule a rest day after 3 consecutive strength sessions',
                  priority: 'medium'
                },
                {
                  category: 'Variety',
                  recommendation: 'Try adding yoga or pilates once per week for flexibility',
                  priority: 'low'
                },
                {
                  category: 'Nutrition',
                  recommendation: 'Consider tracking protein intake to support your strength gains',
                  priority: 'medium'
                }
              ].map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-2',
                    rec.priority === 'high' && 'bg-red-500',
                    rec.priority === 'medium' && 'bg-yellow-500',
                    rec.priority === 'low' && 'bg-green-500'
                  )} />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline" size="sm">{rec.category}</Badge>
                      <Badge 
                        variant="secondary" 
                        size="sm"
                        className={cn(
                          rec.priority === 'high' && 'text-red-700',
                          rec.priority === 'medium' && 'text-yellow-700',
                          rec.priority === 'low' && 'text-green-700'
                        )}
                      >
                        {rec.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{rec.recommendation}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}