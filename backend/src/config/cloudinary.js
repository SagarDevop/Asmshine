const cloudinary = require('cloudinary').v2;

/**
 * Validates Cloudinary environment variables.
 * Throws a descriptive configuration error if missing or placeholder.
 */
const validateCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      '[Cloudinary Config Error] Missing required credentials: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET must be defined in backend/.env'
    );
  }

  if (
    cloudName === 'your_cloud_name_here' ||
    apiKey === 'your_api_key_here' ||
    apiSecret === 'your_api_secret_here'
  ) {
    throw new Error(
      '[Cloudinary Config Error] Detected placeholder credentials in backend/.env. Please configure real Cloudinary credentials.'
    );
  }

  return { cloudName, apiKey, apiSecret };
};

/**
 * Returns configured Cloudinary v2 instance.
 * Lazy configuration ensures no startup side-effects or network calls.
 */
let isConfigured = false;
const getCloudinary = () => {
  if (!isConfigured) {
    const { cloudName, apiKey, apiSecret } = validateCloudinaryConfig();
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
    isConfigured = true;
  }
  return cloudinary;
};

module.exports = {
  getCloudinary,
  validateCloudinaryConfig
};
