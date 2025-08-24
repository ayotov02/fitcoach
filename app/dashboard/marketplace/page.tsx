import { requireRole } from '@/lib/auth/auth-helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  Search, 
  Filter, 
  Star, 
  Download,
  Heart,
  Eye,
  User,
  Calendar,
  Dumbbell,
  Apple,
  BookOpen,
} from 'lucide-react';

export default async function MarketplacePage() {
  // Only coaches can access marketplace
  const user = await requireRole(['coach']);

  // Mock marketplace data
  const categories = [
    { name: 'All', count: 156, active: true },
    { name: 'Workout Templates', count: 45, active: false },
    { name: 'Nutrition Plans', count: 32, active: false },
    { name: 'Assessment Tools', count: 28, active: false },
    { name: 'Educational Content', count: 24, active: false },
    { name: 'Client Resources', count: 27, active: false },
  ];

  const featuredItems = [
    {
      id: '1',
      title: 'Complete HIIT Workout Collection',
      description: 'A comprehensive collection of 25+ HIIT workouts for all fitness levels',
      author: 'Sarah Williams, NASM-CPT',
      rating: 4.9,
      reviews: 156,
      price: 29.99,
      type: 'Workout Templates',
      image: '🏃‍♀️',
      downloads: 1240,
      tags: ['HIIT', 'Cardio', 'Fat Loss', 'Beginner Friendly'],
    },
    {
      id: '2',
      title: 'Flexible Dieting Meal Plans',
      description: 'Evidence-based meal plans with macro tracking for sustainable results',
      author: 'Dr. Mike Johnson, RD',
      rating: 4.8,
      reviews: 89,
      price: 39.99,
      type: 'Nutrition Plans',
      image: '🥗',
      downloads: 876,
      tags: ['Flexible Dieting', 'Macro Tracking', 'Sustainable'],
    },
    {
      id: '3',
      title: 'Movement Assessment Toolkit',
      description: 'Professional assessment forms and screening protocols for new clients',
      author: 'Elite Fitness Academy',
      rating: 4.7,
      reviews: 234,
      price: 19.99,
      type: 'Assessment Tools',
      image: '📋',
      downloads: 2150,
      tags: ['Assessment', 'Screening', 'Professional'],
    },
  ];

  const popularItems = [
    {
      id: '4',
      title: 'Beginner Strength Training Guide',
      author: 'Fitness Pro',
      rating: 4.8,
      price: 24.99,
      downloads: 3200,
      type: 'Educational Content',
    },
    {
      id: '5',
      title: 'Bodyweight Home Workouts',
      author: 'HomeGym Coach',
      rating: 4.6,
      price: 15.99,
      downloads: 2890,
      type: 'Workout Templates',
    },
    {
      id: '6',
      title: 'Client Onboarding Package',
      author: 'Business Builder',
      rating: 4.9,
      price: 34.99,
      downloads: 1670,
      type: 'Client Resources',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Store className="mr-3 h-8 w-8 text-primary" />
            Marketplace
          </h1>
          <p className="text-gray-600">
            Discover premium coaching resources from industry experts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Heart className="mr-2 h-4 w-4" />
            Wishlist
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            My Downloads
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search workout templates, meal plans, tools..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.name}
            variant={category.active ? "default" : "outline"}
            size="sm"
            className="whitespace-nowrap"
          >
            {category.name} ({category.count})
          </Button>
        ))}
      </div>

      {/* Featured Items */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Featured Resources</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {featuredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-all duration-200 overflow-hidden">
              <div className="aspect-video bg-gradient-primary/10 flex items-center justify-center text-6xl">
                {item.image}
              </div>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="mb-2">
                    {item.type}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg leading-tight">
                  {item.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {item.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Author and Rating */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{item.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{item.rating}</span>
                    <span className="text-gray-500">({item.reviews})</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Downloads */}
                <div className="flex items-center text-sm text-gray-500">
                  <Download className="h-4 w-4 mr-2" />
                  {item.downloads.toLocaleString()} downloads
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-2xl font-bold text-primary">
                    ${item.price}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm">
                      Buy Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Popular Items */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Popular This Week</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{item.rating}</span>
                  </div>
                </div>
                
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{item.author}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {item.downloads.toLocaleString()} downloads
                  </div>
                  <div className="font-bold text-primary">
                    ${item.price}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Workout Templates', icon: Dumbbell, color: 'bg-blue-500' },
            { name: 'Nutrition Plans', icon: Apple, color: 'bg-green-500' },
            { name: 'Assessment Tools', icon: BookOpen, color: 'bg-purple-500' },
            { name: 'Educational Content', icon: BookOpen, color: 'bg-orange-500' },
            { name: 'Client Resources', icon: User, color: 'bg-pink-500' },
            { name: 'Business Tools', icon: Store, color: 'bg-indigo-500' },
          ].map((category) => (
            <Card key={category.name} className="hover:shadow-md transition-all duration-200 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mx-auto mb-3`}>
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-sm">{category.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}