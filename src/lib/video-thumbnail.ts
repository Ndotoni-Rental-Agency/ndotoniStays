import { GraphQLClient } from '@/lib/graphql-client';

const getMediaUploadUrl = /* GraphQL */ `
  mutation GetMediaUploadUrl($fileName: String!, $contentType: String!) {
    getMediaUploadUrl(fileName: $fileName, contentType: $contentType) {
      uploadUrl
      fileUrl
      key
    }
  }
`;

/**
 * Generates a thumbnail image from a video URL by capturing a frame at 1 second.
 * Uploads the thumbnail to S3 and returns the URL.
 * Returns null if thumbnail generation fails (non-blocking).
 */
export async function generateVideoThumbnail(videoUrl: string): Promise<string | null> {
  try {
    const blob = await captureVideoFrame(videoUrl);
    if (!blob) return null;

    // Upload the thumbnail
    const fileName = `video-thumb-${Date.now()}.jpg`;
    const data = await GraphQLClient.executePublic<{
      getMediaUploadUrl: { uploadUrl: string; fileUrl: string };
    }>(getMediaUploadUrl, { fileName, contentType: 'image/jpeg' });

    const { uploadUrl, fileUrl } = data.getMediaUploadUrl;

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': 'image/jpeg' },
    });

    if (!response.ok) return null;
    return fileUrl;
  } catch (err) {
    console.error('Failed to generate video thumbnail:', err);
    return null;
  }
}

function captureVideoFrame(videoUrl: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const timeout = setTimeout(() => {
      cleanup();
      resolve(null);
    }, 10000); // 10s timeout

    function cleanup() {
      clearTimeout(timeout);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      video.src = '';
      video.load();
    }

    function onSeeked() {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { cleanup(); resolve(null); return; }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => { cleanup(); resolve(blob); },
          'image/jpeg',
          0.85
        );
      } catch {
        cleanup();
        resolve(null);
      }
    }

    function onError() {
      cleanup();
      resolve(null);
    }

    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });

    video.src = videoUrl;
    video.load();

    video.addEventListener('loadeddata', () => {
      video.currentTime = Math.min(1, video.duration * 0.1);
    }, { once: true });
  });
}
