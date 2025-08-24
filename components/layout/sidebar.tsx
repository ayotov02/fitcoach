'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/auth/supabase';
import { UserRole } from '@/lib/auth/auth-helpers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Home,
  Users,
  Dumbbell,
  Apple,
  Brain,
  Store,
  BarChart3,
  Settings,
  TrendingUp,
  MessageCircle,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ 
  isCollapsed, 
  onToggle, 
  isMobile = false, 
  isOpen = false, 
  onClose 
}: SidebarProps) {
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

  const coachNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Clients', href: '/dashboard/clients', icon: Users },
    { name: 'Workouts', href: '/dashboard/workouts', icon: Dumbbell },
    { name: 'Nutrition', href: '/dashboard/nutrition', icon: Apple },
    { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Brain, badge: 3 },
    { name: 'Marketplace', href: '/dashboard/marketplace', icon: Store },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const clientNavigation: NavigationItem[] = [
    { name: 'My Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Workouts', href: '/dashboard/workouts', icon: Dumbbell },
    { name: 'My Nutrition', href: '/dashboard/nutrition', icon: Apple },
    { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
    { name: 'Chat with Coach', href: '/dashboard/chat', icon: MessageCircle, badge: 2 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const navigation = userRole === 'coach' ? coachNavigation : clientNavigation;

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary" />
            <span className="text-xl font-bold">FitCoach</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={isMobile ? onClose : onToggle}
          className="h-8 w-8"
        >
          {isMobile ? (
            <X className="h-4 w-4" />
          ) : isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                isCollapsed && !isMobile && 'justify-center px-2'
              )}
            >
              <item.icon className={cn(
                'flex-shrink-0',
                isCollapsed && !isMobile ? 'h-6 w-6' : 'mr-3 h-5 w-5'
              )} />
              {(!isCollapsed || isMobile) && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-accent-green text-white'
                    )}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className={cn(
          'flex items-center',
          isCollapsed && !isMobile ? 'justify-center' : 'space-x-3'
        )}>
          <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
            {userRole === 'coach' ? 'C' : 'M'}
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userRole === 'coach' ? 'Coach Account' : 'Member Account'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userRole === 'coach' ? 'Premium Plan' : 'Basic Plan'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={onClose}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-80 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-full flex-col">
            {sidebarContent}
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className={cn(
        'hidden bg-white/80 backdrop-blur-xl border-r border-gray-200/50 transition-all duration-300 lg:flex lg:flex-col lg:fixed lg:inset-y-0',
        isCollapsed ? 'lg:w-20' : 'lg:w-80'
      )}
    >
      {sidebarContent}
    </div>
  );
}