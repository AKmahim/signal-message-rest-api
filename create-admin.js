
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'signal.db'));

const email = process.argv[2] || 'admin@example.com';
const password = process.argv[3] || '12345678';
const hashedPassword = bcrypt.hashSync(password, 10);

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Delete existing admin and insert new one
db.exec('DELETE FROM admins');
db.prepare('INSERT INTO admins (email, password) VALUES (?, ?)').run(email, hashedPassword);

console.log('✅ Admin user created successfully!');
console.log('   Email:', email);
console.log('   Password:', password);
db.close();