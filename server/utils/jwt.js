const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_SECRET = () => process.env.JWT_SECRET;
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

/**
 * Sign short-lived access token (API requests)
 */
function generateAccessToken(userId) {
  return jwt.sign(
    { id: userId, type: 'access' },
    ACCESS_SECRET(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Sign long-lived refresh token (token rotation)
 */
function generateRefreshToken(userId) {
  return jwt.sign(
    { id: userId, type: 'refresh', jti: crypto.randomUUID() },
    REFRESH_SECRET(),
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
}

/**
 * Hash refresh token for secure storage
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify access token payload
 */
function verifyAccessToken(token) {
  const decoded = jwt.verify(token, ACCESS_SECRET());
  if (decoded.type && decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return decoded;
}

/**
 * Verify refresh token payload
 */
function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, REFRESH_SECRET());
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return decoded;
}

/**
 * Decode without verify (for debugging expired tokens)
 */
function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};
