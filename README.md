# Signal REST API

A comprehensive REST API for sending messages via Signal messenger with an admin panel for monitoring and analytics.

## ✨ Features

- 📨 Send messages to single or multiple recipients
- 📊 Admin dashboard with message statistics
- 🔍 Advanced filtering (by phone, date, date range)
- 📥 Export message history to CSV
- 🔒 Secure password-protected admin panel
- 💾 SQLite database for message logging
- 📱 Mobile-responsive interface

## Prerequisites

This API requires **signal-cli-rest-api** to be running. The easiest way is using Docker:

### 1. Set up Signal CLI REST API (Docker)

```bash
# Create a directory for Signal data
mkdir -p ~/.local/share/signal-cli

# Run signal-cli-rest-api container
docker run -d --name signal-cli-rest-api \
  -p 8080:8080 \
  -v ~/.local/share/signal-cli:/home/.local/share/signal-cli \
  -e MODE=native \
  bbernhard/signal-cli-rest-api
```

### 2. Register your phone number with Signal

```bash
# Request a verification code via SMS
curl -X POST -H "Content-Type: application/json" \
  "http://localhost:8080/v1/register/+YOUR_PHONE_NUMBER"

# Verify with the code you received
curl -X POST -H "Content-Type: application/json" \
  -d '{"pin": "123456"}' \
  "http://localhost:8080/v1/register/+YOUR_PHONE_NUMBER/verify"
```

**OR** link to an existing Signal account:

```bash
# Get QR code link
curl "http://localhost:8080/v1/qrcodelink?device_name=signal-api"
# Scan the QR code with Signal mobile app (Settings -> Linked Devices)
```

## Installation

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
```

## Configuration

Edit `.env` file:

```env
PORT=3000
SIGNAL_CLI_REST_API_URL=http://localhost:8080
SIGNAL_SENDER_NUMBER=+1234567890  # Your registered Signal number
```

## Running the API

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API will start on `http://localhost:3000`

## 🎯 Quick Start Testing

Once the API is running:

1. **Access Admin Panel:** http://localhost:3000/admin
   - Email: `admin@gp.com`
   - Password: `Admin@Event#GP`

2. **Send a test message:**
```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+1234567890", "message": "Test message"}'
```

3. **View in admin panel:** Refresh dashboard to see the message logged

## 📊 Admin Panel

Access the admin dashboard at `http://localhost:3000/admin`

**Features:**
- View total messages sent
- Filter by phone number or date
- Export data to CSV
- Real-time message tracking

👉 **[Full Admin Panel Documentation](ADMIN_PANEL.md)**

## API Endpoints

### Send Message to Single Recipient

```http
POST /api/send
Content-Type: application/json

{
  "phone_number": "+1234567890",
  "message": "Hello from Signal API!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {}
}
```

### Send Message to Multiple Recipients

```http
POST /api/send/bulk
Content-Type: application/json

{
  "phone_numbers": ["+1234567890", "+0987654321"],
  "message": "Hello everyone!"
}
```

### Health Check

```http
GET /api/health
```

### Admin Panel

```http
GET /admin              # Login page
GET /admin/dashboard    # Dashboard (requires authentication)
GET /admin/logout       # Logout
```

## Example Usage with cURL

```bash
# Send a message
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+1234567890",
    "message": "Hello from Signal API!"
  }'

# Check health
curl http://localhost:3000/api/health
```

## Phone Number Format

All phone numbers must be in E.164 format:
- Start with `+`
- Country code (1-3 digits)
- Phone number (up to 14 digits)
- Example: `+14155551234` (US), `+447911123456` (UK)

## Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Validation errors:
```json
{
  "success": false,
  "errors": [
    {
      "field": "phone_number",
      "message": "Phone number must be in E.164 format"
    }
  ]
}
```

## 📁 Project Structure

```
signal-api/
├── src/
│   ├── config/
│   │   ├── index.js          # App configuration
│   │   └── database.js       # SQLite setup
│   ├── controllers/
│   │   ├── messageController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js           # Authentication middleware
│   │   └── validation.js     # Request validation
│   ├── models/
│   │   ├── MessageModel.js   # Message database operations
│   │   └── AdminModel.js     # Admin user operations
│   ├── routes/
│   │   ├── messageRoutes.js
│   │   └── adminRoutes.js
│   ├── services/
│   │   └── signalService.js  # Signal CLI integration
│   ├── views/
│   │   └── admin/
│   │       ├── login.ejs     # Login page
│   │       └── dashboard.ejs # Dashboard
│   └── index.js              # Main entry point
├── data/
│   └── signal.db             # SQLite database
├── .env                      # Environment variables
├── package.json
├── README.md
├── ADMIN_PANEL.md           # Admin panel docs
└── VPS_SETUP.md             # VPS deployment guide
```

## 📚 Documentation

- **[Admin Panel Guide](ADMIN_PANEL.md)** - Complete admin panel documentation
- **[VPS Setup Guide](VPS_SETUP.md)** - Deploy to production server

## 🔒 Security Notes

- All admin routes are password-protected
- Passwords are hashed with bcrypt
- Session-based authentication
- SQL injection prevention with parameterized queries
- Change default admin credentials in production

## License

MIT



# Request verification code
curl -X POST "http://localhost:8081/v1/register/+8801635227460"

# Verify with the code you received
curl -X POST -H "Content-Type: application/json" \
  -d '{"pin": "123456"}' \
  "http://localhost:8081/v1/register/+YOUR_PHONE_NUMBER/verify"