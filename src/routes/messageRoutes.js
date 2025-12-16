const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const {
  sendMessageValidation,
  sendBulkMessageValidation,
  validate,
} = require('../middleware/validation');

/**
 * @route   POST /api/send
 * @desc    Send a message to a single Signal user
 * @body    { phone_number: string, message: string }
 */
router.post('/send', sendMessageValidation, validate, messageController.sendMessage);

/**
 * @route   POST /api/send/bulk
 * @desc    Send a message to multiple Signal users
 * @body    { phone_numbers: string[], message: string }
 */
router.post('/send/bulk', sendBulkMessageValidation, validate, messageController.sendBulkMessage);

/**
 * @route   GET /api/health
 * @desc    Check Signal CLI REST API health
 */
router.get('/health', messageController.healthCheck);

module.exports = router;
