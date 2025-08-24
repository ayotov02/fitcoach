import { requireAuth } from '@/lib/auth/auth-helpers';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Zap, 
  Activity,
  Target,
  Trophy,
  MessageCircle,
  Plus,
} from 'lucide-react';

export default async function DashboardPage() {
  const user = await requireAuth();
  const supabase = createServerSupabaseClient();

  // Fetch user data and role-specific information
  const { data: userData } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  const isCoach = userData?.role === 'coach';

  // Fetch role-specific data
  let roleData = null;
  let stats = null;

  if (isCoach) {
    const { data: coach } = await supabase
      .from('coaches')
      .select('*, clients(count)')
      .eq('user_id', user.id)
      .single();
    
    roleData = coach;
    stats = {
      totalClients: coach?.clients?.length || 0,
      activePrograms: 12,
      avgProgress: 85,
      aiSuggestions: 3,
    };
  } else {
    const { data: client } = await supabase
      .from('clients')
      .select('*, coaches(business_name, users(full_name))')
      .eq('user_id', user.id)
      .single();
    
    roleData = client;
    stats = {
      currentWeight: client?.current_weight_kg || 0,
      weeklyGoal: 3,
      monthlyWorkouts: 12,
      achievements: 5,
    };
  }

  if (isCoach) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Coach Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {userData?.full_name || user.email}!
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
            <Button variant="outline">Create Workout</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePrograms}</div>
              <p className="text-xs text-muted-foreground">8 in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgProgress}%</div>
              <p className="text-xs text-muted-foreground">+5% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Suggestions</CardTitle>
              <Zap className="h-4 w-4 text-accent-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.aiSuggestions}</div>
              <p className="text-xs text-muted-foreground">New recommendations</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your clients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm">
                  J
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">John completed Upper Body workout</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm">
                  S
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Sarah logged new weight: 65kg</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm">
                  M
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Mike sent a message</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-accent-green" />
                AI Insights
              </CardTitle>
              <CardDescription>Personalized coaching recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-accent-green/5 border border-accent-green/20">
                <h4 className="text-sm font-medium">Workout Optimization</h4>
                <p className="text-xs text-gray-600 mt-1">
                  3 clients would benefit from increased cardio intensity this week.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="text-sm font-medium">Client Engagement</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Sarah hasn't logged workouts in 4 days. Consider a check-in.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <h4 className="text-sm font-medium">Nutrition Focus</h4>
                <p className="text-xs text-gray-600 mt-1">
                  5 clients ready for advanced meal planning guidance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Client Dashboard
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Fitness Journey
          </h1>
          <p className="text-gray-600">
            Welcome back, {userData?.full_name || user.email}!
          </p>
          {roleData?.coaches && (
            <p className="text-sm text-gray-500">
              Coached by {roleData.coaches.users?.full_name || roleData.coaches.business_name}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button>Start Today's Workout</Button>
          <Button variant="outline">Log Progress</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.currentWeight ? `${stats.currentWeight}kg` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {roleData?.target_weight_kg && `Goal: ${roleData.target_weight_kg}kg`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/{stats.weeklyGoal}</div>
            <p className="text-xs text-muted-foreground">workouts completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyWorkouts}</div>
            <p className="text-xs text-muted-foreground">workouts completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-accent-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.achievements}</div>
            <p className="text-xs text-muted-foreground">milestones reached</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Workout */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Workout</CardTitle>
            <CardDescription>Your scheduled workout for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-gradient-primary/10">
              <h3 className="font-medium text-lg">Upper Body Strength</h3>
              <p className="text-sm text-gray-600 mt-1">45 minutes • 6 exercises</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium">Progress: 0/6</span>
                <Button size="sm">Start Workout</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages from Coach */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2 h-5 w-5" />
              Messages
            </CardTitle>
            <CardDescription>Recent messages from your coach</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roleData?.coaches ? (
              <>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium">Great progress this week!</p>
                  <p className="text-xs text-gray-500 mt-1">
                    From {roleData.coaches.users?.full_name} • 2 hours ago
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium">Remember to focus on form</p>
                  <p className="text-xs text-gray-500 mt-1">
                    From {roleData.coaches.users?.full_name} • Yesterday
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <MessageCircle className="mx-auto h-8 w-8 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium">No coach assigned</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Connect with a coach to get personalized guidance.
                </p>
                <Button className="mt-3" size="sm">Find a Coach</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}