'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  CreditCard, Lock, Shield, CheckCircle, AlertCircle,
  ArrowLeft, Gift, Percent, Clock, Download, Users,
  Star, Mail, Phone, MapPin, Building, Globe,
  Truck, Calendar, RefreshCw, Info, ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { 
  MarketplaceProduct,
  ProductVariant,
  MarketplaceOrder,
  BillingAddress,
  CreateOrderRequest,
  ProcessPaymentRequest,
  DiscountCode
} from '@/lib/types/marketplace'

interface CartItem {
  product: MarketplaceProduct
  variant?: ProductVariant
  quantity: number
}

interface PurchaseFlowProps {
  cartItems: CartItem[]
  userId: string
  onOrderComplete?: (orderId: string) => void
  onBack?: () => void
  className?: string
}

export function PurchaseFlow({
  cartItems,
  userId,
  onOrderComplete,
  onBack,
  className
}: PurchaseFlowProps) {
  const [currentStep, setCurrentStep] = useState<'review' | 'billing' | 'payment' | 'complete'>('review')
  const [order, setOrder] = useState<MarketplaceOrder | null>(null)
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    name: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US'
  })
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null)
  const [customerNotes, setCustomerNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple_pay'>('card')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  
  // Stripe Elements state
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)

  useEffect(() => {
    calculateTotals()
  }, [cartItems, appliedDiscount])

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      const basePrice = item.product.price
      const variantPrice = item.variant?.price_modifier || 0
      return sum + ((basePrice + variantPrice) * item.quantity)
    }, 0)

    const discountAmount = appliedDiscount 
      ? appliedDiscount.discount_type === 'percentage'
        ? Math.min(subtotal * (appliedDiscount.discount_value / 100), appliedDiscount.max_discount_amount || Infinity)
        : appliedDiscount.discount_value
      : 0

    const taxRate = 0.08 // 8% tax rate - should come from tax service
    const taxAmount = (subtotal - discountAmount) * taxRate
    const platformFeeRate = 0.10 // 10% platform fee
    const platformFee = subtotal * platformFeeRate
    const total = subtotal - discountAmount + taxAmount

    return {
      subtotal,
      discountAmount,
      taxAmount,
      platformFee,
      total: Math.max(0, total)
    }
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/marketplace/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode,
          products: cartItems.map(item => item.product.id),
          subtotal: calculateTotals().subtotal
        })
      })

      const data = await response.json()
      if (response.ok && data.discount) {
        setAppliedDiscount(data.discount)
        setError(null)
      } else {
        setError(data.error || 'Invalid discount code')
      }
    } catch (error) {
      setError('Failed to apply discount code')
    } finally {
      setIsProcessing(false)
    }
  }

  const createOrder = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const orderRequest: CreateOrderRequest = {
        items: cartItems.map(item => ({
          product_id: item.product.id,
          variant_id: item.variant?.id,
          quantity: item.quantity
        })),
        billing_address: billingAddress,
        discount_code: appliedDiscount?.code,
        customer_notes: customerNotes || undefined
      }

      const response = await fetch('/api/marketplace/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderRequest)
      })

      const data = await response.json()
      if (response.ok) {
        setOrder(data.order)
        setClientSecret(data.client_secret)
        setPaymentIntentId(data.payment_intent_id)
        setCurrentStep('payment')
      } else {
        throw new Error(data.error || 'Failed to create order')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const processPayment = async (paymentMethodId: string) => {
    if (!order || !paymentIntentId) return

    setIsProcessing(true)
    setError(null)

    try {
      const paymentRequest: ProcessPaymentRequest = {
        order_id: order.id,
        payment_method_id: paymentMethodId,
        return_url: window.location.origin + '/marketplace/purchase/complete'
      }

      const response = await fetch('/api/marketplace/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentRequest)
      })

      const data = await response.json()
      if (response.ok) {
        if (data.status === 'succeeded') {
          setCurrentStep('complete')
          onOrderComplete?.(order.id)
        } else if (data.status === 'requires_action') {
          // Handle 3D Secure or other authentication
          window.location.href = data.next_action.redirect_to_url.url
        }
      } else {
        throw new Error(data.error || 'Payment failed')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const renderOrderSummary = () => {
    const totals = calculateTotals()
    
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cart Items */}
          <div className="space-y-3">
            {cartItems.map((item, index) => (
              <div key={`${item.product.id}-${item.variant?.id}-${index}`} className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.product.cover_image_url ? (
                    <img
                      src={item.product.cover_image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2">
                    {item.product.name}
                  </h4>
                  {item.variant && (
                    <p className="text-xs text-muted-foreground">
                      {item.variant.name}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </span>
                    <span className="font-medium text-sm">
                      {formatPrice((item.product.price + (item.variant?.price_modifier || 0)) * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Separator />
          
          {/* Discount Code */}
          {currentStep === 'review' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyDiscountCode}
                  disabled={!discountCode.trim() || isProcessing}
                >
                  Apply
                </Button>
              </div>
              
              {appliedDiscount && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Discount applied: {appliedDiscount.name}</span>
                </div>
              )}
            </div>
          )}
          
          <Separator />
          
          {/* Price Breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(totals.subtotal)}</span>
            </div>
            
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedDiscount?.code})</span>
                <span>-{formatPrice(totals.discountAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatPrice(totals.taxAmount)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-medium text-base">
              <span>Total</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
          </div>
          
          {/* Security Badges */}
          <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secure SSL Encrypted Payment</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            <span>30-day money-back guarantee</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review Your Order</h2>
        <p className="text-muted-foreground">
          Review your items and proceed to checkout
        </p>
      </div>
      
      {/* Product Details */}
      <div className="space-y-4">
        {cartItems.map((item, index) => (
          <Card key={`${item.product.id}-${item.variant?.id}-${index}`}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.product.cover_image_url ? (
                    <img
                      src={item.product.cover_image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{item.product.name}</h3>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground">
                          {item.variant.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatPrice((item.product.price + (item.variant?.price_modifier || 0)) * item.quantity)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(item.product.price + (item.variant?.price_modifier || 0))} × {item.quantity}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{item.product.average_rating.toFixed(1)}</span>
                    </div>
                    
                    {item.product.duration_weeks && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{item.product.duration_weeks} weeks</span>
                      </div>
                    )}
                    
                    {item.product.is_subscription && (
                      <Badge variant="outline" className="text-xs">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Subscription
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.product.short_description}
                    </p>
                  </div>
                  
                  {/* Access Information */}
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>
                        {item.product.download_limit 
                          ? `${item.product.download_limit} downloads`
                          : 'Unlimited downloads'
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>
                        {item.product.access_duration_days
                          ? `${item.product.access_duration_days} day access`
                          : 'Lifetime access'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Customer Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Notes (Optional)</CardTitle>
          <CardDescription>
            Any special instructions or notes for the coach
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any special requests or questions..."
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>
      
      <Button 
        size="lg" 
        className="w-full"
        onClick={() => setCurrentStep('billing')}
      >
        Continue to Billing
      </Button>
    </div>
  )

  const renderBillingStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Billing Information</h2>
        <p className="text-muted-foreground">
          Enter your billing details for the purchase
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={billingAddress.name}
                onChange={(e) => setBillingAddress(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={billingAddress.email}
                onChange={(e) => setBillingAddress(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="line1">Address Line 1 *</Label>
            <Input
              id="line1"
              value={billingAddress.line1}
              onChange={(e) => setBillingAddress(prev => ({ ...prev, line1: e.target.value }))}
              placeholder="123 Main St"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="line2">Address Line 2</Label>
            <Input
              id="line2"
              value={billingAddress.line2 || ''}
              onChange={(e) => setBillingAddress(prev => ({ ...prev, line2: e.target.value }))}
              placeholder="Apt, Suite, etc. (optional)"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={billingAddress.city}
                onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                placeholder="New York"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={billingAddress.state}
                onChange={(e) => setBillingAddress(prev => ({ ...prev, state: e.target.value }))}
                placeholder="NY"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postal_code">ZIP Code *</Label>
              <Input
                id="postal_code"
                value={billingAddress.postal_code}
                onChange={(e) => setBillingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                placeholder="10001"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep('review')}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Review
        </Button>
        <Button 
          size="lg" 
          className="flex-1"
          onClick={createOrder}
          disabled={
            isProcessing ||
            !billingAddress.name ||
            !billingAddress.email ||
            !billingAddress.line1 ||
            !billingAddress.city ||
            !billingAddress.state ||
            !billingAddress.postal_code
          }
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Creating Order...
            </>
          ) : (
            'Continue to Payment'
          )}
        </Button>
      </div>
    </div>
  )

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Payment Information</h2>
        <p className="text-muted-foreground">
          Complete your secure payment to finalize your order
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as typeof paymentMethod)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="card">
                <CreditCard className="h-4 w-4 mr-2" />
                Card
              </TabsTrigger>
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="apple_pay">Apple Pay</TabsTrigger>
            </TabsList>
            
            <TabsContent value="card" className="mt-4">
              <div className="space-y-4">
                {/* Stripe Card Element would go here */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter your card information securely with Stripe
                  </p>
                  
                  {/* Mock card form - replace with Stripe Elements */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 1234 1234 1234"
                        disabled
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="card-expiry">Expiry</Label>
                        <Input
                          id="card-expiry"
                          placeholder="MM/YY"
                          disabled
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="card-cvc">CVC</Label>
                        <Input
                          id="card-cvc"
                          placeholder="123"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="accept-terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  <Label htmlFor="accept-terms" className="text-sm">
                    I accept the{' '}
                    <Button variant="link" className="h-auto p-0 text-sm">
                      Terms of Service
                    </Button>
                    {' '}and{' '}
                    <Button variant="link" className="h-auto p-0 text-sm">
                      Privacy Policy
                    </Button>
                  </Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="paypal" className="mt-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="space-y-4">
                  <div className="text-6xl">🅿️</div>
                  <p className="text-sm text-muted-foreground">
                    You'll be redirected to PayPal to complete your payment
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="apple_pay" className="mt-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="space-y-4">
                  <div className="text-6xl">🍎</div>
                  <p className="text-sm text-muted-foreground">
                    Use Touch ID or Face ID to pay with Apple Pay
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Security Information */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-purple-600" />
              <span>30-day Guarantee</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep('billing')}
          disabled={isProcessing}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Billing
        </Button>
        <Button 
          size="lg" 
          className="flex-1"
          onClick={() => {
            // Mock payment processing - replace with real Stripe integration
            if (paymentMethod === 'card') {
              processPayment('pm_card_visa') // Mock payment method ID
            } else {
              setCurrentStep('complete')
              onOrderComplete?.(order?.id || 'mock-order-id')
            }
          }}
          disabled={
            isProcessing || 
            (paymentMethod === 'card' && !acceptedTerms)
          }
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Complete Payment {formatPrice(calculateTotals().total)}
            </>
          )}
        </Button>
      </div>
    </div>
  )

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-lg text-muted-foreground">
          Thank you for your purchase. Your order has been confirmed.
        </p>
      </div>
      
      {order && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-base">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Order Number:</span>
              <span className="font-mono">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Paid:</span>
              <span className="font-medium">{formatPrice(order.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="capitalize">{paymentMethod.replace('_', ' ')}</span>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <p className="font-medium">What's next?</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span>Confirmation email sent to {billingAddress.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="h-3 w-3" />
                  <span>Digital products available for download</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>Coach will be notified of your purchase</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Products
        </Button>
        <Button variant="outline">
          <ExternalLink className="h-4 w-4 mr-2" />
          View Order Details
        </Button>
        <Button>
          Continue Shopping
        </Button>
      </div>
    </div>
  )

  const steps = [
    { id: 'review', title: 'Review', completed: ['billing', 'payment', 'complete'].includes(currentStep) },
    { id: 'billing', title: 'Billing', completed: ['payment', 'complete'].includes(currentStep) },
    { id: 'payment', title: 'Payment', completed: currentStep === 'complete' },
    { id: 'complete', title: 'Complete', completed: false }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <div className={cn("max-w-7xl mx-auto", className)}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">
              Complete your purchase securely
            </p>
          </div>
          
          {onBack && currentStep === 'review' && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          )}
        </div>
        
        {/* Progress Steps */}
        {currentStep !== 'complete' && (
          <div className="flex items-center justify-between mb-6">
            {steps.slice(0, -1).map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    currentStep === step.id
                      ? "border-blue-600 bg-blue-600 text-white"
                      : step.completed
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-300 text-gray-500"
                  )}
                >
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:block">
                  {step.title}
                </span>
                {index < steps.length - 2 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 ml-4 transition-colors",
                      step.completed ? "bg-green-600" : "bg-gray-300"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        
        <Progress
          value={((currentStepIndex + 1) / steps.length) * 100}
          className="h-2"
        />
      </div>

      {error && currentStep !== 'payment' && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 'review' && renderReviewStep()}
          {currentStep === 'billing' && renderBillingStep()}
          {currentStep === 'payment' && renderPaymentStep()}
          {currentStep === 'complete' && renderCompleteStep()}
        </div>
        
        {/* Order Summary Sidebar */}
        {currentStep !== 'complete' && (
          <div className="lg:col-span-1">
            {renderOrderSummary()}
          </div>
        )}
      </div>
    </div>
  )
}