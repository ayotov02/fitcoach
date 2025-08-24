'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ChevronLeft, ChevronRight, Upload, X, Plus, Save, 
  Eye, BookOpen, Users, Calendar, Clock, DollarSign,
  Tag, Image as ImageIcon, File, Video, Zap,
  AlertCircle, CheckCircle, Info, Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { 
  ProductType, 
  ProductCategory, 
  DifficultyLevel,
  BillingInterval,
  CreateProductRequest,
  ProductVariant
} from '@/lib/types/marketplace'

interface CreateProductProps {
  coachId: string
  onProductCreated?: (productId: string) => void
  onCancel?: () => void
  className?: string
}

interface ProductFormData extends Omit<CreateProductRequest, 'variants'> {
  variants: Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]
}

export function CreateProduct({
  coachId,
  onProductCreated,
  onCancel,
  className
}: CreateProductProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    product_type: 'digital_program',
    name: '',
    description: '',
    short_description: '',
    price: 0,
    category: 'workout_programs',
    subcategory: '',
    tags: [],
    cover_image_url: '',
    gallery_images: [],
    file_urls: [],
    is_subscription: false,
    variants: []
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewMode, setPreviewMode] = useState(false)

  const steps = [
    { id: 1, title: 'Product Type', description: 'Choose what you\'re selling' },
    { id: 2, title: 'Basic Info', description: 'Name, description, and category' },
    { id: 3, title: 'Pricing', description: 'Set your price and variants' },
    { id: 4, title: 'Content', description: 'Upload files and media' },
    { id: 5, title: 'Settings', description: 'Configure access and features' },
    { id: 6, title: 'Review', description: 'Review and publish' }
  ]

  const productTypes: { value: ProductType; label: string; description: string; icon: any }[] = [
    {
      value: 'digital_program',
      label: 'Digital Program',
      description: 'Complete workout or training programs with PDFs, videos',
      icon: BookOpen
    },
    {
      value: 'meal_plan',
      label: 'Nutrition Plan',
      description: 'Meal plans, recipes, and nutrition guides',
      icon: BookOpen
    },
    {
      value: 'coaching_package',
      label: 'Coaching Package',
      description: 'Personal coaching services over a period of time',
      icon: Users
    },
    {
      value: 'consultation',
      label: 'Consultation',
      description: 'One-time consultation sessions',
      icon: Calendar
    },
    {
      value: 'video_course',
      label: 'Video Course',
      description: 'Educational video content and courses',
      icon: Video
    },
    {
      value: 'monthly_membership',
      label: 'Membership',
      description: 'Recurring subscription with ongoing access',
      icon: Zap
    }
  ]

  const categories: { value: ProductCategory; label: string }[] = [
    { value: 'workout_programs', label: 'Workout Programs' },
    { value: 'nutrition_plans', label: 'Nutrition Plans' },
    { value: 'coaching_services', label: 'Coaching Services' },
    { value: 'educational_content', label: 'Educational Content' },
    { value: 'assessments', label: 'Assessments' },
    { value: 'subscriptions', label: 'Subscriptions' },
    { value: 'consultations', label: 'Consultations' },
    { value: 'group_programs', label: 'Group Programs' }
  ]

  const difficultyLevels: { value: DifficultyLevel; label: string }[] = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all_levels', label: 'All Levels' }
  ]

  const billingIntervals: { value: BillingInterval; label: string }[] = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ]

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleFileUpload = async (files: FileList | null, type: 'cover' | 'gallery' | 'content') => {
    if (!files) return

    // Simulate file upload
    const urls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // In real implementation, upload to cloud storage
      const url = URL.createObjectURL(file)
      urls.push(url)
      
      if (type === 'content') {
        setUploadedFiles(prev => [...prev, file])
      }
    }

    switch (type) {
      case 'cover':
        updateFormData({ cover_image_url: urls[0] })
        break
      case 'gallery':
        updateFormData({ gallery_images: [...(formData.gallery_images || []), ...urls] })
        break
      case 'content':
        updateFormData({ file_urls: [...(formData.file_urls || []), ...urls] })
        break
    }
  }

  const addVariant = () => {
    const newVariant: Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'> = {
      name: '',
      description: '',
      price_modifier: 0,
      features_json: {},
      is_default: formData.variants.length === 0,
      sort_order: formData.variants.length,
      is_active: true
    }
    updateFormData({ variants: [...formData.variants, newVariant] })
  }

  const updateVariant = (index: number, updates: Partial<ProductVariant>) => {
    const updatedVariants = formData.variants.map((variant, i) =>
      i === index ? { ...variant, ...updates } : variant
    )
    updateFormData({ variants: updatedVariants })
  }

  const removeVariant = (index: number) => {
    const updatedVariants = formData.variants.filter((_, i) => i !== index)
    updateFormData({ variants: updatedVariants })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/marketplace/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        onProductCreated?.(data.product.id)
      } else {
        throw new Error('Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return !!formData.product_type
      case 2:
        return !!(formData.name && formData.description && formData.category)
      case 3:
        return formData.price > 0
      case 4:
        return true // Optional step
      case 5:
        return true // Optional step
      case 6:
        return true
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">What are you selling?</h3>
              <p className="text-muted-foreground">
                Choose the type of product or service you want to create
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Card
                    key={type.value}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      formData.product_type === type.value && "ring-2 ring-blue-500"
                    )}
                    onClick={() => updateFormData({ product_type: type.value })}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Icon className="h-8 w-8 text-blue-600 mt-1" />
                        <div>
                          <h4 className="font-semibold mb-2">{type.label}</h4>
                          <p className="text-sm text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
              <p className="text-muted-foreground">
                Tell customers about your product
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="e.g., 12-Week Transformation Program"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  value={formData.short_description || ''}
                  onChange={(e) => updateFormData({ short_description: e.target.value })}
                  placeholder="One-line summary of your product"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Detailed description of what customers will get..."
                  rows={6}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => updateFormData({ category: value as ProductCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory || ''}
                    onChange={(e) => updateFormData({ subcategory: e.target.value })}
                    placeholder="e.g., Weight Loss, Strength Training"
                  />
                </div>
              </div>
              
              {/* Program-specific fields */}
              {(['digital_program', 'meal_plan', 'coaching_package'] as ProductType[]).includes(formData.product_type) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (weeks)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration_weeks || ''}
                      onChange={(e) => updateFormData({ duration_weeks: parseInt(e.target.value) || undefined })}
                      placeholder="12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select
                      value={formData.difficulty_level || ''}
                      onValueChange={(value) => updateFormData({ difficulty_level: value as DifficultyLevel || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.product_type === 'coaching_package' && (
                    <div className="space-y-2">
                      <Label htmlFor="max_participants">Max Participants</Label>
                      <Input
                        id="max_participants"
                        type="number"
                        value={formData.max_participants || ''}
                        onChange={(e) => updateFormData({ max_participants: parseInt(e.target.value) || undefined })}
                        placeholder="1"
                      />
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.tags || []).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => {
                          const newTags = formData.tags?.filter((_, i) => i !== index) || []
                          updateFormData({ tags: newTags })
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.currentTarget
                        const tag = input.value.trim()
                        if (tag && !(formData.tags || []).includes(tag)) {
                          updateFormData({ tags: [...(formData.tags || []), tag] })
                          input.value = ''
                        }
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Add suggested tags
                      const suggestedTags = ['fitness', 'nutrition', 'beginner', 'advanced']
                      const randomTag = suggestedTags[Math.floor(Math.random() * suggestedTags.length)]
                      if (!(formData.tags || []).includes(randomTag)) {
                        updateFormData({ tags: [...(formData.tags || []), randomTag] })
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Pricing</h3>
              <p className="text-muted-foreground">
                Set your price and create different package options
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Subscription Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Subscription Product</Label>
                  <p className="text-sm text-muted-foreground">
                    Charge customers on a recurring basis
                  </p>
                </div>
                <Button
                  variant={formData.is_subscription ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFormData({ is_subscription: !formData.is_subscription })}
                >
                  {formData.is_subscription ? "On" : "Off"}
                </Button>
              </div>
              
              {/* Basic Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => updateFormData({ price: parseFloat(e.target.value) || 0 })}
                      className="pl-10"
                      placeholder="99.00"
                    />
                  </div>
                </div>
                
                {formData.is_subscription && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="billing_interval">Billing Interval</Label>
                      <Select
                        value={formData.billing_interval || 'monthly'}
                        onValueChange={(value) => updateFormData({ billing_interval: value as BillingInterval })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {billingIntervals.map(interval => (
                            <SelectItem key={interval.value} value={interval.value}>
                              {interval.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="trial_days">Free Trial (days)</Label>
                      <Input
                        id="trial_days"
                        type="number"
                        value={formData.trial_days || 0}
                        onChange={(e) => updateFormData({ trial_days: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                  </>
                )}
              </div>
              
              {/* Package Variants */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Package Options</h4>
                    <p className="text-sm text-muted-foreground">
                      Create different tiers or options for your product
                    </p>
                  </div>
                  <Button variant="outline" onClick={addVariant}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
                
                {formData.variants.map((variant, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">Package {index + 1}</h5>
                          <div className="flex items-center gap-2">
                            <Button
                              variant={variant.is_default ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                // Only one variant can be default
                                const updatedVariants = formData.variants.map((v, i) => ({
                                  ...v,
                                  is_default: i === index ? !variant.is_default : false
                                }))
                                updateFormData({ variants: updatedVariants })
                              }}
                            >
                              {variant.is_default ? "Default" : "Set Default"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariant(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Package Name</Label>
                            <Input
                              value={variant.name}
                              onChange={(e) => updateVariant(index, { name: e.target.value })}
                              placeholder="e.g., Basic, Premium, VIP"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Price Adjustment</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                step="0.01"
                                value={variant.price_modifier}
                                onChange={(e) => updateVariant(index, { price_modifier: parseFloat(e.target.value) || 0 })}
                                className="pl-10"
                                placeholder="0.00"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Final price: ${(formData.price + variant.price_modifier).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={variant.description || ''}
                            onChange={(e) => updateVariant(index, { description: e.target.value })}
                            placeholder="What makes this package different?"
                            rows={2}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Content & Media</h3>
              <p className="text-muted-foreground">
                Upload images and files for your product
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Cover Image */}
              <div className="space-y-4">
                <Label>Cover Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {formData.cover_image_url ? (
                    <div className="relative">
                      <img
                        src={formData.cover_image_url}
                        alt="Cover"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => updateFormData({ cover_image_url: '' })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Upload a cover image for your product
                        </p>
                        <Button variant="outline" onClick={() => document.getElementById('cover-upload')?.click()}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                        <input
                          id="cover-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files, 'cover')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Gallery Images */}
              <div className="space-y-4">
                <Label>Gallery Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(formData.gallery_images || []).map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => {
                          const newImages = formData.gallery_images?.filter((_, i) => i !== index) || []
                          updateFormData({ gallery_images: newImages })
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => document.getElementById('gallery-upload')?.click()}
                  >
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <input
                    id="gallery-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, 'gallery')}
                  />
                </div>
              </div>
              
              {/* Content Files */}
              <div className="space-y-4">
                <Label>Product Files</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center space-y-4">
                    <File className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload PDFs, videos, and other content files
                      </p>
                      <Button variant="outline" onClick={() => document.getElementById('content-upload')?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </Button>
                      <input
                        id="content-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files, 'content')}
                      />
                    </div>
                  </div>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="mt-6 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newFiles = uploadedFiles.filter((_, i) => i !== index)
                              const newUrls = formData.file_urls?.filter((_, i) => i !== index) || []
                              setUploadedFiles(newFiles)
                              updateFormData({ file_urls: newUrls })
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Settings & Access</h3>
              <p className="text-muted-foreground">
                Configure how customers access your product
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Digital Access Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Digital Access</CardTitle>
                  <CardDescription>
                    Control download limits and access duration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="download_limit">Download Limit</Label>
                      <Input
                        id="download_limit"
                        type="number"
                        value={formData.download_limit || ''}
                        onChange={(e) => updateFormData({ download_limit: parseInt(e.target.value) || undefined })}
                        placeholder="Unlimited"
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty for unlimited downloads
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="access_duration">Access Duration (days)</Label>
                      <Input
                        id="access_duration"
                        type="number"
                        value={formData.access_duration_days || ''}
                        onChange={(e) => updateFormData({ access_duration_days: parseInt(e.target.value) || undefined })}
                        placeholder="Lifetime"
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty for lifetime access
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Booking Settings */}
              {(['consultation', 'coaching_package'].includes(formData.product_type)) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Booking Settings</CardTitle>
                    <CardDescription>
                      Configure appointment and consultation settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Enable Online Booking</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow customers to book appointments directly
                        </p>
                      </div>
                      <Button
                        variant={formData.booking_enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFormData({ booking_enabled: !formData.booking_enabled })}
                      >
                        {formData.booking_enabled ? "On" : "Off"}
                      </Button>
                    </div>
                    
                    {formData.booking_enabled && (
                      <div className="space-y-2">
                        <Label htmlFor="session_duration">Session Duration (minutes)</Label>
                        <Input
                          id="session_duration"
                          type="number"
                          value={formData.session_duration_minutes || ''}
                          onChange={(e) => updateFormData({ session_duration_minutes: parseInt(e.target.value) || undefined })}
                          placeholder="60"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Inventory Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Inventory</CardTitle>
                  <CardDescription>
                    Manage product availability and stock
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Track Inventory</Label>
                      <p className="text-sm text-muted-foreground">
                        Limit the number of available spots or copies
                      </p>
                    </div>
                    <Button
                      variant={formData.inventory_tracked ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFormData({ 
                        inventory_tracked: !formData.inventory_tracked,
                        unlimited_inventory: formData.inventory_tracked 
                      })}
                    >
                      {formData.inventory_tracked ? "On" : "Off"}
                    </Button>
                  </div>
                  
                  {formData.inventory_tracked && (
                    <div className="space-y-2">
                      <Label htmlFor="inventory_quantity">Available Quantity</Label>
                      <Input
                        id="inventory_quantity"
                        type="number"
                        value={formData.inventory_quantity || ''}
                        onChange={(e) => updateFormData({ inventory_quantity: parseInt(e.target.value) || undefined })}
                        placeholder="100"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Review & Publish</h3>
              <p className="text-muted-foreground">
                Review your product details before publishing
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Product Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Name</Label>
                      <p className="font-medium">{formData.name || 'Untitled Product'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-muted-foreground">Type</Label>
                      <p className="font-medium capitalize">
                        {formData.product_type.replace('_', ' ')}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-muted-foreground">Category</Label>
                      <p className="font-medium capitalize">
                        {formData.category.replace('_', ' ')}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-muted-foreground">Price</Label>
                      <p className="font-medium text-lg">
                        ${formData.price.toFixed(2)}
                        {formData.is_subscription && formData.billing_interval && (
                          <span className="text-sm text-muted-foreground ml-1">
                            /{formData.billing_interval}
                          </span>
                        )}
                      </p>
                    </div>
                    
                    {formData.variants.length > 0 && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Variants</Label>
                        <div className="space-y-1">
                          {formData.variants.map((variant, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-sm">{variant.name}</span>
                              <span className="text-sm font-medium">
                                ${(formData.price + variant.price_modifier).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Checklist */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Publish Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {formData.name ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                        )}
                        <span className="text-sm">Product name added</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {formData.description ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                        )}
                        <span className="text-sm">Description provided</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {formData.price > 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                        )}
                        <span className="text-sm">Price set</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {formData.cover_image_url ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-600" />
                        )}
                        <span className="text-sm">Cover image (recommended)</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {(formData.file_urls?.length || 0) > 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-600" />
                        )}
                        <span className="text-sm">Content files (recommended)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Preview */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Preview</CardTitle>
                    <CardDescription>
                      How your product will appear to customers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 space-y-4">
                      {formData.cover_image_url ? (
                        <img
                          src={formData.cover_image_url}
                          alt="Product preview"
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-semibold mb-1">
                          {formData.name || 'Product Name'}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {formData.short_description || 'Short description...'}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-gray-300" />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">
                              No reviews yet
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-lg font-bold">
                          ${formData.price.toFixed(2)}
                          {formData.is_subscription && formData.billing_interval && (
                            <span className="text-sm text-muted-foreground font-normal ml-1">
                              /{formData.billing_interval}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn("max-w-6xl mx-auto space-y-8", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Product</h1>
          <p className="text-muted-foreground">
            Add a new product or service to your marketplace
          </p>
        </div>
        
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
      
      {/* Progress Steps */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                  currentStep === step.id
                    ? "border-blue-600 bg-blue-600 text-white"
                    : currentStep > step.id
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-gray-300 text-gray-500"
                )}
              >
                {currentStep > step.id ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-0.5 ml-4 transition-colors",
                    currentStep > step.id ? "bg-green-600" : "bg-gray-300"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-muted-foreground">
            {steps[currentStep - 1].description}
          </p>
        </div>
        
        <Progress
          value={(currentStep / steps.length) * 100}
          className="mt-4"
        />
      </div>
      
      {/* Step Content */}
      <Card>
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          {currentStep < steps.length ? (
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              disabled={!canProceed(currentStep)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceed(currentStep)}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Publish Product
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}