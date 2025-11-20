// src/app/admin/gallery/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useGallery } from '@/hooks/useGallery';
import type { GalleryImage } from '@/api/endpoints/gallery';
import {
  compressImage,
  validateImage,
  formatFileSize,
  getImageDimensions,
} from '@/utils/imageCompression';
import {
  Upload,
  Star,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Info,
  X,
  Plus
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type ImageType =
  | 'campus'
  | 'facility'
  | 'student_life'
  | 'academic'
  | 'athletics'
  | 'other';

interface ImageInfoState {
  dimensions: { width: number; height: number };
  size: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  recommendation: string;
}

export default function AdminGalleryPage() {
  const {
    images,
    featuredImage,
    loading,
    uploading,
    error,
    uploadImage,
    updateImage,
    deleteImage,
    setFeatured,
    moveUp,
    moveDown,
    isEmpty,
    count,
  } = useGallery({ autoLoad: true });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadType, setUploadType] = useState<ImageType>('campus');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editType, setEditType] = useState<ImageType>('campus');

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfoState | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);



  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageTypes: Array<{ value: ImageType; label: string }> = [
    { value: 'campus', label: 'Campus' },
    { value: 'facility', label: 'Facility' },
    { value: 'student_life', label: 'Student Life' },
    { value: 'academic', label: 'Academic' },
    { value: 'athletics', label: 'Athletics' },
    { value: 'other', label: 'Other' },
  ];

  // ---------- helpers ----------

  function analyzeImageQuality(dimensions: { width: number; height: number }) {
    const { width, height } = dimensions;

    const IDEAL_MIN_WIDTH = 1920;
    const IDEAL_MIN_HEIGHT = 1080;
    const IDEAL_MAX_WIDTH = 4000;
    const IDEAL_MAX_HEIGHT = 3000;

    if (width < 1200 || height < 800) {
      return {
        rating: 'poor' as const,
        message: `Image is too small (${width}×${height}). Recommended: at least 1920×1080 for best quality.`,
      };
    }

    if (width < IDEAL_MIN_WIDTH || height < IDEAL_MIN_HEIGHT) {
      return {
        rating: 'fair' as const,
        message: `Image is smaller than ideal (${width}×${height}). Recommended: 1920×1080 or larger.`,
      };
    }

    if (width > 5000 || height > 5000) {
      return {
        rating: 'good' as const,
        message: `Image is very large (${width}×${height}). It will be automatically resized to 2400px max.`,
      };
    }

    const isIdealWidth =
      width >= IDEAL_MIN_WIDTH && width <= IDEAL_MAX_WIDTH;
    const isIdealHeight =
      height >= IDEAL_MIN_HEIGHT && height <= IDEAL_MAX_HEIGHT;

    if (isIdealWidth && isIdealHeight) {
      return {
        rating: 'excellent' as const,
        message: '',
      };
    }

    return {
      rating: 'good' as const,
      message: '',
    };
  }

  function getQualityBadge(quality: ImageInfoState['quality']) {
    switch (quality) {
      case 'excellent':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'fair':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'poor':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  }

  function getImageSrc(img: GalleryImage): string | null {
    // prefer CDN URL if present, otherwise image_url, otherwise a normalized url field
    // (works even if you normalized `url` inside useGallery)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyImg = img as any;
    return img.cdn_url || img.image_url || anyImg.url || null;
  }

  // ---------- file selection / upload ----------

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageInfo(null);
    setIsCompressing(true);

    try {
      const dimensions = await getImageDimensions(file);
      const quality = analyzeImageQuality(dimensions);

      const recommendationBase =
        quality.rating === 'excellent'
          ? 'Perfect! This image will display beautifully.'
          : quality.rating === 'good'
            ? 'Good quality. Image will display well.'
            : quality.rating === 'fair'
              ? 'Acceptable, but consider using a higher resolution image.'
              : 'Image quality may be poor. Please use a larger image.';

      setImageInfo({
        dimensions,
        size: file.size,
        quality: quality.rating,
        recommendation: quality.message || recommendationBase,
      });

      const validation = await validateImage(file);
      if (!validation.valid) {
        setImageInfo(null);
        alert(validation.error || 'Invalid image');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      let processedFile = file;
      if (file.size > 1024 * 1024) {
        processedFile = await compressImage(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 2400,
          quality: 0.85,
        });
      }

      setSelectedFile(processedFile);
      setPreviewUrl(URL.createObjectURL(processedFile));
    } catch (err: any) {
      console.error('Error processing image:', err);
      alert(err?.message || 'Failed to process image');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsCompressing(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await uploadImage({
      file: selectedFile,
      caption: uploadCaption || undefined,
      image_type: uploadType,
    });

    if (result) {
      // reset form
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setUploadCaption('');
      setUploadType('campus');
      setImageInfo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadCaption('');
    setUploadType('campus');
    setImageInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---------- edit / delete / featured ----------

  const openEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setEditCaption(image.caption || '');
    setEditType((image.image_type || 'campus') as ImageType);
  };

  const handleUpdateImage = async () => {
    if (!editingImage) return;

    const result = await updateImage(editingImage.id, {
      caption: editCaption || undefined,
      image_type: editType,
    });

    if (result) {
      setEditingImage(null);
      setEditCaption('');
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    const success = await deleteImage(imageId);
    if (success) {
      setDeleteConfirmId(null);
    }
  };

  const handleSetFeatured = async (imageId: number) => {
    await setFeatured(imageId);
  };


  const handleUploadImage = async () => {
    if (!uploadFile) return;

    const result = await uploadImage({
      file: uploadFile,
      caption: uploadCaption || undefined,
      image_type: uploadType,
    });

    if (result) {
      // reset & close modal
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadCaption('');
      setUploadType('campus');
    }
  };


  // cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- UI ----------

  if (loading && images.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 rounded-full border-b-2 border-gray-700 animate-spin" />
          <p className="mt-4 text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Title + subtitle */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Gallery Management
              </h1>
              <p className="text-gray-600">
                Manage your institution&apos;s images
                {count ? ` (${count} ${count === 1 ? 'image' : 'images'})` : ''}
              </p>
            </div>

            {/* Upload button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="inline-flex w-full sm:w-auto items-center justify-center px-4 py-2
                   bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium
                   transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Image
              </button>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5" />
            <span>{error}</span>
          </div>
        )}


        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Recommendations card */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-gray-100 p-2">
                <Info className="h-4 w-4 text-gray-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">
                  Image Recommendations
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Ideal Dimensions</p>
                    <p className="font-medium text-gray-900">
                      1920×1080 to 2400×1600
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Minimum Size</p>
                    <p className="font-medium text-gray-900">
                      1200×800 pixels
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">File Size</p>
                    <p className="font-medium text-gray-900">
                      Under 10MB (auto-compress)
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Formats</p>
                    <p className="font-medium text-gray-900">
                      JPEG, PNG, WebP
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Image analysis card */}
        {imageInfo && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 ${getQualityBadge(
              imageInfo.quality,
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold">
                  {imageInfo.quality === 'excellent' && '⭐ Excellent'}
                  {imageInfo.quality === 'good' && '✅ Good'}
                  {imageInfo.quality === 'fair' && '⚠️ Fair'}
                  {imageInfo.quality === 'poor' && '❌ Poor'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-2">
              <div>
                <p className="text-gray-600">Dimensions</p>
                <p className="font-medium">
                  {imageInfo.dimensions.width}×{imageInfo.dimensions.height}
                </p>
              </div>
              <div>
                <p className="text-gray-600">File Size</p>
                <p className="font-medium">
                  {formatFileSize(imageInfo.size)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Megapixels</p>
                <p className="font-medium">
                  {(
                    (imageInfo.dimensions.width *
                      imageInfo.dimensions.height) /
                    1_000_000
                  ).toFixed(1)}
                  MP
                </p>
              </div>
            </div>
            <p className="text-sm">{imageInfo.recommendation}</p>
          </div>
        )}

        {/* Upload panel */}
        {selectedFile && previewUrl && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Upload New Image
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Preview */}
                <div className="md:col-span-1">
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={400}
                      height={260}
                      className="h-48 w-full object-cover"
                      unoptimized
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 break-all">
                    {selectedFile.name}
                  </p>
                </div>

                {/* Form */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Caption (optional)
                    </label>
                    <input
                      type="text"
                      value={uploadCaption}
                      onChange={(e) => setUploadCaption(e.target.value)}
                      placeholder="Short description for this image"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image Type
                    </label>
                    <select
                      value={uploadType}
                      onChange={(e) =>
                        setUploadType(e.target.value as ImageType)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                    >
                      {imageTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelUpload}
                      disabled={uploading}
                      className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading || isCompressing}
                      className="inline-flex items-center rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Featured image */}
        {featuredImage && getImageSrc(featuredImage) && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Featured Image
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col md:flex-row gap-4 md:items-center">
                <div className="relative w-full md:w-1/2 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                  <Image
                    src={getImageSrc(featuredImage)!}
                    alt={featuredImage.caption || 'Featured image'}
                    width={800}
                    height={480}
                    className="h-64 w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {featuredImage.caption || 'No caption'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize mb-1">
                    Type: {featuredImage.image_type || 'campus'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Display order: {featuredImage.display_order}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* UPLOAD BUTTON */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Upload Image</h2>
                <button onClick={() => setShowUploadModal(false)}>
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              {/* File input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              {/* Caption */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="e.g., Campus Entrance"
                />
              </div>

              {/* Image Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image Type (optional)
                </label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as ImageType)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  {imageTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>


              {/* Action buttons */}
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>

                <button
                  onClick={handleUploadImage}
                  disabled={uploading || !uploadFile}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state or grid */}
        {isEmpty ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">
              🖼️
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No images yet
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Upload your first image to get started.
            </p>
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Gallery Images
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image, index) => {
                  const src = getImageSrc(image);

                  return (
                    <div
                      key={image.id}
                      className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm"
                    >
                      {/* Image */}
                      <div className="relative">
                        {src ? (
                          <Image
                            src={src}
                            alt={
                              image.caption ||
                              `Gallery image ${index + 1}`
                            }
                            width={600}
                            height={380}
                            className="h-48 w-full rounded-t-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-48 w-full items-center justify-center rounded-t-lg bg-gray-100 text-3xl">
                            🖼️
                          </div>
                        )}

                        {image.is_featured && (
                          <div className="absolute left-3 top-3 inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-900">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-1 flex-col px-4 py-3 gap-2">
                        <div>
                          {image.caption && (
                            <p className="text-sm font-medium text-gray-900">
                              {image.caption}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 capitalize">
                            {image.image_type || 'campus'}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-2 flex items-center justify-between gap-2">
                          {/* Reorder */}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => moveUp(image.id)}
                              disabled={index === 0}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                              title="Move up"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveDown(image.id)}
                              disabled={index === images.length - 1}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                              title="Move down"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleSetFeatured(image.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-yellow-600 hover:bg-yellow-50"
                              title={
                                image.is_featured
                                  ? 'Already featured'
                                  : 'Set as featured'
                              }
                            >
                              <Star className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(image)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(image.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 text-red-600 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Delete confirmation */}
                        {deleteConfirmId === image.id && (
                          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 flex items-center justify-between gap-2">
                            <span>Delete this image?</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="rounded-md bg-white/80 px-2 py-1 text-gray-700 hover:bg-white"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(image.id)}
                                className="rounded-md bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Edit modal */}
        {editingImage && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Edit Image
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingImage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption
                  </label>
                  <input
                    type="text"
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Type
                  </label>
                  <select
                    value={editType}
                    onChange={(e) =>
                      setEditType(e.target.value as ImageType)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                  >
                    {imageTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setEditingImage(null)}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateImage}
                  className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
