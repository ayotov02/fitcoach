'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ClientWithDetails, ClientStatus } from '@/types/clients';
import { 
  MessageCircle, 
  TrendingUp, 
  Calendar,
  Phone,
  Mail,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientCardProps {
  client: ClientWithDetails;
  viewMode?: 'grid' | 'list';
  onMessage?: (clientId: string) => void;
  onViewProgress?: (clientId: string) => void;
  onEditClient?: (clientId: string) => void;
}

export function ClientCard({ 
  client, 
  viewMode = 'grid',
  onMessage,
  onViewProgress,
  onEditClient 
}: ClientCardProps) {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: ClientStatus) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      needs_attention: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      at_risk: 'bg-red-100 text-red-800 border-red-200',
      paused: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[status] || colors.inactive;
  };

  const getStatusIcon = (status: ClientStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'needs_attention':
        return <AlertTriangle className="h-3 w-3" />;
      case 'at_risk':
        return <AlertTriangle className="h-3 w-3" />;
      case 'paused':
        return <Clock className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getRiskIndicator = () => {
    if (client.risk_level === 'high') {
      return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />;
    }
    if (client.risk_level === 'medium') {
      return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
    }
    return <div className="w-2 h-2 bg-green-500 rounded-full" />;
  };

  const getInitials = () => {
    const name = client.user?.full_name || client.user?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getDaysSinceLastActivity = () => {
    if (!client.last_activity_date) return null;
    const days = Math.floor(
      (Date.now() - new Date(client.last_activity_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const getProgressSummary = () => {
    const completedGoals = client.goals?.filter(g => g.status === 'completed').length || 0;
    const totalGoals = client.goals?.length || 0;
    const weightProgress = client.progress_summary?.total_weight_lost;
    
    return {
      goals: `${completedGoals}/${totalGoals} goals`,
      weight: weightProgress ? `${weightProgress}kg lost` : 'No weight data',
    };
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Client Info */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={client.user?.avatar_url} />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1">
                  {getRiskIndicator()}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-lg truncate">
                    {client.user?.full_name || 'Unknown Client'}
                  </h3>
                  <Badge className={getStatusColor(client.status)}>
                    {getStatusIcon(client.status)}
                    <span className="ml-1 capitalize">{client.status.replace('_', ' ')}</span>
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 truncate">{client.user?.email}</p>
                <p className="text-xs text-gray-500">
                  Goal: {client.primary_goal} • 
                  Level: {client.fitness_level ? ` ${client.fitness_level}` : ' Unknown'}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="font-medium">{getProgressSummary().goals}</div>
                <div className="text-gray-500">Goals</div>
              </div>
              <div className="text-center">
                <div className="font-medium">
                  {client.latest_measurement?.weight_kg 
                    ? `${client.latest_measurement.weight_kg}kg` 
                    : '--'}
                </div>
                <div className="text-gray-500">Weight</div>
              </div>
              <div className="text-center">
                <div className="font-medium">
                  {getDaysSinceLastActivity() !== null 
                    ? `${getDaysSinceLastActivity()}d` 
                    : '--'}
                </div>
                <div className="text-gray-500">Last Active</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onMessage?.(client.id)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Link href={`/dashboard/clients/${client.id}`}>
                <Button size="sm">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={client.user?.avatar_url} />
                <AvatarFallback className="bg-gradient-primary text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1">
                {getRiskIndicator()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {client.user?.full_name || 'Unknown Client'}
              </h3>
              <p className="text-sm text-gray-600 truncate">{client.user?.email}</p>
            </div>
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            
            {showActions && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg border z-20">
                  <button 
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClient?.(client.id);
                      setShowActions(false);
                    }}
                  >
                    Edit Client
                  </button>
                  <button 
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add archive functionality
                      setShowActions(false);
                    }}
                  >
                    Archive
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(client.status)}>
            {getStatusIcon(client.status)}
            <span className="ml-1 capitalize">{client.status.replace('_', ' ')}</span>
          </Badge>
          {!client.onboarding_completed && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Setup Needed
            </Badge>
          )}
        </div>

        {/* Client Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Goal:</span>
            <p className="font-medium truncate" title={client.primary_goal}>
              {client.primary_goal}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Level:</span>
            <p className="font-medium capitalize">
              {client.fitness_level || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Goals Progress</span>
            <span className="font-medium">{getProgressSummary().goals}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${client.goals?.length ? 
                  ((client.goals.filter(g => g.status === 'completed').length / client.goals.length) * 100) : 0}%` 
              }}
            />
          </div>
        </div>

        {/* Last Activity */}
        {client.last_activity_date && (
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              Last active: {getDaysSinceLastActivity() === 0 ? 'Today' : 
                getDaysSinceLastActivity() === 1 ? 'Yesterday' : 
                `${getDaysSinceLastActivity()} days ago`}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onMessage?.(client.id);
            }}
          >
            <MessageCircle className="mr-2 h-3 w-3" />
            Message
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onViewProgress?.(client.id);
            }}
          >
            <TrendingUp className="mr-2 h-3 w-3" />
            Progress
          </Button>
        </div>

        {/* Quick Contact */}
        <div className="flex justify-center space-x-4 pt-2 border-t">
          <button className="p-2 text-gray-400 hover:text-primary transition-colors">
            <Mail className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-primary transition-colors">
            <Phone className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
      
      <Link href={`/dashboard/clients/${client.id}`} className="absolute inset-0" />
    </Card>
  );
}