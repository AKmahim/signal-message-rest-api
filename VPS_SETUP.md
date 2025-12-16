# Signal REST API - VPS Setup Guide

Complete guide to deploy Signal REST API on a VPS (Ubuntu/Debian).

---

## Prerequisites

- VPS with Ubuntu 20.04+ or Debian 11+
- Root or sudo access
- Domain name (optional, for production)

---

## Step 1: Initial VPS Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Required Dependencies
```bash
# Install Node.js (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install Docker
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Verify Docker installation
sudo docker --version

# Add user to docker group (optional, to run docker without sudo)
sudo usermod -aG docker $USER
newgrp docker

# Install Git
sudo apt install -y git

# Install PM2 (process manager for Node.js)
sudo npm install -g pm2
```

---

## Step 2: Setup Signal CLI REST API (Docker)

### 2.1 Create Directory for Signal Data
```bash
mkdir -p ~/signal-cli-data
```

### 2.2 Run Signal CLI REST API Container
```bash
docker run -d \
  --name signal-cli-rest-api \
  --restart unless-stopped \
  -p 8080:8080 \
  -v ~/signal-cli-data:/home/.local/share/signal-cli \
  -e MODE=native \
  bbernhard/signal-cli-rest-api
```

### 2.3 Verify Container is Running
```bash
docker ps
docker logs signal-cli-rest-api
```

### 2.4 Register/Link Your Signal Number

**Option A: Link to Existing Signal Account (Recommended)**
```bash
# Generate QR code for linking
curl "http://localhost:8080/v1/qrcodelink?device_name=vps-signal-api"
```
- Copy the QR code link and open it in a browser
- Scan with Signal mobile app: Settings → Linked Devices → Link New Device

**Option B: Register New Number**
```bash
# Replace +1234567890 with your phone number (with country code)
curl -X POST "http://localhost:8080/v1/register/+1234567890"

# You'll receive an SMS with verification code
# Verify with the code (replace 123456 with your code)
curl -X POST -H "Content-Type: application/json" \
  -d '{"pin": "123456"}' \
  "http://localhost:8080/v1/register/+1234567890/verify"
```

### 2.5 Test Signal CLI
```bash
curl http://localhost:8080/v1/about
```

---

## Step 3: Deploy Signal REST API

### 3.1 Clone/Upload Your Project
```bash
# Create project directory
mkdir -p ~/apps
cd ~/apps

# Option 1: Upload via Git
git clone <your-repository-url> signal-api
cd signal-api

# Option 2: Upload via SCP from your local machine
# Run this from your local machine:
# scp -r /path/to/signal-api user@your-vps-ip:~/apps/
```

### 3.2 Install Dependencies
```bash
cd ~/apps/signal-api
npm install --production
```

### 3.3 Configure Environment Variables
```bash
# Create .env file
cat > .env << 'EOF'
# Server port
PORT=3000

# Signal CLI REST API URL
SIGNAL_CLI_REST_API_URL=http://localhost:8080

# Your registered Signal phone number (with country code)
SIGNAL_SENDER_NUMBER=+1234567890
EOF

# Edit with your actual phone number
nano .env
```

### 3.4 Test the API Manually
```bash
# Start the API (test run)
node src/index.js

# In another terminal, test it
curl http://localhost:3000/
```

Press `Ctrl+C` to stop the test run.

---

## Step 4: Setup PM2 (Process Manager)

### 4.1 Start API with PM2
```bash
cd ~/apps/signal-api
pm2 start src/index.js --name signal-api
```

### 4.2 Configure PM2 to Start on Boot
```bash
pm2 startup
# Copy and run the command shown in the output

pm2 save
```

### 4.3 Useful PM2 Commands
```bash
# View status
pm2 status

# View logs
pm2 logs signal-api

# Restart
pm2 restart signal-api

# Stop
pm2 stop signal-api

# Delete
pm2 delete signal-api
```

---

## Step 5: Setup Firewall

```bash
# Allow SSH (if not already allowed)
sudo ufw allow ssh

# Allow API port
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Step 6: Setup Nginx (Optional - For Production)

### 6.1 Install Nginx
```bash
sudo apt install -y nginx
```

### 6.2 Configure Nginx as Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/signal-api
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6.3 Enable Site and Restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/signal-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Allow HTTP traffic
sudo ufw allow 'Nginx Full'
```

### 6.4 Setup SSL with Let's Encrypt (Optional)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Step 7: API Testing

### 7.1 Check API Health
```bash
# Local test
curl http://localhost:3000/api/health

# Remote test (if using Nginx)
curl http://your-vps-ip/api/health
# or
curl http://your-domain.com/api/health
```

### 7.2 Test Sending Message

**Single Message:**
```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+1234567890",
    "message": "Hello! This is a test message from Signal API."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {}
}
```

**Bulk Message:**
```bash
curl -X POST http://localhost:3000/api/send/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "phone_numbers": ["+1234567890", "+0987654321"],
    "message": "Bulk message test!"
  }'
```

### 7.3 Test from Remote Machine
```bash
# Replace YOUR_VPS_IP with your actual VPS IP
curl -X POST http://YOUR_VPS_IP:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+1234567890",
    "message": "Remote test message"
  }'
```

### 7.4 Test with Postman or Similar Tools

**Endpoint:** `POST http://your-vps-ip:3000/api/send`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "phone_number": "+1234567890",
  "message": "Test message from Postman"
}
```

---

## Step 8: Monitoring & Maintenance

### 8.1 View Application Logs
```bash
# PM2 logs
pm2 logs signal-api

# Docker logs for Signal CLI
docker logs signal-cli-rest-api

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 8.2 Monitor Resources
```bash
# CPU and Memory usage
pm2 monit

# Docker stats
docker stats signal-cli-rest-api
```

### 8.3 Restart Services
```bash
# Restart Node.js API
pm2 restart signal-api

# Restart Docker container
docker restart signal-cli-rest-api

# Restart Nginx
sudo systemctl restart nginx
```

---

## Troubleshooting

### Issue: Can't connect to API
```bash
# Check if API is running
pm2 status

# Check if port is open
sudo netstat -tlnp | grep 3000

# Check firewall
sudo ufw status

# View logs
pm2 logs signal-api
```

### Issue: Signal messages not sending
```bash
# Check Signal CLI container
docker ps
docker logs signal-cli-rest-api

# Test Signal CLI directly
curl http://localhost:8080/v1/about

# Verify your number is registered
curl http://localhost:8080/v1/accounts
```

### Issue: Docker container won't start
```bash
# Check Docker status
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker

# Remove and recreate container
docker rm -f signal-cli-rest-api
# Then run the docker run command again
```

---

## Security Best Practices

1. **Change default SSH port**
```bash
sudo nano /etc/ssh/sshd_config
# Change Port 22 to something else
sudo systemctl restart sshd
```

2. **Use SSH keys instead of passwords**
3. **Keep system updated**
```bash
sudo apt update && sudo apt upgrade -y
```

4. **Add rate limiting to Nginx** (optional)
5. **Use environment variables for sensitive data**
6. **Regular backups of signal-cli-data**
```bash
# Backup Signal data
tar -czf signal-backup-$(date +%Y%m%d).tar.gz ~/signal-cli-data/
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API information |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/send` | Send message to single recipient |
| `POST` | `/api/send/bulk` | Send message to multiple recipients |

---

## Quick Reference Commands

```bash
# Start API
pm2 start signal-api

# Stop API
pm2 stop signal-api

# Restart API
pm2 restart signal-api

# View logs
pm2 logs signal-api

# Check Docker container
docker ps
docker logs signal-cli-rest-api

# Test API
curl http://localhost:3000/api/health
```

---

## Support

For issues or questions, check:
- Signal CLI REST API: https://github.com/bbernhard/signal-cli-rest-api
- Signal CLI: https://github.com/AsamK/signal-cli

---

## License

MIT
