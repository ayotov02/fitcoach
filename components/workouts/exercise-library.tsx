'use client';

import { useState, useMemo, useEffect } from 'react';
import { Exercise, ExerciseFilter, ExerciseCategory, ExerciseDifficulty, ExerciseType } from '@/types/workouts';
import { ExerciseCard } from './exercise-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  X,
  Star,
  Bookmark,
  Grid3X3,
  List,
  Zap,
  Target,
  Dumbbell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXERCISE_LIBRARY, EXERCISE_CATEGORIES, MUSCLE_GROUP_PRESETS, EQUIPMENT_GROUPS } from '@/lib/data/exercise-library';

interface ExerciseLibraryProps {
  exercises?: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
  onPreviewExercise?: (exercise: Exercise) => void;
  favorites?: string[];
  onToggleFavorite?: (exerciseId: string) => void;
  showFilters?: boolean;
  allowDrag?: boolean;
  selectedCategory?: ExerciseCategory;
  compactView?: boolean;
}

export function ExerciseLibrary({
  exercises,
  onAddExercise,
  onPreviewExercise,
  favorites = [],
  onToggleFavorite,
  showFilters = true,
  allowDrag = false,
  selectedCategory,
  compactView = false
}: ExerciseLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Initialize exercises from library if not provided
  const allExercises = exercises || EXERCISE_LIBRARY.map((ex, index) => ({
    ...ex,
    id: `ex-${index}`,
    created_at: new Date(),
    updated_at: new Date()
  }));

  const [filters, setFilters] = useState<ExerciseFilter>({
    category: selectedCategory,
    muscle_groups: [],
    equipment: [],
    difficulty: undefined,
    exercise_type: undefined,
    search: '',
    tags: []
  });

  // Update filters when selectedCategory changes
  useEffect(() => {
    if (selectedCategory) {
      setFilters(prev => ({ ...prev, category: selectedCategory }));
    }
  }, [selectedCategory]);

  const filteredExercises = useMemo(() => {
    let filtered = allExercises;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscle_groups.some(group => 
          group.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        exercise.equipment.some(equip => 
          equip.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        exercise.instructions.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(exercise => exercise.category === filters.category);
    }

    // Muscle groups filter
    if (filters.muscle_groups && filters.muscle_groups.length > 0) {
      filtered = filtered.filter(exercise =>
        filters.muscle_groups!.some(group => exercise.muscle_groups.includes(group))
      );
    }

    // Equipment filter
    if (filters.equipment && filters.equipment.length > 0) {
      filtered = filtered.filter(exercise =>
        filters.equipment!.some(equip => exercise.equipment.includes(equip))
      );
    }

    // Difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter(exercise => exercise.difficulty === filters.difficulty);
    }

    // Exercise type filter
    if (filters.exercise_type) {
      filtered = filtered.filter(exercise => exercise.exercise_type === filters.exercise_type);
    }

    // Active tab filter
    if (activeTab === 'favorites') {
      filtered = filtered.filter(exercise => favorites.includes(exercise.id));
    } else if (activeTab === 'compound') {
      filtered = filtered.filter(exercise => exercise.is_compound);
    } else if (activeTab === 'bodyweight') {
      filtered = filtered.filter(exercise => exercise.equipment.includes('bodyweight'));
    }

    return filtered;
  }, [allExercises, searchTerm, filters, activeTab, favorites]);

  const groupedExercises = useMemo(() => {
    const grouped: Record<string, Exercise[]> = {};
    
    filteredExercises.forEach(exercise => {
      const category = exercise.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(exercise);
    });

    return grouped;
  }, [filteredExercises]);

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setActiveTab('all');
  };

  const applyMuscleGroupPreset = (preset: keyof typeof MUSCLE_GROUP_PRESETS) => {
    setFilters(prev => ({
      ...prev,
      muscle_groups: MUSCLE_GROUP_PRESETS[preset]
    }));
  };

  const applyEquipmentGroup = (group: keyof typeof EQUIPMENT_GROUPS) => {
    setFilters(prev => ({
      ...prev,
      equipment: EQUIPMENT_GROUPS[group]
    }));
  };

  const handleDragStart = (e: React.DragEvent, exercise: Exercise) => {
    if (!allowDrag) return;
    e.dataTransfer.setData('application/json', JSON.stringify(exercise));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  }).length;

  if (compactView) {
    return (
      <div className="space-y-4">
        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Exercise List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              draggable={allowDrag}
              onDragStart={(e) => handleDragStart(e, exercise)}
              className="cursor-pointer"
            >
              <ExerciseCard
                exercise={exercise}
                onAdd={onAddExercise}
                onPreview={onPreviewExercise}
                onFavorite={onToggleFavorite}
                isFavorite={favorites.includes(exercise.id)}
                size="sm"
                showDragHandle={allowDrag}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exercise Library</h2>
          <p className="text-gray-600">
            {filteredExercises.length} of {allExercises.length} exercises
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
          
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={activeFiltersCount > 0 ? 'bg-primary/10 text-primary' : ''}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search exercises by name, muscle groups, or equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Exercises</TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="compound">Compound</TabsTrigger>
            <TabsTrigger value="bodyweight">Bodyweight</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(EXERCISE_CATEGORIES).map(([key, category]) => (
                  <Button
                    key={key}
                    variant={filters.category === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      category: prev.category === key ? undefined : key as ExerciseCategory
                    }))}
                    className="flex items-center space-x-1"
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Muscle Group Presets */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Muscle Groups</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(MUSCLE_GROUP_PRESETS).map(([key, groups]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => applyMuscleGroupPreset(key as keyof typeof MUSCLE_GROUP_PRESETS)}
                    className="capitalize"
                  >
                    <Target className="h-3 w-3 mr-1" />
                    {key.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Equipment Groups */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Equipment</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(EQUIPMENT_GROUPS).map(([key, equipment]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => applyEquipmentGroup(key as keyof typeof EQUIPMENT_GROUPS)}
                    className="capitalize"
                  >
                    <Dumbbell className="h-3 w-3 mr-1" />
                    {key.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Individual Filters */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Select
                  value={filters.difficulty || ''}
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    difficulty: value as ExerciseDifficulty || undefined
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any difficulty</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Exercise Type</label>
                <Select
                  value={filters.exercise_type || ''}
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    exercise_type: value as ExerciseType || undefined
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any type</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                    <SelectItem value="mobility">Mobility</SelectItem>
                    <SelectItem value="plyometric">Plyometric</SelectItem>
                    <SelectItem value="balance">Balance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Category: {EXERCISE_CATEGORIES[filters.category].name}</span>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, category: undefined }))}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {filters.difficulty && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Difficulty: {filters.difficulty}</span>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, difficulty: undefined }))}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}

                {filters.exercise_type && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Type: {filters.exercise_type}</span>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, exercise_type: undefined }))}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Exercise Grid/List */}
      {filteredExercises.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find exercises.
            </p>
            <Button onClick={clearFilters}>
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        Object.entries(groupedExercises).map(([category, exercises]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-lg font-semibold capitalize flex items-center">
              <span className="mr-2">{EXERCISE_CATEGORIES[category as ExerciseCategory]?.icon}</span>
              {EXERCISE_CATEGORIES[category as ExerciseCategory]?.name} ({exercises.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  draggable={allowDrag}
                  onDragStart={(e) => handleDragStart(e, exercise)}
                >
                  <ExerciseCard
                    exercise={exercise}
                    onAdd={onAddExercise}
                    onPreview={onPreviewExercise}
                    onFavorite={onToggleFavorite}
                    isFavorite={favorites.includes(exercise.id)}
                    showDragHandle={allowDrag}
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="space-y-2">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              draggable={allowDrag}
              onDragStart={(e) => handleDragStart(e, exercise)}
            >
              <ExerciseCard
                exercise={exercise}
                onAdd={onAddExercise}
                onPreview={onPreviewExercise}
                onFavorite={onToggleFavorite}
                isFavorite={favorites.includes(exercise.id)}
                showDragHandle={allowDrag}
                size="sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}