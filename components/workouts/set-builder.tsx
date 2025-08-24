'use client';

import { useState } from 'react';
import { SetConfiguration } from '@/types/workouts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Timer,
  Repeat,
  Weight,
  Target,
  Clock,
  TrendingUp,
  Info,
  Plus,
  Minus,
  RotateCcw,
  Zap,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SetBuilderProps {
  initialConfig?: SetConfiguration;
  onChange: (config: SetConfiguration) => void;
  exerciseType?: 'strength' | 'cardio' | 'flexibility';
  showAdvanced?: boolean;
}

const REST_TIME_PRESETS = [
  { label: '30 sec', value: 30 },
  { label: '45 sec', value: 45 },
  { label: '1 min', value: 60 },
  { label: '90 sec', value: 90 },
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 }
];

const INTENSITY_LEVELS = [
  { label: 'Light', value: 'light', description: '50-60% effort' },
  { label: 'Moderate', value: 'moderate', description: '60-70% effort' },
  { label: 'Hard', value: 'hard', description: '70-80% effort' },
  { label: 'Very Hard', value: 'very_hard', description: '80-90% effort' },
  { label: 'Max', value: 'max', description: '90-100% effort' }
];

const RPE_LEVELS = [
  { value: 'RPE 6', description: 'Easy - could do many more reps' },
  { value: 'RPE 7', description: 'Moderately hard - 3-4 reps in reserve' },
  { value: 'RPE 8', description: 'Hard - 2-3 reps in reserve' },
  { value: 'RPE 9', description: 'Very hard - 1-2 reps in reserve' },
  { value: 'RPE 10', description: 'Maximum effort - 0 reps in reserve' }
];

export function SetBuilder({ 
  initialConfig, 
  onChange, 
  exerciseType = 'strength',
  showAdvanced = false 
}: SetBuilderProps) {
  const [config, setConfig] = useState<SetConfiguration>({
    sets: 3,
    reps: '10',
    rest_seconds: 60,
    ...initialConfig
  });

  const [advancedMode, setAdvancedMode] = useState(showAdvanced);

  const updateConfig = (updates: Partial<SetConfiguration>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const incrementSets = () => updateConfig({ sets: Math.min(config.sets + 1, 10) });
  const decrementSets = () => updateConfig({ sets: Math.max(config.sets - 1, 1) });

  const handleRepsChange = (value: string) => {
    // Allow various formats: "10", "8-12", "AMRAP", "30 seconds"
    updateConfig({ reps: value });
  };

  const handleWeightChange = (value: string) => {
    // Allow various formats: "135", "75% 1RM", "BW", "BW+25"
    updateConfig({ weight: value || undefined });
  };

  const getEstimatedDuration = () => {
    const sets = config.sets;
    const restTime = config.rest_seconds * (sets - 1); // Rest between sets
    let workTime = 0;

    // Estimate work time based on exercise type and reps
    if (exerciseType === 'cardio') {
      // For cardio, reps might be time-based
      const timeMatch = config.reps.match(/(\d+)\s*(sec|min|seconds|minutes)/i);
      if (timeMatch) {
        const time = parseInt(timeMatch[1]);
        const unit = timeMatch[2].toLowerCase();
        workTime = (unit.startsWith('min') ? time * 60 : time) * sets;
      } else {
        workTime = 60 * sets; // Default 1 minute per set
      }
    } else {
      // For strength, estimate ~3-4 seconds per rep
      const repsNum = parseInt(config.reps) || 10;
      workTime = repsNum * 3.5 * sets;
    }

    return Math.round((workTime + restTime) / 60); // Return minutes
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Set Configuration</h3>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            ~{getEstimatedDuration()} min
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAdvancedMode(!advancedMode)}
          >
            Advanced
          </Button>
        </div>
      </div>

      <Tabs value={advancedMode ? 'advanced' : 'basic'} className="w-full">
        <TabsContent value="basic" className="space-y-4">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sets */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Repeat className="h-4 w-4 mr-2" />
                  Sets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementSets}
                    disabled={config.sets <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="text-2xl font-bold w-12 text-center">
                    {config.sets}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementSets}
                    disabled={config.sets >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reps */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Reps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={config.reps}
                  onChange={(e) => handleRepsChange(e.target.value)}
                  placeholder="10 or 8-12 or AMRAP"
                  className="text-center text-lg font-medium"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {['8', '10', '12', '8-12', 'AMRAP'].map((preset) => (
                    <Button
                      key={preset}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRepsChange(preset)}
                      className="text-xs h-6 px-2"
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rest Time */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Timer className="h-4 w-4 mr-2" />
                  Rest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-2">
                  <div className="text-lg font-medium">
                    {config.rest_seconds < 60 
                      ? `${config.rest_seconds}s`
                      : `${Math.floor(config.rest_seconds / 60)}:${(config.rest_seconds % 60).toString().padStart(2, '0')}`
                    }
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {REST_TIME_PRESETS.slice(0, 6).map((preset) => (
                    <Button
                      key={preset.value}
                      variant={config.rest_seconds === preset.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateConfig({ rest_seconds: preset.value })}
                      className="text-xs h-7"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weight/Load */}
          {exerciseType === 'strength' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Weight className="h-4 w-4 mr-2" />
                  Weight/Load
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    value={config.weight || ''}
                    onChange={(e) => handleWeightChange(e.target.value)}
                    placeholder="135 lbs or 75% 1RM or BW+25"
                    className="flex-1"
                  />
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {['BW', '50% 1RM', '70% 1RM', '85% 1RM'].map((preset) => (
                    <Button
                      key={preset}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleWeightChange(preset)}
                      className="text-xs h-6 px-2"
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Notes & Coaching Cues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={config.notes || ''}
                onChange={(e) => updateConfig({ notes: e.target.value })}
                placeholder="Add specific instructions, form cues, or motivational notes..."
                rows={2}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          {/* Include basic configuration */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Sets */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center">
                <Repeat className="h-4 w-4 mr-1" />
                Sets
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementSets}
                  disabled={config.sets <= 1}
                  className="h-8 w-8"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={config.sets}
                  onChange={(e) => updateConfig({ sets: parseInt(e.target.value) || 1 })}
                  className="w-16 text-center"
                  min={1}
                  max={10}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementSets}
                  disabled={config.sets >= 10}
                  className="h-8 w-8"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Reps */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center">
                <Target className="h-4 w-4 mr-1" />
                Reps
              </Label>
              <Input
                value={config.reps}
                onChange={(e) => handleRepsChange(e.target.value)}
                placeholder="10 or 8-12"
              />
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center">
                <Weight className="h-4 w-4 mr-1" />
                Weight
              </Label>
              <Input
                value={config.weight || ''}
                onChange={(e) => handleWeightChange(e.target.value)}
                placeholder="135 or 75% 1RM"
              />
            </div>

            {/* Rest */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center">
                <Timer className="h-4 w-4 mr-1" />
                Rest (sec)
              </Label>
              <Input
                type="number"
                value={config.rest_seconds}
                onChange={(e) => updateConfig({ rest_seconds: parseInt(e.target.value) || 60 })}
                min={15}
                max={600}
              />
            </div>
          </div>

          {/* Advanced Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tempo */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center">
                <Activity className="h-4 w-4 mr-1" />
                Tempo
              </Label>
              <Input
                value={config.tempo || ''}
                onChange={(e) => updateConfig({ tempo: e.target.value || undefined })}
                placeholder="3-1-2-1 (eccentric-pause-concentric-pause)"
              />
              <div className="flex flex-wrap gap-1">
                {['2-0-2-0', '3-1-1-1', '4-2-1-1', '1-0-1-0'].map((preset) => (
                  <Button
                    key={preset}
                    variant="ghost"
                    size="sm"
                    onClick={() => updateConfig({ tempo: preset })}
                    className="text-xs h-6 px-2"
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>

            {/* Intensity */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center">
                <Zap className="h-4 w-4 mr-1" />
                Intensity
              </Label>
              <Select
                value={config.intensity || ''}
                onValueChange={(value) => updateConfig({ intensity: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select intensity" />
                </SelectTrigger>
                <SelectContent>
                  {INTENSITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div>
                        <div>{level.label}</div>
                        <div className="text-xs text-gray-500">{level.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* RPE Scale */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              RPE (Rate of Perceived Exertion)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {RPE_LEVELS.map((rpe) => (
                <Button
                  key={rpe.value}
                  variant={config.intensity === rpe.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateConfig({ intensity: rpe.value })}
                  className="flex flex-col h-auto p-2"
                >
                  <span className="text-sm font-medium">{rpe.value}</span>
                  <span className="text-xs text-gray-500 text-center leading-tight">
                    {rpe.description}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center">
              <Info className="h-4 w-4 mr-1" />
              Coaching Notes
            </Label>
            <Textarea
              value={config.notes || ''}
              onChange={(e) => updateConfig({ notes: e.target.value })}
              placeholder="Detailed instructions, form cues, progressions, or special considerations..."
              rows={3}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Configuration Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Configuration Summary</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfig({ sets: 3, reps: '10', rest_seconds: 60 })}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">{config.sets} sets</span> × 
            <span className="font-medium"> {config.reps} reps</span>
            {config.weight && (
              <>
                {' '}@ <span className="font-medium">{config.weight}</span>
              </>
            )}
            {', '}
            <span className="font-medium">
              {config.rest_seconds < 60 
                ? `${config.rest_seconds}s`
                : `${Math.floor(config.rest_seconds / 60)}:${(config.rest_seconds % 60).toString().padStart(2, '0')}`
              } rest
            </span>
            {config.tempo && (
              <>
                {', tempo: '}<span className="font-medium">{config.tempo}</span>
              </>
            )}
            {config.intensity && (
              <>
                {', '}<span className="font-medium">{config.intensity}</span>
              </>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Estimated duration: <span className="font-medium">{getEstimatedDuration()} minutes</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}