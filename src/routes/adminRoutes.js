const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/auth');

// Root admin route - redirect to login or dashboard
router.get('/', (req, res) => {
  if (req.session && req.session.adminId) {
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/admin/login');
  }
});

// Public routes
router.get('/login', adminController.showLogin);
router.post('/login', adminController.login);
router.get('/logout', adminController.logout);

// Protected routes
router.get('/dashboard', isAuthenticated, adminController.showDashboard);

// API routes
router.get('/api/messages', isAuthenticated, adminController.getMessages);
router.get('/api/stats', isAuthenticated, adminController.getStats);

module.exports = router;
