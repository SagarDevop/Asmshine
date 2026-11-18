/**
 * ASM SHINE Image Optimization Utility
 * Automatically injects Cloudinary transformations (f_auto, q_auto, responsive widths)
 * to deliver lightweight WebP/AVIF images, reducing page weight by up to 90%.
 */

export const getOptimizedImageUrl = (url, { width = 400, quality = 'auto', crop = 'limit' } = {}) => {
  if (!url || typeof url !== 'string') return '/favicon.svg';

  // Detect Cloudinary delivery URLs
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // Prevent duplicate transformations if already applied
    if (url.includes('/upload/f_auto') || url.includes('/upload/w_') || url.includes('/upload/q_')) {
      return url;
    }
    const transform = `f_auto,q_${quality},w_${width},c_${crop}`;
    return url.replace('/upload/', `/upload/${transform}/`);
  }

  // Fallback for local assets or external SVGs
  return url;
};
