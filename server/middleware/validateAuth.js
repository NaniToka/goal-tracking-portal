const { body, validationResult } = require('express-validator');

/**
 * Return validation errors as 400 JSON
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array().map((e) => e.msg).join(' '),
      errors: errors.array(),
    });
  }
  next();
};

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const refreshRules = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

module.exports = {
  handleValidation,
  loginRules,
  refreshRules,
  changePasswordRules,
};
