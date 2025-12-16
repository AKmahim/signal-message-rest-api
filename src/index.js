const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const config = require('./config');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');
require('./config/database'); // Initialize database

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'signal-api-admin-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/api', messageRoutes);
app.use('/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Signal REST API',
    version: '1.0.0',
    description: 'REST API for sending Signal messages',
    endpoints: {
      'POST /api/send': 'Send a message to a single recipient',
      'POST /api/send/bulk': 'Send a message to multiple recipients',
      'GET /api/health': 'Check Signal CLI REST API health',
      'GET /admin': 'Admin panel login',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Signal REST API running on port ${config.port}`);
  console.log(`📡 Signal CLI REST API URL: ${config.signalCliRestApiUrl}`);
  console.log(`📱 Sender number: ${config.signalSenderNumber}`);
});

module.exports = app;
