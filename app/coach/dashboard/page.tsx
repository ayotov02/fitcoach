import { requireRole } from '@/lib/auth/auth-helpers';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, TrendingUp, Zap } from 'lucide-react';

export default async function CoachDashboardPage() {
  const user = await requireRole(['coach']);
  const supabase = createServerSupabaseClient();

  // Fetch coach data and stats
  const { data: coach } = await supabase
    .from('coaches')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: clients } = await supabase
    .from('clients')
    .select('id, user_id, users(full_name)')
    .eq('coach_id', coach?.id);

  const clientCount = clients?.length || 0;

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold">Coach Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user.user_metadata?.full_name || user.email}!
              </p>
            </div>
            <div className="flex space-x-2">
              <Button>Add New Client</Button>
              <Button variant="outline">Create Workout</Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientCount}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  8 in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Suggestions</CardTitle>
                <Zap className="h-4 w-4 text-accent-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  New recommendations
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Clients */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Clients</CardTitle>
                <CardDescription>
                  Your most recently active clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clients && clients.length > 0 ? (
                  <div className="space-y-4">
                    {clients.slice(0, 5).map((client) => (
                      <div key={client.id} className="flex items-center space-x-4">
                        <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
                          {client.users?.full_name?.[0] || 'C'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {client.users?.full_name || 'Client'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last workout: 2 days ago
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-sm font-medium">No clients yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Start by adding your first client to begin coaching.
                    </p>
                    <Button className="mt-4">Add Client</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-accent-green" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized suggestions to improve your coaching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-accent-green/20 bg-accent-green/5 p-3">
                    <h4 className="text-sm font-medium">Workout Optimization</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Consider adding more compound movements to John's upper body routine for better results.
                    </p>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <h4 className="text-sm font-medium">Client Engagement</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sarah hasn't logged a workout in 4 days. Send a check-in message.
                    </p>
                  </div>
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <h4 className="text-sm font-medium">Nutrition Focus</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      3 clients would benefit from macro tracking guidance this week.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}