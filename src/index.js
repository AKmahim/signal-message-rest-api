const express = require('express');
const cors = require('cors');
const config = require('./config');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', messageRoutes);

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
