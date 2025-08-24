'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ClientWithDetails, ClientStatus } from '@/types/clients';
import { 
  Settings, 
  Bell, 
  Mail,
  MessageSquare,
  Calendar,
  Target,
  AlertTriangle,
  Save,
  Trash2,
  UserX,
  Archive,
  RotateCcw,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientSettingsProps {
  client: ClientWithDetails;
  onUpdateClient?: (clientId: string, data: Partial<ClientWithDetails>) => void;
}

export function ClientSettings({ client, onUpdateClient }: ClientSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [settings, setSettings] = useState({
    // Communication preferences
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    weekly_progress_email: true,
    workout_reminders: true,
    appointment_reminders: true,
    
    // Privacy settings
    progress_photos_visible: true,
    measurements_visible: true,
    goals_visible: true,
    notes_visible: false,
    
    // Training preferences
    preferred_communication_method: 'email' as 'email' | 'sms' | 'app',
    reminder_frequency: 'daily' as 'never' | 'daily' | 'weekly',
    session_reminder_hours: 24,
    
    // Status and billing
    status: client.status,
    billing_status: 'active' as 'active' | 'overdue' | 'suspended',
    auto_renew: true,
    
    // Custom settings
    custom_notes: '',
    emergency_contact_can_view: false,
  });

  const handleSaveSettings = async () => {
    // In real app, this would call API
    console.log('Saving client settings:', settings);
    onUpdateClient?.(client.id, {
      // Map settings to client properties
      status: settings.status,
    });
    setIsEditing(false);
  };

  const handleStatusChange = async (newStatus: ClientStatus) => {
    const confirmMessage = getStatusChangeConfirmation(client.status, newStatus);
    if (confirmMessage && !confirm(confirmMessage)) return;
    
    setSettings(prev => ({ ...prev, status: newStatus }));
    // In real app, would immediately update status
    onUpdateClient?.(client.id, { status: newStatus });
  };

  const getStatusChangeConfirmation = (current: ClientStatus, target: ClientStatus) => {
    if (target === 'inactive') {
      return 'This will deactivate the client and stop all notifications. Continue?';
    }
    if (target === 'at_risk') {
      return 'This will mark the client as at-risk and trigger additional monitoring. Continue?';
    }
    return null;
  };

  const getStatusColor = (status: ClientStatus) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      needs_attention: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      at_risk: 'bg-red-100 text-red-800 border-red-200',
      paused: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[status];
  };

  const handleArchiveClient = async () => {
    if (!confirm('Archive this client? They will be hidden from active lists but data will be preserved.')) return;
    
    console.log('Archiving client:', client.id);
    onUpdateClient?.(client.id, { status: 'inactive' });
  };

  const handleDeleteClient = async () => {
    const confirmation = prompt(
      'WARNING: This will permanently delete all client data including progress photos, measurements, and notes.\n\nType "DELETE" to confirm:'
    );
    
    if (confirmation !== 'DELETE') return;
    
    console.log('Deleting client:', client.id);
    // In real app, would call delete API
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Client Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Client Status
          </CardTitle>
          <CardDescription>
            Manage the client's current status and access level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Current Status</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getStatusColor(settings.status)}>
                  {settings.status.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-gray-500">
                  Since {new Date(client.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Select value={settings.status} onValueChange={(value: ClientStatus) => handleStatusChange(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="needs_attention">Needs Attention</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-gray-500">Last Activity</Label>
              <p className="font-medium">
                {client.last_activity_date 
                  ? new Date(client.last_activity_date).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
            <div>
              <Label className="text-gray-500">Member Since</Label>
              <p className="font-medium">
                {new Date(client.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Communication & Notifications
          </CardTitle>
          <CardDescription>
            Configure how and when to contact this client
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Notification Preferences</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, email_notifications: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={settings.sms_notifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, sms_notifications: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={settings.push_notifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, push_notifications: checked }))
                    }
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Automated Communications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-progress">Weekly Progress Email</Label>
                  <Switch
                    id="weekly-progress"
                    checked={settings.weekly_progress_email}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, weekly_progress_email: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="workout-reminders">Workout Reminders</Label>
                  <Switch
                    id="workout-reminders"
                    checked={settings.workout_reminders}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, workout_reminders: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="appointment-reminders">Appointment Reminders</Label>
                  <Switch
                    id="appointment-reminders"
                    checked={settings.appointment_reminders}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, appointment_reminders: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Preferred Contact Method</Label>
              <Select 
                value={settings.preferred_communication_method} 
                onValueChange={(value: 'email' | 'sms' | 'app') => 
                  setSettings(prev => ({ ...prev, preferred_communication_method: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="app">In-App Messages</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Reminder Frequency</Label>
              <Select 
                value={settings.reminder_frequency} 
                onValueChange={(value: 'never' | 'daily' | 'weekly') => 
                  setSettings(prev => ({ ...prev, reminder_frequency: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Session Reminder (hours ahead)</Label>
              <Input
                type="number"
                min="1"
                max="168"
                value={settings.session_reminder_hours}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, session_reminder_hours: parseInt(e.target.value) }))
                }
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Privacy & Data Sharing
          </CardTitle>
          <CardDescription>
            Control what information is visible and who can access it
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Data Visibility</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {settings.progress_photos_visible ? (
                      <Eye className="h-4 w-4 text-gray-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    )}
                    <Label htmlFor="photos-visible">Progress Photos</Label>
                  </div>
                  <Switch
                    id="photos-visible"
                    checked={settings.progress_photos_visible}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, progress_photos_visible: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {settings.measurements_visible ? (
                      <Eye className="h-4 w-4 text-gray-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    )}
                    <Label htmlFor="measurements-visible">Body Measurements</Label>
                  </div>
                  <Switch
                    id="measurements-visible"
                    checked={settings.measurements_visible}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, measurements_visible: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {settings.goals_visible ? (
                      <Eye className="h-4 w-4 text-gray-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    )}
                    <Label htmlFor="goals-visible">Goals & Progress</Label>
                  </div>
                  <Switch
                    id="goals-visible"
                    checked={settings.goals_visible}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, goals_visible: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {settings.notes_visible ? (
                      <Eye className="h-4 w-4 text-gray-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    )}
                    <Label htmlFor="notes-visible">Coach Notes</Label>
                  </div>
                  <Switch
                    id="notes-visible"
                    checked={settings.notes_visible}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, notes_visible: checked }))
                    }
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Emergency Contact Access</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="emergency-access">Allow emergency contact to view progress</Label>
                    <p className="text-xs text-gray-500">
                      {client.emergency_contact_name || 'No emergency contact set'}
                    </p>
                  </div>
                  <Switch
                    id="emergency-access"
                    checked={settings.emergency_contact_can_view}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, emergency_contact_can_view: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <Label htmlFor="custom-notes">Custom Privacy Notes</Label>
            <Textarea
              id="custom-notes"
              value={settings.custom_notes}
              onChange={(e) => setSettings(prev => ({ ...prev, custom_notes: e.target.value }))}
              placeholder="Any special privacy requirements or notes..."
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex items-center justify-between">
        <Button onClick={handleSaveSettings} className="flex items-center">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => setShowDangerZone(!showDangerZone)}
          className="text-red-600 hover:text-red-700"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          {showDangerZone ? 'Hide' : 'Show'} Danger Zone
        </Button>
      </div>

      {/* Danger Zone */}
      {showDangerZone && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions that affect client data and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
              <div>
                <h4 className="font-medium">Archive Client</h4>
                <p className="text-sm text-gray-600">
                  Hide client from active lists while preserving all data
                </p>
              </div>
              <Button variant="outline" onClick={handleArchiveClient} className="text-orange-600 hover:text-orange-700">
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
              <div>
                <h4 className="font-medium text-red-600">Delete Client</h4>
                <p className="text-sm text-gray-600">
                  Permanently delete all client data including photos, measurements, and notes
                </p>
              </div>
              <Button variant="destructive" onClick={handleDeleteClient}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Forever
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}