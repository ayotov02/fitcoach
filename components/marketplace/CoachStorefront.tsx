'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Star,
  MapPin,
  Clock,
  Users,
  Award,
  CheckCircle,
  MessageCircle,
  Mail,
  Phone,
  Globe,
  Calendar,
  TrendingUp,
  Target,
  Zap,
  Heart,
  Share2,
  BookOpen
} from 'lucide-react'
import { ProductCard } from './ProductCard'
import Link from 'next/link'

interface CoachStorefrontProps {
  coachId: string
  showHeader?: boolean
}

interface CoachProfile {
  id: string
  user_id: string
  business_name: string
  bio: string
  specialties: string[]
  certifications: string[]
  years_experience: number
  hourly_rate: number
  location: string
  timezone: string
  verified: boolean
  rating: number
  total_clients: number
  users: {
    full_name: string
    avatar_url: string
  }
}

interface CoachStats {
  total_products: number
  total_sales: number
  average_rating: number
  total_reviews: number
  response_time: string
  success_rate: number
}

export function CoachStorefront({ coachId, showHeader = true }: CoachStorefrontProps) {
  const [coach, setCoach] = useState<CoachProfile | null>(null)
  const [stats, setStats] = useState<CoachStats | null>(null)
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')

  useEffect(() => {
    loadCoachData()
  }, [coachId])

  const loadCoachData = async () => {
    setLoading(true)
    try {
      // Load coach profile
      const coachResponse = await fetch(`/api/coaches/${coachId}`)
      if (coachResponse.ok) {
        const coachData = await coachResponse.json()
        setCoach(coachData.coach)
        setStats(coachData.stats)
      }

      // Load coach products
      const productsResponse = await fetch(`/api/marketplace/products?coach_id=${coachId}`)
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData.products)
      }

      // Load reviews
      const reviewsResponse = await fetch(`/api/coaches/${coachId}/reviews`)
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json()
        setReviews(reviewsData.reviews)
      }
    } catch (error) {
      console.error('Failed to load coach data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContactCoach = () => {
    // Implement contact functionality
    console.log('Contact coach:', coachId)
  }

  const handleShareProfile = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${coach?.users.full_name} - Fitness Coach`,
        text: coach?.bio,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4" />
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (!coach) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Coach not found</p>
      </div>
    )
  }

  const renderStarRating = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} fill-yellow-400 text-yellow-400`}
          />
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} text-yellow-400`}
            style={{ 
              background: 'linear-gradient(90deg, #facc15 50%, transparent 50%)',
              backgroundClip: 'text'
            }}
          />
        )
      } else {
        stars.push(
          <Star
            key={i}
            className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} text-gray-300`}
          />
        )
      }
    }
    
    return <div className="flex items-center gap-1">{stars}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10" />
          <CardContent className="relative p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={coach.users.avatar_url} alt={coach.users.full_name} />
                  <AvatarFallback className="text-2xl">
                    {coach.users.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{coach.users.full_name}</h1>
                  {coach.verified && (
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                  )}
                </div>
                
                {coach.business_name && (
                  <p className="text-lg text-muted-foreground mb-2">{coach.business_name}</p>
                )}
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    {renderStarRating(coach.rating, 'md')}
                    <span className="ml-2 font-semibold">{coach.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({stats?.total_reviews || 0} reviews)
                    </span>
                  </div>
                  
                  {coach.location && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{coach.location}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {coach.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                
                <p className="text-muted-foreground mb-4 max-w-2xl">{coach.bio}</p>
                
                <div className="flex items-center gap-3">
                  <Button onClick={handleContactCoach} size="lg">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Coach
                  </Button>
                  <Button variant="outline" onClick={handleShareProfile}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold">{stats.total_products}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Clients</p>
                  <p className="text-2xl font-bold">{coach.total_clients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{Math.round(stats.success_rate * 100)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Response Time</p>
                  <p className="text-2xl font-bold">{stats.response_time}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No products available yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Years of Experience</p>
                  <p className="text-2xl font-bold text-primary">{coach.years_experience} years</p>
                </div>
                
                <div>
                  <p className="font-medium mb-2">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {coach.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="font-medium mb-2">Certifications</p>
                  <div className="space-y-2">
                    {coach.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Hourly Rate</p>
                  <p className="text-2xl font-bold text-primary">${coach.hourly_rate}/hour</p>
                </div>
                
                <div>
                  <p className="font-medium">Timezone</p>
                  <p className="text-muted-foreground">{coach.timezone}</p>
                </div>
                
                {stats && (
                  <div>
                    <p className="font-medium">Average Response Time</p>
                    <p className="text-muted-foreground">{stats.response_time}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{coach.bio}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.users?.avatar_url} />
                        <AvatarFallback>
                          {review.users?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold">{review.users?.full_name}</p>
                            <div className="flex items-center gap-2">
                              {renderStarRating(review.rating)}
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {review.review_title && (
                          <h4 className="font-medium mb-1">{review.review_title}</h4>
                        )}
                        
                        <p className="text-muted-foreground">{review.review_text}</p>
                        
                        {review.verified_purchase && (
                          <Badge variant="outline" className="mt-2">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No reviews yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Get In Touch</CardTitle>
              <CardDescription>
                Ready to start your fitness journey? Contact me to discuss your goals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button size="lg" onClick={handleContactCoach}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" size="lg">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Consultation
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{coach.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Response time: {stats?.response_time || 'Within 24 hours'}</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Coaching Approach</h4>
                <p className="text-muted-foreground">
                  I believe in creating personalized fitness programs that fit your lifestyle 
                  and help you achieve sustainable results. Let's work together to reach your goals!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}