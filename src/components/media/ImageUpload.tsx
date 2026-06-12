'use client';

import { useState, useCallback } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { PhotoIcon, XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      // Use public API key — no auth required
      const data = await GraphQLClient.executePublic<{ getMediaUploadUrl: { uploadUrl: string; fileUrl: string } }>(
        getMediaUploadUrl,
        { fileName: file.name, contentType: file.type }
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
    setUploadProgress(0);

    const uploadedUrls: string[] = [];
    for (let i = 0; i < fileArray.length; i++) {
      const url = await uploadFile(fileArray[i]);
      if (url) uploadedUrls.push(url);
      setUploadProgress(Math.round(((i + 1) / fileArray.length) * 100));
    }

    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls]);
    }

    setUploading(false);
    setUploadProgress(0);
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
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4 text-white" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full font-medium">
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
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 sm:p-6 cursor-pointer transition-colors active:scale-[0.98] ${
            uploading ? 'border-brand-300 bg-brand-50' : 'border-ink-200 hover:border-brand-400 hover:bg-brand-50/30 active:bg-brand-50/50'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="sr-only"
            disabled={uploading}
          />
          {uploading ? (
            <>
              <div className="animate-spin h-8 w-8 border-3 border-brand-600 border-t-transparent rounded-full" />
              <p className="text-sm text-brand-600 font-medium">
                Uploading... {uploadProgress}%
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 sm:flex-col sm:gap-2">
                <div className="h-12 w-12 sm:h-10 sm:w-10 rounded-full bg-brand-100 flex items-center justify-center">
                  <CameraIcon className="h-6 w-6 sm:h-5 sm:w-5 text-brand-600" />
                </div>
                <div className="text-left sm:text-center">
                  <p className="text-sm font-medium text-brand-600">
                    Tap to add photos
                  </p>
                  <p className="text-xs text-ink-400 mt-0.5">
                    {images.length}/{maxImages} photos · Max 10MB each
                  </p>
                </div>
              </div>
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
