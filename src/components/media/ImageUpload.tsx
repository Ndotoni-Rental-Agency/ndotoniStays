'use client';

import { useState, useCallback } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

const getMediaUploadUrl = /* GraphQL */ `
  mutation GetMediaUploadUrl($fileName: String!, $contentType: String!) {
    getMediaUploadUrl(fileName: $fileName, contentType: $contentType) {
      uploadUrl
      fileUrl
      key
    }
  }
`;

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onChange, maxImages = 10 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      // Get presigned upload URL (public — no auth required)
      const data = await GraphQLClient.execute<{ getMediaUploadUrl: { uploadUrl: string; fileUrl: string } }>(
        getMediaUploadUrl,
        { fileName: file.name, contentType: file.type },
        true // forceApiKey — allow unauthenticated uploads
      );

      const { uploadUrl, fileUrl } = data.getMediaUploadUrl;

      // Upload to S3
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!response.ok) throw new Error('Upload failed');

      return fileUrl;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const fileArray = Array.from(files).slice(0, remaining);
    
    // Validate
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        setError('Only images are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Images must be under 10MB');
        return;
      }
    }

    setUploading(true);
    setError(null);

    const uploadedUrls: string[] = [];
    for (const file of fileArray) {
      const url = await uploadFile(file);
      if (url) uploadedUrls.push(url);
    }

    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls]);
    }

    setUploading(false);
  }, [images, maxImages, onChange]);

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
          {images.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4 text-white" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {images.length < maxImages && (
        <label
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${
            uploading ? 'border-brand-300 bg-brand-50' : 'border-ink-200 hover:border-brand-400 hover:bg-brand-50/30'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="sr-only"
            disabled={uploading}
          />
          {uploading ? (
            <>
              <div className="animate-spin h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full" />
              <p className="text-sm text-brand-600 font-medium">Uploading...</p>
            </>
          ) : (
            <>
              <PhotoIcon className="h-8 w-8 text-ink-300" />
              <p className="text-sm text-ink-500">
                <span className="text-brand-600 font-medium">Click to upload</span> or drag photos here
              </p>
              <p className="text-xs text-ink-400">
                {images.length}/{maxImages} photos · Max 10MB each
              </p>
            </>
          )}
        </label>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
