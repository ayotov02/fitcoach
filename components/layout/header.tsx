'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth/supabase-client';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface UserData {
  role: 'coach' | 'client' | 'admin';
  full_name?: string;
}

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('role, full_name')
          .eq('id', user.id)
          .single();
        setUserData(data);
      }
      
      setIsLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const { data } = await supabase
          .from('users')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single();
        setUserData(data);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserData(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!userData?.role) return '/dashboard';
    return userData.role === 'coach' ? '/coach/dashboard' : '/client/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary" />
            <span className="font-bold text-xl">FitCoach</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {user && (
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link
                href={getDashboardLink()}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Dashboard
              </Link>
              {userData?.role === 'coach' && (
                <>
                  <Link
                    href="/coach/clients"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Clients
                  </Link>
                  <Link
                    href="/coach/workouts"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Workouts
                  </Link>
                  <Link
                    href="/coach/analytics"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Analytics
                  </Link>
                </>
              )}
              {userData?.role === 'client' && (
                <>
                  <Link
                    href="/client/workouts"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    My Workouts
                  </Link>
                  <Link
                    href="/client/progress"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Progress
                  </Link>
                </>
              )}
            </nav>
          )}
          
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse bg-muted rounded" />
            ) : user ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>{userData?.full_name || user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:ml-2 sm:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}