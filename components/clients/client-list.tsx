'use client';

import { useState, useMemo } from 'react';
import { ClientCard } from './client-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ClientWithDetails, ClientStatus } from '@/types/clients';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Download,
  MessageSquareMore,
  Archive,
  MoreHorizontal,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientListProps {
  clients: ClientWithDetails[];
  isLoading?: boolean;
  onAddClient?: () => void;
  onMessage?: (clientId: string) => void;
  onViewProgress?: (clientId: string) => void;
  onEditClient?: (clientId: string) => void;
  onBulkAction?: (action: string, clientIds: string[]) => void;
}

type SortField = 'name' | 'status' | 'join_date' | 'last_activity' | 'progress';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

const STATUS_FILTERS: { value: ClientStatus | 'all'; label: string; count?: number }[] = [
  { value: 'all', label: 'All Clients' },
  { value: 'active', label: 'Active' },
  { value: 'needs_attention', label: 'Needs Attention' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'paused', label: 'Paused' },
];

export function ClientList({ 
  clients, 
  isLoading = false,
  onAddClient,
  onMessage,
  onViewProgress,
  onEditClient,
  onBulkAction
}: ClientListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients.filter(client => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        client.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.primary_goal?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort clients
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.user?.full_name || a.user?.email || '';
          bValue = b.user?.full_name || b.user?.email || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'join_date':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'last_activity':
          aValue = a.last_activity_date ? new Date(a.last_activity_date) : new Date(0);
          bValue = b.last_activity_date ? new Date(b.last_activity_date) : new Date(0);
          break;
        case 'progress':
          const aProgress = a.goals?.length ? 
            (a.goals.filter(g => g.status === 'completed').length / a.goals.length) * 100 : 0;
          const bProgress = b.goals?.length ? 
            (b.goals.filter(g => g.status === 'completed').length / b.goals.length) * 100 : 0;
          aValue = aProgress;
          bValue = bProgress;
          break;
        default:
          aValue = a.user?.full_name || a.user?.email || '';
          bValue = b.user?.full_name || b.user?.email || '';
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [clients, searchQuery, statusFilter, sortField, sortOrder]);

  // Get status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: clients.length,
      active: 0,
      needs_attention: 0,
      at_risk: 0,
      inactive: 0,
      paused: 0,
    };

    clients.forEach(client => {
      counts[client.status]++;
    });

    return counts;
  }, [clients]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectClient = (clientId: string) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId);
    } else {
      newSelected.add(clientId);
    }
    setSelectedClients(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedClients.size === filteredAndSortedClients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(filteredAndSortedClients.map(c => c.id)));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedClients.size > 0) {
      onBulkAction?.(action, Array.from(selectedClients));
      setSelectedClients(new Set());
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">
            Manage your {clients.length} client{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button onClick={onAddClient}>
            Add Client
          </Button>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search clients by name, email, or goal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('name')}
              className={cn(sortField === 'name' && 'bg-primary/10')}
            >
              Name {sortField === 'name' && (
                sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('last_activity')}
              className={cn(sortField === 'last_activity' && 'bg-primary/10')}
            >
              Activity {sortField === 'last_activity' && (
                sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
              )}
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            variant={statusFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(filter.value)}
            className="whitespace-nowrap"
          >
            {filter.label} ({statusCounts[filter.value] || 0})
          </Button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedClients.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedClients.size} client{selectedClients.size !== 1 ? 's' : ''} selected
            </span>
            <Button variant="outline" size="sm" onClick={() => setSelectedClients(new Set())}>
              Clear Selection
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleBulkAction('message')}>
              <MessageSquareMore className="mr-2 h-4 w-4" />
              Message All
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('archive')}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
          </div>
        </div>
      )}

      {/* Client Grid/List */}
      {filteredAndSortedClients.length > 0 ? (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            : "space-y-4"
        )}>
          {filteredAndSortedClients.map((client) => (
            <div key={client.id} className="relative">
              {/* Selection Checkbox for Bulk Actions */}
              {viewMode === 'grid' && (
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedClients.has(client.id)}
                    onChange={() => handleSelectClient(client.id)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
              )}
              
              <ClientCard
                client={client}
                viewMode={viewMode}
                onMessage={onMessage}
                onViewProgress={onViewProgress}
                onEditClient={onEditClient}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Grid3X3 className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' 
              ? 'No clients found' 
              : 'No clients yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Start building your coaching business by adding your first client.'}
          </p>
          {(!searchQuery && statusFilter === 'all') && (
            <Button onClick={onAddClient}>
              Add Your First Client
            </Button>
          )}
        </div>
      )}
    </div>
  );
}