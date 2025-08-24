'use client';

import { useState, useEffect } from 'react';
import { ClientList } from '@/components/clients/client-list';
import { AddClientForm } from '@/components/clients/add-client-form';
import { ClientProfile } from '@/components/clients/client-profile';
import { ClientWithDetails } from '@/types/clients';
import { ClientAPI } from '@/lib/api/clients';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Users, UserCheck, AlertTriangle, UserX } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientWithDetails | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await ClientAPI.getClients();
      if (error) {
        toast.error('Failed to load clients: ' + error);
        return;
      }
      setClients(data);
    } catch (error) {
      toast.error('Failed to load clients');
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClient = async (clientData: any) => {
    setIsCreating(true);
    try {
      const { data, error } = await ClientAPI.createClient(clientData);
      if (error) {
        toast.error('Failed to create client: ' + error);
        return;
      }
      
      toast.success('Client created successfully');
      setShowAddForm(false);
      loadClients(); // Reload the list
    } catch (error) {
      toast.error('Failed to create client');
      console.error('Error creating client:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateClient = async (clientId: string, updates: Partial<ClientWithDetails>) => {
    try {
      const { error } = await ClientAPI.updateClient(clientId, updates);
      if (error) {
        toast.error('Failed to update client: ' + error);
        return;
      }
      
      toast.success('Client updated successfully');
      
      // Update local state
      setClients(prev => 
        prev.map(client => 
          client.id === clientId ? { ...client, ...updates } : client
        )
      );
      
      // Update selected client if it's the one being updated
      if (selectedClient?.id === clientId) {
        setSelectedClient(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      toast.error('Failed to update client');
      console.error('Error updating client:', error);
    }
  };

  const handleSelectClient = async (clientId: string) => {
    try {
      const { data, error } = await ClientAPI.getClient(clientId);
      if (error) {
        toast.error('Failed to load client details: ' + error);
        return;
      }
      setSelectedClient(data);
    } catch (error) {
      toast.error('Failed to load client details');
      console.error('Error loading client:', error);
    }
  };

  const handleEditClient = (clientId: string) => {
    // In a real app, this would open an edit modal or navigate to edit page
    console.log('Edit client:', clientId);
    toast.info('Edit functionality would open here');
  };

  const handleMessage = (clientId: string) => {
    // In a real app, this would open messaging interface
    console.log('Message client:', clientId);
    toast.info('Messaging functionality would open here');
  };

  const getClientStats = () => {
    const total = clients.length;
    const active = clients.filter(c => c.status === 'active').length;
    const needsAttention = clients.filter(c => c.status === 'needs_attention').length;
    const atRisk = clients.filter(c => c.status === 'at_risk').length;
    
    return { total, active, needsAttention, atRisk };
  };

  const stats = getClientStats();

  if (showAddForm) {
    return (
      <div className="container mx-auto py-6">
        <AddClientForm
          onSubmit={handleAddClient}
          onCancel={() => setShowAddForm(false)}
          isLoading={isCreating}
        />
      </div>
    );
  }

  if (selectedClient) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedClient(null)}
            className="mb-4"
          >
            ← Back to Client List
          </Button>
        </div>
        <ClientProfile
          client={selectedClient}
          onMessage={handleMessage}
          onEditClient={handleEditClient}
          onUpdateClient={handleUpdateClient}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your clients, track progress, and monitor engagement
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Needs Attention</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.needsAttention}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">At Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.atRisk}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <div className="space-y-6">
        <ClientList
          clients={clients}
          onSelectClient={handleSelectClient}
          onEditClient={handleEditClient}
          onMessage={handleMessage}
          onUpdateClient={handleUpdateClient}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}