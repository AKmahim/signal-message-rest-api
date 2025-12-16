const AdminModel = require('../models/AdminModel');
const MessageModel = require('../models/MessageModel');

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

module.exports = {
  showLogin,
  login,
  logout,
  showDashboard,
  getMessages,
  getStats,
};
