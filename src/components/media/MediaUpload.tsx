'use client';

import { useState, useCallback, useRef } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { getMediaUploadUrl } from '@/graphql/mutations';
import { useAuth } from '@/contexts/AuthContext';

interface MediaUploadProps {
  onMediaUploaded?: (fileUrl: string, fileName: string, contentType: string) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

/**
 * Resolve the content type for a file.
 * Some mobile browsers (especially iOS Safari) return empty file.type for videos.
 * Fall back to extension-based detection.
 */
function getContentType(file: File): string {
  if (file.type) return file.type;

  const ext = file.name.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
    bmp: 'image/bmp',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    webm: 'video/webm',
  };
  return mimeMap[ext || ''] || 'application/octet-stream';
}

/**
 * Re-encode a real photo that's just in a web-awkward format (HEIC from iPhones, BMP)
 * into a JPEG the backend/CDN/next-image pipeline already knows how to handle — entirely
 * client-side, so the backend never has to see or trust anything but plain JPEG bytes.
 * Anything else (including PDFs) passes through untouched and gets rejected below.
 */
async function normalizeImageFile(file: File): Promise<File> {
  const contentType = getContentType(file).toLowerCase();
  const jpegName = file.name.replace(/\.[^.]+$/, '.jpg');

  if (contentType === 'image/heic' || contentType === 'image/heif') {
    const heic2any = (await import('heic2any')).default;
    const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
    const blob = Array.isArray(result) ? result[0] : result;
    return new File([blob], jpegName, { type: 'image/jpeg' });
  }

  if (contentType === 'image/bmp') {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('BMP conversion failed'))), 'image/jpeg', 0.9)
    );
    return new File([blob], jpegName, { type: 'image/jpeg' });
  }

  return file;
}

export default function MediaUpload({
  onMediaUploaded,
  accept = 'image/*,video/*',
  multiple = true,
  maxFiles = 10,
  className = ''
}: MediaUploadProps) {
  const { user } = useAuth();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadFile = async (file: File, contentType: string) => {
    try {
      // Get upload URL from GraphQL
      const data = user 
        ? await GraphQLClient.executeAuthenticated<{ getMediaUploadUrl: any }>(
            getMediaUploadUrl,
            { fileName: file.name, contentType }
          )
        : await GraphQLClient.execute<{ getMediaUploadUrl: any }>(
            getMediaUploadUrl,
            { fileName: file.name, contentType }
          );

      const uploadData = data.getMediaUploadUrl;
      if (!uploadData) {
        throw new Error('No upload data received');
      }

      // Upload file to S3 using the presigned URL
      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': contentType },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed (${uploadResponse.status})`);
      }

      onMediaUploaded?.(uploadData.fileUrl, file.name, contentType);
      return { success: true, url: uploadData.fileUrl };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files).slice(0, maxFiles);
    
    const newUploadingFiles: UploadingFile[] = fileArray.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    for (let i = 0; i < fileArray.length; i++) {
      const originalFile = fileArray[i];

      try {
        // HEIC/BMP photos get quietly re-encoded to JPEG before any validation or upload
        // — the rest of the pipeline (backend, CDN, next/image) only ever sees plain JPEG.
        const file = await normalizeImageFile(originalFile);

        // Determine content type — fall back to extension if file.type is empty
        const contentType = getContentType(file);
        const isVideo = contentType.startsWith('video/');
        const isImage = contentType.startsWith('image/');

        // The `accept` attribute on the file input is only a UI hint — drag-and-drop and
        // "All Files" bypass it. Reject anything that isn't actually an image/video here
        // (e.g. a PDF a host exported photos to) so it never reaches the property gallery,
        // where next/image 400s on non-image content and breaks the whole listing.
        if (!isVideo && !isImage) {
          throw new Error(`"${contentType}" files aren't supported — upload a photo (JPG/PNG) or video instead.`);
        }

        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;

        if (file.size > maxSize) {
          const maxSizeMB = isVideo ? '100MB' : '10MB';
          throw new Error(`File is too large (max ${maxSizeMB})`);
        }

        setUploadingFiles(prev =>
          prev.map(uf => uf.file === originalFile ? { ...uf, progress: 50 } : uf)
        );

        const result = await uploadFile(file, contentType);

        setUploadingFiles(prev =>
          prev.map(uf =>
            uf.file === originalFile
              ? { ...uf, progress: 100, status: 'success', url: result.url }
              : uf
          )
        );
      } catch (error) {
        setUploadingFiles(prev =>
          prev.map(uf =>
            uf.file === originalFile
              ? { ...uf, progress: 100, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
              : uf
          )
        );
      }
    }

    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(uf => uf.status === 'uploading'));
    }, 5000);
  }, [maxFiles, onMediaUploaded, user]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
    e.target.value = '';
  }, [handleFiles]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-brand-400 bg-brand-50' 
            : 'border-ink-200 hover:border-brand-400 hover:bg-brand-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />
        <svg className="w-12 h-12 text-brand-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm font-medium text-ink-700 mb-1">
          Tap here to take a photo or choose from gallery
        </p>
        <p className="text-xs text-ink-400">
          Images (max 10MB) and videos (max 100MB) · Up to {maxFiles} files
        </p>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-ink-700">Uploading Files</h4>
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={index} className="bg-ink-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-ink-700 truncate">
                  {uploadingFile.file.name}
                </span>
                <div className="flex items-center space-x-2">
                  {uploadingFile.status === 'uploading' && (
                    <div className="animate-spin h-4 w-4 border-2 border-brand-600 border-t-transparent rounded-full" />
                  )}
                  {uploadingFile.status === 'success' && (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {uploadingFile.status === 'error' && (
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className="text-xs text-ink-500">
                    {uploadingFile.status === 'error' ? 'Failed' : `${uploadingFile.progress}%`}
                  </span>
                </div>
              </div>
              
              {uploadingFile.status === 'error' && uploadingFile.error && (
                <p className="text-xs text-red-500 mb-2">{uploadingFile.error}</p>
              )}
              
              <div className="w-full bg-ink-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    uploadingFile.status === 'success' ? 'bg-green-500' 
                    : uploadingFile.status === 'error' ? 'bg-red-400'
                    : 'bg-brand-500'
                  }`}
                  style={{ width: `${uploadingFile.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
