import { requireRole } from '@/lib/auth/auth-helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Calendar,
  Download,
  Filter,
  Clock,
} from 'lucide-react';

export default async function AnalyticsPage() {
  // Only coaches can access analytics
  const user = await requireRole(['coach']);

  // Mock analytics data
  const stats = {
    totalClients: 24,
    activeClients: 18,
    retention: 87,
    avgProgress: 82,
  };

  const chartData = [
    { month: 'Jan', clients: 12, workouts: 156, retention: 85 },
    { month: 'Feb', clients: 16, workouts: 198, retention: 88 },
    { month: 'Mar', clients: 20, workouts: 245, retention: 92 },
    { month: 'Apr', clients: 24, workouts: 312, retention: 87 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Track your coaching business performance and client progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+4</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.activeClients / stats.totalClients) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.retention}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Across all active clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Client Growth</CardTitle>
            <CardDescription>Monthly client acquisition and retention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2 px-4">
              {chartData.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center space-y-2">
                  <div 
                    className="w-12 bg-gradient-primary rounded-t-md transition-all duration-300 hover:opacity-80"
                    style={{ height: `${(data.clients / 24) * 160}px` }}
                  />
                  <div className="text-sm font-medium">{data.month}</div>
                  <div className="text-xs text-gray-500">{data.clients}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workout Completion */}
        <Card>
          <CardHeader>
            <CardTitle>Workout Completion</CardTitle>
            <CardDescription>Total workouts completed by clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2 px-4">
              {chartData.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center space-y-2">
                  <div 
                    className="w-12 bg-accent-green rounded-t-md transition-all duration-300 hover:opacity-80"
                    style={{ height: `${(data.workouts / 312) * 160}px` }}
                  />
                  <div className="text-sm font-medium">{data.month}</div>
                  <div className="text-xs text-gray-500">{data.workouts}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Clients with highest progress rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Sarah Johnson', progress: 95, workouts: 28 },
              { name: 'Mike Chen', progress: 92, workouts: 24 },
              { name: 'Emma Davis', progress: 88, workouts: 26 },
              { name: 'John Smith', progress: 85, workouts: 22 },
            ].map((client, index) => (
              <div key={client.name} className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
                  {client.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{client.name}</p>
                  <p className="text-xs text-gray-500">{client.workouts} workouts</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">{client.progress}%</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Popular Workouts */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Workouts</CardTitle>
            <CardDescription>Most assigned workout programs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Upper Body Strength', assigned: 18, completion: 89 },
              { name: 'HIIT Cardio', assigned: 15, completion: 92 },
              { name: 'Lower Body Power', assigned: 12, completion: 85 },
              { name: 'Core Stability', assigned: 10, completion: 94 },
            ].map((workout) => (
              <div key={workout.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{workout.name}</span>
                  <span className="text-gray-500">{workout.assigned} clients</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full"
                    style={{ width: `${workout.completion}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {workout.completion}% completion rate
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest client interactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { action: 'Workout completed', client: 'Sarah J.', time: '2 hours ago' },
              { action: 'Progress photo uploaded', client: 'Mike C.', time: '4 hours ago' },
              { action: 'Message sent', client: 'Emma D.', time: '6 hours ago' },
              { action: 'Weight goal achieved', client: 'John S.', time: '1 day ago' },
              { action: 'New client onboarded', client: 'Lisa M.', time: '2 days ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-accent-green rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.client} • {activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}