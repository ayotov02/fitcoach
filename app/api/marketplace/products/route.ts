import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/marketplace/products - Get all marketplace products with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const coachId = searchParams.get('coach_id')
    const featured = searchParams.get('featured')
    
    let query = supabase
      .from('marketplace_products')
      .select(`
        *,
        coaches!inner(
          id,
          user_id,
          business_name,
          rating,
          verified,
          users!inner(
            full_name,
            avatar_url
          )
        )
      `)
      .eq('status', 'active')
    
    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%, description.ilike.%${search}%, tags.cs.{${search}}`)
    }
    
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }
    
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }
    
    if (coachId) {
      query = query.eq('coach_id', coachId)
    }
    
    if (featured === 'true') {
      query = query.eq('featured', true)
    }
    
    // Apply sorting
    const validSortFields = ['created_at', 'price', 'average_rating', 'purchase_count', 'view_count', 'name']
    const sortField = validSortFields.includes(sort) ? sort : 'created_at'
    const sortOrder = order === 'asc' ? { ascending: true } : { ascending: false }
    
    query = query.order(sortField, sortOrder)
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1)
    
    const { data: products, error, count } = await query
    
    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      products: products || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_next: count ? count > offset + limit : false,
        has_prev: offset > 0
      }
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/marketplace/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get coach profile
    const { data: coach, error: coachError } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    if (coachError || !coach) {
      return NextResponse.json(
        { error: 'Coach profile not found' },
        { status: 404 }
      )
    }
    
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['product_type', 'name', 'description', 'price', 'category']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Generate unique slug
    const baseSlug = body.name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim()
    
    let slug = baseSlug
    let counter = 1
    
    // Ensure slug uniqueness
    while (true) {
      const { data: existingProduct } = await supabase
        .from('marketplace_products')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
      
      if (!existingProduct) break
      
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    // Prepare product data
    const productData = {
      coach_id: coach.id,
      product_type: body.product_type,
      name: body.name,
      slug: slug,
      description: body.description,
      short_description: body.short_description || body.description.substring(0, 200),
      price: parseFloat(body.price),
      currency: body.currency || 'USD',
      category: body.category,
      status: 'draft', // Always start as draft
      featured: false,
      tags: body.tags || [],
      cover_image_url: body.cover_image_url,
      gallery_images: body.gallery_images || [],
      file_urls: body.file_urls || [],
      is_subscription: body.is_subscription || false,
      billing_interval: body.billing_interval,
      trial_days: body.trial_days || 0
    }
    
    const { data: product, error: createError } = await supabase
      .from('marketplace_products')
      .insert([productData])
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
    
    if (createError) {
      console.error('Error creating product:', createError)
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ product }, { status: 201 })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}