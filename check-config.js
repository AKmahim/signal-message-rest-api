#!/usr/bin/env node

/**
 * Signal API Configuration Checker
 * Run this to verify your setup before starting the server
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Signal API Configuration Checker\n');
console.log('====================================\n');

let hasErrors = false;

// Check 1: .env file
console.log('📋 Checking .env file...');
if (fs.existsSync('.env')) {
  console.log('   ✅ .env file exists');
  
  const envContent = fs.readFileSync('.env', 'utf8');
  
  if (envContent.includes('SIGNAL_SENDER_NUMBER=+')) {
    console.log('   ✅ SIGNAL_SENDER_NUMBER is configured');
  } else {
    console.log('   ❌ SIGNAL_SENDER_NUMBER needs to be set');
    hasErrors = true;
  }
  
  if (envContent.includes('SIGNAL_CLI_REST_API_URL')) {
    console.log('   ✅ SIGNAL_CLI_REST_API_URL is configured');
  } else {
    console.log('   ❌ SIGNAL_CLI_REST_API_URL needs to be set');
    hasErrors = true;
  }
} else {
  console.log('   ❌ .env file not found. Copy .env.example to .env');
  hasErrors = true;
}
console.log('');

// Check 2: node_modules
console.log('📦 Checking dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('   ✅ Dependencies installed');
  
  // Check critical packages
  const packages = ['express', 'sqlite3', 'ejs', 'bcryptjs', 'express-session'];
  packages.forEach(pkg => {
    if (fs.existsSync(path.join('node_modules', pkg))) {
      console.log(`   ✅ ${pkg} installed`);
    } else {
      console.log(`   ❌ ${pkg} not installed`);
      hasErrors = true;
    }
  });
} else {
  console.log('   ❌ Dependencies not installed. Run: npm install');
  hasErrors = true;
}
console.log('');

// Check 3: Data directory
console.log('💾 Checking data directory...');
if (fs.existsSync('data')) {
  console.log('   ✅ Data directory exists');
} else {
  console.log('   ⚠️  Data directory will be created on first run');
}
console.log('');

// Check 4: Source files
console.log('📁 Checking source files...');
const requiredFiles = [
  'src/index.js',
  'src/config/database.js',
  'src/controllers/messageController.js',
  'src/controllers/adminController.js',
  'src/models/MessageModel.js',
  'src/models/AdminModel.js',
  'src/routes/messageRoutes.js',
  'src/routes/adminRoutes.js',
  'src/middleware/auth.js',
  'src/views/admin/login.ejs',
  'src/views/admin/dashboard.ejs'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} missing`);
    hasErrors = true;
  }
});
console.log('');

// Check 5: Port availability
console.log('🔌 Checking port availability...');
const net = require('net');
const testPort = 3000;

const server = net.createServer();
server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`   ⚠️  Port ${testPort} is already in use`);
    console.log('   💡 Stop the running server or change PORT in .env');
  }
});

server.once('listening', () => {
  console.log(`   ✅ Port ${testPort} is available`);
  server.close();
});

server.listen(testPort);

setTimeout(() => {
  console.log('');
  
  // Final summary
  if (hasErrors) {
    console.log('❌ Configuration has errors. Please fix them before starting.\n');
    process.exit(1);
  } else {
    console.log('✅ All checks passed! Your setup looks good.\n');
    console.log('🚀 Ready to start the server:');
    console.log('   npm start\n');
    console.log('📊 Admin Panel:');
    console.log('   http://localhost:3000/admin');
    console.log('   Email: admin@gp.com');
    console.log('   Password: Admin@Event#GP\n');
    process.exit(0);
  }
}, 100);
