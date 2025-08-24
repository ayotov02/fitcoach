import { requireAuth } from '@/lib/auth/auth-helpers';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dumbbell, 
  Plus, 
  Clock, 
  Users, 
  Play, 
  MoreHorizontal,
  Calendar,
  Filter,
  Search,
} from 'lucide-react';

export default async function WorkoutsPage() {
  const user = await requireAuth();
  const supabase = createServerSupabaseClient();

  // Fetch user role
  const { data: userData } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  const isCoach = userData?.role === 'coach';

  // Mock workout data - in real app, fetch from database
  const workouts = [
    {
      id: '1',
      name: 'Upper Body Strength',
      description: 'Comprehensive upper body workout focusing on strength building',
      duration: 45,
      exercises: 8,
      difficulty: 'Intermediate',
      type: 'Strength',
      assignedTo: isCoach ? 5 : null,
      status: 'published',
      lastCompleted: isCoach ? null : '2024-01-20',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'HIIT Cardio Blast',
      description: 'High intensity interval training for maximum calorie burn',
      duration: 30,
      exercises: 6,
      difficulty: 'Advanced',
      type: 'Cardio',
      assignedTo: isCoach ? 8 : null,
      status: 'published',
      lastCompleted: isCoach ? null : '2024-01-18',
      createdAt: '2024-01-12',
    },
    {
      id: '3',
      name: 'Lower Body Power',
      description: 'Explosive lower body movements for power development',
      duration: 50,
      exercises: 7,
      difficulty: 'Advanced',
      type: 'Strength',
      assignedTo: isCoach ? 3 : null,
      status: 'draft',
      lastCompleted: null,
      createdAt: '2024-01-10',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Cardio': return '🏃';
      case 'Strength': return '💪';
      case 'Flexibility': return '🧘';
      default: return '🏋️';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isCoach ? 'Workout Library' : 'My Workouts'}
          </h1>
          <p className="text-gray-600">
            {isCoach 
              ? `Manage and create workouts for your clients`
              : `Your personalized workout programs`
            }
          </p>
        </div>
        <div className="flex gap-2">
          {isCoach && (
            <>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Workout
              </Button>
            </>
          )}
          {!isCoach && (
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Button>
          )}
        </div>
      </div>

      {/* Search and Quick Stats */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder={isCoach ? "Search workouts..." : "Search my workouts..."}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Published: {workouts.filter(w => w.status === 'published').length}</span>
          </div>
          {isCoach && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Draft: {workouts.filter(w => w.status === 'draft').length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Today's Workout (Client Only) */}
      {!isCoach && (
        <Card className="bg-gradient-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Dumbbell className="mr-2 h-5 w-5 text-primary" />
              Today's Workout
            </CardTitle>
            <CardDescription>Your scheduled workout for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Upper Body Strength</h3>
                <p className="text-sm text-gray-600">45 minutes • 8 exercises</p>
              </div>
              <Button size="lg">
                <Play className="mr-2 h-4 w-4" />
                Start Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workouts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {workouts.map((workout) => (
          <Card key={workout.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getTypeIcon(workout.type)}</span>
                  <div>
                    <CardTitle className="text-lg">{workout.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {workout.description}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Workout Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{workout.duration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-gray-400" />
                  <span>{workout.exercises} exercises</span>
                </div>
                {isCoach && workout.assignedTo && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{workout.assignedTo} clients</span>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant="outline" 
                  className={getDifficultyColor(workout.difficulty)}
                >
                  {workout.difficulty}
                </Badge>
                <Badge variant="outline">
                  {workout.type}
                </Badge>
                {isCoach && (
                  <Badge 
                    variant={workout.status === 'published' ? 'default' : 'secondary'}
                  >
                    {workout.status}
                  </Badge>
                )}
              </div>

              {/* Last Completed (Client) */}
              {!isCoach && workout.lastCompleted && (
                <div className="text-sm text-gray-600">
                  Last completed: {new Date(workout.lastCompleted).toLocaleDateString()}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {isCoach ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Assign
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1">
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Play className="mr-2 h-3 w-3" />
                      Start
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {workouts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Dumbbell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isCoach ? 'No workouts created yet' : 'No workouts assigned'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isCoach 
                ? 'Create your first workout to get started with your coaching business.'
                : 'Your coach will assign workouts to help you reach your fitness goals.'
              }
            </p>
            {isCoach && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Workout
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}