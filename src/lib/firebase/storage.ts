import { auth } from './config';

/**
 * Upload a room image via the server-side API route.
 * Routes through /api/admin/upload (Admin SDK) to avoid Firebase Storage CORS
 * restrictions — no need to configure CORS on the GCS bucket.
 * Uses XHR so upload progress percentage is still reported.
 */
export function uploadRoomImage(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const user = auth.currentUser;
    if (!user) { reject(new Error('Not authenticated')); return; }

    user.getIdToken().then((token) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/admin/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
      }

      xhr.addEventListener('load', () => {
        try {
          const data = JSON.parse(xhr.responseText) as { url?: string; error?: string };
          if (xhr.status >= 200 && xhr.status < 300 && data.url) {
            resolve(data.url);
          } else {
            reject(new Error(data.error ?? 'Upload failed'));
          }
        } catch {
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
      xhr.send(formData);
    }).catch(reject);
  });
}
