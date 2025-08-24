import { User } from '@supabase/supabase-js';
import { createServerSupabaseClient } from './supabase';
import { redirect } from 'next/navigation';

export type UserRole = 'coach' | 'client' | 'admin';

export interface AuthUser extends User {
  role?: UserRole;
  profile?: {
    full_name?: string;
    avatar_url?: string;
    role: UserRole;
  };
}

// Get current user on server
export async function getUser(): Promise<AuthUser | null> {
  const supabase = createServerSupabaseClient();
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Fetch user profile with role
  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  return {
    ...user,
    role: profile?.role,
    profile,
  };
}

// Require authentication (redirect if not authenticated)
export async function requireAuth(): Promise<AuthUser> {
  const user = await getUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return user;
}

// Require specific role (redirect if wrong role)
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!user.role || !allowedRoles.includes(user.role)) {
    redirect('/auth/unauthorized');
  }
  
  return user;
}

// Check if user has completed profile
export async function hasCompletedProfile(userId: string): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  
  const { data: user } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', userId)
    .single();

  if (!user || !user.role || !user.full_name) {
    return false;
  }

  if (user.role === 'coach') {
    const { data: coach } = await supabase
      .from('coaches')
      .select('business_name')
      .eq('user_id', userId)
      .single();
    
    return !!coach?.business_name;
  }

  if (user.role === 'client') {
    const { data: client } = await supabase
      .from('clients')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .single();
    
    return !!client?.onboarding_completed;
  }

  return true;
}

// Sign out helper
export async function signOut() {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/');
}