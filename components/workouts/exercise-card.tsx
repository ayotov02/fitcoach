'use client';

import { useState } from 'react';
import { Exercise } from '@/types/workouts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play,
  Info,
  Clock,
  Target,
  Zap,
  Users,
  AlertTriangle,
  Plus,
  Grip,
  Star,
  Bookmark
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  exercise: Exercise;
  onAdd?: (exercise: Exercise) => void;
  onPreview?: (exercise: Exercise) => void;
  onFavorite?: (exerciseId: string) => void;
  isDragging?: boolean;
  isSelected?: boolean;
  showAddButton?: boolean;
  showDragHandle?: boolean;
  isFavorite?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ExerciseCard({ 
  exercise, 
  onAdd, 
  onPreview,
  onFavorite,
  isDragging = false,
  isSelected = false,
  showAddButton = true,
  showDragHandle = false,
  isFavorite = false,
  size = 'md'
}: ExerciseCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      advanced: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[difficulty as keyof typeof colors] || colors.beginner;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      chest: '💪',
      back: '🏋️',
      shoulders: '🤸',
      arms: '💪',
      legs: '🦵',
      core: '🔥',
      cardio: '❤️',
      functional: '⚡',
    };
    return icons[category as keyof typeof icons] || '💪';
  };

  const getEquipmentString = (equipment: string[]) => {
    if (equipment.includes('bodyweight')) return 'Bodyweight';
    if (equipment.length === 1) return equipment[0].replace('_', ' ');
    if (equipment.length === 2) return equipment.map(e => e.replace('_', ' ')).join(' + ');
    return `${equipment.length} items`;
  };

  const cardSizes = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <Card 
      className={cn(
        'group transition-all duration-200 cursor-pointer relative',
        isSelected && 'ring-2 ring-primary',
        isDragging && 'opacity-50 scale-95 rotate-1',
        isHovered && 'shadow-lg scale-[1.02]',
        'hover:shadow-md'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPreview?.(exercise)}
    >
      {/* Drag Handle */}
      {showDragHandle && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <Grip className="h-4 w-4 text-gray-400" />
        </div>
      )}

      {/* Favorite Button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(exercise.id);
          }}
          className="h-8 w-8 p-0"
        >
          {isFavorite ? (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          ) : (
            <Star className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>

      <CardHeader className={cn(cardSizes[size], 'pb-2')}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={cn(titleSizes[size], 'mb-1')}>
              <span className="mr-2">{getCategoryIcon(exercise.category)}</span>
              {exercise.name}
            </CardTitle>
            <CardDescription className="text-xs">
              {exercise.muscle_groups.slice(0, 3).map(group => 
                group.replace('_', ' ')
              ).join(', ')}
              {exercise.muscle_groups.length > 3 && ` +${exercise.muscle_groups.length - 3} more`}
            </CardDescription>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge 
            variant="outline" 
            className={getDifficultyColor(exercise.difficulty)}
            size="sm"
          >
            {exercise.difficulty}
          </Badge>
          
          <Badge variant="secondary" className="text-xs">
            {getEquipmentString(exercise.equipment)}
          </Badge>

          {exercise.is_compound && (
            <Badge variant="outline" className="text-xs">
              Compound
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn(cardSizes[size], 'pt-0')}>
        {/* Exercise Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{exercise.calories_per_minute} cal/min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="h-3 w-3" />
              <span className="capitalize">{exercise.exercise_type}</span>
            </div>
          </div>

          {/* Instructions Preview */}
          {size !== 'sm' && (
            <p className="text-xs text-gray-700 line-clamp-2">
              {exercise.instructions}
            </p>
          )}

          {/* Form Cues */}
          {size === 'lg' && exercise.form_cues && exercise.form_cues.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">Key Form Cues:</p>
              <div className="flex flex-wrap gap-1">
                {exercise.form_cues.slice(0, 3).map((cue, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {cue}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Contraindications */}
          {exercise.contraindications && exercise.contraindications.length > 0 && (
            <div className="flex items-center space-x-1 text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-xs">Has contraindications</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(exercise);
            }}
            className="flex items-center space-x-1"
          >
            <Info className="h-3 w-3" />
            <span>Details</span>
          </Button>

          {exercise.video_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // In real app, would open video modal
                console.log('Play video:', exercise.video_url);
              }}
              className="flex items-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>Demo</span>
            </Button>
          )}

          {showAddButton && onAdd && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAdd(exercise);
              }}
              className="flex items-center space-x-1"
            >
              <Plus className="h-3 w-3" />
              <span>Add</span>
            </Button>
          )}
        </div>
      </CardContent>

      {/* Exercise Variations */}
      {size === 'lg' && exercise.variations && exercise.variations.length > 0 && (
        <CardContent className="pt-0 border-t">
          <p className="text-xs font-medium text-gray-700 mb-2">Variations:</p>
          <div className="flex flex-wrap gap-1">
            {exercise.variations.slice(0, 4).map((variation, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {variation}
              </Badge>
            ))}
            {exercise.variations.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{exercise.variations.length - 4} more
              </Badge>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}