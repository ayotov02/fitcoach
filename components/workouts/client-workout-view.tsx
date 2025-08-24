'use client';

import { useState, useEffect } from 'react';
import { ClientWorkout, ExerciseLog, WorkoutStatus } from '@/types/workouts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play,
  Pause,
  Square,
  SkipForward,
  Timer,
  Target,
  CheckCircle,
  Circle,
  Heart,
  Zap,
  Clock,
  TrendingUp,
  Star,
  MessageSquare,
  Volume2,
  VolumeX,
  RotateCcw,
  Camera,
  Award,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientWorkoutViewProps {
  workout: ClientWorkout;
  onUpdateWorkout: (workoutId: string, updates: Partial<ClientWorkout>) => void;
  onLogExercise: (log: Omit<ExerciseLog, 'id' | 'created_at'>) => void;
  onComplete: (workoutId: string, feedback: WorkoutFeedback) => void;
  onCancel?: () => void;
}

interface WorkoutFeedback {
  difficulty_rating: number;
  energy_rating: number;
  enjoyment_rating: number;
  client_notes?: string;
}

interface WorkoutTimer {
  isRunning: boolean;
  currentTime: number; // seconds
  exerciseTime: number;
  restTime: number;
  currentPhase: 'exercise' | 'rest' | 'prepare';
}

interface ExerciseProgress {
  exerciseId: string;
  completedSets: number;
  totalSets: number;
  setLogs: Array<{
    setNumber: number;
    reps: number;
    weight?: number;
    completed: boolean;
    notes?: string;
  }>;
}

export function ClientWorkoutView({ 
  workout, 
  onUpdateWorkout, 
  onLogExercise,
  onComplete,
  onCancel 
}: ClientWorkoutViewProps) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [workoutStatus, setWorkoutStatus] = useState<WorkoutStatus>(workout.status);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [exerciseProgress, setExerciseProgress] = useState<Record<string, ExerciseProgress>>({});
  const [timer, setTimer] = useState<WorkoutTimer>({
    isRunning: false,
    currentTime: 0,
    exerciseTime: 0,
    restTime: 0,
    currentPhase: 'prepare'
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<WorkoutFeedback>({
    difficulty_rating: 3,
    energy_rating: 3,
    enjoyment_rating: 3,
    client_notes: ''
  });

  const exercises = workout.workout_template?.exercises || [];
  const currentEx = exercises[currentExercise];

  // Initialize exercise progress
  useEffect(() => {
    const initialProgress: Record<string, ExerciseProgress> = {};
    exercises.forEach(ex => {
      initialProgress[ex.id] = {
        exerciseId: ex.id,
        completedSets: 0,
        totalSets: ex.sets || 1,
        setLogs: []
      };
    });
    setExerciseProgress(initialProgress);
  }, [exercises]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer.isRunning && workoutStatus === 'in_progress') {
      interval = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          currentTime: prev.currentTime + 1
        }));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning, workoutStatus]);

  // Auto-advance timer phases
  useEffect(() => {
    if (timer.currentPhase === 'rest' && timer.currentTime >= timer.restTime && timer.restTime > 0) {
      playSound('rest_complete');
      setTimer(prev => ({ ...prev, currentPhase: 'prepare', currentTime: 0 }));
    }
  }, [timer.currentTime, timer.restTime, timer.currentPhase]);

  const playSound = (type: 'start' | 'rest' | 'rest_complete' | 'complete') => {
    if (!soundEnabled) return;
    
    // In a real app, you would play actual sound files
    console.log(`Playing sound: ${type}`);
    
    // Simple beep using Web Audio API (optional)
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const frequencies = {
        start: 800,
        rest: 600,
        rest_complete: 1000,
        complete: 1200
      };
      
      oscillator.frequency.value = frequencies[type];
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const startWorkout = () => {
    const now = new Date();
    setWorkoutStatus('in_progress');
    setStartTime(now);
    setTimer(prev => ({ ...prev, isRunning: true, currentPhase: 'exercise' }));
    onUpdateWorkout(workout.id, { 
      status: 'in_progress', 
      started_at: now 
    });
    playSound('start');
  };

  const pauseWorkout = () => {
    setTimer(prev => ({ ...prev, isRunning: false }));
  };

  const resumeWorkout = () => {
    setTimer(prev => ({ ...prev, isRunning: true }));
  };

  const startRestTimer = (restSeconds: number) => {
    setTimer(prev => ({
      ...prev,
      currentTime: 0,
      restTime: restSeconds,
      currentPhase: 'rest'
    }));
    playSound('rest');
  };

  const completeSet = (reps: number, weight?: number, notes?: string) => {
    if (!currentEx) return;

    const exerciseId = currentEx.id;
    const newSetLog = {
      setNumber: currentSet,
      reps,
      weight,
      completed: true,
      notes
    };

    // Update exercise progress
    setExerciseProgress(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        completedSets: prev[exerciseId].completedSets + 1,
        setLogs: [...prev[exerciseId].setLogs, newSetLog]
      }
    }));

    // Log to database
    onLogExercise({
      client_id: workout.client_id,
      client_workout_id: workout.id,
      exercise_id: currentEx.exercise_id,
      workout_exercise_id: currentEx.id,
      set_number: currentSet,
      reps_completed: reps,
      weight_used: weight,
      notes,
      completed_at: new Date()
    });

    // Move to next set or exercise
    if (currentSet < (currentEx.sets || 1)) {
      setCurrentSet(currentSet + 1);
      startRestTimer(currentEx.rest_seconds);
    } else {
      // Exercise complete, move to next
      nextExercise();
    }
  };

  const skipSet = () => {
    if (!currentEx) return;

    if (currentSet < (currentEx.sets || 1)) {
      setCurrentSet(currentSet + 1);
    } else {
      nextExercise();
    }
  };

  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setCurrentSet(1);
      setTimer(prev => ({ ...prev, currentPhase: 'prepare', currentTime: 0 }));
    } else {
      // Workout complete
      finishWorkout();
    }
  };

  const previousExercise = () => {
    if (currentExercise > 0) {
      setCurrentExercise(currentExercise - 1);
      setCurrentSet(1);
      setTimer(prev => ({ ...prev, currentPhase: 'prepare', currentTime: 0 }));
    }
  };

  const finishWorkout = () => {
    setWorkoutStatus('completed');
    setTimer(prev => ({ ...prev, isRunning: false, currentPhase: 'prepare' }));
    setShowFeedback(true);
    playSound('complete');
  };

  const submitFeedback = () => {
    const now = new Date();
    const duration = startTime ? Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60) : 0;
    
    onUpdateWorkout(workout.id, {
      status: 'completed',
      completed_at: now,
      actual_duration: duration,
      ...feedback
    });
    
    onComplete(workout.id, feedback);
  };

  const cancelWorkout = () => {
    if (confirm('Are you sure you want to cancel this workout? Your progress will not be saved.')) {
      setWorkoutStatus('cancelled');
      onCancel?.();
    }
  };

  const calculateProgress = () => {
    const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets || 1), 0);
    const completedSets = Object.values(exerciseProgress).reduce((sum, progress) => sum + progress.completedSets, 0);
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'warmup': return <Zap className="h-4 w-4 text-orange-500" />;
      case 'main': return <Target className="h-4 w-4 text-blue-500" />;
      case 'cooldown': return <Heart className="h-4 w-4 text-green-500" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  if (showFeedback) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Award className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-2xl">Workout Complete! 🎉</CardTitle>
            <CardDescription>
              Great job finishing your workout! Please rate your experience.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Difficulty Rating */}
            <div>
              <Label className="text-sm font-medium">How difficult was this workout?</Label>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">Easy</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={feedback.difficulty_rating >= rating ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setFeedback(prev => ({ ...prev, difficulty_rating: rating }))}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
                <span className="text-sm text-gray-500">Hard</span>
              </div>
            </div>

            {/* Energy Rating */}
            <div>
              <Label className="text-sm font-medium">How was your energy level?</Label>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">Low</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={feedback.energy_rating >= rating ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setFeedback(prev => ({ ...prev, energy_rating: rating }))}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
                <span className="text-sm text-gray-500">High</span>
              </div>
            </div>

            {/* Enjoyment Rating */}
            <div>
              <Label className="text-sm font-medium">How much did you enjoy it?</Label>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">😢</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={feedback.enjoyment_rating >= rating ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setFeedback(prev => ({ ...prev, enjoyment_rating: rating }))}
                    >
                      <Star className={cn(
                        "h-4 w-4",
                        feedback.enjoyment_rating >= rating ? "text-yellow-400 fill-current" : ""
                      )} />
                    </Button>
                  ))}
                </div>
                <span className="text-sm text-gray-500">😍</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Additional notes (optional)</Label>
              <Textarea
                id="notes"
                value={feedback.client_notes}
                onChange={(e) => setFeedback(prev => ({ ...prev, client_notes: e.target.value }))}
                placeholder="How did you feel? Any exercises you loved or found challenging?"
                className="mt-1"
                rows={3}
              />
            </div>

            <Button onClick={submitFeedback} className="w-full" size="lg">
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{workout.workout_template?.name}</h1>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(timer.currentTime)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>{currentExercise + 1} of {exercises.length}</span>
                </div>
                <Badge variant={workoutStatus === 'in_progress' ? 'default' : 'secondary'}>
                  {workoutStatus.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              
              {workoutStatus === 'scheduled' && (
                <Button onClick={startWorkout} size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}
              
              {workoutStatus === 'in_progress' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={timer.isRunning ? pauseWorkout : resumeWorkout}
                  >
                    {timer.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={finishWorkout}
                  >
                    Finish
                  </Button>
                </>
              )}
              
              <Button variant="ghost" size="sm" onClick={cancelWorkout}>
                <X className="h-4 w-4" />
              </Button>
            </div>
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
        {workoutStatus === 'scheduled' ? (
          // Pre-workout view
          <Card>
            <CardContent className="text-center py-12">
              <Play className="mx-auto h-16 w-16 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Ready to start your workout?</h2>
              <p className="text-gray-600 mb-6">
                {workout.workout_template?.description}
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {workout.workout_template?.estimated_duration}
                  </div>
                  <div className="text-sm text-gray-600">minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {exercises.length}
                  </div>
                  <div className="text-sm text-gray-600">exercises</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    ~{workout.workout_template?.calories_estimate || 250}
                  </div>
                  <div className="text-sm text-gray-600">calories</div>
                </div>
              </div>
              <Button onClick={startWorkout} size="lg">
                <Play className="h-5 w-5 mr-2" />
                Start Workout
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Active workout view
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Exercise */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {currentEx && getSectionIcon(currentEx.section)}
                      <div>
                        <CardTitle>{currentEx?.exercise?.name}</CardTitle>
                        <CardDescription>
                          Set {currentSet} of {currentEx?.sets || 1}
                        </CardDescription>
                      </div>
                    </div>
                    
                    {timer.currentPhase === 'rest' && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {formatTime(Math.max(0, timer.restTime - timer.currentTime))}
                        </div>
                        <div className="text-sm text-gray-600">Rest time</div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                {currentEx && (
                  <CardContent className="space-y-6">
                    {/* Set Details */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-3xl font-bold text-primary">
                          {currentEx.reps}
                        </div>
                        <div className="text-sm text-gray-600">Target Reps</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-primary">
                          {currentEx.weight || 'BW'}
                        </div>
                        <div className="text-sm text-gray-600">Weight</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-primary">
                          {formatTime(currentEx.rest_seconds)}
                        </div>
                        <div className="text-sm text-gray-600">Rest</div>
                      </div>
                    </div>

                    {/* Exercise Instructions */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Instructions</h4>
                      <p className="text-gray-700">{currentEx.exercise?.instructions}</p>
                    </div>

                    {/* Form Cues */}
                    {currentEx.exercise?.form_cues && currentEx.exercise.form_cues.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Key Points</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {currentEx.exercise.form_cues.map((cue, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm">{cue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {timer.currentPhase !== 'rest' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="actual-reps">Reps Completed</Label>
                            <Input
                              id="actual-reps"
                              type="number"
                              defaultValue={parseInt(currentEx.reps?.toString() || '10')}
                              min={0}
                            />
                          </div>
                          <div>
                            <Label htmlFor="actual-weight">Weight Used</Label>
                            <Input
                              id="actual-weight"
                              type="number"
                              step="0.1"
                              placeholder={currentEx.weight || 'Bodyweight'}
                            />
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            className="flex-1"
                            onClick={() => {
                              const repsInput = document.getElementById('actual-reps') as HTMLInputElement;
                              const weightInput = document.getElementById('actual-weight') as HTMLInputElement;
                              completeSet(
                                parseInt(repsInput.value) || 0,
                                parseFloat(weightInput.value) || undefined
                              );
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete Set
                          </Button>
                          
                          <Button variant="outline" onClick={skipSet}>
                            <SkipForward className="h-4 w-4 mr-2" />
                            Skip
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={previousExercise}
                        disabled={currentExercise === 0}
                      >
                        Previous Exercise
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={nextExercise}
                        disabled={currentExercise >= exercises.length - 1}
                      >
                        Next Exercise
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Exercise List & Timer */}
            <div className="space-y-4">
              {/* Rest Timer Card */}
              {timer.currentPhase === 'rest' && (
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="text-center py-6">
                    <Timer className="mx-auto h-8 w-8 text-orange-600 mb-2" />
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {formatTime(Math.max(0, timer.restTime - timer.currentTime))}
                    </div>
                    <div className="text-sm text-orange-700">Rest time remaining</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setTimer(prev => ({ ...prev, currentPhase: 'prepare', currentTime: 0 }))}
                    >
                      Skip Rest
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Exercise List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Exercise List</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {exercises.map((exercise, index) => {
                    const progress = exerciseProgress[exercise.id];
                    const isActive = index === currentExercise;
                    const isCompleted = progress?.completedSets >= (exercise.sets || 1);
                    
                    return (
                      <div
                        key={exercise.id}
                        className={cn(
                          'p-3 rounded-lg cursor-pointer transition-colors',
                          isActive ? 'bg-primary text-white' : 
                          isCompleted ? 'bg-green-100 text-green-800' :
                          'hover:bg-gray-100'
                        )}
                        onClick={() => {
                          setCurrentExercise(index);
                          setCurrentSet(1);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              getSectionIcon(exercise.section)
                            )}
                            <span className="text-sm font-medium truncate">
                              {exercise.exercise?.name}
                            </span>
                          </div>
                          <div className="text-xs">
                            {progress ? `${progress.completedSets}/${progress.totalSets}` : `0/${exercise.sets}`}
                          </div>
                        </div>
                        
                        {progress && progress.completedSets > 0 && (
                          <div className="mt-2">
                            <Progress 
                              value={(progress.completedSets / progress.totalSets) * 100}
                              className="h-1"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}