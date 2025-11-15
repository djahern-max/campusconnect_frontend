'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useGallery, useUploadImage, useDeleteImage } from '@/hooks/useGallery';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDropzone } from 'react-dropzone';
import { Upload, Trash2, X, Image as ImageIcon, AlertCircle, ExternalLink } from 'lucide-react';

export default function GalleryPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: images, isLoading, error, refetch } = useGallery();
  const uploadMutation = useUploadImage();
  const deleteMutation = useDeleteImage();
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [captions, setCaptions] = useState<{ [key: string]: string }>({});
  const [imageTypes, setImageTypes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
    },
    maxSize: 10 * 1024 * 1024,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...acceptedFiles]);
      }
      
      if (rejectedFiles.length > 0) {
        const reasons = rejectedFiles.map(f => {
          const errors = f.errors.map(e => {
            if (e.code === 'file-too-large') return `${f.file.name}: File too large (max 10MB)`;
            if (e.code === 'file-invalid-type') return `${f.file.name}: Invalid file type`;
            return `${f.file.name}: ${e.message}`;
          }).join(', ');
          return errors;
        }).join('\n');
        alert(`Some files were rejected:\n${reasons}`);
      }
    }
  });

  const handleUpload = async () => {
    for (const file of selectedFiles) {
      try {
        await uploadMutation.mutateAsync({
          file,
          caption: captions[file.name] || undefined,
          imageType: imageTypes[file.name] || 'campus'
        });
      } catch (error) {
        alert(`Failed to upload ${file.name}`);
      }
    }
    setSelectedFiles([]);
    setCaptions({});
    setImageTypes({});
    await refetch();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this image?')) {
      await deleteMutation.mutateAsync(id);
      await refetch();
    }
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName));
    const newCaptions = { ...captions };
    const newTypes = { ...imageTypes };
    delete newCaptions[fileName];
    delete newTypes[fileName];
    setCaptions(newCaptions);
    setImageTypes(newTypes);
  };

  if (!isAuthenticated) return null;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardBody className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Gallery</h2>
              <p className="text-gray-600">Error loading gallery</p>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gallery Manager</h1>
          <p className="text-gray-600">Upload and manage your campus photos ({images?.length || 0} images)</p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-bold">Upload Images</h2>
          </CardHeader>
          <CardBody>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
                isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              {isDragActive ? (
                <p className="text-lg text-primary-600">Drop the images here...</p>
              ) : (
                <>
                  <p className="text-lg text-gray-700 mb-2">Drag & drop images here, or click to select</p>
                  <p className="text-sm text-gray-500">PNG, JPG, WEBP, GIF up to 10MB</p>
                </>
              )}
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Selected Files ({selectedFiles.length})</h3>
                
                {selectedFiles.map((file) => (
                  <div key={file.name} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <ImageIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{file.name}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button onClick={() => removeFile(file.name)} className="text-gray-400 hover:text-red-600">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Caption (optional)"
                        value={captions[file.name] || ''}
                        onChange={(e) => setCaptions({ ...captions, [file.name]: e.target.value })}
                      />
                      
                      <select
                        value={imageTypes[file.name] || 'campus'}
                        onChange={(e) => setImageTypes({ ...imageTypes, [file.name]: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="campus">Campus</option>
                        <option value="students">Students</option>
                        <option value="facilities">Facilities</option>
                        <option value="events">Events</option>
                      </select>
                    </div>
                  </div>
                ))}

                <Button variant="primary" onClick={handleUpload} isLoading={uploadMutation.isPending} className="w-full">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload {selectedFiles.length} Image{selectedFiles.length !== 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Gallery Grid */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Current Gallery</h2>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">Loading gallery...</p>
              </div>
            ) : images && images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                  <div key={image.id} className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Image */}
                    <div className="aspect-video w-full overflow-hidden bg-gray-100">
                      <img
                        src={image.cdn_url}
                        alt={image.caption || 'Gallery image'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {image.caption || 'Untitled'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        <span className="inline-block px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                          {image.image_type}
                        </span>
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(image.id)}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        
                        <a 
                          href={image.cdn_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition inline-flex items-center justify-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No images in gallery yet</p>
                <p className="text-sm">Upload your first image to get started</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
