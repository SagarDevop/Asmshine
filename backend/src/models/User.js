const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide a valid email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, 'Please provide a valid email address']
    },
    password: {
      type: String,
      select: false, // Excluded from query results by default
      minlength: [6, 'Password must be at least 6 characters']
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined for users registered via email/password
      trim: true
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    avatar: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    addresses: [
      {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        pincode: { type: String, required: true, trim: true },
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        type: { type: String, enum: ['HOME', 'WORK', 'OTHER'], default: 'HOME' },
        isDefault: { type: Boolean, default: false }
      }
    ],
    wishlist: [{ type: String, trim: true }]
  },
  {
    timestamps: true
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  // If password is already a valid bcrypt hash, don't re-hash it
  if (/^\$2[abxy]\$\d+\$[./A-Za-z0-9]{53}$/.test(this.password)) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare candidate password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON serialization helper excluding sensitive fields
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    phone: this.phone || '',
    avatar: this.avatar || '',
    provider: this.provider,
    addresses: this.addresses || [],
    wishlist: this.wishlist || [],
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
