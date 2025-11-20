// src/app/admin/gallery/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useGallery } from '@/hooks/useGallery';
import { GalleryImage } from '@/api/endpoints/gallery';
import Image from 'next/image';
import styles from './GalleryPage.module.css';

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
  const [uploadType, setUploadType] = useState<GalleryImage['image_type']>('campus');
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editType, setEditType] = useState<GalleryImage['image_type']>('campus');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageTypes: Array<{ value: GalleryImage['image_type']; label: string }> = [
    { value: 'campus', label: 'Campus' },
    { value: 'facility', label: 'Facility' },
    { value: 'student_life', label: 'Student Life' },
    { value: 'academic', label: 'Academic' },
    { value: 'athletics', label: 'Athletics' },
    { value: 'other', label: 'Other' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadCaption('');
      setUploadType('campus');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setUploadCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setEditCaption(image.caption || '');
    setEditType(image.image_type);
  };

  const handleUpdate = async () => {
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

  const handleDelete = async (imageId: number) => {
    const success = await deleteImage(imageId);
    if (success) {
      setDeleteConfirm(null);
    }
  };

  const handleSetFeatured = async (imageId: number) => {
    await setFeatured(imageId);
  };

  if (loading && images.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Gallery Management</h1>
          <p className={styles.subtitle}>
            Manage your institution's image gallery ({count} {count === 1 ? 'image' : 'images'})
          </p>
        </div>
        <button
          className={styles.uploadButton}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <span>📤</span>
          Upload Image
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Upload Form */}
      {selectedFile && previewUrl && (
        <div className={styles.uploadCard}>
          <h3 className={styles.uploadTitle}>Upload New Image</h3>
          <div className={styles.uploadContent}>
            <div className={styles.previewSection}>
              <div className={styles.imagePreview}>
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={300}
                  height={200}
                  className={styles.previewImage}
                  unoptimized // For blob URLs
                />
              </div>
              <p className={styles.fileName}>{selectedFile.name}</p>
            </div>

            <div className={styles.uploadForm}>
              <div className={styles.formGroup}>
                <label htmlFor="caption" className={styles.label}>
                  Caption (Optional)
                </label>
                <input
                  id="caption"
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="Enter image caption..."
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="imageType" className={styles.label}>
                  Image Type
                </label>
                <select
                  id="imageType"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as GalleryImage['image_type'])}
                  className={styles.select}
                >
                  {imageTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.uploadActions}>
                <button
                  className={styles.buttonOutline}
                  onClick={handleCancelUpload}
                  disabled={uploading}
                >
                  ❌ Cancel
                </button>
                <button
                  className={styles.buttonPrimary}
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? '⏳ Uploading...' : '✅ Upload Image'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className={styles.hiddenInput}
      />

      {/* Featured Image Section */}
      {featuredImage && featuredImage.url && (
        <div className={styles.featuredCard}>
          <div className={styles.featuredHeader}>
            <span>⭐</span>
            <h3>Featured Image</h3>
          </div>
          <div className={styles.featuredImageContainer}>
            <Image
              src={featuredImage.url}
              alt={featuredImage.caption || 'Featured image'}
              width={600}
              height={400}
              className={styles.featuredImage}
            />
            {featuredImage.caption && (
              <p className={styles.featuredCaption}>{featuredImage.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {isEmpty ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🖼️</div>
          <h3>No Images Yet</h3>
          <p>Upload your first image to get started</p>
          <button
            className={styles.buttonPrimary}
            onClick={() => fileInputRef.current?.click()}
          >
            📤 Upload Image
          </button>
        </div>
      ) : (
        <div className={styles.gallery}>
          {images.map((image, index) => (
            <div key={image.id} className={styles.galleryItem}>
              {/* Edit Modal */}
              {editingImage?.id === image.id && (
                <div className={styles.editOverlay}>
                  <div className={styles.editForm}>
                    <h4>Edit Image</h4>
                    <input
                      type="text"
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Caption"
                      className={styles.input}
                    />
                    <select
                      value={editType}
                      onChange={(e) =>
                        setEditType(e.target.value as GalleryImage['image_type'])
                      }
                      className={styles.select}
                    >
                      {imageTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <div className={styles.editActions}>
                      <button
                        className={styles.buttonOutline}
                        onClick={() => setEditingImage(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className={styles.buttonPrimary}
                        onClick={handleUpdate}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ FIXED: Only render Image if URL exists */}
              {image.url ? (
                <div className={styles.imageWrapper}>
                  <Image
                    src={image.url}
                    alt={image.caption || `Gallery image ${index + 1}`}
                    width={400}
                    height={300}
                    className={styles.galleryImage}
                  />
                  {image.is_featured && (
                    <div className={styles.featuredBadge}>
                      ⭐ Featured
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.imageWrapper}>
                  <div className={styles.imagePlaceholder}>
                    <span>🖼️</span>
                    <p>No image</p>
                  </div>
                </div>
              )}

              <div className={styles.imageInfo}>
                {image.caption && <p className={styles.caption}>{image.caption}</p>}
                <span className={styles.imageType}>
                  {imageTypes.find((t) => t.value === image.image_type)?.label}
                </span>
              </div>

              <div className={styles.imageActions}>
                <div className={styles.reorderButtons}>
                  <button
                    onClick={() => moveUp(image.id)}
                    disabled={index === 0}
                    className={styles.iconButton}
                    title="Move up"
                  >
                    ⬆️
                  </button>
                  <button
                    onClick={() => moveDown(image.id)}
                    disabled={index === images.length - 1}
                    className={styles.iconButton}
                    title="Move down"
                  >
                    ⬇️
                  </button>
                </div>

                <div className={styles.actionButtons}>
                  <button
                    onClick={() => handleSetFeatured(image.id)}
                    className={styles.iconButton}
                    title={image.is_featured ? 'Unset featured' : 'Set as featured'}
                  >
                    {image.is_featured ? '⭐' : '☆'}
                  </button>
                  <button
                    onClick={() => startEdit(image)}
                    className={styles.iconButton}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(image.id)}
                    className={`${styles.iconButton} ${styles.deleteButton}`}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === image.id && (
                <div className={styles.deleteConfirm}>
                  <p>Delete this image?</p>
                  <div className={styles.deleteActions}>
                    <button
                      className={styles.buttonOutline}
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.buttonDestructive}
                      onClick={() => handleDelete(image.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}