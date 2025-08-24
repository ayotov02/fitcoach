import { requireRole } from '@/lib/auth/auth-helpers';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Target, Calendar, Trophy } from 'lucide-react';

export default async function ClientDashboardPage() {
  const user = await requireRole(['client']);
  const supabase = createServerSupabaseClient();

  // Fetch client data
  const { data: client } = await supabase
    .from('clients')
    .select(`
      *,
      coaches (
        business_name,
        users (full_name)
      )
    `)
    .eq('user_id', user.id)
    .single();

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold">My Fitness Journey</h1>
              <p className="text-muted-foreground">
                Welcome back, {user.user_metadata?.full_name || user.email}!
              </p>
              {client?.coaches && (
                <p className="text-sm text-muted-foreground">
                  Coached by {client.coaches.users?.full_name || client.coaches.business_name}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button>Today's Workout</Button>
              <Button variant="outline">Log Progress</Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {client?.current_weight_kg ? `${client.current_weight_kg}kg` : '--'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {client?.target_weight_kg && (
                    `Goal: ${client.target_weight_kg}kg`
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3/4</div>
                <p className="text-xs text-muted-foreground">
                  workouts completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  workouts completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                <Trophy className="h-4 w-4 text-accent-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  milestones reached
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Today's Workout */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Workout</CardTitle>
                <CardDescription>
                  Your scheduled workout for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg bg-gradient-primary/10 p-4">
                    <h3 className="font-medium text-lg">Upper Body Strength</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      45 minutes • 6 exercises
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-medium">Progress: 0/6</span>
                      <Button size="sm">Start Workout</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Exercises:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Bench Press - 3x8</li>
                      <li>• Rows - 3x10</li>
                      <li>• Shoulder Press - 3x8</li>
                      <li>• Pull-ups - 3x5</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
                <CardDescription>
                  Your fitness journey so far
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {client?.primary_goal && (
                    <div>
                      <h4 className="text-sm font-medium">Primary Goal</h4>
                      <p className="text-sm text-muted-foreground">
                        {client.primary_goal}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recent Achievements</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="h-2 w-2 bg-accent-green rounded-full" />
                        <span>Completed 4 workouts this week</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="h-2 w-2 bg-accent-green rounded-full" />
                        <span>Lost 2kg this month</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="h-2 w-2 bg-accent-green rounded-full" />
                        <span>New personal best in squats</span>
                      </div>
                    </div>
                  </div>

                  {!client?.coaches && (
                    <div className="mt-4 p-3 rounded-lg border border-primary/20 bg-primary/5">
                      <h4 className="text-sm font-medium">Get a Coach</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Connect with a certified fitness coach for personalized guidance.
                      </p>
                      <Button size="sm" className="mt-2">
                        Find a Coach
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}