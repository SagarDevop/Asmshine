const mongoose = require('mongoose');

const availableSizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  sku: { type: String, trim: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: String },
  stockQuantity: { type: Number, default: 20, min: 0 },
  inStock: { type: Boolean, default: true },
  image: { type: String }, // Local path or Cloudinary HTTPS URL
  imageData: {
    url: { type: String },
    secureUrl: { type: String },
    publicId: { type: String },
    alt: { type: String }
  }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  id: { type: String },
  author: { type: String, required: true },
  location: { type: String },
  rating: { type: Number, default: 5 },
  date: { type: String },
  title: { type: String },
  comment: { type: String }
}, { _id: false });

const imageMetaSchema = new mongoose.Schema({
  url: { type: String },
  secureUrl: { type: String },
  publicId: { type: String },
  alt: { type: String },
  format: { type: String },
  bytes: { type: Number },
  width: { type: Number },
  height: { type: Number }
}, { _id: false });

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  shortName: { type: String },
  brand: { type: String, default: 'ASM SHINE' },
  category: { type: String, required: true, index: true },
  section: { type: String, required: true, index: true }, // best_sellers | everyday_essentials | recommended
  size: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  discountPercent: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: String, default: '1k' },
  ratingsCount: { type: String },
  image: { type: String, required: true }, // Primary HTTPS URL (or local path fallback)
  imageData: imageMetaSchema,               // Full Cloudinary metadata
  gallery: [imageMetaSchema],               // Optional gallery images
  badge: { type: String }, // 'BEST SELLER', 'TRENDING', 'HOT', etc.
  sku: { type: String, unique: true, sparse: true, trim: true },
  stockQuantity: { type: Number, default: 20, min: 0 },
  reservedQuantity: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 5, min: 0 },
  costPrice: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active', index: true },
  inStock: { type: Boolean, default: true },
  assured: { type: Boolean, default: true },
  companionId: { type: String },
  comboDiscount: { type: Number, default: 0 },
  comboSavingsPercent: { type: Number, default: 0 },
  description: { type: String },
  availableSizes: [availableSizeSchema],
  highlights: [{ type: String }],
  specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
  reviews: [reviewSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strict: false
});

// Virtual for available stock (onHand - reserved)
productSchema.virtual('availableStock').get(function () {
  return Math.max(0, (this.stockQuantity || 0) - (this.reservedQuantity || 0));
});

module.exports = mongoose.model('Product', productSchema);

