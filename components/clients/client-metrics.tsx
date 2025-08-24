'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ClientWithDetails, ClientMeasurement, ClientGoal } from '@/types/clients';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Plus,
  Target,
  Calendar,
  Activity,
  Weight,
  Ruler,
  Heart,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientMetricsProps {
  client: ClientWithDetails;
  onUpdateClient?: (clientId: string, data: Partial<ClientWithDetails>) => void;
}

export function ClientMetrics({ client, onUpdateClient }: ClientMetricsProps) {
  const [isAddingMeasurement, setIsAddingMeasurement] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [newMeasurement, setNewMeasurement] = useState<Partial<ClientMeasurement>>({
    measurement_date: new Date(),
    weight_kg: client.latest_measurement?.weight_kg,
    body_fat_percentage: client.latest_measurement?.body_fat_percentage,
    measurements: {},
  });

  // Mock chart data - in real app, this would be calculated from measurements
  const getWeightTrend = () => {
    if (!client.measurements || client.measurements.length < 2) return null;
    
    const sortedMeasurements = client.measurements.sort(
      (a, b) => new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime()
    );
    
    const latest = sortedMeasurements[sortedMeasurements.length - 1];
    const previous = sortedMeasurements[sortedMeasurements.length - 2];
    
    if (!latest.weight_kg || !previous.weight_kg) return null;
    
    const change = latest.weight_kg - previous.weight_kg;
    return {
      change,
      percentage: ((change / previous.weight_kg) * 100),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  };

  const getGoalProgress = (goal: ClientGoal) => {
    if (!goal.target_value || !goal.current_value) return 0;
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const handleAddMeasurement = async () => {
    // In real app, this would call API
    console.log('Adding measurement:', newMeasurement);
    setIsAddingMeasurement(false);
    setNewMeasurement({
      measurement_date: new Date(),
      weight_kg: undefined,
      body_fat_percentage: undefined,
      measurements: {},
    });
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<ClientGoal>) => {
    // In real app, this would call API
    console.log('Updating goal:', goalId, updates);
    setEditingGoal(null);
  };

  const weightTrend = getWeightTrend();

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Weight className="mr-2 h-4 w-4" />
              Current Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {client.latest_measurement?.weight_kg 
                  ? `${client.latest_measurement.weight_kg}kg` 
                  : '--'}
              </div>
              {weightTrend && (
                <div className={cn(
                  'flex items-center text-sm',
                  weightTrend.trend === 'up' ? 'text-red-600' :
                  weightTrend.trend === 'down' ? 'text-green-600' :
                  'text-gray-500'
                )}>
                  {weightTrend.trend === 'up' && <TrendingUp className="h-4 w-4 mr-1" />}
                  {weightTrend.trend === 'down' && <TrendingDown className="h-4 w-4 mr-1" />}
                  {weightTrend.trend === 'stable' && <Minus className="h-4 w-4 mr-1" />}
                  {weightTrend.change > 0 ? '+' : ''}{weightTrend.change.toFixed(1)}kg
                </div>
              )}
            </div>
            {client.latest_measurement?.measurement_date && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {new Date(client.latest_measurement.measurement_date).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              Body Fat %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {client.latest_measurement?.body_fat_percentage 
                ? `${client.latest_measurement.body_fat_percentage}%` 
                : '--'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Heart className="mr-2 h-4 w-4" />
              BMR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {client.latest_measurement?.bmr_calories 
                ? `${client.latest_measurement.bmr_calories}` 
                : '--'}
            </div>
            <p className="text-xs text-gray-500">calories/day</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
            <CardDescription>
              Weight tracking over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {client.measurements && client.measurements.length > 0 ? (
              <div className="space-y-4">
                {/* Simple chart representation */}
                <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg flex items-end justify-between p-4">
                  {client.measurements.slice(-6).map((measurement, index) => (
                    <div key={measurement.id} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-primary rounded-t-md"
                        style={{ 
                          height: `${((measurement.weight_kg || 0) / 120) * 80}px` 
                        }}
                      />
                      <div className="text-xs mt-2 text-gray-500">
                        {new Date(measurement.measurement_date).toLocaleDateString('en', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>6 months ago</span>
                  <span>Today</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No weight data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Body Measurements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Ruler className="mr-2 h-5 w-5" />
                Body Measurements
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAddingMeasurement(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {client.latest_measurement?.measurements ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(client.latest_measurement.measurements).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize text-gray-600">{key.replace('_', ' ')}:</span>
                    <span className="font-medium">{value}cm</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No measurements recorded
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Goals Progress
          </CardTitle>
          <CardDescription>
            Track progress towards client goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {client.goals && client.goals.length > 0 ? (
            <div className="space-y-6">
              {client.goals.map((goal) => (
                <div key={goal.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{goal.goal_title}</h4>
                      <p className="text-sm text-gray-600">
                        Target: {goal.target_value}{goal.target_unit} by{' '}
                        {new Date(goal.target_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={goal.status === 'completed' ? 'default' : 'outline'}
                        className={goal.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {goal.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingGoal(goal.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  {goal.current_value && goal.target_value && (
                    <div className="text-sm text-gray-600">
                      Current: {goal.current_value}{goal.target_unit} / Target: {goal.target_value}{goal.target_unit}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No goals set for this client
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Measurement Modal */}
      {isAddingMeasurement && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsAddingMeasurement(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>Add New Measurement</CardTitle>
                <CardDescription>Record new progress measurements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newMeasurement.measurement_date?.toISOString().split('T')[0]}
                      onChange={(e) => setNewMeasurement(prev => ({
                        ...prev,
                        measurement_date: new Date(e.target.value)
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newMeasurement.weight_kg || ''}
                      onChange={(e) => setNewMeasurement(prev => ({
                        ...prev,
                        weight_kg: parseFloat(e.target.value) || undefined
                      }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Body Fat (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newMeasurement.body_fat_percentage || ''}
                      onChange={(e) => setNewMeasurement(prev => ({
                        ...prev,
                        body_fat_percentage: parseFloat(e.target.value) || undefined
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Chest (cm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newMeasurement.measurements?.chest || ''}
                      onChange={(e) => setNewMeasurement(prev => ({
                        ...prev,
                        measurements: {
                          ...prev.measurements,
                          chest: parseFloat(e.target.value) || undefined
                        }
                      }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Waist (cm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newMeasurement.measurements?.waist || ''}
                      onChange={(e) => setNewMeasurement(prev => ({
                        ...prev,
                        measurements: {
                          ...prev.measurements,
                          waist: parseFloat(e.target.value) || undefined
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Hips (cm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newMeasurement.measurements?.hips || ''}
                      onChange={(e) => setNewMeasurement(prev => ({
                        ...prev,
                        measurements: {
                          ...prev.measurements,
                          hips: parseFloat(e.target.value) || undefined
                        }
                      }))}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingMeasurement(false)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleAddMeasurement}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Measurement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}