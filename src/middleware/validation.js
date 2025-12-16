const { body, validationResult } = require('express-validator');

// Validation rules for sending a message
const sendMessageValidation = [
  body('phone_number')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('Phone number must be in E.164 format (e.g., +1234567890)'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 4096 })
    .withMessage('Message must be between 1 and 4096 characters'),
];

// Validation rules for sending to multiple recipients
const sendBulkMessageValidation = [
  body('phone_numbers')
    .isArray({ min: 1 })
    .withMessage('Phone numbers must be a non-empty array'),
  body('phone_numbers.*')
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('Each phone number must be in E.164 format (e.g., +1234567890)'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 4096 })
    .withMessage('Message must be between 1 and 4096 characters'),
];

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  sendMessageValidation,
  sendBulkMessageValidation,
  validate,
};
