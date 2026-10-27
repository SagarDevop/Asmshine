const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Otp = require('../models/Otp');
const Order = require('../models/Order');
const emailService = require('../services/emailService');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Generate signed JWT token
 */
const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production');
  }
  return jwt.sign(
    { id: userId },
    jwtSecret || 'dev_jwt_secret_local_apex',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Configure secure session cookie
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
});

/**
 * Helper to compute SHA-256 hash of OTP
 */
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp.toString()).digest('hex');
};

/**
 * POST /api/v1/auth/signup/send-otp
 * Validate details, generate secure OTP, and deliver via email
 */
exports.sendSignupOtp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required.'
      });
    }

    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if account already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    // Check cooldown for existing OTP
    const existingOtp = await Otp.findOne({ email: normalizedEmail });
    if (existingOtp && existingOtp.lastResendAt) {
      const secondsSinceLast = Math.floor((Date.now() - existingOtp.lastResendAt.getTime()) / 1000);
      if (secondsSinceLast < 60) {
        return res.status(429).json({
          success: false,
          cooldownRemaining: 60 - secondsSinceLast,
          message: `Please wait ${60 - secondsSinceLast} seconds before requesting another verification code.`
        });
      }
    }

    // Generate cryptographically secure 6-digit numeric OTP
    const otpNumber = crypto.randomInt(100000, 999999).toString();
    const otpHash = hashOtp(otpNumber);

    // Pre-hash password for the pending user
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save or update pending OTP record (10 minute expiry)
    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        otpHash,
        attempts: 0,
        lastResendAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      },
      { upsert: true, new: true }
    );

    // Send verification email
    const emailResult = await emailService.sendOtpEmail({
      to: normalizedEmail,
      name: name.trim(),
      otp: otpNumber
    });

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email address.',
      email: normalizedEmail,
      simulated: emailResult.simulated,
      devOtp: emailResult.simulated ? otpNumber : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/signup/verify-otp
 * Verify submitted OTP and complete user account creation
 */
exports.verifySignupOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit verification code are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Find pending OTP record
    const otpRecord = await Otp.findOne({ email: normalizedEmail });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Verification code not found or expired. Please request a new code.'
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      });
    }

    // Check attempts limit
    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new code.'
      });
    }

    // Verify OTP hash
    const submittedHash = hashOtp(cleanOtp);
    if (submittedHash !== otpRecord.otpHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 5 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. (${remaining} attempts remaining)`
      });
    }

    // Check once more for existing user (race condition prevention)
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      await Otp.deleteMany({ email: normalizedEmail });
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    // Create user with pre-hashed password directly
    user = new User({
      name: otpRecord.name,
      email: otpRecord.email,
      password: otpRecord.passwordHash,
      provider: 'local'
    });
    // Skip pre-save hashing since password is already hashed
    await user.save({ validateBeforeSave: true });

    // Clean up OTP record
    await Otp.deleteMany({ email: normalizedEmail });

    // Establish session
    const token = generateToken(user._id);
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Account verified and created successfully.',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/signup/resend-otp
 * Resend OTP code with 60-second cooldown check
 */
exports.resendSignupOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await Otp.findOne({ email: normalizedEmail });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found for this email. Please sign up again.'
      });
    }

    // Cooldown check (60s)
    const secondsSinceLast = Math.floor((Date.now() - otpRecord.lastResendAt.getTime()) / 1000);
    if (secondsSinceLast < 60) {
      return res.status(429).json({
        success: false,
        cooldownRemaining: 60 - secondsSinceLast,
        message: `Please wait ${60 - secondsSinceLast} seconds before requesting a new code.`
      });
    }

    // Generate new OTP
    const otpNumber = crypto.randomInt(100000, 999999).toString();
    otpRecord.otpHash = hashOtp(otpNumber);
    otpRecord.attempts = 0;
    otpRecord.lastResendAt = new Date();
    otpRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await otpRecord.save();

    const emailResult = await emailService.sendOtpEmail({
      to: normalizedEmail,
      name: otpRecord.name,
      otp: otpNumber
    });

    res.status(200).json({
      success: true,
      message: 'A new verification code has been sent to your email.',
      email: normalizedEmail,
      simulated: emailResult.simulated,
      devOtp: emailResult.simulated ? otpNumber : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/register
 * Direct registration (backward compatible)
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required.'
      });
    }

    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      provider: 'local'
    });

    const token = generateToken(user._id);
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 * Log in with Email and Password
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id);
    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/google
 * Google Identity Services authentication
 */
exports.googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token credential is required.'
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(503).json({
        success: false,
        message: 'Google Sign-In is not configured on this server. Please set GOOGLE_CLIENT_ID in server environment.'
      });
    }

    const client = new OAuth2Client(clientId);
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Google credential.'
      });
    }

    if (!payload || !payload.sub || !payload.email) {
      return res.status(400).json({
        success: false,
        message: 'Malformed Google identity response.'
      });
    }

    if (!payload.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Your Google email address is not verified by Google.'
      });
    }

    const googleId = payload.sub;
    const normalizedEmail = payload.email.toLowerCase().trim();

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email: normalizedEmail });

      if (user) {
        user.googleId = googleId;
        if (!user.avatar && payload.picture) {
          user.avatar = payload.picture;
        }
        await user.save();
      } else {
        user = await User.create({
          name: payload.name || 'ASM Shine Member',
          email: normalizedEmail,
          googleId,
          provider: 'google',
          avatar: payload.picture || ''
        });
      }
    } else {
      if (payload.picture && user.avatar !== payload.picture) {
        user.avatar = payload.picture;
        await user.save();
      }
    }

    const token = generateToken(user._id);
    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Google sign-in successful.',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 * Invalidate session and clear auth cookie
 */
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

/**
 * GET /api/v1/auth/me
 * Return currently authenticated user profile
 */
exports.getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user ? req.user.toSafeObject() : null
  });
};

/**
 * PUT /api/v1/auth/profile
 * Update user's name and contact phone
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (name && name.trim()) {
      req.user.name = name.trim();
    }
    if (phone !== undefined) {
      req.user.phone = phone.trim();
    }

    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: req.user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/addresses
 * List user's saved delivery addresses
 */
exports.getAddresses = (req, res) => {
  const addresses = req.user.addresses || [];
  res.status(200).json({
    success: true,
    addresses,
    data: addresses
  });
};

/**
 * POST /api/v1/auth/addresses
 * Add a new delivery address
 */
exports.addAddress = async (req, res, next) => {
  try {
    const recipientName = (req.body.fullName || req.body.name || '').trim();
    const phone = (req.body.phone || '').trim();
    const pincode = (req.body.pincode || '').trim();
    const street = (req.body.street || '').trim();
    const city = (req.body.city || '').trim();
    const state = (req.body.state || '').trim();
    const type = (req.body.type || 'HOME').toUpperCase();
    const isDefault = Boolean(req.body.isDefault);

    if (!recipientName || !phone || !pincode || !street || !city || !state) {
      return res.status(400).json({
        success: false,
        message: 'All address fields (name, phone, pincode, street, city, state) are required.'
      });
    }

    // If marked default, unset default on other addresses
    if (isDefault && req.user.addresses.length > 0) {
      req.user.addresses.forEach(addr => addr.isDefault = false);
    }

    req.user.addresses.push({
      fullName: recipientName,
      name: recipientName,
      phone,
      pincode,
      street,
      city,
      state,
      type: ['HOME', 'WORK', 'OTHER'].includes(type) ? type : 'HOME',
      isDefault: isDefault || req.user.addresses.length === 0
    });

    await req.user.save();

    res.status(201).json({
      success: true,
      message: 'Delivery address added successfully.',
      addresses: req.user.addresses,
      data: req.user.addresses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/auth/addresses/:addressId
 * Delete a saved delivery address
 */
exports.deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    req.user.addresses = req.user.addresses.filter(addr => addr._id.toString() !== addressId);
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Delivery address deleted.',
      addresses: req.user.addresses,
      data: req.user.addresses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/orders
 * Returns genuine orders for authenticated user
 */
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map((o) => ({
      id: o.orderId,
      orderId: o.orderId,
      _id: o._id,
      items: o.items,
      shippingAddress: o.shippingAddress,
      pricing: o.pricing,
      totalAmount: o.totalAmount,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt
    }));

    res.status(200).json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders,
      data: formattedOrders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/wishlist
 * Returns the authenticated user's persistent wishlist IDs
 */
exports.getWishlist = async (req, res, next) => {
  try {
    const wishlist = req.user.wishlist || [];
    res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/wishlist/toggle
 * Adds or removes a product ID in the authenticated user's wishlist
 */
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId is required.'
      });
    }

    const cleanPid = productId.trim();
    let list = Array.isArray(req.user.wishlist) ? [...req.user.wishlist] : [];

    const exists = list.includes(cleanPid);
    if (exists) {
      list = list.filter((id) => id !== cleanPid);
    } else {
      list.push(cleanPid);
    }

    req.user.wishlist = list;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: exists ? 'Removed from wishlist.' : 'Saved to wishlist.',
      inWishlist: !exists,
      wishlist: req.user.wishlist,
      data: req.user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/wishlist/sync
 * Merges guest wishlist IDs into the authenticated user's wishlist avoiding duplicates
 */
exports.syncWishlist = async (req, res, next) => {
  try {
    const { productIds = [] } = req.body;
    let list = Array.isArray(req.user.wishlist) ? [...req.user.wishlist] : [];

    if (Array.isArray(productIds) && productIds.length > 0) {
      const mergedSet = new Set([...list, ...productIds.filter(Boolean).map((id) => id.toString().trim())]);
      list = Array.from(mergedSet);
      req.user.wishlist = list;
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Wishlist synced successfully.',
      wishlist: req.user.wishlist,
      data: req.user.wishlist
    });
  } catch (error) {
    next(error);
  }
};
