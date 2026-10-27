const path = require('path');
const fs = require('fs');
const { getCloudinary } = require('../config/cloudinary');

const DEFAULT_FOLDER = 'asm-shine/products';

/**
 * Uploads a local product image to Cloudinary.
 * 
 * @param {string} localFilePath - Absolute or relative path to the local image file
 * @param {object} options
 * @param {string} [options.publicId] - Deterministic public_id (without extension)
 * @param {string} [options.folder='asm-shine/products'] - Cloudinary folder
 * @param {boolean} [options.overwrite=false] - Whether to overwrite existing asset
 * @param {string[]} [options.tags=[]] - Optional tags for asset indexing
 * @returns {Promise<object>} Upload result with secure_url, public_id, width, height, bytes, format
 */
const uploadProductImage = async (localFilePath, options = {}) => {
  const resolvedPath = path.resolve(localFilePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`[CloudinaryService] Local file not found: ${resolvedPath}`);
  }

  const cloudinary = getCloudinary();

  const uploadOptions = {
    resource_type: 'image',
    folder: options.folder || DEFAULT_FOLDER,
    overwrite: options.overwrite !== undefined ? options.overwrite : false,
    use_filename: false,
    unique_filename: false
  };

  if (options.publicId) {
    uploadOptions.public_id = options.publicId;
  }

  if (Array.isArray(options.tags) && options.tags.length > 0) {
    uploadOptions.tags = options.tags;
  }

  const result = await cloudinary.uploader.upload(resolvedPath, uploadOptions);

  return {
    url: result.secure_url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
    createdAt: result.created_at
  };
};

/**
 * Deletes a product image from Cloudinary by public ID.
 * NOTE: When admin authentication is implemented, this operation must be restricted
 * to authenticated admins only. Never expose this endpoint publicly without auth.
 * 
 * @param {string} publicId - The Cloudinary public_id
 * @returns {Promise<object>}
 */
const deleteProductImage = async (publicId) => {
  if (!publicId || typeof publicId !== 'string') {
    throw new Error('[CloudinaryService] Valid publicId is required for deletion');
  }

  const cloudinary = getCloudinary();
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  return result;
};

/**
 * Retrieves asset metadata from Cloudinary.
 * 
 * @param {string} publicId - The Cloudinary public_id
 * @returns {Promise<object>}
 */
const getImageDetails = async (publicId) => {
  if (!publicId) {
    throw new Error('[CloudinaryService] Valid publicId is required');
  }
  const cloudinary = getCloudinary();
  return await cloudinary.api.resource(publicId);
};

module.exports = {
  uploadProductImage,
  deleteProductImage,
  getImageDetails,
  DEFAULT_FOLDER
};
