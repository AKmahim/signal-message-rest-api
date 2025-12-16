const axios = require('axios');
const config = require('../config');

class SignalService {
  constructor() {
    this.apiUrl = config.signalCliRestApiUrl;
    this.senderNumber = config.signalSenderNumber;
  }

  /**
   * Send a message to a Signal user
   * @param {string} recipientNumber - The recipient's phone number (with country code)
   * @param {string} message - The message to send
   * @returns {Promise<object>} - Response from Signal CLI REST API
   */
  async sendMessage(recipientNumber, message) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v2/send`,
        {
          message: message,
          number: this.senderNumber,
          recipients: [recipientNumber],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error sending Signal message:', error.message);
      
      if (error.response) {
        throw new Error(error.response.data?.error || 'Failed to send message via Signal');
      }
      
      throw new Error('Failed to connect to Signal CLI REST API. Make sure it is running.');
    }
  }

  /**
   * Send a message to multiple recipients
   * @param {string[]} recipientNumbers - Array of recipient phone numbers
   * @param {string} message - The message to send
   * @returns {Promise<object>} - Response from Signal CLI REST API
   */
  async sendMessageToMultiple(recipientNumbers, message) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v2/send`,
        {
          message: message,
          number: this.senderNumber,
          recipients: recipientNumbers,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error sending Signal message:', error.message);
      
      if (error.response) {
        throw new Error(error.response.data?.error || 'Failed to send messages via Signal');
      }
      
      throw new Error('Failed to connect to Signal CLI REST API. Make sure it is running.');
    }
  }

  /**
   * Check if Signal CLI REST API is available
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.apiUrl}/v1/about`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Signal CLI REST API is not available',
      };
    }
  }
}

module.exports = new SignalService();
