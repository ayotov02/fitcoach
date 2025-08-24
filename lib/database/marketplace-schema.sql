-- =============================================
-- MARKETPLACE DATABASE SCHEMA
-- Complete marketplace and payment system
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- CORE MARKETPLACE TABLES
-- =============================================

-- Marketplace Products (Digital & Services)
CREATE TABLE marketplace_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_type VARCHAR(50) NOT NULL CHECK (product_type IN (
    'digital_program', 'meal_plan', 'pdf_guide', 'video_course', 
    'assessment_tool', 'coaching_package', 'group_program', 
    'consultation', 'program_review', 'custom_design',
    'monthly_membership', 'premium_content', 'ai_upgrade',
    'analytics_package', 'white_label'
  )),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(250) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description VARCHAR(500),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  category VARCHAR(100) NOT NULL CHECK (category IN (
    'workout_programs', 'nutrition_plans', 'coaching_services',
    'educational_content', 'assessments', 'subscriptions',
    'consultations', 'group_programs', 'premium_features'
  )),
  subcategory VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_review', 'active', 'paused', 'archived'
  )),
  featured BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Product specifications
  duration_weeks INTEGER, -- For programs
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'all_levels')),
  max_participants INTEGER, -- For group programs
  session_duration_minutes INTEGER, -- For consultations
  
  -- Media and content
  cover_image_url TEXT,
  gallery_images TEXT[] DEFAULT ARRAY[]::TEXT[],
  preview_content TEXT,
  sample_files TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Digital product specific
  file_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  download_limit INTEGER DEFAULT NULL, -- NULL = unlimited
  access_duration_days INTEGER DEFAULT NULL, -- NULL = lifetime access
  
  -- Service specific
  booking_enabled BOOLEAN DEFAULT FALSE,
  requires_consultation BOOLEAN DEFAULT FALSE,
  custom_fields JSONB DEFAULT '{}',
  
  -- SEO and marketing
  meta_title VARCHAR(200),
  meta_description VARCHAR(500),
  
  -- Pricing and inventory
  is_subscription BOOLEAN DEFAULT FALSE,
  billing_interval VARCHAR(20) CHECK (billing_interval IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  trial_days INTEGER DEFAULT 0,
  inventory_tracked BOOLEAN DEFAULT FALSE,
  inventory_quantity INTEGER,
  unlimited_inventory BOOLEAN DEFAULT TRUE,
  
  -- Metrics
  view_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Variants (pricing tiers, different options)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_modifier DECIMAL(10,2) NOT NULL DEFAULT 0, -- Added to base price
  features_json JSONB NOT NULL DEFAULT '{}',
  
  -- Variant specific settings
  duration_weeks INTEGER,
  session_count INTEGER,
  support_level VARCHAR(50),
  additional_resources TEXT[],
  
  -- Inventory for variants
  inventory_quantity INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ORDER AND TRANSACTION TABLES
-- =============================================

-- Marketplace Orders
CREATE TABLE marketplace_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Order totals
  subtotal_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  platform_fee_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  
  -- Order status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'cancelled', 'refunded', 'disputed'
  )),
  
  -- Payment details
  payment_intent_id VARCHAR(200), -- Stripe payment intent
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'
  )),
  
  -- Customer details
  billing_address JSONB,
  customer_email VARCHAR(255),
  customer_notes TEXT,
  
  -- Order metadata
  discount_code VARCHAR(50),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  
  -- Timestamps
  ordered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES marketplace_products(id),
  variant_id UUID REFERENCES product_variants(id),
  
  -- Item details
  product_name VARCHAR(200) NOT NULL, -- Snapshot at purchase time
  variant_name VARCHAR(100),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  -- Digital delivery
  download_links TEXT[] DEFAULT ARRAY[]::TEXT[],
  access_granted BOOLEAN DEFAULT FALSE,
  access_expires_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COACH EARNINGS AND PAYOUTS
-- =============================================

-- Coach Earnings Tracking
CREATE TABLE coach_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID NOT NULL REFERENCES marketplace_orders(id),
  order_item_id UUID REFERENCES order_items(id),
  
  -- Earnings breakdown
  gross_amount DECIMAL(10,2) NOT NULL,
  platform_fee_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.10 for 10%
  platform_fee_amount DECIMAL(10,2) NOT NULL,
  payment_processing_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  
  -- Payout status
  payout_status VARCHAR(20) DEFAULT 'pending' CHECK (payout_status IN (
    'pending', 'processing', 'paid', 'on_hold', 'disputed'
  )),
  payout_id VARCHAR(100), -- Stripe payout ID
  payout_date TIMESTAMP WITH TIME ZONE,
  
  -- Tax information
  tax_year INTEGER,
  tax_reported BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payout Batches
CREATE TABLE payout_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Batch details
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  earnings_count INTEGER NOT NULL,
  payout_period_start DATE NOT NULL,
  payout_period_end DATE NOT NULL,
  
  -- Stripe payout details
  stripe_payout_id VARCHAR(100),
  payout_method VARCHAR(50) DEFAULT 'bank_transfer',
  
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'paid', 'failed', 'cancelled'
  )),
  
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- REVIEWS AND RATINGS
-- =============================================

-- Marketplace Reviews
CREATE TABLE marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID REFERENCES marketplace_orders(id),
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR(200),
  review_text TEXT,
  
  -- Review metadata
  verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  
  -- Coach response
  coach_response TEXT,
  coach_responded_at TIMESTAMP WITH TIME ZONE,
  
  -- Moderation
  is_approved BOOLEAN DEFAULT TRUE,
  moderation_notes TEXT,
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one review per buyer per product
  UNIQUE(product_id, buyer_id)
);

-- Review Helpfulness Votes
CREATE TABLE review_helpfulness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES marketplace_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  is_helpful BOOLEAN NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one vote per user per review
  UNIQUE(review_id, user_id)
);

-- =============================================
-- DIGITAL CONTENT MANAGEMENT
-- =============================================

-- Digital Downloads
CREATE TABLE digital_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  
  -- File details
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL, -- S3 or similar storage URL
  file_size_bytes BIGINT,
  file_type VARCHAR(50), -- pdf, zip, mp4, etc.
  mime_type VARCHAR(100),
  
  -- Access control
  download_limit INTEGER DEFAULT NULL, -- NULL = unlimited
  expiry_days INTEGER DEFAULT NULL, -- NULL = no expiry
  requires_completion BOOLEAN DEFAULT FALSE, -- For course materials
  
  -- Organization
  category VARCHAR(100), -- main_content, bonus_material, templates, etc.
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- File versioning
  version VARCHAR(20) DEFAULT '1.0',
  changelog TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Download Access Tracking
CREATE TABLE download_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  download_id UUID NOT NULL REFERENCES digital_downloads(id),
  
  -- Access details
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  access_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SUBSCRIPTION MANAGEMENT
-- =============================================

-- Subscriptions
CREATE TABLE marketplace_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  coach_id UUID NOT NULL REFERENCES auth.users(id),
  product_id UUID NOT NULL REFERENCES marketplace_products(id),
  
  -- Stripe subscription details
  stripe_subscription_id VARCHAR(200) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(200) NOT NULL,
  
  -- Subscription details
  status VARCHAR(20) NOT NULL CHECK (status IN (
    'active', 'past_due', 'cancelled', 'unpaid', 'incomplete', 'trialing'
  )),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_end TIMESTAMP WITH TIME ZONE,
  
  -- Pricing
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  billing_interval VARCHAR(20) NOT NULL,
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DISCOUNT AND PROMOTION SYSTEM
-- =============================================

-- Discount Codes
CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Code details
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Discount configuration
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  max_discount_amount DECIMAL(10,2), -- For percentage discounts
  minimum_order_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Usage limits
  usage_limit INTEGER, -- NULL = unlimited
  usage_count INTEGER DEFAULT 0,
  per_customer_limit INTEGER DEFAULT 1,
  
  -- Applicability
  applicable_products UUID[] DEFAULT ARRAY[]::UUID[], -- Empty = all products
  applicable_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Validity
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ANALYTICS AND REPORTING
-- =============================================

-- Product Analytics
CREATE TABLE product_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  
  -- Date for aggregation
  date DATE NOT NULL,
  
  -- View metrics
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  
  -- Conversion metrics
  add_to_cart_count INTEGER DEFAULT 0,
  checkout_started_count INTEGER DEFAULT 0,
  purchases_count INTEGER DEFAULT 0,
  revenue_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Engagement metrics
  average_time_on_page INTEGER DEFAULT 0, -- seconds
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint for daily aggregation
  UNIQUE(product_id, date)
);

-- Coach Performance Analytics
CREATE TABLE coach_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Date for aggregation
  date DATE NOT NULL,
  
  -- Sales metrics
  gross_revenue DECIMAL(10,2) DEFAULT 0,
  net_revenue DECIMAL(10,2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  products_sold INTEGER DEFAULT 0,
  
  -- Customer metrics
  new_customers INTEGER DEFAULT 0,
  returning_customers INTEGER DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  
  -- Product metrics
  active_products INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  
  -- Conversion metrics
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint for daily aggregation
  UNIQUE(coach_id, date)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Product indexes
CREATE INDEX idx_products_coach_id ON marketplace_products(coach_id);
CREATE INDEX idx_products_category ON marketplace_products(category);
CREATE INDEX idx_products_status ON marketplace_products(status);
CREATE INDEX idx_products_featured ON marketplace_products(featured) WHERE featured = TRUE;
CREATE INDEX idx_products_price ON marketplace_products(price);
CREATE INDEX idx_products_created_at ON marketplace_products(created_at DESC);
CREATE INDEX idx_products_rating ON marketplace_products(average_rating DESC);
CREATE INDEX idx_products_search ON marketplace_products USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX idx_products_tags ON marketplace_products USING gin(tags);

-- Order indexes
CREATE INDEX idx_orders_buyer_id ON marketplace_orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON marketplace_orders(seller_id);
CREATE INDEX idx_orders_status ON marketplace_orders(status);
CREATE INDEX idx_orders_payment_status ON marketplace_orders(payment_status);
CREATE INDEX idx_orders_created_at ON marketplace_orders(created_at DESC);

-- Review indexes
CREATE INDEX idx_reviews_product_id ON marketplace_reviews(product_id);
CREATE INDEX idx_reviews_buyer_id ON marketplace_reviews(buyer_id);
CREATE INDEX idx_reviews_rating ON marketplace_reviews(rating);
CREATE INDEX idx_reviews_verified ON marketplace_reviews(verified_purchase) WHERE verified_purchase = TRUE;

-- Earnings indexes
CREATE INDEX idx_earnings_coach_id ON coach_earnings(coach_id);
CREATE INDEX idx_earnings_payout_status ON coach_earnings(payout_status);
CREATE INDEX idx_earnings_created_at ON coach_earnings(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Public can view active products"
  ON marketplace_products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Coaches can manage their products"
  ON marketplace_products FOR ALL
  USING (auth.uid() = coach_id);

-- Orders policies
CREATE POLICY "Users can view their orders"
  ON marketplace_orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create orders"
  ON marketplace_orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Reviews policies
CREATE POLICY "Public can view approved reviews"
  ON marketplace_reviews FOR SELECT
  USING (is_approved = TRUE);

CREATE POLICY "Buyers can create reviews for purchased products"
  ON marketplace_reviews FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Earnings policies
CREATE POLICY "Coaches can view their earnings"
  ON coach_earnings FOR SELECT
  USING (auth.uid() = coach_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to update product ratings
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE marketplace_products 
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating::numeric), 2)
      FROM marketplace_reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND is_approved = TRUE
    ),
    review_count = (
      SELECT COUNT(*)
      FROM marketplace_reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND is_approved = TRUE
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product ratings
CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON marketplace_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                      UPPER(SUBSTRING(NEW.id::text, 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate order numbers
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON marketplace_orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON marketplace_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON marketplace_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON marketplace_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- This would be populated by the application
-- Sample categories, payment methods, etc.