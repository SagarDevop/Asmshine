const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware:
 * Validates JWT token from HttpOnly cookie or Authorization Bearer header.
 * Derives authenticated user securely and attaches to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HttpOnly cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback to Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret && process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be configured in production');
    }
    const decoded = jwt.verify(token, jwtSecret || 'dev_jwt_secret_local_apex');

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session token. Please log in again.'
      });
    }

    // Retrieve active user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or session expired.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid session token. Please log in again.'
    });
  }
};

/**
 * Optional Authentication Middleware:
 * Attaches req.user if a valid token is present; otherwise gracefully sets req.user = null
 * without returning 401. Ideal for session checks like /api/v1/auth/me.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, jwtSecret || 'dev_jwt_secret_local_apex');

    if (decoded && decoded.id) {
      const user = await User.findById(decoded.id);
      req.user = user || null;
    } else {
      req.user = null;
    }
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Role-Based Authorization Middleware:
 * Restricts access to users having one of the specified roles.
 * Superadmin always bypasses role restrictions.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.'
      });
    }

    const userRole = req.user.role || 'customer';

    // Superadmin has universal permissions
    if (userRole === 'superadmin') {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of [${allowedRoles.join(', ')}] role.`
      });
    }

    next();
  };
};

authenticate.authenticate = authenticate;
authenticate.optionalAuth = optionalAuth;
authenticate.authorize = authorize;

module.exports = authenticate;
module.exports.optionalAuth = optionalAuth;
module.exports.authorize = authorize;

