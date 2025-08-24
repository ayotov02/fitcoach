'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientWithDetails, ClientStatus } from '@/types/clients';
import { ClientMetrics } from './client-metrics';
import { ClientPhotos } from './client-photos';
import { ClientNotes } from './client-notes';
import { ClientSettings } from './client-settings';
import { 
  User, 
  MessageCircle, 
  Phone, 
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Edit,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientProfileProps {
  client: ClientWithDetails;
  onMessage?: (clientId: string) => void;
  onEditClient?: (clientId: string) => void;
  onUpdateClient?: (clientId: string, data: Partial<ClientWithDetails>) => void;
}

export function ClientProfile({ 
  client, 
  onMessage, 
  onEditClient,
  onUpdateClient 
}: ClientProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');

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
        return <CheckCircle className="h-4 w-4" />;
      case 'needs_attention':
        return <AlertTriangle className="h-4 w-4" />;
      case 'at_risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'paused':
        return <Clock className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getInitials = () => {
    const name = client.user?.full_name || client.user?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const calculateAge = () => {
    if (!client.date_of_birth) return null;
    const today = new Date();
    const birthDate = new Date(client.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getDaysSinceLastActivity = () => {
    if (!client.last_activity_date) return null;
    const days = Math.floor(
      (Date.now() - new Date(client.last_activity_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={client.user?.avatar_url} />
                <AvatarFallback className="bg-gradient-primary text-white text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold">
                    {client.user?.full_name || 'Unknown Client'}
                  </h1>
                  <Badge className={getStatusColor(client.status)}>
                    {getStatusIcon(client.status)}
                    <span className="ml-2 capitalize">{client.status.replace('_', ' ')}</span>
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{client.user?.email}</span>
                  </div>
                  {client.emergency_contact_phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{client.emergency_contact_phone}</span>
                    </div>
                  )}
                  {calculateAge() && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{calculateAge()} years old</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {client.fitness_level && (
                    <Badge variant="outline" className="capitalize">
                      {client.fitness_level} Level
                    </Badge>
                  )}
                  {client.primary_goal && (
                    <Badge variant="outline">
                      Goal: {client.primary_goal}
                    </Badge>
                  )}
                  {!client.onboarding_completed && (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      Setup Incomplete
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => onMessage?.(client.id)}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Message
              </Button>
              <Button variant="outline" onClick={() => onEditClient?.(client.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {client.goals?.filter(g => g.status === 'completed').length || 0}
              </div>
              <div className="text-sm text-gray-600">Goals Achieved</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {client.latest_measurement?.weight_kg 
                  ? `${client.latest_measurement.weight_kg}kg` 
                  : '--'}
              </div>
              <div className="text-sm text-gray-600">Current Weight</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {getDaysSinceLastActivity() !== null 
                  ? `${getDaysSinceLastActivity()}d` 
                  : '--'}
              </div>
              <div className="text-sm text-gray-600">Last Active</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {Math.floor(
                  (Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24)
                )}d
              </div>
              <div className="text-sm text-gray-600">Days as Client</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {client.occupation && (
                    <div>
                      <label className="text-gray-500">Occupation</label>
                      <p className="font-medium">{client.occupation}</p>
                    </div>
                  )}
                  {client.emergency_contact_name && (
                    <div>
                      <label className="text-gray-500">Emergency Contact</label>
                      <p className="font-medium">{client.emergency_contact_name}</p>
                    </div>
                  )}
                  {client.activity_level && (
                    <div>
                      <label className="text-gray-500">Activity Level</label>
                      <p className="font-medium capitalize">{client.activity_level.replace('_', ' ')}</p>
                    </div>
                  )}
                  {client.training_experience_years && (
                    <div>
                      <label className="text-gray-500">Training Experience</label>
                      <p className="font-medium">{client.training_experience_years} years</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Goals and Motivation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5" />
                  Goals & Motivation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-gray-500 text-sm">Primary Goal</label>
                  <p className="font-medium">{client.primary_goal}</p>
                </div>
                {client.secondary_goals && client.secondary_goals.length > 0 && (
                  <div>
                    <label className="text-gray-500 text-sm">Secondary Goals</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {client.secondary_goals.map((goal, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {client.motivation_factors && client.motivation_factors.length > 0 && (
                  <div>
                    <label className="text-gray-500 text-sm">Motivation Factors</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {client.motivation_factors.map((factor, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical Information */}
            {(client.medical_conditions?.length || client.injuries?.length || client.medications?.length) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {client.medical_conditions && client.medical_conditions.length > 0 && (
                    <div>
                      <label className="text-gray-500 text-sm">Medical Conditions</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {client.medical_conditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-red-600 border-red-200">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {client.injuries && client.injuries.length > 0 && (
                    <div>
                      <label className="text-gray-500 text-sm">Previous Injuries</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {client.injuries.map((injury, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-orange-600 border-orange-200">
                            {injury}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {client.medications && client.medications.length > 0 && (
                    <div>
                      <label className="text-gray-500 text-sm">Medications</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {client.medications.map((medication, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {medication}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm">
                    {client.medical_clearance ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className={client.medical_clearance ? 'text-green-600' : 'text-yellow-600'}>
                      Medical clearance {client.medical_clearance ? 'approved' : 'pending'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Training Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Training Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {client.workout_location_preference && (
                    <div>
                      <label className="text-gray-500">Preferred Location</label>
                      <p className="font-medium capitalize">{client.workout_location_preference}</p>
                    </div>
                  )}
                  {client.session_duration_preference && (
                    <div>
                      <label className="text-gray-500">Session Duration</label>
                      <p className="font-medium">{client.session_duration_preference} minutes</p>
                    </div>
                  )}
                </div>
                
                {client.preferred_workout_times && client.preferred_workout_times.length > 0 && (
                  <div>
                    <label className="text-gray-500 text-sm">Preferred Times</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {client.preferred_workout_times.map((time, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {client.available_days && client.available_days.length > 0 && (
                  <div>
                    <label className="text-gray-500 text-sm">Available Days</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {client.available_days.map((day, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {client.equipment_access && client.equipment_access.length > 0 && (
                  <div>
                    <label className="text-gray-500 text-sm">Available Equipment</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {client.equipment_access.map((equipment, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {equipment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="progress">
          <ClientMetrics client={client} onUpdateClient={onUpdateClient} />
        </TabsContent>
        
        <TabsContent value="photos">
          <ClientPhotos client={client} onUpdateClient={onUpdateClient} />
        </TabsContent>
        
        <TabsContent value="notes">
          <ClientNotes client={client} onUpdateClient={onUpdateClient} />
        </TabsContent>
        
        <TabsContent value="settings">
          <ClientSettings client={client} onUpdateClient={onUpdateClient} />
        </TabsContent>
      </Tabs>
    </div>
  );
}