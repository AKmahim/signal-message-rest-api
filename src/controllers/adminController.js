const AdminModel = require('../models/AdminModel');
const MessageModel = require('../models/MessageModel');
const axios = require('axios');
const config = require('../config');

// Show login page
const showLogin = (req, res) => {
  if (req.session && req.session.adminId) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { error: null });
};

// Handle login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await AdminModel.findByEmail(email);
    if (!admin) {
      return res.render('admin/login', { error: 'Invalid email or password' });
    }

    const isValid = await AdminModel.verifyPassword(password, admin.password);
    if (!isValid) {
      return res.render('admin/login', { error: 'Invalid email or password' });
    }

    req.session.adminId = admin.id;
    req.session.adminEmail = admin.email;

    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('admin/login', { error: 'An error occurred during login' });
  }
};

// Handle logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/admin/login');
  });
};

// Show dashboard
const showDashboard = async (req, res) => {
  try {
    const stats = await MessageModel.getStats();
    res.render('admin/dashboard', {
      admin: req.session,
      stats,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Error loading dashboard');
  }
};

// Get messages (API)
const getMessages = async (req, res) => {
  try {
    const { phone_number, date, start_date, end_date, limit } = req.query;

    const filters = {};
    if (phone_number) filters.phone_number = phone_number;
    if (date) filters.date = date;
    if (start_date && end_date) {
      filters.start_date = start_date;
      filters.end_date = end_date;
    }
    if (limit) filters.limit = parseInt(limit);

    const messages = await MessageModel.findAll(filters);
    const total = await MessageModel.count(filters);

    res.json({
      success: true,
      total,
      messages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
    });
  }
};

// Get statistics (API)
const getStats = async (req, res) => {
  try {
    const stats = await MessageModel.getStats();
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
};

// Get Signal QR Code for linking
const getSignalQRCode = async (req, res) => {
  try {
    const response = await axios.get(
      `${config.signalCliRestApiUrl}/v1/qrcodelink?device_name=signal-api-admin`,
      { responseType: 'arraybuffer' }
    );
    
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    res.json({
      success: true,
      qrCode: `data:image/png;base64,${base64Image}`,
    });
  } catch (error) {
    console.error('QR Code error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code. Make sure Signal CLI is running.',
    });
  }
};

// Check Signal connection status
const getSignalStatus = async (req, res) => {
  try {
    const response = await axios.get(`${config.signalCliRestApiUrl}/v1/accounts`);
    const accounts = response.data || [];
    const phoneNumber = accounts.length > 0 ? accounts[0] : null;
    
    res.json({
      success: true,
      accounts: accounts,
      connected: accounts.length > 0,
      phoneNumber: phoneNumber,
    });
  } catch (error) {
    console.error('Signal status error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to check Signal status',
      connected: false,
      phoneNumber: null,
    });
  }
};

// Disconnect Signal account
const disconnectSignal = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    // Unregister the account from Signal CLI
    await axios.post(
      `${config.signalCliRestApiUrl}/v1/unregister/${phoneNumber}`
    );

    res.json({
      success: true,
      message: 'Signal account disconnected successfully',
    });
  } catch (error) {
    console.error('Disconnect error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect Signal account',
    });
  }
};

// Submit rate limit challenge with CAPTCHA
const submitCaptcha = async (req, res) => {
  try {
    const { challenge, captcha, phoneNumber } = req.body;

    if (!captcha) {
      return res.status(400).json({
        success: false,
        error: 'CAPTCHA token is required',
      });
    }

    const accountNumber = phoneNumber || config.signalSenderNumber;

    const response = await axios.post(
      `${config.signalCliRestApiUrl}/v1/accounts/${accountNumber}/rate-limit-challenge`,
      {
        challenge: challenge || '',
        captcha: captcha,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    res.json({
      success: true,
      message: 'CAPTCHA submitted successfully! Rate limit should be cleared.',
      data: response.data,
    });
  } catch (error) {
    console.error('Submit CAPTCHA error:', error.message);
    const errorMessage = error.response?.data?.error || error.message || 'Failed to submit CAPTCHA';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

// Trigger a test message to get the challenge token
const triggerChallenge = async (req, res) => {
  try {
    const { testNumber } = req.body;
    const recipientNumber = testNumber || '+8801700000000';

    const response = await axios.post(
      `${config.signalCliRestApiUrl}/v2/send`,
      {
        number: config.signalSenderNumber,
        recipients: [recipientNumber],
        message: 'test',
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
        validateStatus: () => true, // Accept all status codes
      }
    );

    // Check if rate limited
    if (response.data?.error && response.data.error.includes('CAPTCHA proof required')) {
      // Extract challenge token from error message
      const challengeMatch = response.data.error.match(/challenge token "([^"]+)"/);
      const challengeToken = challengeMatch ? challengeMatch[1] : null;

      res.json({
        success: false,
        rateLimited: true,
        challengeToken: challengeToken,
        message: 'Rate limited! Use the challenge token below with a fresh CAPTCHA.',
        rawError: response.data.error,
      });
    } else if (response.data?.timestamp) {
      res.json({
        success: true,
        message: 'Test message sent successfully! No rate limit active.',
        data: response.data,
      });
    } else {
      res.json({
        success: false,
        message: 'Unexpected response',
        data: response.data,
      });
    }
  } catch (error) {
    console.error('Trigger challenge error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to trigger challenge',
    });
  }
};

module.exports = {
  showLogin,
  login,
  logout,
  showDashboard,
  getMessages,
  getStats,
  getSignalQRCode,
  getSignalStatus,
  disconnectSignal,
  submitCaptcha,
  triggerChallenge,
};
