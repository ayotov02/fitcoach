-- Workout Management Schema Extension

-- Exercise Library Table
CREATE TABLE exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'functional', 'full_body'
    )),
    subcategory TEXT, -- e.g., 'biceps', 'triceps' under 'arms'
    muscle_groups TEXT[] NOT NULL, -- ['chest', 'triceps', 'front_delts']
    equipment TEXT[] DEFAULT '{}', -- ['dumbbells', 'bench'] or ['bodyweight']
    instructions TEXT NOT NULL,
    form_cues TEXT[],
    video_url TEXT,
    image_url TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    exercise_type TEXT NOT NULL CHECK (exercise_type IN (
        'strength', 'cardio', 'flexibility', 'mobility', 'plyometric', 'balance'
    )),
    calories_per_minute INTEGER DEFAULT 5,
    tags TEXT[] DEFAULT '{}',
    variations TEXT[] DEFAULT '{}', -- Related exercise variations
    is_compound BOOLEAN DEFAULT false,
    is_unilateral BOOLEAN DEFAULT false, -- Single limb/side exercises
    contraindications TEXT[], -- Injuries or conditions to avoid
    modifications TEXT[], -- Easier/harder variations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Workout Templates Table
CREATE TABLE workout_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'strength', 'cardio', 'hiit', 'circuit', 'flexibility', 'rehabilitation', 'sports_specific'
    )),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration INTEGER NOT NULL, -- minutes
    equipment_needed TEXT[] DEFAULT '{}',
    muscle_groups_targeted TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false, -- Can other coaches see/use this template
    calories_estimate INTEGER,
    workout_structure JSONB DEFAULT '{}', -- Stores sections like warmup, main, cooldown
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Workout Exercises Table (Links exercises to workout templates)
CREATE TABLE workout_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    section TEXT NOT NULL CHECK (section IN ('warmup', 'main', 'cooldown')),
    exercise_order INTEGER NOT NULL,
    superset_group INTEGER, -- Groups exercises into supersets (null if not in superset)
    circuit_group INTEGER, -- Groups exercises into circuits
    sets INTEGER,
    reps TEXT, -- Can be number or range like "8-12" or "AMRAP"
    weight TEXT, -- Can be specific weight or percentage like "75% 1RM"
    duration_seconds INTEGER, -- For time-based exercises
    rest_seconds INTEGER DEFAULT 60,
    distance TEXT, -- For cardio exercises
    intensity TEXT, -- low, moderate, high, or specific like "RPE 7"
    tempo TEXT, -- e.g., "3-1-2-1" (eccentric-pause-concentric-pause)
    notes TEXT,
    coaching_cues TEXT[],
    is_optional BOOLEAN DEFAULT false,
    alternatives TEXT[], -- Exercise IDs for alternatives
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Workouts Table (Scheduled workouts for clients)
CREATE TABLE client_workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
    workout_template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'in_progress', 'completed', 'skipped', 'cancelled'
    )),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    actual_duration INTEGER, -- minutes
    difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
    energy_rating INTEGER CHECK (energy_rating BETWEEN 1 AND 5),
    enjoyment_rating INTEGER CHECK (enjoyment_rating BETWEEN 1 AND 5),
    client_notes TEXT,
    coach_notes TEXT,
    modifications_made TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise Logs Table (Individual exercise performance tracking)
CREATE TABLE exercise_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
    client_workout_id UUID REFERENCES client_workouts(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE SET NULL,
    set_number INTEGER NOT NULL,
    reps_completed INTEGER,
    weight_used DECIMAL(6,2),
    duration_seconds INTEGER,
    distance_completed DECIMAL(8,2),
    perceived_exertion INTEGER CHECK (perceived_exertion BETWEEN 1 AND 10),
    rest_time_seconds INTEGER,
    form_rating INTEGER CHECK (form_rating BETWEEN 1 AND 5),
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Programs Table (Multi-week training programs)
CREATE TABLE workout_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_weeks INTEGER NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    program_type TEXT NOT NULL CHECK (program_type IN (
        'strength', 'hypertrophy', 'powerlifting', 'weight_loss', 'endurance', 'general_fitness'
    )),
    sessions_per_week INTEGER NOT NULL,
    equipment_needed TEXT[] DEFAULT '{}',
    goals TEXT[],
    is_public BOOLEAN DEFAULT false,
    price DECIMAL(10,2), -- For marketplace programs
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Program Weeks Table (Weekly structure of programs)
CREATE TABLE program_weeks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    description TEXT,
    focus TEXT, -- e.g., "Strength", "Volume", "Deload"
    intensity_modifier DECIMAL(3,2) DEFAULT 1.0, -- Multiplier for weights/intensity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Program Sessions Table (Links workout templates to program weeks)
CREATE TABLE program_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    program_week_id UUID REFERENCES program_weeks(id) ON DELETE CASCADE,
    workout_template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE,
    session_number INTEGER NOT NULL, -- Day of the week (1-7)
    session_name TEXT,
    is_optional BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Programs Table (Assigns programs to clients)
CREATE TABLE client_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
    workout_program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    current_week INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'paused', 'completed', 'cancelled'
    )),
    completion_percentage DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise Performance Analytics Table
CREATE TABLE exercise_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_volume DECIMAL(10,2), -- sets * reps * weight
    max_weight DECIMAL(6,2),
    total_reps INTEGER,
    total_sets INTEGER,
    average_rest_time INTEGER,
    one_rep_max_estimate DECIMAL(6,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(client_id, exercise_id, date)
);

-- Indexes for performance
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);
CREATE INDEX idx_exercises_equipment ON exercises USING GIN(equipment);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_workout_templates_coach ON workout_templates(coach_id);
CREATE INDEX idx_workout_templates_difficulty ON workout_templates(difficulty);
CREATE INDEX idx_workout_exercises_template ON workout_exercises(workout_template_id);
CREATE INDEX idx_workout_exercises_order ON workout_exercises(workout_template_id, exercise_order);
CREATE INDEX idx_client_workouts_client ON client_workouts(client_id);
CREATE INDEX idx_client_workouts_date ON client_workouts(scheduled_date);
CREATE INDEX idx_client_workouts_status ON client_workouts(status);
CREATE INDEX idx_exercise_logs_client ON exercise_logs(client_id);
CREATE INDEX idx_exercise_logs_workout ON exercise_logs(client_workout_id);
CREATE INDEX idx_exercise_logs_exercise ON exercise_logs(exercise_id);
CREATE INDEX idx_exercise_logs_date ON exercise_logs(completed_at);
CREATE INDEX idx_exercise_analytics_client ON exercise_analytics(client_id);
CREATE INDEX idx_exercise_analytics_exercise ON exercise_analytics(exercise_id);
CREATE INDEX idx_exercise_analytics_date ON exercise_analytics(date);

-- Row Level Security Policies
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_analytics ENABLE ROW LEVEL SECURITY;

-- Exercises table is public (all coaches can access)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view exercises" ON exercises FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert exercises" ON exercises FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Workout Templates
CREATE POLICY "Coaches can manage their own workout templates" ON workout_templates
    FOR ALL USING (
        auth.uid() = coach_id OR 
        (is_public = true AND auth.uid() IS NOT NULL)
    );

-- Workout Exercises
CREATE POLICY "Coaches can manage workout exercises through templates" ON workout_exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workout_templates 
            WHERE id = workout_exercises.workout_template_id 
            AND (coach_id = auth.uid() OR is_public = true)
        )
    );

-- Client Workouts
CREATE POLICY "Coaches can manage their clients' workouts" ON client_workouts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM client_profiles 
            WHERE id = client_workouts.client_id 
            AND coach_id = auth.uid()
        ) OR
        client_id = auth.uid()
    );

-- Exercise Logs
CREATE POLICY "Coaches and clients can manage exercise logs" ON exercise_logs
    FOR ALL USING (
        client_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM client_profiles 
            WHERE id = exercise_logs.client_id 
            AND coach_id = auth.uid()
        )
    );

-- Workout Programs
CREATE POLICY "Coaches can manage their programs" ON workout_programs
    FOR ALL USING (
        auth.uid() = coach_id OR 
        (is_public = true AND auth.uid() IS NOT NULL)
    );

-- Program Weeks
CREATE POLICY "Program weeks access through programs" ON program_weeks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workout_programs 
            WHERE id = program_weeks.workout_program_id 
            AND (coach_id = auth.uid() OR is_public = true)
        )
    );

-- Program Sessions
CREATE POLICY "Program sessions access through weeks" ON program_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM program_weeks pw
            JOIN workout_programs wp ON pw.workout_program_id = wp.id
            WHERE pw.id = program_sessions.program_week_id 
            AND (wp.coach_id = auth.uid() OR wp.is_public = true)
        )
    );

-- Client Programs
CREATE POLICY "Client programs access" ON client_programs
    FOR ALL USING (
        client_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM client_profiles 
            WHERE id = client_programs.client_id 
            AND coach_id = auth.uid()
        )
    );

-- Exercise Analytics
CREATE POLICY "Exercise analytics access" ON exercise_analytics
    FOR ALL USING (
        client_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM client_profiles 
            WHERE id = exercise_analytics.client_id 
            AND coach_id = auth.uid()
        )
    );

-- Functions for workout analytics
CREATE OR REPLACE FUNCTION calculate_one_rep_max(weight DECIMAL, reps INTEGER)
RETURNS DECIMAL AS $$
BEGIN
    -- Epley formula: 1RM = weight * (1 + reps/30)
    RETURN weight * (1 + reps::decimal / 30);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_workout_volume(client_workout_id UUID)
RETURNS TABLE (
    total_volume DECIMAL,
    total_sets INTEGER,
    total_reps INTEGER,
    exercises_completed INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(COALESCE(el.reps_completed, 0) * COALESCE(el.weight_used, 0)), 0) as total_volume,
        COUNT(*)::INTEGER as total_sets,
        COALESCE(SUM(el.reps_completed), 0)::INTEGER as total_reps,
        COUNT(DISTINCT el.exercise_id)::INTEGER as exercises_completed
    FROM exercise_logs el
    WHERE el.client_workout_id = $1;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics after exercise logs
CREATE OR REPLACE FUNCTION update_exercise_analytics()
RETURNS TRIGGER AS $$
DECLARE
    analytics_date DATE;
BEGIN
    analytics_date := DATE(NEW.completed_at);
    
    INSERT INTO exercise_analytics (
        client_id,
        exercise_id,
        date,
        total_volume,
        max_weight,
        total_reps,
        total_sets,
        one_rep_max_estimate
    )
    SELECT 
        NEW.client_id,
        NEW.exercise_id,
        analytics_date,
        SUM(COALESCE(reps_completed, 0) * COALESCE(weight_used, 0)),
        MAX(weight_used),
        SUM(reps_completed),
        COUNT(*),
        MAX(calculate_one_rep_max(weight_used, reps_completed))
    FROM exercise_logs 
    WHERE client_id = NEW.client_id 
        AND exercise_id = NEW.exercise_id 
        AND DATE(completed_at) = analytics_date
    GROUP BY client_id, exercise_id
    ON CONFLICT (client_id, exercise_id, date) 
    DO UPDATE SET
        total_volume = EXCLUDED.total_volume,
        max_weight = EXCLUDED.max_weight,
        total_reps = EXCLUDED.total_reps,
        total_sets = EXCLUDED.total_sets,
        one_rep_max_estimate = EXCLUDED.one_rep_max_estimate;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_exercise_analytics
    AFTER INSERT OR UPDATE ON exercise_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_exercise_analytics();