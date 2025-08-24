import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/marketplace/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { id } = params
    
    const { data: product, error } = await supabase
      .from('marketplace_products')
      .select(`
        *,
        coaches!inner(
          id,
          user_id,
          business_name,
          bio,
          specialties,
          certifications,
          years_experience,
          rating,
          total_clients,
          verified,
          users!inner(
            full_name,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .eq('status', 'active')
      .single()
    
    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Increment view count
    await supabase
      .from('marketplace_products')
      .update({ view_count: (product.view_count || 0) + 1 })
      .eq('id', id)
    
    // Get reviews
    const { data: reviews } = await supabase
      .from('marketplace_reviews')
      .select(`
        *,
        users!inner(
          full_name,
          avatar_url
        )
      `)
      .eq('product_id', id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(10)
    
    // Get related products (same category, different coach)
    const { data: relatedProducts } = await supabase
      .from('marketplace_products')
      .select(`
        id,
        name,
        slug,
        price,
        currency,
        cover_image_url,
        average_rating,
        coaches!inner(
          business_name,
          users!inner(
            full_name
          )
        )
      `)
      .eq('category', product.category)
      .neq('coach_id', product.coach_id)
      .eq('status', 'active')
      .order('average_rating', { ascending: false })
      .limit(4)
    
    return NextResponse.json({
      product,
      reviews: reviews || [],
      related_products: relatedProducts || []
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/marketplace/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { id } = params
    const body = await request.json()
    
    // Check if user owns this product
    const { data: product, error: productError } = await supabase
      .from('marketplace_products')
      .select(`
        *,
        coaches!inner(
          user_id
        )
      `)
      .eq('id', id)
      .single()
    
    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    if (product.coaches.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only update your own products' },
        { status: 403 }
      )
    }
    
    // Prepare update data (exclude read-only fields)
    const updateData: any = {}
    const allowedFields = [
      'name', 'description', 'short_description', 'price', 'currency',
      'category', 'status', 'tags', 'cover_image_url', 'gallery_images',
      'file_urls', 'is_subscription', 'billing_interval', 'trial_days'
    ]
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })
    
    // Handle slug update if name changed
    if (body.name && body.name !== product.name) {
      const baseSlug = body.name.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      
      let slug = baseSlug
      let counter = 1
      
      while (true) {
        const { data: existingProduct } = await supabase
          .from('marketplace_products')
          .select('id')
          .eq('slug', slug)
          .neq('id', id) // Exclude current product
          .maybeSingle()
        
        if (!existingProduct) break
        
        slug = `${baseSlug}-${counter}`
        counter++
      }
      
      updateData.slug = slug
    }
    
    // Ensure price is a number
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price)
    }
    
    const { data: updatedProduct, error: updateError } = await supabase
      .from('marketplace_products')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        coaches!inner(
          id,
          business_name,
          users!inner(
            full_name,
            avatar_url
          )
        )
      `)
      .single()
    
    if (updateError) {
      console.error('Error updating product:', updateError)
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ product: updatedProduct })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/marketplace/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { id } = params
    
    // Check if user owns this product
    const { data: product, error: productError } = await supabase
      .from('marketplace_products')
      .select(`
        *,
        coaches!inner(
          user_id
        )
      `)
      .eq('id', id)
      .single()
    
    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    if (product.coaches.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own products' },
        { status: 403 }
      )
    }
    
    // Check if product has any orders
    const { data: orders, error: ordersError } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', id)
      .limit(1)
    
    if (ordersError) {
      return NextResponse.json(
        { error: 'Error checking product orders' },
        { status: 500 }
      )
    }
    
    if (orders && orders.length > 0) {
      // Archive instead of delete if there are orders
      const { error: archiveError } = await supabase
        .from('marketplace_products')
        .update({ status: 'archived' })
        .eq('id', id)
      
      if (archiveError) {
        return NextResponse.json(
          { error: 'Failed to archive product' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ 
        message: 'Product archived successfully (has existing orders)' 
      })
    } else {
      // Safe to delete
      const { error: deleteError } = await supabase
        .from('marketplace_products')
        .delete()
        .eq('id', id)
      
      if (deleteError) {
        return NextResponse.json(
          { error: 'Failed to delete product' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ 
        message: 'Product deleted successfully' 
      })
    }
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}