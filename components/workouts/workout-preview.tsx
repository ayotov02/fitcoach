'use client';

import { useState } from 'react';
import { WorkoutTemplate, WorkoutSection } from '@/types/workouts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play,
  Pause,
  SkipForward,
  Timer,
  Target,
  Dumbbell,
  Clock,
  Users,
  Zap,
  CheckCircle,
  Heart,
  Eye,
  Share,
  Download,
  Edit,
  X,
  Info,
  TrendingUp,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutPreviewProps {
  template: WorkoutTemplate;
  onStart?: (template: WorkoutTemplate) => void;
  onEdit?: (template: WorkoutTemplate) => void;
  onAssign?: (template: WorkoutTemplate) => void;
  onShare?: (template: WorkoutTemplate) => void;
  onClose?: () => void;
  showClientView?: boolean;
}

export function WorkoutPreview({ 
  template, 
  onStart,
  onEdit,
  onAssign,
  onShare,
  onClose,
  showClientView = false 
}: WorkoutPreviewProps) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);

  const exercises = template.exercises || [];
  const warmupExercises = exercises.filter(ex => ex.section === 'warmup');
  const mainExercises = exercises.filter(ex => ex.section === 'main');
  const cooldownExercises = exercises.filter(ex => ex.section === 'cooldown');

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      advanced: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[difficulty as keyof typeof colors] || colors.beginner;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      strength: 'bg-blue-100 text-blue-800',
      cardio: 'bg-red-100 text-red-800',
      hiit: 'bg-orange-100 text-orange-800',
      circuit: 'bg-purple-100 text-purple-800',
      flexibility: 'bg-green-100 text-green-800',
    };
    return colors[category as keyof typeof colors] || colors.strength;
  };

  const getSectionInfo = (section: WorkoutSection) => {
    switch (section) {
      case 'warmup':
        return { name: 'Warm-up', icon: <Zap className="h-4 w-4" />, color: 'text-orange-600' };
      case 'main':
        return { name: 'Main Workout', icon: <Target className="h-4 w-4" />, color: 'text-blue-600' };
      case 'cooldown':
        return { name: 'Cool-down', icon: <Heart className="h-4 w-4" />, color: 'text-green-600' };
    }
  };

  const calculateProgress = () => {
    if (exercises.length === 0) return 0;
    return (currentExercise / exercises.length) * 100;
  };

  const handleStartWorkout = () => {
    setIsPlaying(true);
    onStart?.(template);
  };

  if (showClientView) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{template.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                </div>
              </div>
              
              {onClose && (
                <Button variant="ghost" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Workout Progress</span>
                <span>{Math.round(calculateProgress())}% Complete</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Exercise */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        {currentExercise < exercises.length && (
                          <>
                            {getSectionInfo(exercises[currentExercise].section).icon}
                            <span className="ml-2">
                              {exercises[currentExercise].exercise?.name}
                            </span>
                          </>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Exercise {currentExercise + 1} of {exercises.length}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentExercise(Math.max(0, currentExercise - 1))}
                        disabled={currentExercise === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => setCurrentExercise(Math.min(exercises.length - 1, currentExercise + 1))}
                        disabled={currentExercise >= exercises.length - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {currentExercise < exercises.length && (
                  <CardContent className="space-y-6">
                    {/* Exercise Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {exercises[currentExercise].sets}
                        </div>
                        <div className="text-sm text-gray-600">Sets</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {exercises[currentExercise].reps}
                        </div>
                        <div className="text-sm text-gray-600">Reps</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {exercises[currentExercise].weight || 'BW'}
                        </div>
                        <div className="text-sm text-gray-600">Weight</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {Math.floor(exercises[currentExercise].rest_seconds / 60)}:
                          {(exercises[currentExercise].rest_seconds % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-sm text-gray-600">Rest</div>
                      </div>
                    </div>

                    {/* Instructions */}
                    {exercises[currentExercise].exercise?.instructions && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Instructions</h4>
                        <p className="text-gray-700">
                          {exercises[currentExercise].exercise?.instructions}
                        </p>
                      </div>
                    )}

                    {/* Form Cues */}
                    {exercises[currentExercise].exercise?.form_cues && 
                     exercises[currentExercise].exercise!.form_cues!.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Form Cues</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {exercises[currentExercise].exercise!.form_cues!.map((cue, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{cue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {exercises[currentExercise].notes && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Coach Notes</h4>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                          {exercises[currentExercise].notes}
                        </p>
                      </div>
                    )}

                    {/* Video Demo */}
                    {exercises[currentExercise].exercise?.video_url && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Video Demonstration</h4>
                        <Button variant="outline" className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Watch Demo Video
                        </Button>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Workout Overview */}
            <div className="space-y-4">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Workout Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Duration</span>
                    </div>
                    <span className="font-medium">{template.estimated_duration} min</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Exercises</span>
                    </div>
                    <span className="font-medium">{exercises.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Calories</span>
                    </div>
                    <span className="font-medium">~{template.calories_estimate || 250}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Exercise List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Exercise List</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {exercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className={cn(
                        'p-2 rounded-lg cursor-pointer transition-colors',
                        index === currentExercise 
                          ? 'bg-primary text-white' 
                          : 'hover:bg-gray-100'
                      )}
                      onClick={() => setCurrentExercise(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getSectionInfo(exercise.section).icon}
                          <span className="text-sm font-medium truncate">
                            {exercise.exercise?.name}
                          </span>
                        </div>
                        <div className="text-xs">
                          {exercise.sets} × {exercise.reps}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button onClick={handleStartWorkout} className="w-full" size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Start Workout
                </Button>
                
                {onShare && (
                  <Button variant="outline" onClick={() => onShare(template)} className="w-full">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Coach preview view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{template.name}</h1>
          <div className="flex items-center space-x-2 mt-2">
            <Badge className={getCategoryColor(template.category)}>
              {template.category}
            </Badge>
            <Badge className={getDifficultyColor(template.difficulty)}>
              {template.difficulty}
            </Badge>
            {template.is_public && (
              <Badge variant="outline">Public</Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowClientView(!showClientView)}>
            <Eye className="h-4 w-4 mr-2" />
            Client View
          </Button>
          
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(template)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          
          {onAssign && (
            <Button onClick={() => onAssign(template)}>
              <Users className="h-4 w-4 mr-2" />
              Assign to Client
            </Button>
          )}
          
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{template.estimated_duration}</div>
            <div className="text-sm text-gray-600">minutes</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{exercises.length}</div>
            <div className="text-sm text-gray-600">exercises</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Dumbbell className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{template.equipment_needed?.length || 0}</div>
            <div className="text-sm text-gray-600">equipment</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">~{template.calories_estimate || 250}</div>
            <div className="text-sm text-gray-600">calories</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Description */}
          {template.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{template.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Workout Structure */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-orange-800">
                  <Zap className="h-5 w-5 mr-2" />
                  Warm-up
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {warmupExercises.length}
                </div>
                <div className="text-sm text-orange-700">exercises</div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-blue-800">
                  <Target className="h-5 w-5 mr-2" />
                  Main Workout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {mainExercises.length}
                </div>
                <div className="text-sm text-blue-700">exercises</div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-green-800">
                  <Heart className="h-5 w-5 mr-2" />
                  Cool-down
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {cooldownExercises.length}
                </div>
                <div className="text-sm text-green-700">exercises</div>
              </CardContent>
            </Card>
          </div>

          {/* Muscle Groups */}
          {template.muscle_groups_targeted && template.muscle_groups_targeted.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Target Muscle Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {template.muscle_groups_targeted.map(group => (
                    <Badge key={group} variant="secondary">
                      {group.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="exercises">
          <div className="space-y-6">
            {(['warmup', 'main', 'cooldown'] as WorkoutSection[]).map(section => {
              const sectionExercises = exercises.filter(ex => ex.section === section);
              const sectionInfo = getSectionInfo(section);
              
              if (sectionExercises.length === 0) return null;
              
              return (
                <Card key={section}>
                  <CardHeader>
                    <CardTitle className={cn('flex items-center', sectionInfo.color)}>
                      {sectionInfo.icon}
                      <span className="ml-2">{sectionInfo.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {sectionExercises.length} exercises
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sectionExercises.map((exercise, index) => (
                        <div key={exercise.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{exercise.exercise?.name}</h4>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                <span>{exercise.sets} sets</span>
                                <span>{exercise.reps} reps</span>
                                {exercise.weight && <span>{exercise.weight}</span>}
                                <span>
                                  {Math.floor(exercise.rest_seconds / 60)}:
                                  {(exercise.rest_seconds % 60).toString().padStart(2, '0')} rest
                                </span>
                              </div>
                              
                              {exercise.notes && (
                                <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                                  {exercise.notes}
                                </p>
                              )}
                            </div>
                            
                            {exercise.superset_group && (
                              <Badge variant="secondary" className="ml-2">
                                Superset {exercise.superset_group}
                              </Badge>
                            )}
                            
                            {exercise.circuit_group && (
                              <Badge variant="secondary" className="ml-2">
                                Circuit {exercise.circuit_group}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>Required Equipment</CardTitle>
              <CardDescription>
                Equipment needed to complete this workout
              </CardDescription>
            </CardHeader>
            <CardContent>
              {template.equipment_needed && template.equipment_needed.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {template.equipment_needed.map(equipment => (
                    <div key={equipment} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Dumbbell className="h-5 w-5 text-primary" />
                      <span className="capitalize">{equipment.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Dumbbell className="mx-auto h-12 w-12 mb-4" />
                  <p>No equipment required - bodyweight only!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Usage Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Times Used</span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Rating</span>
                  <span className="font-medium">4.8/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Completion Rate</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="flex justify-between">
                  <span>Favorited</span>
                  <span className="font-medium">23 times</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Avg. Duration</span>
                  <span className="font-medium">{template.estimated_duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Calories Burned</span>
                  <span className="font-medium">~{template.calories_estimate || 250}</span>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty Rating</span>
                  <span className="font-medium capitalize">{template.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span>Client Satisfaction</span>
                  <span className="font-medium">96%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}