'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ClientWithDetails, ClientNote, NoteType, Priority } from '@/types/clients';
import { 
  MessageSquare, 
  Plus,
  Brain,
  AlertCircle,
  CheckCircle,
  Flag,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientNotesProps {
  client: ClientWithDetails;
  onUpdateClient?: (clientId: string, data: Partial<ClientWithDetails>) => void;
}

export function ClientNotes({ client, onUpdateClient }: ClientNotesProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<NoteType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [newNote, setNewNote] = useState({
    note_text: '',
    note_type: 'general' as NoteType,
    priority: 'medium' as Priority,
    requires_action: false,
    action_deadline: '',
    tags: [] as string[],
  });

  // Mock notes - in real app, these would come from client.notes
  const mockNotes: ClientNote[] = [
    {
      id: '1',
      client_id: client.id,
      coach_id: 'coach-1',
      note_text: 'Client showed great improvement in squat form today. Increased weight by 5kg without compromising technique. Ready to progress to 3x8 next session.',
      note_type: 'workout',
      ai_generated: false,
      priority: 'medium',
      is_private: false,
      requires_action: false,
      action_completed: false,
      tags: ['squat', 'form', 'progression'],
      created_at: new Date('2024-01-20'),
      updated_at: new Date('2024-01-20'),
      coach: {
        user: {
          full_name: 'John Coach'
        }
      }
    },
    {
      id: '2',
      client_id: client.id,
      coach_id: 'coach-1',
      note_text: 'AI suggests increasing protein intake by 20g daily based on current muscle gain goals and training intensity.',
      note_type: 'ai_insight',
      ai_generated: true,
      ai_confidence_score: 0.87,
      ai_suggestion_category: 'nutrition',
      priority: 'high',
      is_private: false,
      requires_action: true,
      action_deadline: new Date('2024-01-25'),
      action_completed: false,
      tags: ['nutrition', 'protein', 'muscle-gain'],
      created_at: new Date('2024-01-18'),
      updated_at: new Date('2024-01-18'),
      coach: {
        user: {
          full_name: 'AI Assistant'
        }
      }
    },
    {
      id: '3',
      client_id: client.id,
      coach_id: 'coach-1',
      note_text: 'Client mentioned knee discomfort during lunges. Recommended modification to reverse lunges with reduced range of motion. Monitor closely.',
      note_type: 'concern',
      ai_generated: false,
      priority: 'high',
      is_private: false,
      requires_action: true,
      action_deadline: new Date('2024-01-22'),
      action_completed: false,
      tags: ['knee', 'modification', 'safety'],
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15'),
      coach: {
        user: {
          full_name: 'John Coach'
        }
      }
    },
  ];

  const notes = client.notes || mockNotes;

  const getNoteTypeIcon = (type: NoteType) => {
    switch (type) {
      case 'workout':
        return <MessageSquare className="h-4 w-4" />;
      case 'nutrition':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'progress':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'concern':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'achievement':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'ai_insight':
        return <Brain className="h-4 w-4 text-purple-600" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.note_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || note.note_type === filterType;
    const matchesPriority = filterPriority === 'all' || note.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  const handleAddNote = async () => {
    // In real app, this would call API
    console.log('Adding note:', newNote);
    setIsAddingNote(false);
    setNewNote({
      note_text: '',
      note_type: 'general',
      priority: 'medium',
      requires_action: false,
      action_deadline: '',
      tags: [],
    });
  };

  const handleUpdateNote = async (noteId: string, updates: Partial<ClientNote>) => {
    // In real app, this would call API
    console.log('Updating note:', noteId, updates);
    setEditingNote(null);
  };

  const handleDeleteNote = async (noteId: string) => {
    // In real app, this would call API
    console.log('Deleting note:', noteId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Coach Notes</h2>
          <p className="text-gray-600">
            Track observations, insights, and action items
          </p>
        </div>
        <Button onClick={() => setIsAddingNote(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search notes and tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All Notes ({notes.length})
          </Button>
          {(['general', 'workout', 'nutrition', 'progress', 'concern', 'achievement', 'ai_insight'] as NoteType[]).map(type => {
            const count = notes.filter(n => n.note_type === type).length;
            return (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type)}
                className="capitalize"
              >
                {type.replace('_', ' ')} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <Card key={note.id} className={cn(
              'transition-all duration-200',
              note.requires_action && !note.action_completed && 'border-yellow-200 bg-yellow-50/50'
            )}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {note.ai_generated ? (
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Brain className="h-4 w-4 text-purple-600" />
                      </div>
                    ) : (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {note.coach?.user?.full_name?.[0] || 'C'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">
                          {note.coach?.user?.full_name || 'Unknown Coach'}
                        </span>
                        {note.ai_generated && (
                          <Badge variant="outline" className="text-purple-600 border-purple-200">
                            <Brain className="mr-1 h-3 w-3" />
                            AI {note.ai_confidence_score && `${Math.round(note.ai_confidence_score * 100)}%`}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {getNoteTypeIcon(note.note_type)}
                        <span className="capitalize">{note.note_type.replace('_', ' ')}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(note.priority)}>
                      <Flag className="mr-1 h-3 w-3" />
                      {note.priority}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-900 leading-relaxed">{note.note_text}</p>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Required */}
                {note.requires_action && (
                  <div className={cn(
                    'p-3 rounded-lg border',
                    note.action_completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  )}>
                    <div className="flex items-center space-x-2 mb-2">
                      {note.action_completed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="text-sm font-medium">
                        Action {note.action_completed ? 'Completed' : 'Required'}
                      </span>
                    </div>
                    {note.action_deadline && !note.action_completed && (
                      <p className="text-xs text-gray-600">
                        Due: {new Date(note.action_deadline).toLocaleDateString()}
                      </p>
                    )}
                    {!note.action_completed && (
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => handleUpdateNote(note.id, { action_completed: true })}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingNote(note.id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filterType !== 'all' || filterPriority !== 'all'
                  ? 'No notes found'
                  : 'No notes yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterType !== 'all' || filterPriority !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Start tracking client progress and observations.'}
              </p>
              {(!searchQuery && filterType === 'all' && filterPriority === 'all') && (
                <Button onClick={() => setIsAddingNote(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Note
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Note Modal */}
      {isAddingNote && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsAddingNote(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Add New Note</CardTitle>
                <CardDescription>Record observations, insights, or action items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Note</Label>
                  <textarea
                    className="w-full min-h-[100px] p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your note..."
                    value={newNote.note_text}
                    onChange={(e) => setNewNote(prev => ({ ...prev, note_text: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <select
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      value={newNote.note_type}
                      onChange={(e) => setNewNote(prev => ({ ...prev, note_type: e.target.value as NoteType }))}
                    >
                      <option value="general">General</option>
                      <option value="workout">Workout</option>
                      <option value="nutrition">Nutrition</option>
                      <option value="progress">Progress</option>
                      <option value="concern">Concern</option>
                      <option value="achievement">Achievement</option>
                    </select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <select
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      value={newNote.priority}
                      onChange={(e) => setNewNote(prev => ({ ...prev, priority: e.target.value as Priority }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requires_action"
                    checked={newNote.requires_action}
                    onChange={(e) => setNewNote(prev => ({ ...prev, requires_action: e.target.checked }))}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="requires_action">Requires action</Label>
                </div>

                {newNote.requires_action && (
                  <div>
                    <Label>Action Deadline</Label>
                    <Input
                      type="date"
                      value={newNote.action_deadline}
                      onChange={(e) => setNewNote(prev => ({ ...prev, action_deadline: e.target.value }))}
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingNote(false)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleAddNote} disabled={!newNote.note_text.trim()}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}