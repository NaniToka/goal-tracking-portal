const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const AppError = require('../utils/AppError');
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} = require('../utils/jwt');

const REFRESH_MS = () => {
  const days = parseInt(process.env.JWT_REFRESH_DAYS, 10) || 30;
  return days * 24 * 60 * 60 * 1000;
};

/** Populate user fields safe for client */
async function getUserPayload(userId) {
  return User.findById(userId)
    .populate('manager', 'name email')
    .select('-password');
}

/** Persist refresh token hash */
async function saveRefreshToken(userId, refreshToken, req) {
  const expiresAt = new Date(Date.now() + REFRESH_MS());
  await RefreshToken.create({
    user: userId,
    tokenHash: hashToken(refreshToken),
    expiresAt,
    userAgent: req.get('user-agent') || '',
    ipAddress: req.ip || req.socket?.remoteAddress || '',
  });
  return expiresAt;
}

/** Issue access + refresh token pair */
async function issueTokenPair(userId, req) {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  const refreshExpiresAt = await saveRefreshToken(userId, refreshToken, req);
  return { accessToken, refreshToken, refreshExpiresAt };
}

/**
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Contact your administrator.', 401);
    }

    // Optional: limit concurrent sessions — revoke old refresh tokens
    await RefreshToken.deleteMany({ user: user._id });

    const { accessToken, refreshToken, refreshExpiresAt } = await issueTokenPair(
      user._id,
      req
    );

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const userPayload = await getUserPayload(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      accessToken,
      refreshToken,
      refreshExpiresAt,
      user: userPayload,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 * Rotate refresh token and issue new access token
 */
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError('Refresh token is required.', 400);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expired. Please log in again.', 401);
      }
      throw new AppError('Invalid refresh token.', 401);
    }

    const stored = await RefreshToken.findOne({ tokenHash: hashToken(refreshToken) });
    if (!stored) {
      throw new AppError('Refresh token revoked or not found.', 401);
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      await RefreshToken.deleteOne({ _id: stored._id });
      throw new AppError('User not found or inactive.', 401);
    }

    // Rotate: remove old, issue new pair
    await RefreshToken.deleteOne({ _id: stored._id });
    const tokens = await issueTokenPair(user._id, req);
    const userPayload = await getUserPayload(user._id);

    res.json({
      success: true,
      message: 'Token refreshed',
      token: tokens.accessToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      refreshExpiresAt: tokens.refreshExpiresAt,
      user: userPayload,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Revoke refresh token(s) for current user
 */
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });
    } else {
      await RefreshToken.deleteMany({ user: req.user._id });
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await getUserPayload(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify
 * Validate access token without side effects
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const user = await getUserPayload(req.user._id);
    res.json({
      success: true,
      valid: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/change-password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError('Current password is incorrect.', 400);
    }

    user.password = newPassword;
    await user.save();

    // Invalidate all refresh tokens after password change
    await RefreshToken.deleteMany({ user: user._id });

    res.json({ success: true, message: 'Password updated successfully. Please log in again.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/sessions — list active refresh sessions (current user)
 */
exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await RefreshToken.find({ user: req.user._id })
      .select('userAgent ipAddress createdAt expiresAt')
      .sort('-createdAt');

    res.json({ success: true, sessions, count: sessions.length });
  } catch (error) {
    next(error);
  }
};
