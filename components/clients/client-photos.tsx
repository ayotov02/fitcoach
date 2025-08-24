'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientWithDetails, ClientPhoto, PhotoType } from '@/types/clients';
import { 
  Camera, 
  Upload,
  Calendar,
  Eye,
  Download,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Filter,
  Grid3X3,
  Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientPhotosProps {
  client: ClientWithDetails;
  onUpdateClient?: (clientId: string, data: Partial<ClientWithDetails>) => void;
}

export function ClientPhotos({ client, onUpdateClient }: ClientPhotosProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<ClientPhoto | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'comparison'>('grid');
  const [filterType, setFilterType] = useState<PhotoType | 'all'>('all');
  const [isUploading, setIsUploading] = useState(false);

  // Mock photos - in real app, these would come from client.photos
  const mockPhotos: ClientPhoto[] = [
    {
      id: '1',
      client_id: client.id,
      photo_url: '/placeholder-photo.jpg',
      photo_type: 'front',
      photo_date: new Date('2024-01-01'),
      description: 'Initial front view',
      tags: ['before'],
      is_public: false,
      is_before_photo: true,
      is_milestone_photo: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
    },
    {
      id: '2',
      client_id: client.id,
      photo_url: '/placeholder-photo.jpg',
      photo_type: 'side_left',
      photo_date: new Date('2024-01-01'),
      description: 'Initial side view',
      tags: ['before'],
      is_public: false,
      is_before_photo: true,
      is_milestone_photo: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
    },
    {
      id: '3',
      client_id: client.id,
      photo_url: '/placeholder-photo.jpg',
      photo_type: 'front',
      photo_date: new Date('2024-02-01'),
      description: '1 month progress',
      tags: ['progress'],
      is_public: false,
      is_before_photo: false,
      is_milestone_photo: false,
      created_at: new Date('2024-02-01'),
      updated_at: new Date('2024-02-01'),
    },
  ];

  const photos = client.photos || mockPhotos;

  const getPhotoTypeColor = (type: PhotoType) => {
    const colors = {
      front: 'bg-blue-100 text-blue-800',
      back: 'bg-green-100 text-green-800',
      side_left: 'bg-purple-100 text-purple-800',
      side_right: 'bg-orange-100 text-orange-800',
      progress: 'bg-yellow-100 text-yellow-800',
      before: 'bg-red-100 text-red-800',
      after: 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredPhotos = filterType === 'all' 
    ? photos 
    : photos.filter(photo => photo.photo_type === filterType);

  const getBeforeAfterPairs = () => {
    const beforePhotos = photos.filter(p => p.is_before_photo);
    const afterPhotos = photos.filter(p => !p.is_before_photo && p.photo_type);
    
    const pairs = beforePhotos.map(before => {
      const matchingAfter = afterPhotos
        .filter(after => after.photo_type === before.photo_type)
        .sort((a, b) => new Date(b.photo_date).getTime() - new Date(a.photo_date).getTime())[0];
      
      return { before, after: matchingAfter };
    });

    return pairs.filter(pair => pair.after);
  };

  const handleUploadPhoto = async (file: File, type: PhotoType) => {
    setIsUploading(true);
    // In real app, upload to storage and save to database
    console.log('Uploading photo:', file.name, type);
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);
  };

  const handleDeletePhoto = async (photoId: string) => {
    // In real app, delete from storage and database
    console.log('Deleting photo:', photoId);
  };

  if (viewMode === 'comparison') {
    const pairs = getBeforeAfterPairs();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Before & After Comparison</h2>
            <p className="text-gray-600">Compare progress photos side by side</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setViewMode('grid')}>
              <Grid3X3 className="mr-2 h-4 w-4" />
              Grid View
            </Button>
          </div>
        </div>

        {pairs.length > 0 ? (
          <div className="space-y-8">
            {pairs.map((pair, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {pair.before.photo_type.replace('_', ' ')} View Comparison
                  </CardTitle>
                  <CardDescription>
                    Progress from {new Date(pair.before.photo_date).toLocaleDateString()} to{' '}
                    {new Date(pair.after.photo_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Before Photo */}
                    <div className="space-y-3">
                      <div className="text-center">
                        <Badge className="bg-red-100 text-red-800 mb-2">Before</Badge>
                        <div className="text-sm text-gray-600">
                          {new Date(pair.before.photo_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative group">
                        <Image
                          src={pair.before.photo_url}
                          alt="Before photo"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedPhoto(pair.before)}
                            className="text-white hover:bg-white/20"
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* After Photo */}
                    <div className="space-y-3">
                      <div className="text-center">
                        <Badge className="bg-green-100 text-green-800 mb-2">Current</Badge>
                        <div className="text-sm text-gray-600">
                          {new Date(pair.after.photo_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative group">
                        <Image
                          src={pair.after.photo_url}
                          alt="Current photo"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedPhoto(pair.after)}
                            className="text-white hover:bg-white/20"
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No comparison photos available
              </h3>
              <p className="text-gray-600 mb-6">
                Upload before and after photos to see progress comparisons.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Progress Photos</h2>
          <p className="text-gray-600">
            Visual progress tracking with {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode('comparison')}>
            <Eye className="mr-2 h-4 w-4" />
            Compare
          </Button>
          <label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach(file => handleUploadPhoto(file, 'progress'));
              }}
            />
            <Button asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photos
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('all')}
        >
          All Photos ({photos.length})
        </Button>
        {['front', 'back', 'side_left', 'side_right'].map((type) => {
          const count = photos.filter(p => p.photo_type === type).length;
          return (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(type as PhotoType)}
              className="whitespace-nowrap capitalize"
            >
              {type.replace('_', ' ')} ({count})
            </Button>
          );
        })}
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden group hover:shadow-lg transition-all duration-200">
              <div className="aspect-[3/4] bg-gray-100 relative">
                <Image
                  src={photo.photo_url}
                  alt={photo.description || 'Progress photo'}
                  fill
                  className="object-cover"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedPhoto(photo)}
                      className="text-white hover:bg-white/20"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="text-white hover:bg-white/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2">
                  <Badge className={getPhotoTypeColor(photo.photo_type)} size="sm">
                    {photo.photo_type.replace('_', ' ')}
                  </Badge>
                </div>
                
                {photo.is_milestone_photo && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-yellow-100 text-yellow-800" size="sm">
                      Milestone
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-3">
                <div className="flex items-center text-xs text-gray-600">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(photo.photo_date).toLocaleDateString()}
                </div>
                {photo.description && (
                  <p className="text-sm mt-1 truncate">{photo.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filterType === 'all' ? 'No photos yet' : `No ${filterType.replace('_', ' ')} photos`}
            </h3>
            <p className="text-gray-600 mb-6">
              Upload progress photos to track visual changes over time.
            </p>
            <label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => handleUploadPhoto(file, 'progress'));
                }}
              />
              <Button>
                <Camera className="mr-2 h-4 w-4" />
                Upload First Photo
              </Button>
            </label>
          </CardContent>
        </Card>
      )}

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <>
          <div className="fixed inset-0 bg-black/80 z-50" onClick={() => setSelectedPhoto(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="font-semibold capitalize">
                    {selectedPhoto.photo_type.replace('_', ' ')} Photo
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedPhoto.photo_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedPhoto(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="relative max-h-[70vh] max-w-[80vw]">
                  <Image
                    src={selectedPhoto.photo_url}
                    alt={selectedPhoto.description || 'Progress photo'}
                    width={600}
                    height={800}
                    className="object-contain rounded-lg"
                  />
                </div>
                {selectedPhoto.description && (
                  <p className="mt-4 text-gray-700">{selectedPhoto.description}</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Upload Loading State */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <div>
                <p className="font-medium">Uploading photos...</p>
                <p className="text-sm text-gray-600">Please wait while we process your images.</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}