'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  Star, Heart, ShoppingCart, Filter, Grid3X3, List, Eye,
  Clock, Users, Download, Play, BookOpen, Award, Zap,
  ChevronLeft, ChevronRight, X, SlidersHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { 
  MarketplaceProduct, 
  ProductCategory, 
  ProductFilters, 
  ProductSortOptions,
  MarketplaceSearchResult,
  DifficultyLevel,
  ProductType
} from '@/lib/types/marketplace'

interface ProductListingProps {
  products: MarketplaceProduct[]
  searchResults?: MarketplaceSearchResult
  isLoading?: boolean
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  onProductClick?: (product: MarketplaceProduct) => void
  onAddToCart?: (productId: string, variantId?: string) => void
  onAddToWishlist?: (productId: string) => void
  filters?: ProductFilters
  onFiltersChange?: (filters: ProductFilters) => void
  sortBy?: ProductSortOptions
  onSortChange?: (sort: ProductSortOptions) => void
  showFilters?: boolean
  className?: string
}

export function ProductListing({
  products,
  searchResults,
  isLoading = false,
  viewMode = 'grid',
  onViewModeChange,
  onProductClick,
  onAddToCart,
  onAddToWishlist,
  filters = {},
  onFiltersChange,
  sortBy = { field: 'created_at', direction: 'desc' },
  onSortChange,
  showFilters = true,
  className
}: ProductListingProps) {
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // Product type options
  const productTypes: { value: ProductType; label: string }[] = [
    { value: 'digital_program', label: 'Digital Programs' },
    { value: 'meal_plan', label: 'Meal Plans' },
    { value: 'coaching_package', label: 'Coaching Packages' },
    { value: 'consultation', label: 'Consultations' },
    { value: 'video_course', label: 'Video Courses' },
    { value: 'pdf_guide', label: 'PDF Guides' },
    { value: 'assessment_tool', label: 'Assessment Tools' },
    { value: 'group_program', label: 'Group Programs' },
    { value: 'monthly_membership', label: 'Memberships' }
  ]

  const difficultyLevels: { value: DifficultyLevel; label: string }[] = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all_levels', label: 'All Levels' }
  ]

  const sortOptions = [
    { value: 'created_at_desc', label: 'Newest First' },
    { value: 'created_at_asc', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating_desc', label: 'Highest Rated' },
    { value: 'popularity_desc', label: 'Most Popular' },
    { value: 'name_asc', label: 'Name A-Z' },
    { value: 'name_desc', label: 'Name Z-A' }
  ]

  // Get all unique tags from products
  const availableTags = Array.from(
    new Set(products.flatMap(product => product.tags))
  ).sort()

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...localFilters, ...newFilters }
    setLocalFilters(updatedFilters)
    onFiltersChange?.(updatedFilters)
  }

  const clearFilters = () => {
    const emptyFilters: ProductFilters = {}
    setLocalFilters(emptyFilters)
    setPriceRange([0, 1000])
    setSelectedTags([])
    onFiltersChange?.(emptyFilters)
  }

  const formatPrice = (price: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(price)
  }

  const getProductTypeIcon = (type: ProductType) => {
    const icons: Record<ProductType, React.ComponentType<any>> = {
      digital_program: BookOpen,
      meal_plan: BookOpen,
      pdf_guide: BookOpen,
      video_course: Play,
      assessment_tool: BookOpen,
      coaching_package: Users,
      group_program: Users,
      consultation: Users,
      program_review: BookOpen,
      custom_design: BookOpen,
      monthly_membership: Zap,
      premium_content: Award,
      ai_upgrade: Zap,
      analytics_package: BookOpen,
      white_label: BookOpen
    }
    return icons[type] || BookOpen
  }

  const renderProductCard = (product: MarketplaceProduct) => {
    const Icon = getProductTypeIcon(product.product_type)
    
    return (
      <Card 
        key={product.id} 
        className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full"
        onClick={() => onProductClick?.(product)}
      >
        <div className="relative">
          {product.cover_image_url ? (
            <img 
              src={product.cover_image_url} 
              alt={product.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center rounded-t-lg">
              <Icon className="h-16 w-16 text-blue-600" />
            </div>
          )}
          
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.featured && (
              <Badge className="bg-yellow-500 text-white text-xs">
                Featured
              </Badge>
            )}
            {product.is_subscription && (
              <Badge variant="outline" className="bg-white text-xs">
                Subscription
              </Badge>
            )}
          </div>

          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation()
                onAddToWishlist?.(product.id)
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4 flex flex-col h-44">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <Badge variant="secondary" className="text-xs mb-2">
                {product.category.replace('_', ' ')}
              </Badge>
              {product.difficulty_level && (
                <Badge variant="outline" className="text-xs">
                  {product.difficulty_level}
                </Badge>
              )}
            </div>
            
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 leading-tight">
              {product.name}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {product.short_description}
            </p>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {product.average_rating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({product.review_count})
                </span>
              </div>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {product.purchase_count} sold
              </span>
            </div>
            
            {product.duration_weeks && (
              <div className="flex items-center gap-1 mb-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {product.duration_weeks} weeks
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              <span className="font-bold text-xl">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.is_subscription && product.billing_interval && (
                <span className="text-xs text-muted-foreground">
                  per {product.billing_interval}
                </span>
              )}
            </div>
            
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart?.(product.id)
              }}
              className="shrink-0"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderProductListItem = (product: MarketplaceProduct) => {
    const Icon = getProductTypeIcon(product.product_type)
    
    return (
      <Card 
        key={product.id} 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onProductClick?.(product)}
      >
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Product Image */}
            <div className="flex-shrink-0">
              {product.cover_image_url ? (
                <img 
                  src={product.cover_image_url} 
                  alt={product.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center rounded-lg">
                  <Icon className="h-12 w-12 text-blue-600" />
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.category.replace('_', ' ')}
                    </Badge>
                    {product.featured && (
                      <Badge className="bg-yellow-500 text-white text-xs">
                        Featured
                      </Badge>
                    )}
                    {product.is_subscription && (
                      <Badge variant="outline" className="text-xs">
                        Subscription
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-xl mb-2">{product.name}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {product.short_description}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-2xl mb-1">
                    {formatPrice(product.price, product.currency)}
                  </div>
                  {product.is_subscription && product.billing_interval && (
                    <div className="text-sm text-muted-foreground">
                      per {product.billing_interval}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {product.average_rating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({product.review_count} reviews)
                  </span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {product.purchase_count} sold
                </span>
                {product.duration_weeks && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {product.duration_weeks} weeks
                      </span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {product.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {product.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.tags.length - 3} more
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddToWishlist?.(product.id)
                    }}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Wishlist
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddToCart?.(product.id)
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderFilterPanel = () => (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>
      
      {/* Price Range */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Price Range</label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}+</span>
          </div>
        </div>
      </div>
      
      {/* Product Type */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Product Type</label>
        <div className="space-y-2">
          {productTypes.map(type => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={type.value}
                checked={localFilters.product_type === type.value}
                onCheckedChange={(checked) => {
                  handleFilterChange({
                    product_type: checked ? type.value : undefined
                  })
                }}
              />
              <label
                htmlFor={type.value}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {type.label}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Difficulty Level */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Difficulty</label>
        <Select
          value={localFilters.difficulty_level || ''}
          onValueChange={(value) => 
            handleFilterChange({ 
              difficulty_level: value as DifficultyLevel || undefined 
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Any difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any difficulty</SelectItem>
            {difficultyLevels.map(level => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Rating */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Minimum Rating</label>
        <Select
          value={localFilters.rating_min?.toString() || ''}
          onValueChange={(value) => 
            handleFilterChange({ 
              rating_min: value ? parseInt(value) : undefined 
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any rating</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="2">2+ Stars</SelectItem>
            <SelectItem value="1">1+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Tags */}
      {availableTags.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Tags</label>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {availableTags.slice(0, 10).map(tag => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={(checked) => {
                    const newTags = checked 
                      ? [...selectedTags, tag]
                      : selectedTags.filter(t => t !== tag)
                    setSelectedTags(newTags)
                    handleFilterChange({ tags: newTags.length ? newTags : undefined })
                  }}
                />
                <label
                  htmlFor={tag}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {tag}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Sort and View Options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {searchResults ? (
              `${searchResults.total_count} Products Found`
            ) : (
              `${products.length} Products`
            )}
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Mobile Filter Button */}
          {showFilters && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                {renderFilterPanel()}
              </SheetContent>
            </Sheet>
          )}
          
          {/* Sort Dropdown */}
          <Select
            value={`${sortBy.field}_${sortBy.direction}`}
            onValueChange={(value) => {
              const [field, direction] = value.split('_')
              onSortChange?.({
                field: field as ProductSortOptions['field'],
                direction: direction as 'asc' | 'desc'
              })
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* View Mode Toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange?.('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange?.('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        {showFilters && (
          <div className="hidden lg:block w-80 flex-shrink-0">
            <Card>
              {renderFilterPanel()}
            </Card>
          </div>
        )}
        
        {/* Product Grid/List */}
        <div className="flex-1">
          {isLoading ? (
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
            )}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
            )}>
              {products.map(product => 
                viewMode === 'grid' 
                  ? renderProductCard(product)
                  : renderProductListItem(product)
              )}
            </div>
          )}
          
          {/* Pagination */}
          {searchResults && searchResults.total_pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                disabled={searchResults.current_page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {searchResults.current_page} of {searchResults.total_pages}
              </span>
              
              <Button
                variant="outline"
                disabled={searchResults.current_page === searchResults.total_pages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}