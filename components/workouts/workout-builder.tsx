'use client';

import { useState, useCallback, useRef } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Exercise, WorkoutTemplate, WorkoutExercise, WorkoutSection, WorkoutBuilderState } from '@/types/workouts';
import { ExerciseLibrary } from './exercise-library';
import { ExerciseCard } from './exercise-card';
import { SetBuilder } from './set-builder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Save,
  Play,
  Eye,
  Settings,
  Plus,
  Trash2,
  Copy,
  Move,
  Clock,
  Target,
  Zap,
  Users,
  GripVertical,
  AlertTriangle,
  CheckCircle,
  X,
  Calendar,
  Dumbbell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutBuilderProps {
  initialTemplate?: Partial<WorkoutTemplate>;
  onSave: (template: WorkoutTemplate) => void;
  onPreview?: (template: WorkoutTemplate) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

// Sortable Exercise Item Component
function SortableExerciseItem({ 
  exercise, 
  onEdit, 
  onRemove, 
  onDuplicate,
  section 
}: {
  exercise: WorkoutExercise;
  onEdit: (exercise: WorkoutExercise) => void;
  onRemove: (exerciseId: string) => void;
  onDuplicate: (exercise: WorkoutExercise) => void;
  section: WorkoutSection;
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
        'group relative',
        isDragging && 'opacity-50'
      )}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
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
              <div className="flex items-center space-x-2">
                <h4 className="font-medium truncate">{exercise.exercise?.name}</h4>
                {exercise.superset_group && (
                  <Badge variant="secondary" className="text-xs">
                    Superset {exercise.superset_group}
                  </Badge>
                )}
                {exercise.circuit_group && (
                  <Badge variant="secondary" className="text-xs">
                    Circuit {exercise.circuit_group}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <span>{exercise.sets} sets</span>
                <span>{exercise.reps} reps</span>
                {exercise.weight && <span>{exercise.weight}</span>}
                <span>{Math.floor(exercise.rest_seconds / 60)}:{(exercise.rest_seconds % 60).toString().padStart(2, '0')} rest</span>
              </div>
              
              {exercise.notes && (
                <p className="text-xs text-gray-500 mt-1 truncate">{exercise.notes}</p>
              )}
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
                onClick={() => onDuplicate(exercise)}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(exercise.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Drop Zone Component
function DropZone({ 
  section, 
  exercises, 
  onAddExercise, 
  onEditExercise, 
  onRemoveExercise, 
  onDuplicateExercise,
  isActive 
}: {
  section: WorkoutSection;
  exercises: WorkoutExercise[];
  onAddExercise: (exercise: Exercise, section: WorkoutSection) => void;
  onEditExercise: (exercise: WorkoutExercise) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onDuplicateExercise: (exercise: WorkoutExercise) => void;
  isActive: boolean;
}) {
  const getSectionInfo = (section: WorkoutSection) => {
    switch (section) {
      case 'warmup':
        return {
          title: 'Warm-up',
          description: 'Prepare the body for exercise',
          icon: <Zap className="h-5 w-5" />,
          color: 'border-orange-200 bg-orange-50'
        };
      case 'main':
        return {
          title: 'Main Workout',
          description: 'Primary training exercises',
          icon: <Target className="h-5 w-5" />,
          color: 'border-primary/20 bg-primary/5'
        };
      case 'cooldown':
        return {
          title: 'Cool-down',
          description: 'Recovery and flexibility',
          icon: <CheckCircle className="h-5 w-5" />,
          color: 'border-green-200 bg-green-50'
        };
    }
  };

  const sectionInfo = getSectionInfo(section);
  const sectionExercises = exercises.filter(ex => ex.section === section);

  return (
    <div className={cn(
      'border-2 border-dashed rounded-lg p-4 transition-all',
      isActive ? 'border-primary bg-primary/5' : sectionInfo.color
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {sectionInfo.icon}
          <div>
            <h3 className="font-semibold">{sectionInfo.title}</h3>
            <p className="text-sm text-gray-600">{sectionInfo.description}</p>
          </div>
        </div>
        <Badge variant="outline">
          {sectionExercises.length} exercise{sectionExercises.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {sectionExercises.length > 0 ? (
        <SortableContext items={sectionExercises.map(ex => ex.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sectionExercises.map((exercise) => (
              <SortableExerciseItem
                key={exercise.id}
                exercise={exercise}
                onEdit={onEditExercise}
                onRemove={onRemoveExercise}
                onDuplicate={onDuplicateExercise}
                section={section}
              />
            ))}
          </div>
        </SortableContext>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Plus className="mx-auto h-8 w-8 mb-2" />
          <p className="text-sm">Drop exercises here or use the exercise library</p>
        </div>
      )}
    </div>
  );
}

export function WorkoutBuilder({ 
  initialTemplate, 
  onSave, 
  onPreview, 
  onCancel,
  isEditing = false 
}: WorkoutBuilderProps) {
  const [builderState, setBuilderState] = useState<WorkoutBuilderState>({
    template: {
      name: '',
      description: '',
      category: 'strength',
      difficulty: 'beginner',
      estimated_duration: 45,
      equipment_needed: [],
      muscle_groups_targeted: [],
      tags: [],
      is_public: false,
      ...initialTemplate
    },
    exercises: [],
    activeSection: 'main',
    isEditing: false
  });

  const [editingExercise, setEditingExercise] = useState<WorkoutExercise | null>(null);
  const [showLibrary, setShowLibrary] = useState(true);
  const [activeDropZone, setActiveDropZone] = useState<WorkoutSection | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddExercise = useCallback((exercise: Exercise, section: WorkoutSection = 'main') => {
    const newWorkoutExercise: WorkoutExercise = {
      id: `we-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workout_template_id: '',
      exercise_id: exercise.id,
      section,
      exercise_order: builderState.exercises.filter(ex => ex.section === section).length + 1,
      sets: 3,
      reps: '10',
      rest_seconds: 60,
      is_optional: false,
      exercise,
      created_at: new Date()
    };

    setBuilderState(prev => ({
      ...prev,
      exercises: [...prev.exercises, newWorkoutExercise]
    }));

    // Update template muscle groups and equipment
    const newMuscleGroups = [...new Set([
      ...(builderState.template.muscle_groups_targeted || []),
      ...exercise.muscle_groups
    ])];
    
    const newEquipment = [...new Set([
      ...(builderState.template.equipment_needed || []),
      ...exercise.equipment
    ])];

    setBuilderState(prev => ({
      ...prev,
      template: {
        ...prev.template,
        muscle_groups_targeted: newMuscleGroups,
        equipment_needed: newEquipment
      }
    }));
  }, [builderState.exercises, builderState.template]);

  const handleEditExercise = (exercise: WorkoutExercise) => {
    setEditingExercise(exercise);
  };

  const handleUpdateExercise = (updates: Partial<WorkoutExercise>) => {
    if (!editingExercise) return;

    setBuilderState(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === editingExercise.id ? { ...ex, ...updates } : ex
      )
    }));
    setEditingExercise(null);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setBuilderState(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
    }));
  };

  const handleDuplicateExercise = (exercise: WorkoutExercise) => {
    const duplicated: WorkoutExercise = {
      ...exercise,
      id: `we-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exercise_order: exercise.exercise_order + 1
    };

    setBuilderState(prev => ({
      ...prev,
      exercises: [...prev.exercises, duplicated]
    }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag start:', event);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      setActiveDropZone(over.id as WorkoutSection);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveDropZone(null);
    
    if (!over) return;

    // Handle dropping from exercise library
    if (typeof active.id === 'string' && active.id.startsWith('ex-')) {
      try {
        const exerciseData = active.data?.current;
        if (exerciseData && typeof over.id === 'string') {
          handleAddExercise(exerciseData as Exercise, over.id as WorkoutSection);
        }
      } catch (error) {
        console.error('Error handling drag end:', error);
      }
      return;
    }

    // Handle reordering within workout
    if (active.id !== over.id) {
      setBuilderState(prev => {
        const oldIndex = prev.exercises.findIndex(ex => ex.id === active.id);
        const newIndex = prev.exercises.findIndex(ex => ex.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          return {
            ...prev,
            exercises: arrayMove(prev.exercises, oldIndex, newIndex)
          };
        }
        
        return prev;
      });
    }
  };

  const calculateTotalDuration = () => {
    let totalSeconds = 0;
    
    builderState.exercises.forEach(exercise => {
      // Estimate work time (3-4 seconds per rep for strength)
      const repsNum = parseInt(exercise.reps || '10') || 10;
      const workTime = repsNum * 3.5 * (exercise.sets || 1);
      
      // Add rest time
      const restTime = (exercise.rest_seconds || 60) * ((exercise.sets || 1) - 1);
      
      totalSeconds += workTime + restTime;
    });
    
    return Math.round(totalSeconds / 60);
  };

  const handleSave = () => {
    const template: WorkoutTemplate = {
      id: initialTemplate?.id || '',
      coach_id: '', // Will be set by API
      ...builderState.template,
      estimated_duration: calculateTotalDuration(),
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true,
      exercises: builderState.exercises
    } as WorkoutTemplate;

    onSave(template);
  };

  const handlePreview = () => {
    if (onPreview) {
      const template: WorkoutTemplate = {
        id: initialTemplate?.id || 'preview',
        coach_id: '',
        ...builderState.template,
        estimated_duration: calculateTotalDuration(),
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true,
        exercises: builderState.exercises
      } as WorkoutTemplate;

      onPreview(template);
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen">
        {/* Exercise Library Sidebar */}
        {showLibrary && (
          <div className="w-96 border-r bg-white overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Exercise Library</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLibrary(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ExerciseLibrary
                onAddExercise={(exercise) => handleAddExercise(exercise, builderState.activeSection)}
                compactView
                allowDrag
              />
            </div>
          </div>
        )}

        {/* Main Builder Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Input
                  value={builderState.template.name || ''}
                  onChange={(e) => setBuilderState(prev => ({
                    ...prev,
                    template: { ...prev.template, name: e.target.value }
                  }))}
                  placeholder="Workout name..."
                  className="text-xl font-semibold border-0 p-0 h-auto focus-visible:ring-0"
                />
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>~{calculateTotalDuration()} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>{builderState.exercises.length} exercises</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Dumbbell className="h-4 w-4" />
                    <span>{builderState.template.equipment_needed?.length || 0} equipment</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!showLibrary && (
                  <Button
                    variant="outline"
                    onClick={() => setShowLibrary(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercises
                  </Button>
                )}
                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update' : 'Save'} Workout
                </Button>
                {onCancel && (
                  <Button variant="ghost" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Workout Builder */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Workout Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Workout Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={builderState.template.category || 'strength'}
                        onValueChange={(value) => setBuilderState(prev => ({
                          ...prev,
                          template: { ...prev.template, category: value as any }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strength">Strength</SelectItem>
                          <SelectItem value="cardio">Cardio</SelectItem>
                          <SelectItem value="hiit">HIIT</SelectItem>
                          <SelectItem value="circuit">Circuit</SelectItem>
                          <SelectItem value="flexibility">Flexibility</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Difficulty</Label>
                      <Select
                        value={builderState.template.difficulty || 'beginner'}
                        onValueChange={(value) => setBuilderState(prev => ({
                          ...prev,
                          template: { ...prev.template, difficulty: value as any }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={builderState.template.estimated_duration || calculateTotalDuration()}
                        onChange={(e) => setBuilderState(prev => ({
                          ...prev,
                          template: { ...prev.template, estimated_duration: parseInt(e.target.value) || 0 }
                        }))}
                        min={15}
                        max={180}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={builderState.template.description || ''}
                      onChange={(e) => setBuilderState(prev => ({
                        ...prev,
                        template: { ...prev.template, description: e.target.value }
                      }))}
                      placeholder="Describe the workout goals, target audience, or special instructions..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Workout Sections */}
              <div className="space-y-6">
                {(['warmup', 'main', 'cooldown'] as WorkoutSection[]).map((section) => (
                  <DropZone
                    key={section}
                    section={section}
                    exercises={builderState.exercises}
                    onAddExercise={handleAddExercise}
                    onEditExercise={handleEditExercise}
                    onRemoveExercise={handleRemoveExercise}
                    onDuplicateExercise={handleDuplicateExercise}
                    isActive={activeDropZone === section}
                  />
                ))}
              </div>

              {/* Empty State */}
              {builderState.exercises.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Start building your workout
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Drag exercises from the library or click "Add Exercises" to get started.
                    </p>
                    {!showLibrary && (
                      <Button onClick={() => setShowLibrary(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Exercises
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
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
            
            <div className="p-6 border-t flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setEditingExercise(null)}
              >
                Cancel
              </Button>
              <Button onClick={() => setEditingExercise(null)}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Drag Overlay */}
      <DragOverlay>
        {/* This would show the exercise being dragged */}
      </DragOverlay>
    </DndContext>
  );
}