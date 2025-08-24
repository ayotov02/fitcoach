'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Star, Heart, ShoppingCart, Share, MessageSquare, Clock, Users,
  Download, Play, BookOpen, Award, Zap, Shield, RefreshCw,
  CheckCircle, AlertCircle, Calendar, Globe, ArrowLeft,
  ThumbsUp, Flag, ExternalLink, Copy, Facebook, Twitter,
  Mail, Link as LinkIcon, Eye, TrendingUp, Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { 
  MarketplaceProduct, 
  ProductVariant,
  MarketplaceReview,
  CoachProfile,
  DigitalDownload
} from '@/lib/types/marketplace'

interface ProductDetailProps {
  product: MarketplaceProduct
  onAddToCart?: (productId: string, variantId?: string) => void
  onAddToWishlist?: (productId: string) => void
  onContactCoach?: (coachId: string) => void
  onBack?: () => void
  className?: string
}

export function ProductDetail({
  product,
  onAddToCart,
  onAddToWishlist,
  onContactCoach,
  onBack,
  className
}: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.find(v => v.is_default) || product.variants?.[0] || null
  )
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [reviews, setReviews] = useState<MarketplaceReview[]>([])
  const [coachInfo, setCoachInfo] = useState<CoachProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [showShareMenu, setShowShareMenu] = useState(false)
  
  const images = [
    product.cover_image_url,
    ...(product.gallery_images || [])
  ].filter(Boolean)

  useEffect(() => {
    loadProductDetails()
  }, [product.id])

  const loadProductDetails = async () => {
    setIsLoading(true)
    try {
      // Load reviews
      const reviewsResponse = await fetch(`/api/marketplace/products/${product.id}/reviews`)
      const reviewsData = await reviewsResponse.json()
      setReviews(reviewsData.reviews || [])

      // Load coach information
      const coachResponse = await fetch(`/api/marketplace/coaches/${product.coach_id}`)
      const coachData = await coachResponse.json()
      setCoachInfo(coachData.coach || null)
    } catch (error) {
      console.error('Failed to load product details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = () => {
    onAddToCart?.(product.id, selectedVariant?.id)
  }

  const getCurrentPrice = () => {
    const basePrice = product.price
    const variantModifier = selectedVariant?.price_modifier || 0
    return basePrice + variantModifier
  }

  const formatPrice = (price: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(price)
  }

  const shareProduct = async (method: 'copy' | 'facebook' | 'twitter' | 'email') => {
    const url = window.location.href
    const title = product.name
    const text = `Check out this ${product.category.replace('_', ' ')}: ${product.name}`

    switch (method) {
      case 'copy':
        await navigator.clipboard.writeText(url)
        // Show toast notification
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
        break
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`
        break
    }
    setShowShareMenu(false)
  }

  const renderProductImages = () => (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
        {images.length > 0 ? (
          <img
            src={images[selectedImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-24 w-24 text-gray-400" />
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                "flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors",
                selectedImageIndex === index 
                  ? "border-blue-600" 
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => setSelectedImageIndex(index)}
            >
              <img
                src={image}
                alt={`${product.name} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Product Badges */}
      <div className="flex flex-wrap gap-2">
        {product.featured && (
          <Badge className="bg-yellow-500 text-white">
            <Award className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        {product.is_subscription && (
          <Badge variant="outline">
            <RefreshCw className="h-3 w-3 mr-1" />
            Subscription
          </Badge>
        )}
        <Badge variant="secondary">
          {product.category.replace('_', ' ')}
        </Badge>
        {product.difficulty_level && (
          <Badge variant="outline">
            {product.difficulty_level}
          </Badge>
        )}
      </div>
    </div>
  )

  const renderProductInfo = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-lg text-muted-foreground mb-4">
              {product.short_description}
            </p>
          </div>
          
          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddToWishlist?.(product.id)}
            >
              <Heart className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareMenu(!showShareMenu)}
              >
                <Share className="h-4 w-4" />
              </Button>
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-md shadow-lg border p-2 z-10 min-w-40">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => shareProduct('copy')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => shareProduct('facebook')}
                  >
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => shareProduct('twitter')}
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => shareProduct('email')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rating and Social Proof */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < Math.floor(product.average_rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="font-medium text-lg">
              {product.average_rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              ({product.review_count} reviews)
            </span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {product.purchase_count} students
            </span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {product.view_count} views
            </span>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {product.duration_weeks && (
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>{product.duration_weeks} weeks duration</span>
            </div>
          )}
          {product.difficulty_level && (
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <span className="capitalize">{product.difficulty_level} level</span>
            </div>
          )}
          {product.max_participants && (
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Max {product.max_participants} participants</span>
            </div>
          )}
          {product.session_duration_minutes && (
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <span>{product.session_duration_minutes} min sessions</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {product.tags.map(tag => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Pricing and Variants */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {formatPrice(getCurrentPrice(), product.currency)}
                </div>
                {product.is_subscription && product.billing_interval && (
                  <div className="text-sm text-muted-foreground">
                    per {product.billing_interval}
                    {product.trial_days > 0 && (
                      <span className="ml-2 text-green-600">
                        ({product.trial_days} day free trial)
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {product.inventory_tracked && product.inventory_quantity !== undefined && (
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {product.inventory_quantity > 0 
                      ? `${product.inventory_quantity} available`
                      : "Out of stock"
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Variants Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Package Options</label>
                <Select
                  value={selectedVariant?.id || ''}
                  onValueChange={(value) => {
                    const variant = product.variants?.find(v => v.id === value)
                    setSelectedVariant(variant || null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants.map(variant => (
                      <SelectItem key={variant.id} value={variant.id}>
                        <div className="flex justify-between w-full">
                          <span>{variant.name}</span>
                          <span className="ml-4">
                            {formatPrice(product.price + variant.price_modifier)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedVariant && selectedVariant.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedVariant.description}
                  </p>
                )}
              </div>
            )}

            {/* Quantity (for applicable products) */}
            {!product.is_subscription && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Quantity</label>
                <Select
                  value={quantity.toString()}
                  onValueChange={(value) => setQuantity(parseInt(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full text-lg py-6"
                onClick={handleAddToCart}
                disabled={product.inventory_tracked && product.inventory_quantity === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.is_subscription ? 'Start Subscription' : 'Add to Cart'}
              </Button>
              
              {product.booking_enabled && (
                <Button size="lg" variant="outline" className="w-full">
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Consultation
                </Button>
              )}
            </div>

            {/* Guarantees */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Download className="h-4 w-4" />
                <span>Instant digital delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>Lifetime access</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCoachInfo = () => {
    if (!coachInfo) return null

    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4">About the Coach</h3>
          
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={coachInfo.avatar_url} alt={coachInfo.full_name} />
              <AvatarFallback>
                {coachInfo.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-lg">{coachInfo.full_name}</h4>
                {coachInfo.identity_verified && (
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">
                  {coachInfo.marketplace_rating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({coachInfo.marketplace_reviews_count} reviews)
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {coachInfo.specializations.join(', ')}
              </p>
              
              {coachInfo.bio && (
                <p className="text-sm line-clamp-3 mb-3">{coachInfo.bio}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {coachInfo.total_products}
              </div>
              <div className="text-xs text-muted-foreground">Products</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {coachInfo.total_sales}
              </div>
              <div className="text-xs text-muted-foreground">Sales</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {Math.round(coachInfo.total_earnings).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Students</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onContactCoach?.(coachInfo.id)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact
            </Button>
            <Button variant="outline" className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderReviews = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">
          Reviews ({product.review_count})
        </h3>
        <Button variant="outline" size="sm">
          Write Review
        </Button>
      </div>
      
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="font-medium mb-2">No reviews yet</h4>
          <p className="text-muted-foreground text-sm">
            Be the first to review this product
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.slice(0, 5).map(review => (
            <div key={review.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.buyer?.avatar_url} />
                    <AvatarFallback>
                      {review.buyer?.full_name.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {review.buyer?.full_name || 'Anonymous'}
                      </span>
                      {review.verified_purchase && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
              
              {review.review_title && (
                <h4 className="font-medium">{review.review_title}</h4>
              )}
              
              {review.review_text && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {review.review_text}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Button variant="ghost" size="sm" className="h-auto p-0">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful ({review.helpful_count})
                </Button>
              </div>
              
              {review.coach_response && (
                <div className="ml-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={coachInfo?.avatar_url} />
                      <AvatarFallback>
                        {coachInfo?.full_name.split(' ').map(n => n[0]).join('') || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {coachInfo?.full_name} (Coach)
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {review.coach_responded_at && 
                        new Date(review.coach_responded_at).toLocaleDateString()
                      }
                    </span>
                  </div>
                  <p className="text-sm">{review.coach_response}</p>
                </div>
              )}
              
              <Separator />
            </div>
          ))}
          
          {reviews.length > 5 && (
            <Button variant="outline" className="w-full">
              Load More Reviews
            </Button>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className={cn("space-y-8", className)}>
      {/* Back Button */}
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      )}

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-6">
          {renderProductImages()}
          {renderCoachInfo()}
        </div>
        
        {/* Product Information */}
        <div className="space-y-6">
          {renderProductInfo()}
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <div
                  dangerouslySetInnerHTML={{ 
                    __html: product.description.replace(/\n/g, '<br>') 
                  }}
                />
              </div>
              
              {selectedVariant && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-3">
                    What's included in {selectedVariant.name}:
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(selectedVariant.features_json).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="capitalize">
                          {key.replace('_', ' ')}: {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Course Content</h4>
                  <div className="space-y-3">
                    {product.file_urls.map((fileUrl, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Download className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <div className="font-medium">Module {index + 1}</div>
                          <div className="text-sm text-muted-foreground">
                            PDF • Video • Worksheets
                          </div>
                        </div>
                        <Badge variant="secondary">Premium</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                {product.preview_content && (
                  <div>
                    <h4 className="font-semibold mb-3">Preview</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">{product.preview_content}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {renderReviews()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="faq" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">How long do I have access?</h4>
                  <p className="text-sm text-muted-foreground">
                    {product.access_duration_days 
                      ? `You have ${product.access_duration_days} days of access from purchase.`
                      : "You have lifetime access to this content."
                    }
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Can I download the content?</h4>
                  <p className="text-sm text-muted-foreground">
                    {product.download_limit 
                      ? `Yes, you can download up to ${product.download_limit} times.`
                      : "Yes, unlimited downloads are included."
                    }
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Is there a money-back guarantee?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, we offer a 30-day money-back guarantee if you're not satisfied.
                  </p>
                </div>
                
                {product.requires_consultation && (
                  <div>
                    <h4 className="font-semibold mb-2">Do I need a consultation first?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes, this service requires an initial consultation to customize your program.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}