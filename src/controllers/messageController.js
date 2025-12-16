const signalService = require('../services/signalService');

/**
 * Send a message to a single recipient
 * POST /api/send
 */
const sendMessage = async (req, res) => {
  try {
    const { phone_number, message } = req.body;

    const result = await signalService.sendMessage(phone_number, message);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: result.data,
    });
  } catch (error) {
    console.error('Send message error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Send a message to multiple recipients
 * POST /api/send/bulk
 */
const sendBulkMessage = async (req, res) => {
  try {
    const { phone_numbers, message } = req.body;

    const result = await signalService.sendMessageToMultiple(phone_numbers, message);

    res.status(200).json({
      success: true,
      message: `Message sent to ${phone_numbers.length} recipients`,
      data: result.data,
    });
  } catch (error) {
    console.error('Send bulk message error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Health check for Signal CLI REST API
 * GET /api/health
 */
const healthCheck = async (req, res) => {
  try {
    const result = await signalService.healthCheck();

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Signal CLI REST API is available',
        data: result.data,
      });
    } else {
      res.status(503).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to check Signal CLI REST API health',
    });
  }
};

module.exports = {
  sendMessage,
  sendBulkMessage,
  healthCheck,
};
