'use client';

import { useState } from 'react';
import { WorkoutTemplate, WorkoutCategory, ExerciseDifficulty } from '@/types/workouts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock,
  Users,
  Target,
  Dumbbell,
  Play,
  Copy,
  Edit,
  Trash2,
  Eye,
  Star,
  Share,
  Download,
  Heart,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutTemplateProps {
  template: WorkoutTemplate;
  onUse?: (template: WorkoutTemplate) => void;
  onEdit?: (template: WorkoutTemplate) => void;
  onDuplicate?: (template: WorkoutTemplate) => void;
  onDelete?: (templateId: string) => void;
  onPreview?: (template: WorkoutTemplate) => void;
  onFavorite?: (templateId: string) => void;
  onShare?: (template: WorkoutTemplate) => void;
  isFavorite?: boolean;
  isOwner?: boolean;
  showStats?: boolean;
  size?: 'sm' | 'md' | 'lg';
  view?: 'card' | 'list';
}

export function WorkoutTemplate({ 
  template, 
  onUse,
  onEdit,
  onDuplicate,
  onDelete,
  onPreview,
  onFavorite,
  onShare,
  isFavorite = false,
  isOwner = false,
  showStats = false,
  size = 'md',
  view = 'card'
}: WorkoutTemplateProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getDifficultyColor = (difficulty: ExerciseDifficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      advanced: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[difficulty];
  };

  const getCategoryIcon = (category: WorkoutCategory) => {
    const icons = {
      strength: '💪',
      cardio: '❤️',
      hiit: '🔥',
      circuit: '🔄',
      flexibility: '🧘',
      rehabilitation: '⚕️',
      sports_specific: '⚽'
    };
    return icons[category] || '💪';
  };

  const getCategoryColor = (category: WorkoutCategory) => {
    const colors = {
      strength: 'bg-blue-100 text-blue-800',
      cardio: 'bg-red-100 text-red-800',
      hiit: 'bg-orange-100 text-orange-800',
      circuit: 'bg-purple-100 text-purple-800',
      flexibility: 'bg-green-100 text-green-800',
      rehabilitation: 'bg-gray-100 text-gray-800',
      sports_specific: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || colors.strength;
  };

  const getEquipmentSummary = () => {
    if (!template.equipment_needed || template.equipment_needed.length === 0) return 'No equipment';
    if (template.equipment_needed.includes('bodyweight')) return 'Bodyweight';
    if (template.equipment_needed.length === 1) return template.equipment_needed[0].replace('_', ' ');
    if (template.equipment_needed.length <= 3) {
      return template.equipment_needed.map(eq => eq.replace('_', ' ')).join(', ');
    }
    return `${template.equipment_needed.length} items`;
  };

  const exerciseCount = template.exercises?.length || 0;
  const warmupCount = template.exercises?.filter(ex => ex.section === 'warmup').length || 0;
  const mainCount = template.exercises?.filter(ex => ex.section === 'main').length || 0;
  const cooldownCount = template.exercises?.filter(ex => ex.section === 'cooldown').length || 0;

  if (view === 'list') {
    return (
      <Card 
        className={cn(
          'hover:shadow-md transition-all duration-200 cursor-pointer',
          isHovered && 'shadow-lg'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onPreview?.(template)}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Template Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white text-xl">
                {getCategoryIcon(template.category)}
              </div>
            </div>

            {/* Template Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold truncate">{template.name}</h3>
                <Badge className={getCategoryColor(template.category)} size="sm">
                  {template.category}
                </Badge>
                <Badge className={getDifficultyColor(template.difficulty)} size="sm">
                  {template.difficulty}
                </Badge>
                {template.is_public && (
                  <Badge variant="outline" size="sm">Public</Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-600 truncate mt-1">
                {template.description || 'No description provided'}
              </p>
              
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{template.estimated_duration} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-3 w-3" />
                  <span>{exerciseCount} exercises</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Dumbbell className="h-3 w-3" />
                  <span>{getEquipmentSummary()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite?.(template.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Star className={cn("h-4 w-4", isFavorite && "text-yellow-500 fill-yellow-500")} />
              </Button>
              
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onUse?.(template);
                }}
              >
                <Play className="h-4 w-4 mr-1" />
                Use
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        'group hover:shadow-lg transition-all duration-200 cursor-pointer relative',
        isHovered && 'scale-[1.02]',
        size === 'sm' && 'max-w-sm',
        size === 'lg' && 'max-w-lg'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPreview?.(template)}
    >
      {/* Favorite Button */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(template.id);
          }}
          className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
        >
          <Star className={cn("h-4 w-4", isFavorite && "text-yellow-500 fill-yellow-500")} />
        </Button>
      </div>

      <CardHeader className={cn(size === 'sm' ? 'p-4' : 'p-6')}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{getCategoryIcon(template.category)}</span>
              <Badge className={getCategoryColor(template.category)} size="sm">
                {template.category}
              </Badge>
              <Badge className={getDifficultyColor(template.difficulty)} size="sm">
                {template.difficulty}
              </Badge>
            </div>
            
            <CardTitle className={cn(
              size === 'sm' ? 'text-lg' : 'text-xl',
              'line-clamp-2 mb-2'
            )}>
              {template.name}
            </CardTitle>
            
            <CardDescription className="line-clamp-2">
              {template.description || 'A comprehensive workout designed to help you achieve your fitness goals.'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn(size === 'sm' ? 'p-4 pt-0' : 'p-6 pt-0', 'space-y-4')}>
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{template.estimated_duration}</div>
            <div className="text-xs text-gray-600">minutes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{exerciseCount}</div>
            <div className="text-xs text-gray-600">exercises</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {template.muscle_groups_targeted?.length || 0}
            </div>
            <div className="text-xs text-gray-600">muscle groups</div>
          </div>
        </div>

        {/* Workout Structure */}
        {size !== 'sm' && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Workout Structure</h4>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-orange-600">
                <Zap className="h-3 w-3" />
                <span>Warm-up: {warmupCount}</span>
              </div>
              <div className="flex items-center space-x-1 text-blue-600">
                <Target className="h-3 w-3" />
                <span>Main: {mainCount}</span>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <Heart className="h-3 w-3" />
                <span>Cool-down: {cooldownCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Equipment */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Equipment Needed</h4>
          <div className="flex flex-wrap gap-1">
            {template.equipment_needed?.slice(0, 4).map((equipment) => (
              <Badge key={equipment} variant="secondary" className="text-xs">
                {equipment.replace('_', ' ')}
              </Badge>
            ))}
            {(template.equipment_needed?.length || 0) > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{(template.equipment_needed?.length || 0) - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {template.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{template.tags.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Stats (if enabled) */}
        {showStats && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="flex items-center justify-center space-x-1 text-blue-600">
                  <Users className="h-3 w-3" />
                  <span className="font-medium">142</span>
                </div>
                <div className="text-xs text-gray-500">uses</div>
              </div>
              <div>
                <div className="flex items-center justify-center space-x-1 text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="font-medium">4.8</span>
                </div>
                <div className="text-xs text-gray-500">rating</div>
              </div>
              <div>
                <div className="flex items-center justify-center space-x-1 text-purple-600">
                  <Award className="h-3 w-3" />
                  <span className="font-medium">89%</span>
                </div>
                <div className="text-xs text-gray-500">completion</div>
              </div>
            </div>
          </div>
        )}

        {/* Public/Private Status */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            {template.is_public && (
              <Badge variant="outline" className="text-xs">
                <Share className="h-2 w-2 mr-1" />
                Public
              </Badge>
            )}
            <span>Created {new Date(template.created_at).toLocaleDateString()}</span>
          </div>
          
          {template.calories_estimate && (
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>~{template.calories_estimate} cal</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Action Buttons */}
      <div className={cn(
        'border-t p-4 flex items-center justify-between',
        'opacity-0 group-hover:opacity-100 transition-opacity'
      )}>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(template);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          
          {onShare && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onShare(template);
              }}
            >
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isOwner && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(template);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(template.id);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate?.(template);
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onUse?.(template);
            }}
          >
            <Play className="h-4 w-4 mr-1" />
            Use Template
          </Button>
        </div>
      </div>
    </Card>
  );
}