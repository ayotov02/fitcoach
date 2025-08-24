'use client';

import { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Exercise, WorkoutExercise, SupersetGroup, CircuitGroup } from '@/types/workouts';
import { ExerciseCard } from './exercise-card';
import { SetBuilder } from './set-builder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus,
  Minus,
  X,
  GripVertical,
  Timer,
  Repeat,
  Target,
  Zap,
  RotateCcw,
  Play,
  Pause,
  Settings,
  Info,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SupersetBuilderProps {
  exercises: WorkoutExercise[];
  onCreateSuperset: (superset: SupersetGroup) => void;
  onCreateCircuit: (circuit: CircuitGroup) => void;
  onUpdateExercises: (exercises: WorkoutExercise[]) => void;
  onCancel?: () => void;
  mode?: 'superset' | 'circuit';
}

// Sortable Exercise Component
function SortableExerciseItem({ 
  exercise, 
  onRemove, 
  onEdit,
  index 
}: {
  exercise: WorkoutExercise;
  onRemove: (id: string) => void;
  onEdit: (exercise: WorkoutExercise) => void;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative mb-2',
        isDragging && 'opacity-50'
      )}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {/* Exercise Number */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                {String.fromCharCode(65 + index)} {/* A, B, C, etc. */}
              </div>
            </div>

            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
              <GripVertical className="h-5 w-5" />
            </div>

            {/* Exercise Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{exercise.exercise?.name}</h4>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <span>{exercise.sets} sets</span>
                <span>{exercise.reps} reps</span>
                {exercise.weight && <span>{exercise.weight}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(exercise)}
                className="h-8 w-8 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(exercise.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SupersetBuilder({ 
  exercises = [], 
  onCreateSuperset,
  onCreateCircuit,
  onUpdateExercises,
  onCancel,
  mode = 'superset'
}: SupersetBuilderProps) {
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>(exercises);
  const [groupSettings, setGroupSettings] = useState({
    rounds: mode === 'circuit' ? 3 : 1,
    rest_between_exercises: mode === 'circuit' ? 30 : 0,
    rest_between_rounds: mode === 'circuit' ? 120 : 60,
    notes: ''
  });
  const [editingExercise, setEditingExercise] = useState<WorkoutExercise | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = selectedExercises.findIndex(ex => ex.id === active.id);
      const newIndex = selectedExercises.findIndex(ex => ex.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newExercises = arrayMove(selectedExercises, oldIndex, newIndex);
        setSelectedExercises(newExercises);
      }
    }
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const handleUpdateExercise = (updates: Partial<WorkoutExercise>) => {
    if (!editingExercise) return;

    setSelectedExercises(prev => 
      prev.map(ex => 
        ex.id === editingExercise.id ? { ...ex, ...updates } : ex
      )
    );
    setEditingExercise(null);
  };

  const calculateTotalTime = () => {
    if (mode === 'superset') {
      // For supersets: longest exercise time + rest after superset
      const maxExerciseTime = Math.max(
        ...selectedExercises.map(ex => {
          const reps = parseInt(ex.reps || '10') || 10;
          return reps * 3.5; // ~3.5 seconds per rep
        })
      );
      return Math.round((maxExerciseTime + groupSettings.rest_between_rounds) / 60);
    } else {
      // For circuits: sum of all exercise times + rest between + rest between rounds
      const totalExerciseTime = selectedExercises.reduce((total, ex) => {
        const reps = parseInt(ex.reps || '10') || 10;
        return total + (reps * 3.5);
      }, 0);
      
      const restBetweenExercises = (selectedExercises.length - 1) * groupSettings.rest_between_exercises;
      const oneRoundTime = totalExerciseTime + restBetweenExercises;
      const totalRestBetweenRounds = (groupSettings.rounds - 1) * groupSettings.rest_between_rounds;
      
      return Math.round((oneRoundTime * groupSettings.rounds + totalRestBetweenRounds) / 60);
    }
  };

  const handleCreate = () => {
    if (selectedExercises.length < 2) return;

    const groupId = Date.now();

    if (mode === 'superset') {
      const superset: SupersetGroup = {
        id: groupId,
        exercises: selectedExercises.map((ex, index) => ({
          ...ex,
          superset_group: groupId,
          exercise_order: index + 1
        })),
        rest_seconds: groupSettings.rest_between_rounds,
        rounds: groupSettings.rounds,
        notes: groupSettings.notes
      };
      onCreateSuperset(superset);
    } else {
      const circuit: CircuitGroup = {
        id: groupId,
        exercises: selectedExercises.map((ex, index) => ({
          ...ex,
          circuit_group: groupId,
          exercise_order: index + 1,
          rest_seconds: groupSettings.rest_between_exercises
        })),
        rounds: groupSettings.rounds,
        rest_between_exercises: groupSettings.rest_between_exercises,
        rest_between_rounds: groupSettings.rest_between_rounds,
        notes: groupSettings.notes
      };
      onCreateCircuit(circuit);
    }
  };

  const getInstructions = () => {
    if (mode === 'superset') {
      return {
        title: 'Create Superset',
        description: 'Perform exercises back-to-back with no rest between them.',
        icon: <Zap className="h-5 w-5 text-orange-500" />,
        example: 'Example: Push-ups → Pull-ups → Rest → Repeat'
      };
    } else {
      return {
        title: 'Create Circuit',
        description: 'Perform exercises in sequence with short rests between each.',
        icon: <RotateCcw className="h-5 w-5 text-blue-500" />,
        example: 'Example: Squats (30s) → Rest (15s) → Push-ups (30s) → Rest (15s) → Burpees (30s) → Rest (2min) → Repeat'
      };
    }
  };

  const instructions = getInstructions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {instructions.icon}
          <div>
            <h2 className="text-xl font-bold">{instructions.title}</h2>
            <p className="text-gray-600">{instructions.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            <Timer className="h-3 w-3 mr-1" />
            ~{calculateTotalTime()} min
          </Badge>
          
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">How it works</h4>
              <p className="text-sm text-blue-700 mt-1">{instructions.example}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exercise List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Exercises ({selectedExercises.length})
                  </CardTitle>
                  <CardDescription>
                    {mode === 'superset' 
                      ? 'Arrange exercises to be performed back-to-back'
                      : 'Arrange exercises in the order they should be performed'
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {selectedExercises.length > 0 ? (
                <DndContext 
                  collisionDetection={closestCenter} 
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={selectedExercises.map(ex => ex.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    {selectedExercises.map((exercise, index) => (
                      <SortableExerciseItem
                        key={exercise.id}
                        exercise={exercise}
                        onRemove={handleRemoveExercise}
                        onEdit={setEditingExercise}
                        index={index}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No exercises selected
                  </h3>
                  <p className="text-gray-600">
                    Add exercises to create your {mode}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validation */}
          {selectedExercises.length > 0 && selectedExercises.length < 2 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <p className="text-orange-800">
                    You need at least 2 exercises to create a {mode}.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                {mode === 'superset' ? 'Superset' : 'Circuit'} Settings
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Rounds/Sets */}
              <div>
                <Label className="flex items-center">
                  <Repeat className="h-4 w-4 mr-2" />
                  {mode === 'superset' ? 'Sets' : 'Rounds'}
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGroupSettings(prev => ({ 
                      ...prev, 
                      rounds: Math.max(1, prev.rounds - 1) 
                    }))}
                    disabled={groupSettings.rounds <= 1}
                    className="h-8 w-8"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={groupSettings.rounds}
                    onChange={(e) => setGroupSettings(prev => ({
                      ...prev,
                      rounds: Math.max(1, parseInt(e.target.value) || 1)
                    }))}
                    className="w-16 text-center"
                    min={1}
                    max={10}
                  />
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGroupSettings(prev => ({ 
                      ...prev, 
                      rounds: Math.min(10, prev.rounds + 1) 
                    }))}
                    disabled={groupSettings.rounds >= 10}
                    className="h-8 w-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Rest Between Exercises (Circuit only) */}
              {mode === 'circuit' && (
                <div>
                  <Label className="flex items-center">
                    <Timer className="h-4 w-4 mr-2" />
                    Rest Between Exercises (seconds)
                  </Label>
                  <Input
                    type="number"
                    value={groupSettings.rest_between_exercises}
                    onChange={(e) => setGroupSettings(prev => ({
                      ...prev,
                      rest_between_exercises: parseInt(e.target.value) || 0
                    }))}
                    className="mt-1"
                    min={0}
                    max={300}
                  />
                  <div className="flex space-x-1 mt-2">
                    {[15, 30, 45, 60].map(seconds => (
                      <Button
                        key={seconds}
                        variant="ghost"
                        size="sm"
                        onClick={() => setGroupSettings(prev => ({
                          ...prev,
                          rest_between_exercises: seconds
                        }))}
                        className="text-xs h-6 px-2"
                      >
                        {seconds}s
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rest Between Sets/Rounds */}
              <div>
                <Label className="flex items-center">
                  <Timer className="h-4 w-4 mr-2" />
                  Rest Between {mode === 'superset' ? 'Sets' : 'Rounds'} (seconds)
                </Label>
                <Input
                  type="number"
                  value={groupSettings.rest_between_rounds}
                  onChange={(e) => setGroupSettings(prev => ({
                    ...prev,
                    rest_between_rounds: parseInt(e.target.value) || 0
                  }))}
                  className="mt-1"
                  min={0}
                  max={600}
                />
                <div className="flex space-x-1 mt-2">
                  {mode === 'superset' 
                    ? [60, 90, 120, 180].map(seconds => (
                        <Button
                          key={seconds}
                          variant="ghost"
                          size="sm"
                          onClick={() => setGroupSettings(prev => ({
                            ...prev,
                            rest_between_rounds: seconds
                          }))}
                          className="text-xs h-6 px-2"
                        >
                          {seconds >= 60 ? `${seconds/60}m` : `${seconds}s`}
                        </Button>
                      ))
                    : [90, 120, 180, 240].map(seconds => (
                        <Button
                          key={seconds}
                          variant="ghost"
                          size="sm"
                          onClick={() => setGroupSettings(prev => ({
                            ...prev,
                            rest_between_rounds: seconds
                          }))}
                          className="text-xs h-6 px-2"
                        >
                          {seconds >= 60 ? `${seconds/60}m` : `${seconds}s`}
                        </Button>
                      ))
                  }
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label>Notes & Instructions</Label>
                <Textarea
                  value={groupSettings.notes}
                  onChange={(e) => setGroupSettings(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder={`Add specific instructions for this ${mode}...`}
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Summary */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    {mode === 'superset' 
                      ? `${selectedExercises.length} exercises, ${groupSettings.rounds} sets`
                      : `${selectedExercises.length} exercises, ${groupSettings.rounds} rounds`
                    }
                  </div>
                  <div>Estimated time: {calculateTotalTime()} minutes</div>
                  {mode === 'circuit' && (
                    <div>{groupSettings.rest_between_exercises}s between exercises</div>
                  )}
                  <div>
                    {groupSettings.rest_between_rounds}s between {mode === 'superset' ? 'sets' : 'rounds'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Button */}
          <Button 
            onClick={handleCreate}
            disabled={selectedExercises.length < 2}
            className="w-full"
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            Create {mode === 'superset' ? 'Superset' : 'Circuit'}
          </Button>
        </div>
      </div>

      {/* Exercise Configuration Modal */}
      {editingExercise && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Configure Exercise</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingExercise(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-600 mt-1">{editingExercise.exercise?.name}</p>
            </div>
            
            <div className="p-6 overflow-auto">
              <SetBuilder
                initialConfig={{
                  sets: editingExercise.sets || 3,
                  reps: editingExercise.reps || '10',
                  weight: editingExercise.weight,
                  rest_seconds: editingExercise.rest_seconds || 60,
                  tempo: editingExercise.tempo,
                  intensity: editingExercise.intensity,
                  notes: editingExercise.notes
                }}
                onChange={(config) => {
                  handleUpdateExercise({
                    sets: config.sets,
                    reps: config.reps,
                    weight: config.weight,
                    rest_seconds: config.rest_seconds,
                    tempo: config.tempo,
                    intensity: config.intensity,
                    notes: config.notes
                  });
                }}
                exerciseType={editingExercise.exercise?.exercise_type}
                showAdvanced
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}