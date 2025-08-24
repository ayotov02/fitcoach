'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, Filter, Star, TrendingUp, ShoppingCart, Heart,
  Grid3X3, List, SlidersHorizontal, MapPin, Clock, Users,
  Award, Zap, BookOpen, Dumbbell, ChefHat, Brain,
  Play, Download, MessageSquare, ArrowRight, Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { 
  MarketplaceProduct, 
  ProductCategory, 
  ProductFilters, 
  ProductSortOptions,
  MarketplaceSearchResult,
  CoachProfile
} from '@/lib/types/marketplace'

interface MarketplaceHubProps {
  userId: string
  userRole: 'coach' | 'client' | 'admin'
  className?: string
}

export function MarketplaceHub({ 
  userId, 
  userRole,
  className 
}: MarketplaceHubProps) {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<MarketplaceProduct[]>([])
  const [topCoaches, setTopCoaches] = useState<CoachProfile[]>([])
  const [searchResults, setSearchResults] = useState<MarketplaceSearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [sortBy, setSortBy] = useState<ProductSortOptions>({ field: 'created_at', direction: 'desc' })
  const [filters, setFilters] = useState<ProductFilters>({})

  // Categories with icons
  const categories = [
    { id: 'all' as const, name: 'All Categories', icon: Grid3X3, count: 0 },
    { id: 'workout_programs' as const, name: 'Workout Programs', icon: Dumbbell, count: 0 },
    { id: 'nutrition_plans' as const, name: 'Nutrition Plans', icon: ChefHat, count: 0 },
    { id: 'coaching_services' as const, name: 'Coaching Services', icon: Users, count: 0 },
    { id: 'educational_content' as const, name: 'Educational Content', icon: BookOpen, count: 0 },
    { id: 'assessments' as const, name: 'Assessments', icon: Brain, count: 0 },
    { id: 'subscriptions' as const, name: 'Subscriptions', icon: Zap, count: 0 },
    { id: 'consultations' as const, name: 'Consultations', icon: MessageSquare, count: 0 },
    { id: 'group_programs' as const, name: 'Group Programs', icon: Users, count: 0 },
  ]

  useEffect(() => {
    loadMarketplaceData()
  }, [searchTerm, selectedCategory, sortBy, filters])

  const loadMarketplaceData = async () => {
    setIsLoading(true)
    try {
      // Load featured products
      const featuredResponse = await fetch('/api/marketplace/products?featured=true&limit=6')
      const featuredData = await featuredResponse.json()
      setFeaturedProducts(featuredData.products || [])

      // Load top coaches
      const coachesResponse = await fetch('/api/marketplace/coaches/featured?limit=6')
      const coachesData = await coachesResponse.json()
      setTopCoaches(coachesData.coaches || [])

      // Load products based on current filters
      await searchProducts()
      
    } catch (error) {
      console.error('Failed to load marketplace data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchProducts = async () => {
    try {
      const searchParams = new URLSearchParams()
      
      if (searchTerm) searchParams.set('search', searchTerm)
      if (selectedCategory !== 'all') searchParams.set('category', selectedCategory)
      searchParams.set('sort_field', sortBy.field)
      searchParams.set('sort_direction', sortBy.direction)
      searchParams.set('limit', '12')
      
      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value))
        }
      })

      const response = await fetch(`/api/marketplace/search?${searchParams}`)
      const data = await response.json()
      setSearchResults(data)
      setProducts(data.products || [])
    } catch (error) {
      console.error('Failed to search products:', error)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleCategorySelect = (category: ProductCategory | 'all') => {
    setSelectedCategory(category)
  }

  const handleAddToCart = async (productId: string, variantId?: string) => {
    try {
      await fetch('/api/marketplace/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          variant_id: variantId,
          quantity: 1
        })
      })
      // Show success notification
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const getCategoryIcon = (category: ProductCategory) => {
    const categoryData = categories.find(c => c.id === category)
    return categoryData?.icon || BookOpen
  }

  const formatPrice = (price: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(price)
  }

  const renderProductCard = (product: MarketplaceProduct, size: 'small' | 'medium' | 'large' = 'medium') => {
    const Icon = getCategoryIcon(product.category)
    
    return (
      <Card key={product.id} className={cn(
        "group hover:shadow-lg transition-all duration-300 cursor-pointer",
        size === 'small' && "h-64",
        size === 'medium' && "h-80",
        size === 'large' && "h-96"
      )}>
        <div className="relative">
          {product.cover_image_url ? (
            <img 
              src={product.cover_image_url} 
              alt={product.name}
              className={cn(
                "w-full object-cover rounded-t-lg",
                size === 'small' && "h-32",
                size === 'medium' && "h-40",
                size === 'large' && "h-48"
              )}
            />
          ) : (
            <div className={cn(
              "w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center rounded-t-lg",
              size === 'small' && "h-32",
              size === 'medium' && "h-40",
              size === 'large' && "h-48"
            )}>
              <Icon className="h-12 w-12 text-blue-600" />
            </div>
          )}
          
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
              Featured
            </Badge>
          )}
          
          {product.is_subscription && (
            <Badge variant="outline" className="absolute top-2 right-2 bg-white">
              Subscription
            </Badge>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              // Add to wishlist
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.name}</h3>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {product.short_description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{product.average_rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">
                ({product.review_count})
              </span>
            </div>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {product.purchase_count} sold
            </span>
          </div>
          
          {product.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs mr-1 mb-2">
              {tag}
            </Badge>
          ))}
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col">
              <span className="font-bold text-lg">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.is_subscription && (
                <span className="text-xs text-muted-foreground">
                  /{product.billing_interval}
                </span>
              )}
            </div>
            
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleAddToCart(product.id)
              }}
              className="shrink-0"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCoachCard = (coach: CoachProfile) => {
    return (
      <Card key={coach.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <img
                src={coach.avatar_url || '/default-avatar.png'}
                alt={coach.full_name}
                className="w-16 h-16 rounded-full object-cover"
              />
              {coach.identity_verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                  <Award className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{coach.full_name}</h3>
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {coach.marketplace_rating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({coach.marketplace_reviews_count} reviews)
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {coach.specializations.slice(0, 2).join(', ')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {coach.total_products}
              </div>
              <div className="text-xs text-muted-foreground">Products</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {coach.total_sales}
              </div>
              <div className="text-xs text-muted-foreground">Sales</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                ${Math.round(coach.total_earnings).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Earned</div>
            </div>
          </div>
          
          <Button className="w-full" variant="outline">
            View Store <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white overflow-hidden">
        <div className="relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold mb-4">
              Discover Premium Fitness Content
            </h1>
            <p className="text-xl mb-6 opacity-90">
              Access exclusive workout programs, nutrition plans, and expert coaching from certified professionals
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for programs, coaches, or content..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg bg-white text-gray-900 border-0"
              />
              <Button 
                size="lg" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => searchProducts()}
              >
                Search
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32" />
      </section>

      {/* Category Navigation */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Browse Categories</h2>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            All Categories
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.slice(1).map((category) => {
            const Icon = category.icon
            return (
              <Card
                key={category.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  selectedCategory === category.id && "ring-2 ring-blue-500 bg-blue-50"
                )}
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-6 text-center">
                  <Icon className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-medium text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {category.count} products
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Button variant="outline">View All</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.slice(0, 6).map(product => renderProductCard(product, 'medium'))}
        </div>
      </section>

      {/* Top Coaches */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Top Coaches</h2>
          <Button variant="outline">View All Coaches</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topCoaches.slice(0, 6).map(coach => renderCoachCard(coach))}
        </div>
      </section>

      {/* Product Grid with Filters */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {selectedCategory === 'all' ? 'All Products' : 
             categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            
            <Select
              value={`${sortBy.field}_${sortBy.direction}`}
              onValueChange={(value) => {
                const [field, direction] = value.split('_')
                setSortBy({ 
                  field: field as ProductSortOptions['field'], 
                  direction: direction as 'asc' | 'desc' 
                })
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at_desc">Newest First</SelectItem>
                <SelectItem value="created_at_asc">Oldest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating_desc">Highest Rated</SelectItem>
                <SelectItem value="popularity_desc">Most Popular</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="h-80 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          )}>
            {products.map(product => renderProductCard(product, 'medium'))}
          </div>
        )}

        {products.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
              setFilters({})
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </section>

      {/* Quick Actions for Coaches */}
      {userRole === 'coach' && (
        <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Selling?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Create and sell your fitness programs, nutrition plans, and coaching services
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Product
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Users className="h-5 w-5" />
                View My Store
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}