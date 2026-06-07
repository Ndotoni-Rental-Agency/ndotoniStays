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

  const uploadFile = async (file: File) => {
    try {
      console.log(`Starting upload for: ${file.name} (${file.type}, ${file.size} bytes)`);

      // Get upload URL from GraphQL - works for both authenticated and guest users
      const data = user 
        ? await GraphQLClient.executeAuthenticated<{ getMediaUploadUrl: any }>(
            getMediaUploadUrl,
            {
              fileName: file.name,
              contentType: file.type
            }
          )
        : await GraphQLClient.execute<{ getMediaUploadUrl: any }>(
            getMediaUploadUrl,
            {
              fileName: file.name,
              contentType: file.type
            }
          );

      console.log('GraphQL upload response:', data);

      const uploadData = data.getMediaUploadUrl;
      if (!uploadData) {
        throw new Error('No upload data received from GraphQL');
      }

      console.log('Upload data received:', uploadData);

      // Upload file to S3 using the presigned URL
      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      console.log('S3 upload response status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('S3 upload error response:', errorText);
        throw new Error(`S3 upload failed (${uploadResponse.status}): ${errorText}`);
      }

      console.log(`Successfully uploaded: ${file.name}`);
      onMediaUploaded?.(uploadData.fileUrl, file.name, file.type);
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

    // Upload files one by one
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      
      try {
        // Validate file size based on type
        const isVideo = file.type.startsWith('video/');
        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for videos, 10MB for images
        
        if (file.size > maxSize) {
          const maxSizeMB = isVideo ? '100MB' : '10MB';
          throw new Error(`File is too large (max ${maxSizeMB} for ${isVideo ? 'videos' : 'images'})`);
        }

        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.file === file 
              ? { ...uf, progress: 50 } 
              : uf
          )
        );

        const result = await uploadFile(file);
        
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.file === file 
              ? { 
                  ...uf, 
                  progress: 100, 
                  status: 'success',
                  url: result.url 
                } 
              : uf
          )
        );
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.file === file 
              ? { 
                  ...uf, 
                  progress: 100, 
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Upload failed'
                } 
              : uf
          )
        );
      }
    }

    // Clear completed uploads after a delay
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(uf => uf.status === 'uploading'));
    }, 5000);
  }, [maxFiles, onMediaUploaded, user]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
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
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFiles]);

  const language: string = 'en';
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Drop Zone — entire area is clickable */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-brand-400 bg-brand-50' 
            : 'border-stone-300 hover:border-brand-400 hover:bg-brand-50/50'
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
          {language === 'sw' ? 'Bonyeza hapa kupiga picha au kuchagua kutoka kwenye simu' : 'Tap here to take a photo or choose from gallery'}
        </p>
        <p className="text-xs text-gray-400">
          {language === 'sw'
            ? `Picha (max 10MB) na video (max 100MB) • Hadi picha ${maxFiles}`
            : `Images (max 10MB) and videos (max 100MB) • Up to ${maxFiles} files`}
        </p>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Uploading Files</h4>
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate transition-colors">
                  {uploadingFile.file.name}
                </span>
                <div className="flex items-center space-x-2">
                  {uploadingFile.status === 'uploading' && (
                    <svg className="animate-spin w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {uploadingFile.status === 'success' && (
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {uploadingFile.status === 'error' && (
                    <svg className="w-4 h-4 text-gray-900 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                    {uploadingFile.status === 'error' ? 'Failed' : `${uploadingFile.progress}%`}
                  </span>
                </div>
              </div>
              
              {/* Error Message */}
              {uploadingFile.status === 'error' && uploadingFile.error && (
                <div className="mb-2">
                  <p className="text-xs text-gray-900 dark:text-emerald-400">{uploadingFile.error}</p>
                </div>
              )}
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 transition-colors">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    uploadingFile.status === 'success' 
                      ? 'bg-green-600 dark:bg-green-400' 
                      : uploadingFile.status === 'error'
                      ? 'bg-gray-900 dark:bg-emerald-400'
                      : 'bg-blue-600 dark:bg-blue-400'
                  }`}
                  style={{ width: `${uploadingFile.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}