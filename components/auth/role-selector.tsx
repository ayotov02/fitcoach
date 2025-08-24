'use client';

import { UserRole } from '@/lib/auth/auth-helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
  className?: string;
}

export function RoleSelector({ selectedRole, onRoleSelect, className }: RoleSelectorProps) {
  const roles = [
    {
      value: 'coach' as const,
      label: 'Fitness Coach',
      description: 'I want to manage clients and create workout programs',
      icon: Users,
      features: [
        'Manage multiple clients',
        'Create custom workout plans',
        'Track client progress',
        'AI-powered recommendations',
      ],
    },
    {
      value: 'client' as const,
      label: 'Client',
      description: 'I want to work with a coach and follow workout programs',
      icon: User,
      features: [
        'Connect with certified coaches',
        'Get personalized workout plans',
        'Track your progress',
        'Access to nutrition guidance',
      ],
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Choose your role</h2>
        <p className="text-muted-foreground">
          Select how you'll be using FitCoach
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.value;

          return (
            <Card
              key={role.value}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-primary border-primary'
              )}
              onClick={() => onRoleSelect(role.value)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{role.label}</CardTitle>
                    <CardDescription className="text-sm">
                      {role.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {role.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <div className="mr-2 h-1.5 w-1.5 bg-accent-green rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedRole && (
        <div className="text-center">
          <Button
            onClick={() => onRoleSelect(selectedRole)}
            size="lg"
            className="w-full md:w-auto"
          >
            Continue as {selectedRole === 'coach' ? 'Fitness Coach' : 'Client'}
          </Button>
        </div>
      )}
    </div>
  );
}