'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertCircle, Camera, Search, Scan, Mic, Plus, Clock, CheckCircle2, Upload } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Food, FoodLog, MealType, LoggingMethod, NutritionData } from '@/lib/types/nutrition'
import { FoodDatabase } from '@/lib/utils/food-database'

interface FoodLoggerProps {
  userId: string
  selectedDate?: Date
  onFoodLogged?: (log: FoodLog) => void
}

interface FoodSearchResult extends Food {
  relevanceScore?: number
}

interface AIRecognitionResult {
  foods: {
    name: string
    confidence: number
    estimatedQuantity: number
    unit: string
  }[]
  confidence: number
  processingTime: number
}

interface VoiceRecognitionResult {
  transcript: string
  confidence: number
  extractedFoods: {
    name: string
    quantity?: number
    unit?: string
  }[]
}

export function FoodLogger({ userId, selectedDate = new Date(), onFoodLogged }: FoodLoggerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([])
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [mealType, setMealType] = useState<MealType>('lunch')
  const [notes, setNotes] = useState('')
  const [isLogging, setIsLogging] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  
  // AI Photo Recognition
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [aiResults, setAiResults] = useState<AIRecognitionResult | null>(null)
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false)
  
  // Voice Recognition
  const [isListening, setIsListening] = useState(false)
  const [voiceResults, setVoiceResults] = useState<VoiceRecognitionResult | null>(null)
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  
  // Barcode Scanning
  const [barcodeValue, setBarcodeValue] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const foodDatabase = FoodDatabase.getInstance()

  // Initialize food database
  useState(() => {
    foodDatabase.initialize()
  })

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    try {
      const results = await foodDatabase.searchFoods({
        query,
        limit: 20,
        verified: true
      })
      
      setSearchResults(results.foods as FoodSearchResult[])
    } catch (error) {
      console.error('Food search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }, [foodDatabase])

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const processPhotoWithAI = async () => {
    if (!photoFile) return

    setIsProcessingPhoto(true)
    try {
      // Simulate AI processing - in a real implementation, this would call your AI service
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockResults: AIRecognitionResult = {
        foods: [
          {
            name: 'Grilled Chicken Breast',
            confidence: 0.92,
            estimatedQuantity: 150,
            unit: 'g'
          },
          {
            name: 'Steamed Broccoli',
            confidence: 0.87,
            estimatedQuantity: 100,
            unit: 'g'
          },
          {
            name: 'Brown Rice',
            confidence: 0.79,
            estimatedQuantity: 75,
            unit: 'g'
          }
        ],
        confidence: 0.86,
        processingTime: 2.8
      }
      
      setAiResults(mockResults)
    } catch (error) {
      console.error('AI processing failed:', error)
    } finally {
      setIsProcessingPhoto(false)
    }
  }

  const startVoiceRecognition = async () => {
    setIsListening(true)
    setIsProcessingVoice(true)
    
    try {
      // Simulate voice recognition - in a real implementation, this would use the Web Speech API
      await new Promise(resolve => setTimeout(resolve, 4000))
      
      const mockVoiceResult: VoiceRecognitionResult = {
        transcript: "I had a chicken salad with mixed greens, cherry tomatoes, and olive oil dressing for lunch",
        confidence: 0.89,
        extractedFoods: [
          {
            name: 'Grilled Chicken',
            quantity: 100,
            unit: 'g'
          },
          {
            name: 'Mixed Greens Salad',
            quantity: 2,
            unit: 'cup'
          },
          {
            name: 'Cherry Tomatoes',
            quantity: 0.5,
            unit: 'cup'
          },
          {
            name: 'Olive Oil',
            quantity: 1,
            unit: 'tablespoon'
          }
        ]
      }
      
      setVoiceResults(mockVoiceResult)
    } catch (error) {
      console.error('Voice recognition failed:', error)
    } finally {
      setIsListening(false)
      setIsProcessingVoice(false)
    }
  }

  const handleBarcodeSearch = async () => {
    if (!barcodeValue.trim()) return
    
    setIsScanning(true)
    try {
      const food = await foodDatabase.searchByBarcode(barcodeValue)
      if (food) {
        setSelectedFood(food)
      } else {
        alert('Food not found for this barcode')
      }
    } catch (error) {
      console.error('Barcode search failed:', error)
    } finally {
      setIsScanning(false)
    }
  }

  const logFood = async (food: Food, logQuantity: number, method: LoggingMethod, confidenceScore?: number) => {
    setIsLogging(true)
    try {
      const foodLog: FoodLog = {
        id: crypto.randomUUID(),
        user_id: userId,
        food_id: food.id,
        quantity: logQuantity,
        meal_type: mealType,
        logged_at: selectedDate.toISOString(),
        logging_method: method,
        confidence_score: confidenceScore,
        notes: notes.trim() || undefined
      }
      
      // In a real implementation, this would save to Supabase
      console.log('Logging food:', foodLog)
      
      // Reset form
      setSelectedFood(null)
      setQuantity(1)
      setNotes('')
      setPhotoFile(null)
      setPhotoPreview(null)
      setAiResults(null)
      setVoiceResults(null)
      setBarcodeValue('')
      
      onFoodLogged?.(foodLog)
      
      alert('Food logged successfully!')
    } catch (error) {
      console.error('Failed to log food:', error)
      alert('Failed to log food. Please try again.')
    } finally {
      setIsLogging(false)
    }
  }

  const calculateNutritionPreview = (food: Food, logQuantity: number): NutritionData => {
    return foodDatabase.calculateNutritionForQuantity(food, logQuantity)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Log Food
          </CardTitle>
          <CardDescription>
            Track your meals using search, photo recognition, barcode scanning, or voice input
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </TabsTrigger>
              <TabsTrigger value="photo" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Photo
              </TabsTrigger>
              <TabsTrigger value="barcode" className="flex items-center gap-2">
                <Scan className="h-4 w-4" />
                Barcode
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice
              </TabsTrigger>
            </TabsList>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search for foods</Label>
                <Input
                  id="search"
                  placeholder="e.g., chicken breast, apple, greek yogurt..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    handleSearch(e.target.value)
                  }}
                />
              </div>
              
              {isSearching && (
                <div className="text-center text-muted-foreground">
                  <Clock className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Searching foods...
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((food) => (
                    <div
                      key={food.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                        selectedFood?.id === food.id ? 'bg-muted border-primary' : ''
                      }`}
                      onClick={() => setSelectedFood(food)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{food.name}</h4>
                          {food.brand && (
                            <p className="text-sm text-muted-foreground">{food.brand}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {food.nutrition_per_serving.calories} cal per {food.serving_size}{food.serving_unit}
                          </p>
                        </div>
                        {food.verified && (
                          <Badge variant="secondary">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Photo Tab */}
            <TabsContent value="photo" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Upload a photo of your meal</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingPhoto}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Photo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    {photoFile && (
                      <Button
                        onClick={processPhotoWithAI}
                        disabled={isProcessingPhoto}
                      >
                        {isProcessingPhoto ? (
                          <>
                            <Clock className="h-4 w-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-2" />
                            Analyze Photo
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                {photoPreview && (
                  <div className="space-y-4">
                    <img
                      src={photoPreview}
                      alt="Food preview"
                      className="w-full max-w-sm h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {isProcessingPhoto && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 animate-spin" />
                      <span className="text-sm">AI is analyzing your photo...</span>
                    </div>
                    <Progress value={65} className="w-full" />
                  </div>
                )}
                
                {aiResults && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        AI identified {aiResults.foods.length} food items with {Math.round(aiResults.confidence * 100)}% confidence
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      {aiResults.foods.map((food, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{food.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Estimated: {food.estimatedQuantity}{food.unit}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={food.confidence > 0.8 ? 'default' : 'secondary'}>
                                {Math.round(food.confidence * 100)}% match
                              </Badge>
                              <Button size="sm" variant="outline">
                                Select
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Barcode Tab */}
            <TabsContent value="barcode" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="barcode">Enter barcode number</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="barcode"
                      placeholder="123456789012"
                      value={barcodeValue}
                      onChange={(e) => setBarcodeValue(e.target.value)}
                    />
                    <Button
                      onClick={handleBarcodeSearch}
                      disabled={isScanning || !barcodeValue.trim()}
                    >
                      {isScanning ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <Scan className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Scan the barcode on packaged foods for instant nutrition data
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            {/* Voice Tab */}
            <TabsContent value="voice" className="space-y-4">
              <div className="space-y-4">
                <div className="text-center">
                  <Button
                    size="lg"
                    variant={isListening ? "destructive" : "default"}
                    onClick={startVoiceRecognition}
                    disabled={isProcessingVoice}
                    className="w-full max-w-xs"
                  >
                    {isListening ? (
                      <>
                        <Mic className="h-4 w-4 mr-2 animate-pulse" />
                        Listening...
                      </>
                    ) : isProcessingVoice ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Start Voice Input
                      </>
                    )}
                  </Button>
                </div>
                
                {voiceResults && (
                  <div className="space-y-4">
                    <div>
                      <Label>What we heard:</Label>
                      <div className="p-3 border rounded-lg bg-muted mt-2">
                        <p className="text-sm italic">"{voiceResults.transcript}"</p>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Extracted foods:</Label>
                      <div className="space-y-2 mt-2">
                        {voiceResults.extractedFoods.map((food, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{food.name}</h4>
                              {food.quantity && food.unit && (
                                <p className="text-sm text-muted-foreground">
                                  {food.quantity} {food.unit}
                                </p>
                              )}
                            </div>
                            <Button size="sm" variant="outline">
                              Add to Log
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Describe what you ate and we'll extract the foods automatically
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Food Details Form */}
      {selectedFood && (
        <Card>
          <CardHeader>
            <CardTitle>Log {selectedFood.name}</CardTitle>
            <CardDescription>
              Specify quantity and meal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="meal">Meal</Label>
                <Select value={mealType} onValueChange={(value: MealType) => setMealType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about preparation, brand, etc..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            {/* Nutrition Preview */}
            {quantity > 0 && (
              <div className="p-4 border rounded-lg bg-muted">
                <h4 className="font-medium mb-2">Nutrition Preview</h4>
                <div className="grid gap-2 md:grid-cols-4 text-sm">
                  {(() => {
                    const nutrition = calculateNutritionPreview(selectedFood, quantity)
                    return (
                      <>
                        <div>
                          <span className="text-muted-foreground">Calories:</span>
                          <p className="font-medium">{nutrition.calories}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Protein:</span>
                          <p className="font-medium">{nutrition.protein}g</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Carbs:</span>
                          <p className="font-medium">{nutrition.carbohydrates}g</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fat:</span>
                          <p className="font-medium">{nutrition.fat}g</p>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={() => logFood(selectedFood, quantity, 'manual')}
                disabled={isLogging || quantity <= 0}
                className="flex-1"
              >
                {isLogging ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Logging...
                  </>
                ) : (
                  'Log Food'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFood(null)
                  setQuantity(1)
                  setNotes('')
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}