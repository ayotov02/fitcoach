import { supabase } from '@/lib/supabase/client';
import { ClientWithDetails, ClientProfile, ClientMeasurement, ClientPhoto, ClientNote, ClientGoal, ClientStatus } from '@/types/clients';
import { calculateClientStatus, statusManager } from '@/lib/client-status';

// Client CRUD Operations
export class ClientAPI {
  
  // Create a new client
  static async createClient(clientData: any): Promise<{ data: ClientProfile | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create user account first
      const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
        email: clientData.email,
        password: Math.random().toString(36).substring(2, 15), // Generate temporary password
        email_confirm: true,
        user_metadata: {
          full_name: clientData.full_name,
          role: 'client'
        }
      });

      if (userError) throw userError;

      // Create client profile
      const clientProfile = {
        id: newUser.user.id,
        coach_id: user.id,
        date_of_birth: clientData.date_of_birth,
        gender: clientData.gender,
        occupation: clientData.occupation,
        emergency_contact_name: clientData.emergency_contact_name,
        emergency_contact_phone: clientData.emergency_contact_phone,
        fitness_level: clientData.fitness_level,
        training_experience_years: clientData.training_experience_years,
        activity_level: clientData.activity_level,
        primary_goal: clientData.primary_goal,
        secondary_goals: clientData.secondary_goals,
        motivation_factors: clientData.motivation_factors,
        medical_conditions: clientData.medical_conditions,
        injuries: clientData.injuries,
        medications: clientData.medications,
        medical_clearance: clientData.medical_clearance,
        workout_location_preference: clientData.workout_location_preference,
        session_duration_preference: clientData.session_duration_preference,
        preferred_workout_times: clientData.preferred_workout_times,
        available_days: clientData.available_days,
        equipment_access: clientData.equipment_access,
        dietary_restrictions: clientData.dietary_restrictions,
        communication_preference: clientData.communication_preference,
        onboarding_completed: true,
        status: 'active' as ClientStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('client_profiles')
        .insert(clientProfile)
        .select()
        .single();

      if (error) throw error;

      // Send welcome email (in real app)
      console.log('Would send welcome email to:', clientData.email);

      return { data, error: null };
    } catch (error) {
      console.error('Error creating client:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Get all clients for the current coach
  static async getClients(filters?: {
    status?: ClientStatus;
    search?: string;
    sortBy?: 'name' | 'created_at' | 'last_activity_date';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: ClientWithDetails[]; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('client_profiles')
        .select(`
          *,
          user:auth.users!inner (
            id,
            email,
            user_metadata
          ),
          measurements:client_measurements (
            id,
            measurement_date,
            weight_kg,
            body_fat_percentage,
            measurements,
            bmr_calories
          ),
          photos:client_photos (
            id,
            photo_url,
            photo_type,
            photo_date,
            is_before_photo,
            is_milestone_photo
          ),
          goals:client_goals (
            id,
            goal_title,
            goal_type,
            target_value,
            current_value,
            target_unit,
            target_date,
            status,
            progress_percentage
          ),
          notes:client_notes (
            id,
            note_content,
            note_type,
            priority,
            created_at
          )
        `)
        .eq('coach_id', user.id);

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`
          user.user_metadata->full_name.ilike.%${filters.search}%,
          user.email.ilike.%${filters.search}%
        `);
      }

      // Apply sorting
      const sortBy = filters?.sortBy || 'created_at';
      const sortOrder = filters?.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;

      // Process the data to match ClientWithDetails interface
      const processedClients: ClientWithDetails[] = data.map(client => ({
        ...client,
        user: {
          id: client.user.id,
          email: client.user.email,
          full_name: client.user.user_metadata?.full_name,
          avatar_url: client.user.user_metadata?.avatar_url,
        },
        measurements: client.measurements || [],
        photos: client.photos || [],
        goals: client.goals || [],
        notes: client.notes || [],
        latest_measurement: client.measurements?.length > 0 
          ? client.measurements.sort((a: any, b: any) => 
              new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime()
            )[0] 
          : null,
      }));

      return { data: processedClients, error: null };
    } catch (error) {
      console.error('Error fetching clients:', error);
      return { data: [], error: (error as Error).message };
    }
  }

  // Get a single client with full details
  static async getClient(clientId: string): Promise<{ data: ClientWithDetails | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('client_profiles')
        .select(`
          *,
          user:auth.users!inner (
            id,
            email,
            user_metadata
          ),
          measurements:client_measurements (
            id,
            measurement_date,
            weight_kg,
            body_fat_percentage,
            measurements,
            bmr_calories,
            created_at
          ),
          photos:client_photos (
            id,
            photo_url,
            photo_type,
            photo_date,
            description,
            tags,
            is_public,
            is_before_photo,
            is_milestone_photo,
            created_at,
            updated_at
          ),
          goals:client_goals (
            id,
            goal_title,
            goal_type,
            target_value,
            current_value,
            target_unit,
            target_date,
            status,
            progress_percentage,
            created_at,
            updated_at
          ),
          notes:client_notes (
            id,
            note_content,
            note_type,
            priority,
            tags,
            is_action_item,
            action_due_date,
            is_completed,
            ai_insights,
            confidence_score,
            created_at,
            updated_at
          )
        `)
        .eq('id', clientId)
        .eq('coach_id', user.id)
        .single();

      if (error) throw error;

      if (!data) {
        return { data: null, error: 'Client not found' };
      }

      // Process the data
      const processedClient: ClientWithDetails = {
        ...data,
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url,
        },
        measurements: data.measurements || [],
        photos: data.photos || [],
        goals: data.goals || [],
        notes: data.notes || [],
        latest_measurement: data.measurements?.length > 0 
          ? data.measurements.sort((a: any, b: any) => 
              new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime()
            )[0] 
          : null,
      };

      return { data: processedClient, error: null };
    } catch (error) {
      console.error('Error fetching client:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Update client
  static async updateClient(clientId: string, updates: Partial<ClientProfile>): Promise<{ data: ClientProfile | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('client_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .eq('coach_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating client:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Delete client
  static async deleteClient(clientId: string): Promise<{ error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Note: In a real app, you might want to soft-delete or archive instead
      const { error } = await supabase
        .from('client_profiles')
        .delete()
        .eq('id', clientId)
        .eq('coach_id', user.id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error deleting client:', error);
      return { error: (error as Error).message };
    }
  }

  // Update client status with automatic calculation
  static async updateClientStatus(clientId: string, manualStatus?: ClientStatus, reason?: string): Promise<{ data: ClientProfile | null; error: string | null }> {
    try {
      const { data: client } = await this.getClient(clientId);
      if (!client) throw new Error('Client not found');

      let newStatus: ClientStatus;
      let statusReason: string;

      if (manualStatus) {
        newStatus = manualStatus;
        statusReason = reason || `Manually set to ${manualStatus}`;
        
        // Log the manual status change
        statusManager.updateStatus(client, newStatus, statusReason, false);
      } else {
        // Calculate automatic status
        const statusResult = calculateClientStatus(client);
        newStatus = statusResult.status;
        statusReason = statusResult.reason;
        
        // Only update if status actually changed
        if (client.status !== newStatus) {
          statusManager.updateStatus(client, newStatus, statusReason, true);
        }
      }

      const { data, error } = await this.updateClient(clientId, { 
        status: newStatus,
        status_reason: statusReason,
        status_updated_at: new Date().toISOString()
      });

      return { data, error };
    } catch (error) {
      console.error('Error updating client status:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Add measurement
  static async addMeasurement(clientId: string, measurement: Omit<ClientMeasurement, 'id' | 'client_id' | 'created_at' | 'updated_at'>): Promise<{ data: ClientMeasurement | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('client_measurements')
        .insert({
          client_id: clientId,
          ...measurement,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update client's last activity
      await this.updateClient(clientId, {
        last_activity_date: new Date().toISOString()
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error adding measurement:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Add photo
  static async addPhoto(clientId: string, photo: Omit<ClientPhoto, 'id' | 'client_id' | 'created_at' | 'updated_at'>): Promise<{ data: ClientPhoto | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('client_photos')
        .insert({
          client_id: clientId,
          ...photo,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error adding photo:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Add note
  static async addNote(clientId: string, note: Omit<ClientNote, 'id' | 'client_id' | 'coach_id' | 'created_at' | 'updated_at'>): Promise<{ data: ClientNote | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('client_notes')
        .insert({
          client_id: clientId,
          coach_id: user.id,
          ...note,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error adding note:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Add goal
  static async addGoal(clientId: string, goal: Omit<ClientGoal, 'id' | 'client_id' | 'created_at' | 'updated_at'>): Promise<{ data: ClientGoal | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('client_goals')
        .insert({
          client_id: clientId,
          ...goal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error adding goal:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Update goal progress
  static async updateGoalProgress(goalId: string, currentValue: number): Promise<{ data: ClientGoal | null; error: string | null }> {
    try {
      const { data: goal, error: fetchError } = await supabase
        .from('client_goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (fetchError) throw fetchError;

      const progressPercentage = goal.target_value 
        ? Math.min((currentValue / goal.target_value) * 100, 100) 
        : 0;

      const status = progressPercentage >= 100 ? 'completed' : 'in_progress';

      const { data, error } = await supabase
        .from('client_goals')
        .update({
          current_value: currentValue,
          progress_percentage: progressPercentage,
          status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Bulk status update for multiple clients
  static async bulkUpdateStatus(clientIds: string[], status: ClientStatus, reason: string): Promise<{ error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('client_profiles')
        .update({
          status,
          status_reason: reason,
          status_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in('id', clientIds)
        .eq('coach_id', user.id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error bulk updating client status:', error);
      return { error: (error as Error).message };
    }
  }

  // Get client analytics/statistics
  static async getClientAnalytics(clientId: string): Promise<{ data: any | null; error: string | null }> {
    try {
      const { data: client } = await this.getClient(clientId);
      if (!client) throw new Error('Client not found');

      const analytics = {
        totalMeasurements: client.measurements?.length || 0,
        totalPhotos: client.photos?.length || 0,
        totalNotes: client.notes?.length || 0,
        completedGoals: client.goals?.filter(g => g.status === 'completed').length || 0,
        activeGoals: client.goals?.filter(g => g.status === 'in_progress').length || 0,
        daysSinceStart: Math.floor(
          (Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24)
        ),
        daysSinceLastActivity: client.last_activity_date 
          ? Math.floor(
              (Date.now() - new Date(client.last_activity_date).getTime()) / (1000 * 60 * 60 * 24)
            )
          : null,
        weightProgress: client.measurements && client.measurements.length > 1 
          ? {
              start: client.measurements.sort((a, b) => 
                new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime()
              )[0]?.weight_kg,
              current: client.latest_measurement?.weight_kg,
              change: client.latest_measurement?.weight_kg && client.measurements[0]?.weight_kg
                ? client.latest_measurement.weight_kg - client.measurements[0].weight_kg
                : null
            }
          : null,
      };

      return { data: analytics, error: null };
    } catch (error) {
      console.error('Error getting client analytics:', error);
      return { data: null, error: (error as Error).message };
    }
  }
}