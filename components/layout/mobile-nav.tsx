'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/auth/supabase';
import { UserRole } from '@/lib/auth/auth-helpers';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  Dumbbell,
  Apple,
  Settings,
  TrendingUp,
  MessageCircle,
  BarChart3,
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function MobileNav() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(data?.role || null);
      }
    };

    getUserRole();
  }, [supabase]);

  // Simplified navigation for mobile bottom tabs (max 5 items)
  const coachNavigation: NavigationItem[] = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Clients', href: '/dashboard/clients', icon: Users },
    { name: 'Workouts', href: '/dashboard/workouts', icon: Dumbbell },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const clientNavigation: NavigationItem[] = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Workouts', href: '/dashboard/workouts', icon: Dumbbell },
    { name: 'Nutrition', href: '/dashboard/nutrition', icon: Apple },
    { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
    { name: 'Chat', href: '/dashboard/chat', icon: MessageCircle, badge: 2 },
  ];

  const navigation = userRole === 'coach' ? coachNavigation : clientNavigation;

  return (
    <div className="lg:hidden">
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all duration-200 relative',
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5 mb-1" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent-green text-white text-xs flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-20" />
    </div>
  );
}