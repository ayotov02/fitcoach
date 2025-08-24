'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase,
  Heart,
  Target,
  Activity,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const personalInfoSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  occupation: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

const healthInfoSchema = z.object({
  medical_conditions: z.array(z.string()).default([]),
  injuries: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  medical_clearance: z.boolean().default(false),
  additional_health_notes: z.string().optional(),
});

const fitnessProfileSchema = z.object({
  fitness_level: z.enum(['beginner', 'intermediate', 'advanced']),
  training_experience_years: z.number().min(0).max(50),
  activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']),
  primary_goal: z.string().min(1, 'Primary goal is required'),
  secondary_goals: z.array(z.string()).default([]),
  motivation_factors: z.array(z.string()).default([]),
});

const preferencesSchema = z.object({
  workout_location_preference: z.enum(['home', 'gym', 'outdoor', 'hybrid']),
  session_duration_preference: z.number().min(15).max(180),
  preferred_workout_times: z.array(z.string()).default([]),
  available_days: z.array(z.string()).default([]),
  equipment_access: z.array(z.string()).default([]),
  dietary_restrictions: z.array(z.string()).default([]),
  communication_preference: z.enum(['email', 'sms', 'app']),
});

interface AddClientFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AddClientForm({ onSubmit, onCancel, isLoading }: AddClientFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [customInputs, setCustomInputs] = useState({
    medical_condition: '',
    injury: '',
    medication: '',
    secondary_goal: '',
    motivation_factor: '',
    equipment: '',
    dietary_restriction: '',
  });

  const steps = [
    { title: 'Personal Information', description: 'Basic client details' },
    { title: 'Health & Medical', description: 'Medical history and conditions' },
    { title: 'Fitness Profile', description: 'Experience and goals' },
    { title: 'Preferences', description: 'Training and communication preferences' },
    { title: 'Review & Submit', description: 'Confirm all information' },
  ];

  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: 'prefer_not_to_say' as const,
      occupation: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
    },
  });

  const healthForm = useForm({
    resolver: zodResolver(healthInfoSchema),
    defaultValues: {
      medical_conditions: [],
      injuries: [],
      medications: [],
      medical_clearance: false,
      additional_health_notes: '',
    },
  });

  const fitnessForm = useForm({
    resolver: zodResolver(fitnessProfileSchema),
    defaultValues: {
      fitness_level: 'beginner' as const,
      training_experience_years: 0,
      activity_level: 'moderately_active' as const,
      primary_goal: '',
      secondary_goals: [],
      motivation_factors: [],
    },
  });

  const preferencesForm = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      workout_location_preference: 'gym' as const,
      session_duration_preference: 60,
      preferred_workout_times: [],
      available_days: [],
      equipment_access: [],
      dietary_restrictions: [],
      communication_preference: 'email' as const,
    },
  });

  const getAllFormData = () => {
    return {
      ...personalForm.getValues(),
      ...healthForm.getValues(),
      ...fitnessForm.getValues(),
      ...preferencesForm.getValues(),
    };
  };

  const handleNext = async () => {
    let isValid = false;
    
    switch (currentStep) {
      case 0:
        isValid = await personalForm.trigger();
        break;
      case 1:
        isValid = await healthForm.trigger();
        break;
      case 2:
        isValid = await fitnessForm.trigger();
        break;
      case 3:
        isValid = await preferencesForm.trigger();
        break;
      default:
        isValid = true;
    }
    
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const formData = getAllFormData();
    onSubmit(formData);
  };

  const addCustomItem = (field: string, value: string, formInstance: any) => {
    if (value.trim()) {
      const currentItems = formInstance.getValues(field) || [];
      formInstance.setValue(field, [...currentItems, value.trim()]);
      setCustomInputs(prev => ({ ...prev, [field.split('_')[0] || field]: '' }));
    }
  };

  const removeItem = (field: string, index: number, formInstance: any) => {
    const currentItems = formInstance.getValues(field) || [];
    formInstance.setValue(field, currentItems.filter((_: any, i: number) => i !== index));
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Add New Client</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </div>
            <Button variant="ghost" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
          
          <div className="flex space-x-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  'flex-1 text-center py-2 px-3 text-xs rounded-lg transition-colors',
                  index === currentStep
                    ? 'bg-primary text-white'
                    : index < currentStep
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                {step.title}
                {index < currentStep && <Check className="inline ml-1 h-3 w-3" />}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 0 && (
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    {...personalForm.register('full_name')}
                    className="mt-1"
                  />
                  {personalForm.formState.errors.full_name && (
                    <p className="text-sm text-red-600 mt-1">
                      {personalForm.formState.errors.full_name.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...personalForm.register('email')}
                    className="mt-1"
                  />
                  {personalForm.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {personalForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...personalForm.register('phone')}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    {...personalForm.register('date_of_birth')}
                    className="mt-1"
                  />
                  {personalForm.formState.errors.date_of_birth && (
                    <p className="text-sm text-red-600 mt-1">
                      {personalForm.formState.errors.date_of_birth.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => personalForm.setValue('gender', value as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    {...personalForm.register('occupation')}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      {...personalForm.register('emergency_contact_name')}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                    <Input
                      id="emergency_contact_phone"
                      type="tel"
                      {...personalForm.register('emergency_contact_phone')}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Step 2: Health & Medical */}
          {currentStep === 1 && (
            <form className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center">
                  <Heart className="mr-2 h-4 w-4 text-red-500" />
                  Medical Conditions
                </h4>
                <div className="flex space-x-2">
                  <Input
                    value={customInputs.medical_condition}
                    onChange={(e) => setCustomInputs(prev => ({ ...prev, medical_condition: e.target.value }))}
                    placeholder="Add medical condition..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => addCustomItem('medical_conditions', customInputs.medical_condition, healthForm)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {healthForm.watch('medical_conditions')?.map((condition, index) => (
                    <Badge key={index} variant="outline" className="text-red-600 border-red-200">
                      {condition}
                      <button
                        type="button"
                        onClick={() => removeItem('medical_conditions', index, healthForm)}
                        className="ml-1 hover:text-red-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Previous Injuries</h4>
                <div className="flex space-x-2">
                  <Input
                    value={customInputs.injury}
                    onChange={(e) => setCustomInputs(prev => ({ ...prev, injury: e.target.value }))}
                    placeholder="Add previous injury..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => addCustomItem('injuries', customInputs.injury, healthForm)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {healthForm.watch('injuries')?.map((injury, index) => (
                    <Badge key={index} variant="outline" className="text-orange-600 border-orange-200">
                      {injury}
                      <button
                        type="button"
                        onClick={() => removeItem('injuries', index, healthForm)}
                        className="ml-1 hover:text-orange-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Current Medications</h4>
                <div className="flex space-x-2">
                  <Input
                    value={customInputs.medication}
                    onChange={(e) => setCustomInputs(prev => ({ ...prev, medication: e.target.value }))}
                    placeholder="Add medication..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => addCustomItem('medications', customInputs.medication, healthForm)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {healthForm.watch('medications')?.map((medication, index) => (
                    <Badge key={index} variant="outline">
                      {medication}
                      <button
                        type="button"
                        onClick={() => removeItem('medications', index, healthForm)}
                        className="ml-1 hover:text-gray-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="medical_clearance"
                  checked={healthForm.watch('medical_clearance')}
                  onCheckedChange={(checked) => healthForm.setValue('medical_clearance', !!checked)}
                />
                <Label htmlFor="medical_clearance" className="text-sm">
                  Client has medical clearance to participate in physical activity
                </Label>
              </div>
              
              <div>
                <Label htmlFor="additional_health_notes">Additional Health Notes</Label>
                <Textarea
                  id="additional_health_notes"
                  {...healthForm.register('additional_health_notes')}
                  placeholder="Any additional health information, allergies, or special considerations..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </form>
          )}

          {/* Step 3: Fitness Profile */}
          {currentStep === 2 && (
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fitness_level">Fitness Level *</Label>
                  <Select onValueChange={(value) => fitnessForm.setValue('fitness_level', value as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select fitness level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="training_experience_years">Training Experience (years) *</Label>
                  <Input
                    id="training_experience_years"
                    type="number"
                    min="0"
                    max="50"
                    {...fitnessForm.register('training_experience_years', { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="activity_level">Current Activity Level</Label>
                  <Select onValueChange={(value) => fitnessForm.setValue('activity_level', value as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                      <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                      <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                      <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                      <SelectItem value="extremely_active">Extremely Active (2x/day or intense training)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="primary_goal">Primary Goal *</Label>
                  <Input
                    id="primary_goal"
                    {...fitnessForm.register('primary_goal')}
                    placeholder="e.g., Lose 20 pounds, Build muscle, Improve endurance..."
                    className="mt-1"
                  />
                  {fitnessForm.formState.errors.primary_goal && (
                    <p className="text-sm text-red-600 mt-1">
                      {fitnessForm.formState.errors.primary_goal.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Secondary Goals</h4>
                <div className="flex space-x-2">
                  <Input
                    value={customInputs.secondary_goal}
                    onChange={(e) => setCustomInputs(prev => ({ ...prev, secondary_goal: e.target.value }))}
                    placeholder="Add secondary goal..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => addCustomItem('secondary_goals', customInputs.secondary_goal, fitnessForm)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fitnessForm.watch('secondary_goals')?.map((goal, index) => (
                    <Badge key={index} variant="outline">
                      {goal}
                      <button
                        type="button"
                        onClick={() => removeItem('secondary_goals', index, fitnessForm)}
                        className="ml-1 hover:text-gray-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Motivation Factors</h4>
                <div className="flex space-x-2">
                  <Input
                    value={customInputs.motivation_factor}
                    onChange={(e) => setCustomInputs(prev => ({ ...prev, motivation_factor: e.target.value }))}
                    placeholder="What motivates this client? (e.g., health, appearance, confidence...)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => addCustomItem('motivation_factors', customInputs.motivation_factor, fitnessForm)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fitnessForm.watch('motivation_factors')?.map((factor, index) => (
                    <Badge key={index} variant="secondary">
                      {factor}
                      <button
                        type="button"
                        onClick={() => removeItem('motivation_factors', index, fitnessForm)}
                        className="ml-1 hover:text-gray-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 3 && (
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="workout_location_preference">Preferred Workout Location</Label>
                  <Select onValueChange={(value) => preferencesForm.setValue('workout_location_preference', value as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="gym">Gym</SelectItem>
                      <SelectItem value="outdoor">Outdoor</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="session_duration_preference">Preferred Session Duration (minutes)</Label>
                  <Input
                    id="session_duration_preference"
                    type="number"
                    min="15"
                    max="180"
                    {...preferencesForm.register('session_duration_preference', { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="communication_preference">Preferred Communication Method</Label>
                  <Select onValueChange={(value) => preferencesForm.setValue('communication_preference', value as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select communication preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="app">In-App Messages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Available Equipment</h4>
                <div className="flex space-x-2">
                  <Input
                    value={customInputs.equipment}
                    onChange={(e) => setCustomInputs(prev => ({ ...prev, equipment: e.target.value }))}
                    placeholder="Add available equipment..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => addCustomItem('equipment_access', customInputs.equipment, preferencesForm)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {preferencesForm.watch('equipment_access')?.map((equipment, index) => (
                    <Badge key={index} variant="secondary">
                      {equipment}
                      <button
                        type="button"
                        onClick={() => removeItem('equipment_access', index, preferencesForm)}
                        className="ml-1 hover:text-gray-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Dietary Restrictions</h4>
                <div className="flex space-x-2">
                  <Input
                    value={customInputs.dietary_restriction}
                    onChange={(e) => setCustomInputs(prev => ({ ...prev, dietary_restriction: e.target.value }))}
                    placeholder="Add dietary restriction..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => addCustomItem('dietary_restrictions', customInputs.dietary_restriction, preferencesForm)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {preferencesForm.watch('dietary_restrictions')?.map((restriction, index) => (
                    <Badge key={index} variant="outline">
                      {restriction}
                      <button
                        type="button"
                        onClick={() => removeItem('dietary_restrictions', index, preferencesForm)}
                        className="ml-1 hover:text-gray-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Review Client Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div><strong>Name:</strong> {personalForm.getValues('full_name')}</div>
                    <div><strong>Email:</strong> {personalForm.getValues('email')}</div>
                    <div><strong>Phone:</strong> {personalForm.getValues('phone') || 'Not provided'}</div>
                    <div><strong>DOB:</strong> {personalForm.getValues('date_of_birth')}</div>
                    <div><strong>Gender:</strong> {personalForm.getValues('gender')?.replace('_', ' ')}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Target className="mr-2 h-4 w-4" />
                      Fitness Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div><strong>Primary Goal:</strong> {fitnessForm.getValues('primary_goal')}</div>
                    <div><strong>Fitness Level:</strong> {fitnessForm.getValues('fitness_level')}</div>
                    <div><strong>Experience:</strong> {fitnessForm.getValues('training_experience_years')} years</div>
                    <div><strong>Activity Level:</strong> {fitnessForm.getValues('activity_level')?.replace('_', ' ')}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Heart className="mr-2 h-4 w-4" />
                      Health Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div><strong>Medical Clearance:</strong> {healthForm.getValues('medical_clearance') ? 'Yes' : 'No'}</div>
                    <div><strong>Medical Conditions:</strong> {healthForm.getValues('medical_conditions')?.length || 0}</div>
                    <div><strong>Previous Injuries:</strong> {healthForm.getValues('injuries')?.length || 0}</div>
                    <div><strong>Medications:</strong> {healthForm.getValues('medications')?.length || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div><strong>Location:</strong> {preferencesForm.getValues('workout_location_preference')}</div>
                    <div><strong>Session Duration:</strong> {preferencesForm.getValues('session_duration_preference')} min</div>
                    <div><strong>Communication:</strong> {preferencesForm.getValues('communication_preference')}</div>
                    <div><strong>Equipment Available:</strong> {preferencesForm.getValues('equipment_access')?.length || 0} items</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>

        <div className="flex items-center justify-between p-6 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onCancel : handlePrevious}
            disabled={isLoading}
          >
            {currentStep === 0 ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </>
            )}
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={isLoading}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Creating Client...' : 'Create Client'}
              <Check className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}