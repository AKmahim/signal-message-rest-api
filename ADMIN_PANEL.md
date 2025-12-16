# Admin Panel Documentation

## Admin Panel Features

The Signal REST API now includes a comprehensive admin panel for monitoring and managing SMS messages.

---

## 🔐 Admin Credentials

**Default Login:**
- **Email:** `admin@gp.com`
- **Password:** `Admin@Event#GP`

⚠️ **Important:** Change these credentials in production by directly modifying the database.

---

## 📊 Admin Panel Features

### 1. **Dashboard Overview**
- Total messages sent
- Unique recipients count
- Today's messages count
- Real-time statistics

### 2. **Message History**
- View all sent messages
- Message details (phone number, content, status, timestamp)
- Pagination support

### 3. **Advanced Filtering**
- **Filter by Phone Number:** Search messages sent to a specific number
- **Filter by Date:** View messages sent on a specific date
- **Date Range Filter:** View messages between two dates
- **Real-time search**

### 4. **Export Functionality**
- Export filtered data to CSV
- Download message history for reporting
- All filters apply to exports

### 5. **Message Status Tracking**
- ✅ **Sent:** Successfully delivered
- ❌ **Failed:** Delivery failed

---

## 🚀 Accessing the Admin Panel

### Local Development
```
http://localhost:3000/admin
```

### Production (VPS)
```
http://your-vps-ip:3000/admin
# OR with domain
http://your-domain.com/admin
```

---

## 📱 Admin Panel Usage Guide

### Step 1: Login
1. Navigate to `http://localhost:3000/admin`
2. Enter email: `admin@gp.com`
3. Enter password: `Admin@Event#GP`
4. Click **Login**

### Step 2: View Dashboard
- See total messages, unique recipients, and today's count
- Scroll down to view message history

### Step 3: Filter Messages

**By Phone Number:**
```
Enter: +1234567890
Click: Apply Filters
```

**By Specific Date:**
```
Select date: 2025-12-16
Click: Apply Filters
```

**By Date Range:**
```
Start Date: 2025-12-01
End Date: 2025-12-16
Click: Apply Filters
```

**Clear Filters:**
```
Click: Clear Filters
```

### Step 4: Export Data
1. Apply any filters (optional)
2. Click **Export CSV**
3. File downloads automatically with filtered data

---

## 🔧 Database Structure

### Messages Table
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Admin Users Table
```sql
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Database Location:** `data/signal.db`

---

## 🔒 Security Features

1. **Password Hashing:** Using bcrypt with salt rounds
2. **Session Management:** Secure session cookies
3. **Authentication Required:** All admin routes protected
4. **Auto Logout:** Sessions expire after 24 hours
5. **SQL Injection Prevention:** Parameterized queries

---

## 🛠️ Admin API Endpoints

### Get Messages (Protected)
```http
GET /admin/api/messages
Authorization: Session Cookie Required

Query Parameters:
- phone_number: Filter by phone number
- date: Filter by specific date (YYYY-MM-DD)
- start_date: Range start date
- end_date: Range end date
- limit: Number of records to return

Response:
{
  "success": true,
  "total": 150,
  "messages": [...]
}
```

### Get Statistics (Protected)
```http
GET /admin/api/stats
Authorization: Session Cookie Required

Response:
{
  "success": true,
  "stats": {
    "total": 150,
    "unique": 45,
    "daily": [...]
  }
}
```

---

## 📈 Example Usage Scenarios

### Scenario 1: Check Daily Report
1. Login to admin panel
2. Select today's date in date filter
3. Click "Apply Filters"
4. View messages sent today
5. Click "Export CSV" for records

### Scenario 2: Audit Specific Number
1. Login to admin panel
2. Enter phone number: `+1234567890`
3. Click "Apply Filters"
4. View all messages to that number
5. Check status (sent/failed)

### Scenario 3: Monthly Report
1. Login to admin panel
2. Set Start Date: `2025-12-01`
3. Set End Date: `2025-12-31`
4. Click "Apply Filters"
5. View total count at top
6. Export CSV for monthly report

---

## 🔄 Automatic Message Logging

All messages sent through the API are automatically logged:

```javascript
// Single message
POST /api/send
{
  "phone_number": "+1234567890",
  "message": "Hello World"
}
// Automatically logged to database

// Bulk message
POST /api/send/bulk
{
  "phone_numbers": ["+1234567890", "+0987654321"],
  "message": "Bulk message"
}
// Each message logged separately
```

---

## 🚨 Troubleshooting

### Cannot Login
- Verify database exists: `ls data/signal.db`
- Check console for errors: `pm2 logs signal-api`
- Restart application: `pm2 restart signal-api`

### No Messages Showing
- Ensure messages were sent through the API
- Check database: `sqlite3 data/signal.db "SELECT COUNT(*) FROM messages;"`
- Verify filters are not too restrictive

### Session Expired
- Sessions expire after 24 hours
- Simply login again
- If persists, clear browser cookies

---

## 💻 Development Commands

```bash
# Start with admin panel
npm start

# Development mode with auto-reload
npm run dev

# Check database
sqlite3 data/signal.db

# View all messages
sqlite3 data/signal.db "SELECT * FROM messages;"

# View admin users
sqlite3 data/signal.db "SELECT id, email FROM admin_users;"

# Count messages
sqlite3 data/signal.db "SELECT COUNT(*) FROM messages;"
```

---

## 📊 Sample Dashboard View

```
┌─────────────────────────────────────────────────────┐
│  📊 Signal API Dashboard                            │
│  admin@gp.com                          [Logout]     │
└─────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Total Msgs   │  │ Unique Users │  │ Today's Msgs │
│    1,234     │  │     456      │  │      89      │
└──────────────┘  └──────────────┘  └──────────────┘

🔍 Filter Messages
[Phone: _________] [Date: _________] [Start: _____] [End: _____]
[Apply Filters] [Clear Filters] [Export CSV]

📨 Messages History                     Total: 1,234 messages
┌────┬──────────────┬─────────────┬────────┬──────────────┐
│ ID │ Phone Number │ Message     │ Status │ Date & Time  │
├────┼──────────────┼─────────────┼────────┼──────────────┤
│ 5  │ +1234567890  │ Hello...    │  sent  │ Dec 16, 2025 │
│ 4  │ +0987654321  │ Test msg... │  sent  │ Dec 16, 2025 │
│ 3  │ +1122334455  │ Welcome...  │ failed │ Dec 15, 2025 │
└────┴──────────────┴─────────────┴────────┴──────────────┘
```

---

## 🔐 Changing Admin Password

To change the admin password in production:

```bash
# Access the server
ssh user@your-vps

# Open SQLite database
sqlite3 ~/apps/signal-api/data/signal.db

# Generate new password hash (use Node.js)
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourNewPassword', 10, (e,h) => console.log(h));"

# Update password in database
UPDATE admin_users SET password = 'PASTE_HASH_HERE' WHERE email = 'admin@gp.com';

# Exit
.exit
```

---

## 📱 Mobile Responsive

The admin panel is fully responsive and works on:
- ✅ Desktop browsers
- ✅ Tablets
- ✅ Mobile phones

---

## 🎯 Quick Access URLs

| Feature | URL |
|---------|-----|
| Login Page | `/admin` or `/admin/login` |
| Dashboard | `/admin/dashboard` |
| Logout | `/admin/logout` |
| Messages API | `/admin/api/messages` |
| Stats API | `/admin/api/stats` |

---

## 🔗 Integration with VPS

When deploying to VPS, the admin panel automatically works with:
- ✅ PM2 process manager
- ✅ Nginx reverse proxy
- ✅ SSL/HTTPS (if configured)
- ✅ Firewall rules

Just ensure port 3000 is accessible or proxy through Nginx.

---

## 📦 Backup Database

Regular backups recommended:

```bash
# Backup database
cp data/signal.db data/signal-backup-$(date +%Y%m%d).db

# Or use cron for automatic daily backups
0 2 * * * cp /path/to/signal-api/data/signal.db /path/to/backups/signal-$(date +\%Y\%m\%d).db
```

---

## ✅ Admin Panel Testing Checklist

- [ ] Can login with default credentials
- [ ] Dashboard loads with statistics
- [ ] Can view message history
- [ ] Phone number filter works
- [ ] Date filter works
- [ ] Date range filter works
- [ ] Clear filters button works
- [ ] Export CSV downloads correctly
- [ ] Logout redirects to login
- [ ] Session persists across page refreshes
- [ ] Session expires after 24 hours
- [ ] Unauthorized access redirects to login

---

## 🎉 Summary

The admin panel provides complete visibility into your Signal messaging system with:
- Real-time message tracking
- Advanced filtering capabilities
- Export functionality
- Secure authentication
- Mobile-friendly interface
- Automatic message logging

Access it at: **http://localhost:3000/admin**
