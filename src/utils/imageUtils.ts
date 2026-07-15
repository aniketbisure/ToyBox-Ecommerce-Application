/**
 * Cloudinary image transformation helper.
 * Optimizes images by resizing and changing format (webp) on the fly.
 */
export const getOptimizedImageUrl = (
  url: string | undefined,
  width: number = 400,
  height: number = 400,
  quality: string = 'auto'
): string => {
  if (!url) return 'https://via.placeholder.com/400';

  // Only apply to Cloudinary URLs
  if (url.includes('cloudinary.com')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      // Transformation format: w_400,h_400,c_fill,q_auto,f_auto
      const transformation = `w_${width},h_${height},c_limit,q_${quality},f_auto`;
      return `${parts[0]}/upload/${transformation}/${parts[1]}`;
    }
  }

  return url;
};
