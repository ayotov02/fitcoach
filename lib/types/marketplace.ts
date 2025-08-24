// =============================================
// MARKETPLACE TYPES AND INTERFACES
// Comprehensive type definitions for marketplace system
// =============================================

import { Stripe } from 'stripe'

// =============================================
// CORE PRODUCT TYPES
// =============================================

export type ProductType = 
  | 'digital_program' 
  | 'meal_plan' 
  | 'pdf_guide' 
  | 'video_course' 
  | 'assessment_tool' 
  | 'coaching_package' 
  | 'group_program' 
  | 'consultation' 
  | 'program_review' 
  | 'custom_design'
  | 'monthly_membership' 
  | 'premium_content' 
  | 'ai_upgrade'
  | 'analytics_package' 
  | 'white_label'

export type ProductCategory = 
  | 'workout_programs' 
  | 'nutrition_plans' 
  | 'coaching_services'
  | 'educational_content' 
  | 'assessments' 
  | 'subscriptions'
  | 'consultations' 
  | 'group_programs' 
  | 'premium_features'

export type ProductStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'archived'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels'

export type BillingInterval = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface MarketplaceProduct {
  id: string
  coach_id: string
  product_type: ProductType
  name: string
  slug: string
  description: string
  short_description?: string
  price: number
  currency: string
  category: ProductCategory
  subcategory?: string
  status: ProductStatus
  featured: boolean
  tags: string[]
  
  // Product specifications
  duration_weeks?: number
  difficulty_level?: DifficultyLevel
  max_participants?: number
  session_duration_minutes?: number
  
  // Media and content
  cover_image_url?: string
  gallery_images: string[]
  preview_content?: string
  sample_files: string[]
  
  // Digital product specific
  file_urls: string[]
  download_limit?: number
  access_duration_days?: number
  
  // Service specific
  booking_enabled: boolean
  requires_consultation: boolean
  custom_fields: Record<string, any>
  
  // SEO and marketing
  meta_title?: string
  meta_description?: string
  
  // Pricing and inventory
  is_subscription: boolean
  billing_interval?: BillingInterval
  trial_days: number
  inventory_tracked: boolean
  inventory_quantity?: number
  unlimited_inventory: boolean
  
  // Metrics
  view_count: number
  purchase_count: number
  average_rating: number
  review_count: number
  
  // Relationships
  coach?: CoachProfile
  variants?: ProductVariant[]
  reviews?: MarketplaceReview[]
  downloads?: DigitalDownload[]
  
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  description?: string
  price_modifier: number
  features_json: Record<string, any>
  
  // Variant specific settings
  duration_weeks?: number
  session_count?: number
  support_level?: string
  additional_resources: string[]
  
  // Inventory for variants
  inventory_quantity?: number
  is_default: boolean
  sort_order: number
  is_active: boolean
  
  created_at: string
  updated_at: string
}

// =============================================
// ORDER AND TRANSACTION TYPES
// =============================================

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded' | 'disputed'
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded'

export interface MarketplaceOrder {
  id: string
  order_number: string
  buyer_id: string
  seller_id: string
  
  // Order totals
  subtotal_amount: number
  tax_amount: number
  platform_fee_amount: number
  total_amount: number
  currency: string
  
  // Order status
  status: OrderStatus
  
  // Payment details
  payment_intent_id?: string
  payment_method?: string
  payment_status: PaymentStatus
  
  // Customer details
  billing_address?: BillingAddress
  customer_email: string
  customer_notes?: string
  
  // Order metadata
  discount_code?: string
  discount_amount: number
  tax_rate: number
  
  // Relationships
  buyer?: UserProfile
  seller?: CoachProfile
  items: OrderItem[]
  
  // Timestamps
  ordered_at: string
  completed_at?: string
  cancelled_at?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id?: string
  
  // Item details
  product_name: string
  variant_name?: string
  quantity: number
  unit_price: number
  total_price: number
  
  // Digital delivery
  download_links: string[]
  access_granted: boolean
  access_expires_at?: string
  download_count: number
  
  // Relationships
  product?: MarketplaceProduct
  variant?: ProductVariant
  
  created_at: string
}

export interface BillingAddress {
  name: string
  email: string
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

// =============================================
// PAYMENT AND EARNINGS TYPES
// =============================================

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'on_hold' | 'disputed'

export interface CoachEarnings {
  id: string
  coach_id: string
  order_id: string
  order_item_id?: string
  
  // Earnings breakdown
  gross_amount: number
  platform_fee_rate: number
  platform_fee_amount: number
  payment_processing_fee: number
  net_amount: number
  currency: string
  
  // Payout status
  payout_status: PayoutStatus
  payout_id?: string
  payout_date?: string
  
  // Tax information
  tax_year: number
  tax_reported: boolean
  
  // Relationships
  order?: MarketplaceOrder
  coach?: CoachProfile
  
  created_at: string
  updated_at: string
}

export interface PayoutBatch {
  id: string
  coach_id: string
  
  // Batch details
  total_amount: number
  currency: string
  earnings_count: number
  payout_period_start: string
  payout_period_end: string
  
  // Stripe payout details
  stripe_payout_id?: string
  payout_method: string
  status: PayoutStatus
  
  // Relationships
  coach?: CoachProfile
  earnings?: CoachEarnings[]
  
  processed_at?: string
  created_at: string
}

// =============================================
// REVIEW AND RATING TYPES
// =============================================

export interface MarketplaceReview {
  id: string
  product_id: string
  buyer_id: string
  order_id?: string
  
  // Review content
  rating: number
  review_title?: string
  review_text?: string
  
  // Review metadata
  verified_purchase: boolean
  helpful_count: number
  report_count: number
  
  // Coach response
  coach_response?: string
  coach_responded_at?: string
  
  // Moderation
  is_approved: boolean
  moderation_notes?: string
  moderated_by?: string
  moderated_at?: string
  
  // Relationships
  product?: MarketplaceProduct
  buyer?: UserProfile
  order?: MarketplaceOrder
  helpfulness_votes?: ReviewHelpfulness[]
  
  created_at: string
  updated_at: string
}

export interface ReviewHelpfulness {
  id: string
  review_id: string
  user_id: string
  is_helpful: boolean
  created_at: string
}

// =============================================
// DIGITAL CONTENT TYPES
// =============================================

export interface DigitalDownload {
  id: string
  product_id: string
  
  // File details
  file_name: string
  file_url: string
  file_size_bytes?: number
  file_type: string
  mime_type?: string
  
  // Access control
  download_limit?: number
  expiry_days?: number
  requires_completion: boolean
  
  // Organization
  category: string
  sort_order: number
  is_active: boolean
  
  // File versioning
  version: string
  changelog?: string
  
  created_at: string
  updated_at: string
}

export interface DownloadAccessLog {
  id: string
  user_id: string
  order_item_id: string
  download_id: string
  
  // Access details
  download_count: number
  last_downloaded_at?: string
  access_expires_at?: string
  
  // Tracking
  ip_address?: string
  user_agent?: string
  
  created_at: string
  updated_at: string
}

// =============================================
// SUBSCRIPTION TYPES
// =============================================

export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'unpaid' | 'incomplete' | 'trialing'

export interface MarketplaceSubscription {
  id: string
  customer_id: string
  coach_id: string
  product_id: string
  
  // Stripe subscription details
  stripe_subscription_id: string
  stripe_customer_id: string
  
  // Subscription details
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  trial_end?: string
  
  // Pricing
  amount: number
  currency: string
  billing_interval: BillingInterval
  
  // Cancellation
  cancel_at_period_end: boolean
  cancelled_at?: string
  cancellation_reason?: string
  
  // Relationships
  customer?: UserProfile
  coach?: CoachProfile
  product?: MarketplaceProduct
  
  created_at: string
  updated_at: string
}

// =============================================
// DISCOUNT AND PROMOTION TYPES
// =============================================

export type DiscountType = 'percentage' | 'fixed_amount'

export interface DiscountCode {
  id: string
  coach_id: string
  
  // Code details
  code: string
  name: string
  description?: string
  
  // Discount configuration
  discount_type: DiscountType
  discount_value: number
  max_discount_amount?: number
  minimum_order_amount: number
  
  // Usage limits
  usage_limit?: number
  usage_count: number
  per_customer_limit: number
  
  // Applicability
  applicable_products: string[]
  applicable_categories: string[]
  
  // Validity
  starts_at: string
  expires_at?: string
  is_active: boolean
  
  created_at: string
  updated_at: string
}

// =============================================
// ANALYTICS TYPES
// =============================================

export interface ProductAnalytics {
  id: string
  product_id: string
  date: string
  
  // View metrics
  page_views: number
  unique_visitors: number
  
  // Conversion metrics
  add_to_cart_count: number
  checkout_started_count: number
  purchases_count: number
  revenue_amount: number
  
  // Engagement metrics
  average_time_on_page: number
  bounce_rate: number
  
  created_at: string
}

export interface CoachAnalytics {
  id: string
  coach_id: string
  date: string
  
  // Sales metrics
  gross_revenue: number
  net_revenue: number
  orders_count: number
  products_sold: number
  
  // Customer metrics
  new_customers: number
  returning_customers: number
  total_customers: number
  
  // Product metrics
  active_products: number
  total_reviews: number
  average_rating: number
  
  // Conversion metrics
  conversion_rate: number
  average_order_value: number
  
  created_at: string
}

// =============================================
// USER PROFILE EXTENSIONS
// =============================================

export interface CoachProfile extends UserProfile {
  // Marketplace specific fields
  stripe_account_id?: string
  payout_enabled: boolean
  commission_rate: number
  total_earnings: number
  total_products: number
  total_sales: number
  marketplace_rating: number
  marketplace_reviews_count: number
  
  // Verification
  identity_verified: boolean
  background_checked: boolean
  tax_info_provided: boolean
  
  // Marketing
  storefront_banner?: string
  bio?: string
  specializations: string[]
  achievements: string[]
  social_links: Record<string, string>
  
  // Settings
  auto_accept_orders: boolean
  vacation_mode: boolean
  custom_message?: string
}

export interface UserProfile {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  role: 'coach' | 'client' | 'admin'
  created_at: string
}

// =============================================
// API REQUEST/RESPONSE TYPES
// =============================================

export interface ProductFilters {
  category?: ProductCategory
  subcategory?: string
  price_min?: number
  price_max?: number
  rating_min?: number
  difficulty_level?: DifficultyLevel
  product_type?: ProductType
  coach_id?: string
  search?: string
  tags?: string[]
  featured_only?: boolean
}

export interface ProductSortOptions {
  field: 'created_at' | 'price' | 'rating' | 'popularity' | 'name'
  direction: 'asc' | 'desc'
}

export interface MarketplaceSearchParams {
  filters?: ProductFilters
  sort?: ProductSortOptions
  page?: number
  limit?: number
}

export interface MarketplaceSearchResult {
  products: MarketplaceProduct[]
  total_count: number
  total_pages: number
  current_page: number
  filters_applied: ProductFilters
  facets: {
    categories: { name: string; count: number }[]
    price_ranges: { range: string; count: number }[]
    ratings: { rating: number; count: number }[]
    coaches: { id: string; name: string; count: number }[]
  }
}

export interface CreateProductRequest {
  product_type: ProductType
  name: string
  description: string
  short_description?: string
  price: number
  category: ProductCategory
  subcategory?: string
  tags?: string[]
  
  // Product specifications
  duration_weeks?: number
  difficulty_level?: DifficultyLevel
  max_participants?: number
  session_duration_minutes?: number
  
  // Media
  cover_image_url?: string
  gallery_images?: string[]
  
  // Digital content
  file_urls?: string[]
  download_limit?: number
  access_duration_days?: number
  
  // Subscription settings
  is_subscription?: boolean
  billing_interval?: BillingInterval
  trial_days?: number
  
  // Variants
  variants?: Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  status?: ProductStatus
}

export interface CreateOrderRequest {
  items: {
    product_id: string
    variant_id?: string
    quantity: number
  }[]
  billing_address: BillingAddress
  discount_code?: string
  customer_notes?: string
}

export interface ProcessPaymentRequest {
  order_id: string
  payment_method_id: string
  return_url?: string
}

export interface CreateReviewRequest {
  product_id: string
  rating: number
  review_title?: string
  review_text?: string
}

// =============================================
// STRIPE INTEGRATION TYPES
// =============================================

export interface StripePaymentIntent {
  id: string
  amount: number
  currency: string
  status: Stripe.PaymentIntent.Status
  client_secret: string
  metadata: Record<string, string>
}

export interface StripeConnectAccount {
  id: string
  type: string
  country: string
  email: string
  charges_enabled: boolean
  payouts_enabled: boolean
  details_submitted: boolean
  requirements: {
    currently_due: string[]
    eventually_due: string[]
    past_due: string[]
  }
}

// =============================================
// ERROR TYPES
// =============================================

export interface MarketplaceError {
  code: string
  message: string
  details?: Record<string, any>
  field?: string
}

export interface ValidationErrors {
  [field: string]: string[]
}

// =============================================
// CART AND WISHLIST TYPES
// =============================================

export interface CartItem {
  product_id: string
  variant_id?: string
  quantity: number
  added_at: string
  
  // Computed fields (populated by API)
  product?: MarketplaceProduct
  variant?: ProductVariant
  total_price?: number
}

export interface Cart {
  id: string
  user_id: string
  items: CartItem[]
  subtotal: number
  tax_amount: number
  total: number
  currency: string
  discount_code?: string
  discount_amount: number
  updated_at: string
}

export interface WishlistItem {
  product_id: string
  added_at: string
  product?: MarketplaceProduct
}

// =============================================
// NOTIFICATION TYPES
// =============================================

export type NotificationType = 
  | 'order_received' 
  | 'order_completed' 
  | 'payment_received'
  | 'payout_processed' 
  | 'review_received' 
  | 'product_approved'
  | 'subscription_renewed' 
  | 'subscription_cancelled'

export interface MarketplaceNotification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  created_at: string
}

// =============================================
// WEBHOOK TYPES
// =============================================

export interface WebhookPayload {
  id: string
  object: string
  api_version: string
  created: number
  data: {
    object: any
    previous_attributes?: any
  }
  livemode: boolean
  pending_webhooks: number
  request: {
    id: string
    idempotency_key?: string
  }
  type: string
}

// =============================================
// DASHBOARD AND ADMIN TYPES
// =============================================

export interface MarketplaceDashboardStats {
  total_products: number
  active_products: number
  total_orders: number
  total_revenue: number
  pending_payouts: number
  average_rating: number
  total_reviews: number
  conversion_rate: number
}

export interface AdminMarketplaceStats {
  total_coaches: number
  total_products: number
  total_orders: number
  total_revenue: number
  platform_fees_collected: number
  active_subscriptions: number
  pending_reviews: number
  payout_requests: number
}