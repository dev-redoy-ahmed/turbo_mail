#!/bin/bash

# 🔧 Redis Quick Installation Script for TurboMails
# Run this script if Redis is not installed on your VPS

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Installing Redis for TurboMails...${NC}"
echo "======================================"

# Update system packages
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Redis server
echo -e "${YELLOW}🔧 Installing Redis server...${NC}"
sudo apt install redis-server -y

# Enable Redis to start on boot
echo -e "${YELLOW}⚙️ Configuring Redis to start on boot...${NC}"
sudo systemctl enable redis-server

# Start Redis service
echo -e "${YELLOW}🚀 Starting Redis service...${NC}"
sudo systemctl start redis-server

# Test Redis connection
echo -e "${YELLOW}🧪 Testing Redis connection...${NC}"
if redis-cli ping | grep -q "PONG"; then
    echo -e "${GREEN}✅ Redis is working perfectly!${NC}"
else
    echo -e "${RED}❌ Redis test failed${NC}"
    exit 1
fi

# Display Redis status
echo -e "${BLUE}📊 Redis Status:${NC}"
echo "Service Status: $(sudo systemctl is-active redis-server)"
echo "Redis Version: $(redis-cli --version)"
echo "Redis Process: $(ps aux | grep redis-server | grep -v grep | wc -l) process(es) running"
echo "Redis Port: $(sudo netstat -tlnp | grep 6379 | awk '{print $4}' | cut -d: -f2)"

echo ""
echo -e "${GREEN}🎉 Redis installation completed successfully!${NC}"
echo -e "${BLUE}📝 Quick Redis Commands:${NC}"
echo "  • Check status: sudo systemctl status redis-server"
echo "  • Test connection: redis-cli ping"
echo "  • Monitor Redis: redis-cli monitor"
echo "  • Redis CLI: redis-cli"
echo "  • View logs: sudo journalctl -u redis-server -f"
echo ""
echo -e "${GREEN}✅ Your TurboMails application can now connect to Redis!${NC}"