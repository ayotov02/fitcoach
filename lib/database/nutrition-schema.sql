-- Comprehensive Nutrition Tracking Schema

-- Foods Database Table
CREATE TABLE foods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT,
    barcode TEXT UNIQUE,
    category TEXT NOT NULL CHECK (category IN (
        'fruits', 'vegetables', 'grains', 'protein', 'dairy', 'fats', 'beverages', 
        'snacks', 'condiments', 'supplements', 'prepared_foods', 'restaurant'
    )),
    serving_size DECIMAL(8,2) NOT NULL,
    serving_unit TEXT NOT NULL DEFAULT 'g',
    calories_per_serving DECIMAL(8,2) NOT NULL,
    protein_g DECIMAL(8,2) NOT NULL DEFAULT 0,
    carbs_g DECIMAL(8,2) NOT NULL DEFAULT 0,
    fat_g DECIMAL(8,2) NOT NULL DEFAULT 0,
    fiber_g DECIMAL(8,2) DEFAULT 0,
    sugar_g DECIMAL(8,2) DEFAULT 0,
    sodium_mg DECIMAL(8,2) DEFAULT 0,
    cholesterol_mg DECIMAL(8,2) DEFAULT 0,
    saturated_fat_g DECIMAL(8,2) DEFAULT 0,
    trans_fat_g DECIMAL(8,2) DEFAULT 0,
    vitamin_a_mcg DECIMAL(8,2) DEFAULT 0,
    vitamin_c_mg DECIMAL(8,2) DEFAULT 0,
    vitamin_d_mcg DECIMAL(8,2) DEFAULT 0,
    calcium_mg DECIMAL(8,2) DEFAULT 0,
    iron_mg DECIMAL(8,2) DEFAULT 0,
    potassium_mg DECIMAL(8,2) DEFAULT 0,
    glycemic_index INTEGER,
    allergens TEXT[], -- ['gluten', 'dairy', 'nuts', 'soy', 'eggs', 'shellfish']
    dietary_tags TEXT[], -- ['vegan', 'vegetarian', 'keto', 'paleo', 'gluten_free']
    is_verified BOOLEAN DEFAULT false,
    verification_source TEXT, -- 'usda', 'brand', 'user', 'coach'
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Recipes Table
CREATE TABLE recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    servings INTEGER NOT NULL DEFAULT 1,
    prep_time INTEGER, -- minutes
    cook_time INTEGER, -- minutes
    total_time INTEGER GENERATED ALWAYS AS (COALESCE(prep_time, 0) + COALESCE(cook_time, 0)) STORED,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    cuisine_type TEXT,
    meal_type TEXT[] DEFAULT '{}', -- ['breakfast', 'lunch', 'dinner', 'snack']
    dietary_tags TEXT[] DEFAULT '{}',
    equipment_needed TEXT[] DEFAULT '{}',
    instructions JSONB, -- Array of step objects with text, image_url, time
    nutrition_per_serving JSONB, -- Calculated nutrition facts
    photos TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    cost_estimate DECIMAL(8,2),
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Recipe Ingredients Table
CREATE TABLE recipe_ingredients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
    quantity DECIMAL(8,2) NOT NULL,
    unit TEXT NOT NULL, -- 'g', 'ml', 'cup', 'tbsp', 'piece', etc.
    ingredient_order INTEGER NOT NULL DEFAULT 1,
    preparation_notes TEXT, -- 'diced', 'chopped', 'cooked', etc.
    is_optional BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition Goals Table
CREATE TABLE nutrition_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
    calories_target INTEGER NOT NULL,
    protein_target DECIMAL(6,2) NOT NULL, -- grams or percentage
    carb_target DECIMAL(6,2) NOT NULL,
    fat_target DECIMAL(6,2) NOT NULL,
    fiber_target DECIMAL(6,2) DEFAULT 25,
    sodium_target DECIMAL(8,2) DEFAULT 2300, -- mg
    sugar_target DECIMAL(6,2), -- grams
    water_target DECIMAL(6,2) DEFAULT 2000, -- ml
    goal_type TEXT NOT NULL CHECK (goal_type IN (
        'weight_loss', 'weight_gain', 'maintenance', 'muscle_building', 
        'athletic_performance', 'medical_restriction'
    )),
    macro_split TEXT NOT NULL DEFAULT 'balanced', -- 'balanced', 'low_carb', 'high_protein', 'keto'
    dietary_restrictions TEXT[] DEFAULT '{}',
    created_by_coach BOOLEAN DEFAULT false,
    coach_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal Plans Table
CREATE TABLE meal_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    plan_type TEXT NOT NULL CHECK (plan_type IN (
        'weight_loss', 'weight_gain', 'muscle_building', 'maintenance',
        'keto', 'paleo', 'vegan', 'mediterranean', 'diabetic', 'custom'
    )),
    start_date DATE NOT NULL,
    end_date DATE,
    calories_target INTEGER NOT NULL,
    macro_targets JSONB NOT NULL, -- {protein: 150, carbs: 200, fat: 80}
    dietary_restrictions TEXT[] DEFAULT '{}',
    budget_per_day DECIMAL(8,2),
    prep_time_limit INTEGER, -- max minutes per day
    shopping_list JSONB DEFAULT '{}',
    meal_schedule JSONB DEFAULT '{}', -- Preferred meal times
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
    compliance_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Meals Table (Planned meals in meal plans)
CREATE TABLE daily_meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN (
        'breakfast', 'lunch', 'dinner', 'snack_1', 'snack_2', 'snack_3'
    )),
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    custom_meal_name TEXT,
    target_calories INTEGER,
    target_protein DECIMAL(6,2),
    target_carbs DECIMAL(6,2),
    target_fat DECIMAL(6,2),
    prep_time INTEGER,
    cook_time INTEGER,
    ingredients JSONB, -- For custom meals without recipes
    instructions TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food Logs Table (Actual food consumed by clients)
CREATE TABLE food_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT NOT NULL CHECK (meal_type IN (
        'breakfast', 'lunch', 'dinner', 'snack_1', 'snack_2', 'snack_3'
    )),
    food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    food_name TEXT NOT NULL, -- In case food/recipe is deleted
    quantity DECIMAL(8,2) NOT NULL,
    unit TEXT NOT NULL,
    calories DECIMAL(8,2) NOT NULL,
    protein_g DECIMAL(8,2) NOT NULL DEFAULT 0,
    carbs_g DECIMAL(8,2) NOT NULL DEFAULT 0,
    fat_g DECIMAL(8,2) NOT NULL DEFAULT 0,
    fiber_g DECIMAL(8,2) DEFAULT 0,
    sugar_g DECIMAL(8,2) DEFAULT 0,
    sodium_mg DECIMAL(8,2) DEFAULT 0,
    logged_method TEXT DEFAULT 'manual' CHECK (logged_method IN (
        'manual', 'barcode', 'photo_ai', 'voice', 'recipe', 'meal_copy'
    )),
    photo_url TEXT,
    confidence_score DECIMAL(3,2), -- For AI-assisted logging
    verified_by_client BOOLEAN DEFAULT true,
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
    daily_meal_id UUID REFERENCES daily_meals(id) ON DELETE SET NULL,
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition Analytics Table
CREATE TABLE nutrition_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_calories DECIMAL(8,2) NOT NULL DEFAULT 0,
    total_protein DECIMAL(8,2) NOT NULL DEFAULT 0,
    total_carbs DECIMAL(8,2) NOT NULL DEFAULT 0,
    total_fat DECIMAL(8,2) NOT NULL DEFAULT 0,
    total_fiber DECIMAL(8,2) NOT NULL DEFAULT 0,
    total_sugar DECIMAL(8,2) NOT NULL DEFAULT 0,
    total_sodium DECIMAL(8,2) NOT NULL DEFAULT 0,
    water_intake DECIMAL(8,2) DEFAULT 0,
    meals_logged INTEGER DEFAULT 0,
    goal_adherence_score DECIMAL(5,2) DEFAULT 0,
    calorie_deficit DECIMAL(8,2) DEFAULT 0, -- Negative for surplus
    macro_split JSONB, -- Actual percentages
    meal_timing JSONB, -- When meals were consumed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(client_id, date)
);

-- Food Favorites Table
CREATE TABLE food_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    favorite_type TEXT NOT NULL CHECK (favorite_type IN ('food', 'recipe')),
    last_consumed DATE,
    consumption_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(client_id, food_id, recipe_id, favorite_type)
);

-- Meal Templates Table
CREATE TABLE meal_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    template_type TEXT NOT NULL CHECK (template_type IN (
        'weight_loss_1200', 'weight_loss_1500', 'weight_loss_1800',
        'muscle_building_2000', 'muscle_building_2500', 'muscle_building_3000',
        'keto', 'paleo', 'vegan', 'vegetarian', 'mediterranean',
        'quick_prep', 'budget_friendly', 'athletic_performance'
    )),
    target_calories INTEGER NOT NULL,
    macro_targets JSONB NOT NULL,
    meal_structure JSONB NOT NULL, -- Defines meals and their calorie distribution
    duration_days INTEGER NOT NULL DEFAULT 7,
    dietary_restrictions TEXT[] DEFAULT '{}',
    prep_time_estimate INTEGER, -- Total prep time per week
    budget_estimate DECIMAL(8,2),
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Water Intake Logs
CREATE TABLE water_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_ml DECIMAL(8,2) NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX(client_id, date)
);

-- Supplement Logs
CREATE TABLE supplement_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
    supplement_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    unit TEXT, -- 'mg', 'g', 'tablets', 'scoops'
    taken_at TIMESTAMP WITH TIME ZONE NOT NULL,
    meal_timing TEXT CHECK (meal_timing IN ('before_meal', 'with_meal', 'after_meal', 'empty_stomach')),
    purpose TEXT, -- 'protein', 'vitamins', 'pre_workout', 'recovery'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_foods_barcode ON foods(barcode);
CREATE INDEX idx_foods_dietary_tags ON foods USING GIN(dietary_tags);
CREATE INDEX idx_recipes_coach ON recipes(coach_id);
CREATE INDEX idx_recipes_dietary_tags ON recipes USING GIN(dietary_tags);
CREATE INDEX idx_recipes_meal_type ON recipes USING GIN(meal_type);
CREATE INDEX idx_nutrition_goals_client ON nutrition_goals(client_id);
CREATE INDEX idx_nutrition_goals_active ON nutrition_goals(client_id) WHERE is_active = true;
CREATE INDEX idx_meal_plans_client ON meal_plans(client_id);
CREATE INDEX idx_meal_plans_coach ON meal_plans(coach_id);
CREATE INDEX idx_meal_plans_dates ON meal_plans(start_date, end_date);
CREATE INDEX idx_daily_meals_plan_date ON daily_meals(meal_plan_id, date);
CREATE INDEX idx_food_logs_client_date ON food_logs(client_id, date);
CREATE INDEX idx_food_logs_meal_type ON food_logs(client_id, date, meal_type);
CREATE INDEX idx_nutrition_analytics_client_date ON nutrition_analytics(client_id, date);
CREATE INDEX idx_food_favorites_client ON food_favorites(client_id);

-- Row Level Security Policies
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_logs ENABLE ROW LEVEL SECURITY;

-- Foods are public or created by authenticated users
CREATE POLICY "Foods are viewable by everyone" ON foods FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create foods" ON foods FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own foods" ON foods FOR UPDATE USING (created_by = auth.uid());

-- Recipes belong to coaches or are public
CREATE POLICY "Recipes access" ON recipes FOR ALL USING (
    coach_id = auth.uid() OR 
    is_public = true OR
    EXISTS (
        SELECT 1 FROM client_profiles 
        WHERE id = auth.uid() AND coach_id IN (
            SELECT id FROM auth.users WHERE id = recipes.coach_id
        )
    )
);

-- Recipe ingredients follow recipe access
CREATE POLICY "Recipe ingredients access" ON recipe_ingredients FOR ALL USING (
    EXISTS (
        SELECT 1 FROM recipes 
        WHERE id = recipe_ingredients.recipe_id 
        AND (coach_id = auth.uid() OR is_public = true)
    )
);

-- Nutrition goals for clients and their coaches
CREATE POLICY "Nutrition goals access" ON nutrition_goals FOR ALL USING (
    client_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM client_profiles 
        WHERE id = nutrition_goals.client_id 
        AND coach_id = auth.uid()
    )
);

-- Meal plans for clients and coaches
CREATE POLICY "Meal plans access" ON meal_plans FOR ALL USING (
    client_id = auth.uid() OR
    coach_id = auth.uid()
);

-- Daily meals follow meal plan access
CREATE POLICY "Daily meals access" ON daily_meals FOR ALL USING (
    EXISTS (
        SELECT 1 FROM meal_plans 
        WHERE id = daily_meals.meal_plan_id 
        AND (client_id = auth.uid() OR coach_id = auth.uid())
    )
);

-- Food logs for clients and their coaches
CREATE POLICY "Food logs access" ON food_logs FOR ALL USING (
    client_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM client_profiles 
        WHERE id = food_logs.client_id 
        AND coach_id = auth.uid()
    )
);

-- Nutrition analytics follow same pattern
CREATE POLICY "Nutrition analytics access" ON nutrition_analytics FOR ALL USING (
    client_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM client_profiles 
        WHERE id = nutrition_analytics.client_id 
        AND coach_id = auth.uid()
    )
);

-- Food favorites for clients only
CREATE POLICY "Food favorites access" ON food_favorites FOR ALL USING (client_id = auth.uid());

-- Meal templates for coaches and public viewing
CREATE POLICY "Meal templates access" ON meal_templates FOR ALL USING (
    coach_id = auth.uid() OR 
    is_public = true
);

-- Water logs for clients and coaches
CREATE POLICY "Water logs access" ON water_logs FOR ALL USING (
    client_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM client_profiles 
        WHERE id = water_logs.client_id 
        AND coach_id = auth.uid()
    )
);

-- Supplement logs for clients and coaches
CREATE POLICY "Supplement logs access" ON supplement_logs FOR ALL USING (
    client_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM client_profiles 
        WHERE id = supplement_logs.client_id 
        AND coach_id = auth.uid()
    )
);

-- Functions for nutrition calculations
CREATE OR REPLACE FUNCTION calculate_recipe_nutrition(recipe_id_param UUID)
RETURNS JSONB AS $$
DECLARE
    nutrition JSONB := '{}';
    ingredient_nutrition RECORD;
    total_calories DECIMAL := 0;
    total_protein DECIMAL := 0;
    total_carbs DECIMAL := 0;
    total_fat DECIMAL := 0;
    total_fiber DECIMAL := 0;
    total_sugar DECIMAL := 0;
    total_sodium DECIMAL := 0;
    recipe_servings INTEGER;
BEGIN
    -- Get recipe servings
    SELECT servings INTO recipe_servings FROM recipes WHERE id = recipe_id_param;
    
    -- Calculate nutrition from ingredients
    FOR ingredient_nutrition IN
        SELECT 
            ri.quantity,
            ri.unit,
            f.serving_size,
            f.serving_unit,
            f.calories_per_serving,
            f.protein_g,
            f.carbs_g,
            f.fat_g,
            f.fiber_g,
            f.sugar_g,
            f.sodium_mg
        FROM recipe_ingredients ri
        JOIN foods f ON ri.food_id = f.id
        WHERE ri.recipe_id = recipe_id_param
    LOOP
        -- Calculate actual nutritional values based on quantity
        -- This is simplified - in practice you'd need unit conversion
        total_calories := total_calories + (ingredient_nutrition.calories_per_serving * ingredient_nutrition.quantity / ingredient_nutrition.serving_size);
        total_protein := total_protein + (ingredient_nutrition.protein_g * ingredient_nutrition.quantity / ingredient_nutrition.serving_size);
        total_carbs := total_carbs + (ingredient_nutrition.carbs_g * ingredient_nutrition.quantity / ingredient_nutrition.serving_size);
        total_fat := total_fat + (ingredient_nutrition.fat_g * ingredient_nutrition.quantity / ingredient_nutrition.serving_size);
        total_fiber := total_fiber + (ingredient_nutrition.fiber_g * ingredient_nutrition.quantity / ingredient_nutrition.serving_size);
        total_sugar := total_sugar + (ingredient_nutrition.sugar_g * ingredient_nutrition.quantity / ingredient_nutrition.serving_size);
        total_sodium := total_sodium + (ingredient_nutrition.sodium_mg * ingredient_nutrition.quantity / ingredient_nutrition.serving_size);
    END LOOP;
    
    -- Calculate per serving
    nutrition := jsonb_build_object(
        'calories', ROUND(total_calories / recipe_servings, 2),
        'protein', ROUND(total_protein / recipe_servings, 2),
        'carbs', ROUND(total_carbs / recipe_servings, 2),
        'fat', ROUND(total_fat / recipe_servings, 2),
        'fiber', ROUND(total_fiber / recipe_servings, 2),
        'sugar', ROUND(total_sugar / recipe_servings, 2),
        'sodium', ROUND(total_sodium / recipe_servings, 2)
    );
    
    RETURN nutrition;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update recipe nutrition when ingredients change
CREATE OR REPLACE FUNCTION update_recipe_nutrition()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE recipes 
    SET nutrition_per_serving = calculate_recipe_nutrition(
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.recipe_id
            ELSE NEW.recipe_id
        END
    ),
    updated_at = NOW()
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.recipe_id
        ELSE NEW.recipe_id
    END;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_recipe_nutrition
    AFTER INSERT OR UPDATE OR DELETE ON recipe_ingredients
    FOR EACH ROW
    EXECUTE FUNCTION update_recipe_nutrition();

-- Function to update daily nutrition analytics
CREATE OR REPLACE FUNCTION update_nutrition_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO nutrition_analytics (
        client_id,
        date,
        total_calories,
        total_protein,
        total_carbs,
        total_fat,
        total_fiber,
        total_sugar,
        total_sodium,
        meals_logged
    )
    SELECT 
        NEW.client_id,
        NEW.date,
        SUM(calories),
        SUM(protein_g),
        SUM(carbs_g),
        SUM(fat_g),
        SUM(fiber_g),
        SUM(sugar_g),
        SUM(sodium_mg),
        COUNT(DISTINCT meal_type)
    FROM food_logs
    WHERE client_id = NEW.client_id 
        AND date = NEW.date
    GROUP BY client_id, date
    ON CONFLICT (client_id, date) 
    DO UPDATE SET
        total_calories = EXCLUDED.total_calories,
        total_protein = EXCLUDED.total_protein,
        total_carbs = EXCLUDED.total_carbs,
        total_fat = EXCLUDED.total_fat,
        total_fiber = EXCLUDED.total_fiber,
        total_sugar = EXCLUDED.total_sugar,
        total_sodium = EXCLUDED.total_sodium,
        meals_logged = EXCLUDED.meals_logged;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_nutrition_analytics
    AFTER INSERT OR UPDATE OR DELETE ON food_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_nutrition_analytics();