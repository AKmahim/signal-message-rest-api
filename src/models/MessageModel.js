const db = require('../config/database');

const MessageModel = {
  // Create a new message log
  create: (phoneNumber, message, status = 'sent') => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO messages (phone_number, message, status) VALUES (?, ?, ?)',
        [phoneNumber, message, status],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  },

  // Get all messages with optional filters
  findAll: (filters = {}) => {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM messages WHERE 1=1';
      const params = [];

      if (filters.phone_number) {
        query += ' AND phone_number = ?';
        params.push(filters.phone_number);
      }

      if (filters.date) {
        query += ' AND DATE(created_at) = ?';
        params.push(filters.date);
      }

      if (filters.start_date && filters.end_date) {
        query += ' AND DATE(created_at) BETWEEN ? AND ?';
        params.push(filters.start_date, filters.end_date);
      }

      query += ' ORDER BY created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Get message count
  count: (filters = {}) => {
    return new Promise((resolve, reject) => {
      let query = 'SELECT COUNT(*) as count FROM messages WHERE 1=1';
      const params = [];

      if (filters.phone_number) {
        query += ' AND phone_number = ?';
        params.push(filters.phone_number);
      }

      if (filters.date) {
        query += ' AND DATE(created_at) = ?';
        params.push(filters.date);
      }

      if (filters.start_date && filters.end_date) {
        query += ' AND DATE(created_at) BETWEEN ? AND ?';
        params.push(filters.start_date, filters.end_date);
      }

      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
  },

  // Get statistics
  getStats: () => {
    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT 
          COUNT(*) as total_messages,
          COUNT(DISTINCT phone_number) as unique_recipients,
          DATE(created_at) as date,
          COUNT(*) as count
        FROM messages
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 7
      `,
        (err, rows) => {
          if (err) reject(err);
          else {
            db.get('SELECT COUNT(*) as total FROM messages', (err, total) => {
              if (err) reject(err);
              else {
                db.get('SELECT COUNT(DISTINCT phone_number) as unique_count FROM messages', (err, uniqueResult) => {
                  if (err) reject(err);
                  else resolve({ total: total.total, unique: uniqueResult.unique_count, daily: rows });
                });
              }
            });
          }
        }
      );
    });
  },
};

module.exports = MessageModel;
