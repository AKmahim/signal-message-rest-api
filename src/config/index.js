require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  signalCliRestApiUrl: process.env.SIGNAL_CLI_REST_API_URL || 'http://localhost:8080',
  signalSenderNumber: process.env.SIGNAL_SENDER_NUMBER,
};
