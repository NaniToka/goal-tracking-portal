const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

/**
 * Verify JWT access token and attach user to req.user
 */
const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized. Please log in.', 401);
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Access token expired. Please refresh or log in again.', 401);
      }
      throw new AppError('Invalid access token.', 401);
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new AppError('User no longer exists.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Contact HR.', 401);
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(401).json({ success: false, message: 'Not authorized.' });
  }
};

/**
 * Role-based access control — use after protect
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized.' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Role '${req.user.role}' is not authorized for this action.`,
    });
  }
  next();
};

/**
 * Optional auth — attaches user when token present, continues otherwise
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password');
    if (user?.isActive) req.user = user;
  } catch {
    // ignore invalid optional token
  }
  next();
};

module.exports = { protect, authorize, optionalAuth };
