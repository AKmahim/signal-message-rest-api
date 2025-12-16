#!/bin/bash

# ===========================================
# Signal REST API - VPS Auto Setup Script
# ===========================================
# Run this script on your VPS as root:
# chmod +x vps-setup.sh && ./vps-setup.sh
# ===========================================

set -e

echo "🚀 Starting Signal REST API Setup..."
echo "========================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Update System
echo -e "${BLUE}Step 1: Updating system...${NC}"
apt update && apt upgrade -y

# Step 2: Install Node.js
echo -e "${BLUE}Step 2: Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
echo -e "${GREEN}✅ Node.js $(node --version) installed${NC}"

# Step 3: Install Docker
echo -e "${BLUE}Step 3: Installing Docker...${NC}"
apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io
systemctl start docker
systemctl enable docker
echo -e "${GREEN}✅ Docker $(docker --version) installed${NC}"

# Step 4: Install PM2
echo -e "${BLUE}Step 4: Installing PM2...${NC}"
npm install -g pm2
echo -e "${GREEN}✅ PM2 installed${NC}"

# Step 5: Install Git
echo -e "${BLUE}Step 5: Installing Git...${NC}"
apt install -y git
echo -e "${GREEN}✅ Git installed${NC}"

# Step 6: Create app directory
echo -e "${BLUE}Step 6: Setting up application...${NC}"
mkdir -p /root/apps
cd /root/apps

# Step 7: Clone the repository
echo -e "${BLUE}Step 7: Cloning repository...${NC}"
if [ -d "signal-api" ]; then
  rm -rf signal-api
fi
git clone https://github.com/AKmahim/signal-message-rest-api.git signal-api
cd signal-api

# Step 8: Install dependencies
echo -e "${BLUE}Step 8: Installing npm dependencies...${NC}"
npm install --production

# Step 9: Create data directory
mkdir -p data

# Step 10: Create .env file
echo -e "${BLUE}Step 10: Creating .env file...${NC}"
cat > .env << 'EOF'
# Server port
PORT=3000

# Signal CLI REST API URL
SIGNAL_CLI_REST_API_URL=http://localhost:8080

# Your registered Signal phone number (UPDATE THIS!)
SIGNAL_SENDER_NUMBER=+8801635227460
EOF
echo -e "${GREEN}✅ .env file created${NC}"

# Step 11: Setup Signal CLI Docker
echo -e "${BLUE}Step 11: Setting up Signal CLI REST API (Docker)...${NC}"
mkdir -p /root/signal-cli-data

# Stop and remove existing container if exists
docker stop signal-cli-rest-api 2>/dev/null || true
docker rm signal-cli-rest-api 2>/dev/null || true

# Run Signal CLI REST API container
docker run -d \
  --name signal-cli-rest-api \
  --restart unless-stopped \
  -p 8080:8080 \
  -v /root/signal-cli-data:/home/.local/share/signal-cli \
  -e MODE=native \
  bbernhard/signal-cli-rest-api

echo -e "${GREEN}✅ Signal CLI REST API container started${NC}"

# Wait for container to be ready
echo "Waiting for Signal CLI to start..."
sleep 10

# Step 12: Start the application with PM2
echo -e "${BLUE}Step 12: Starting application with PM2...${NC}"
cd /root/apps/signal-api
pm2 delete signal-api 2>/dev/null || true
pm2 start src/index.js --name signal-api
pm2 save
pm2 startup

echo -e "${GREEN}✅ Application started with PM2${NC}"

# Step 13: Setup Firewall
echo -e "${BLUE}Step 13: Configuring firewall...${NC}"
ufw allow ssh
ufw allow 3000/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo -e "${GREEN}✅ Firewall configured${NC}"

# Final Summary
echo ""
echo "========================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "========================================"
echo ""
echo "📌 Important URLs:"
echo "   API: http://$(curl -s ifconfig.me):3000"
echo "   Admin Panel: http://$(curl -s ifconfig.me):3000/admin"
echo ""
echo "🔐 Admin Credentials:"
echo "   Email: admin@example.com"
echo "   Password: 12345678"
echo ""
echo "📋 Next Steps:"
echo "   1. Register your Signal number (see below)"
echo "   2. Update SIGNAL_SENDER_NUMBER in /root/apps/signal-api/.env"
echo "   3. Restart: pm2 restart signal-api"
echo ""
echo "📱 Register Signal Number:"
echo "   Option A - Link existing account:"
echo "   curl 'http://localhost:8080/v1/qrcodelink?device_name=signal-api'"
echo ""
echo "   Option B - Register new number:"
echo "   curl -X POST 'http://localhost:8080/v1/register/+YOUR_PHONE_NUMBER'"
echo ""
echo "🔧 Useful Commands:"
echo "   pm2 status              # Check app status"
echo "   pm2 logs signal-api     # View logs"
echo "   pm2 restart signal-api  # Restart app"
echo "   docker logs signal-cli-rest-api  # Signal CLI logs"
echo ""
echo "========================================"
