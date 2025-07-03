#!/bin/bash

# TurboMails VPS Setup Script
# Server IP: 206.189.158.213
# Domains: oplex.online, agrovia.store

set -e

echo "🚀 Starting TurboMails VPS Setup..."
echo "Server IP: 206.189.158.244"
echo "Domains: oplex.online, agrovia.store"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "\n${BLUE}[STEP]${NC} $1"
    echo "----------------------------------------"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Step 1: System Update
print_step "1. Updating System"
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip software-properties-common build-essential

# Step 2: Configure Firewall
print_step "2. Configuring Firewall"
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp          # SSH
sudo ufw allow 80/tcp          # HTTP
sudo ufw allow 443/tcp         # HTTPS
sudo ufw allow 25/tcp          # SMTP
sudo ufw allow 587/tcp         # SMTP Submission
sudo ufw --force enable
print_status "Firewall configured successfully"

# Step 3: Install Node.js 18
print_step "3. Installing Node.js 18"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
print_status "Node.js $(node --version) installed"
print_status "npm $(npm --version) installed"

# Step 4: Install Redis
print_step "4. Installing Redis"
sudo apt install -y redis-server

# Configure Redis for production
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup
sudo tee /etc/redis/redis.conf > /dev/null <<EOF
# Redis Configuration for TurboMails
bind 127.0.0.1
port 6379
tcp-backlog 511
timeout 0
tcp-keepalive 300

# General
daemonize yes
supervised systemd
pidfile /var/run/redis/redis-server.pid
loglevel notice
logfile /var/log/redis/redis-server.log
databases 16

# Snapshotting
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis

# Memory Management
maxmemory 1gb
maxmemory-policy allkeys-lru

# Append Only File
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Security
requirepass ""
EOF

sudo systemctl start redis-server
sudo systemctl enable redis-server
print_status "Redis installed and configured"

# Step 5: Install PM2
print_step "5. Installing PM2"
sudo npm install -g pm2
print_status "PM2 $(pm2 --version) installed"

# Step 6: Install Nginx
print_step "6. Installing Nginx"
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
print_status "Nginx installed and started"

# Step 7: Clone and Setup Application
print_step "7. Setting up TurboMails Application"
cd /home/$USER
if [ -d "turbo-mails" ]; then
    print_warning "turbo-mails directory exists, backing up..."
    mv turbo-mails turbo-mails-backup-$(date +%Y%m%d-%H%M%S)
fi

git clone https://github.com/yourusername/turbo-mails.git
cd turbo-mails

# Install dependencies
print_status "Installing dependencies..."
npm install --production

# Build frontend
print_status "Building frontend..."
npm run build

# Step 8: Configure Environment
print_step "8. Configuring Environment"
cat > .env << EOF
# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=TurboMails2024!

# Server Configuration
PORT=5000
FRONTEND_PORT=3000
NODE_ENV=production

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# SMTP Configuration
SMTP_HOST=0.0.0.0
SMTP_PORT=25
SMTP_PORT_SECURE=587
SMTP_MAX_CONNECTIONS=100

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://oplex.online
NEXT_PUBLIC_SOCKET_URL=https://oplex.online

# Supported Domains
SUPPORTED_DOMAINS=oplex.online,agrovia.store

# Email Configuration
EMAIL_EXPIRY_HOURS=1
MAX_EMAILS_PER_ADDRESS=50

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cleanup Configuration
CLEANUP_INTERVAL_MINUTES=30
CLEANUP_BATCH_SIZE=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
EOF

print_status "Environment configured"

# Create logs directory
mkdir -p logs

# Step 9: Configure Nginx
print_step "9. Configuring Nginx"
sudo tee /etc/nginx/sites-available/turbomails > /dev/null << 'EOF'
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

# Upstream definitions
upstream frontend {
    server 127.0.0.1:3000;
}

upstream api {
    server 127.0.0.1:5000;
}

# HTTP server (will redirect to HTTPS after SSL setup)
server {
    listen 80;
    server_name oplex.online www.oplex.online agrovia.store www.agrovia.store;
    
    # Temporary allow HTTP for initial setup
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # SMTP receive endpoint
    location /smtp/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check
    location /health {
        proxy_pass http://api;
        access_log off;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/turbomails /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t
sudo systemctl reload nginx
print_status "Nginx configured successfully"

# Step 10: Start Applications with PM2
print_step "10. Starting Applications with PM2"

# Update ecosystem config with correct paths
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'turbomails-api',
      script: 'server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'turbomails-frontend',
      script: 'npm',
      args: 'start',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend.log',
      time: true,
      max_memory_restart: '512M',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'turbomails-smtp',
      script: 'smtp-server.js',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/smtp-error.log',
      out_file: './logs/smtp-out.log',
      log_file: './logs/smtp.log',
      time: true,
      max_memory_restart: '512M',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
EOF

# Start applications
pm2 start ecosystem.config.js
pm2 save
pm2 startup

print_status "Applications started with PM2"

# Step 11: Install SSL Certificates
print_step "11. Installing SSL Certificates"
sudo apt install -y certbot python3-certbot-nginx

print_warning "Setting up SSL certificates..."
print_warning "Make sure your domains (oplex.online, agrovia.store) are pointing to this server IP: 206.189.158.244"

# Get SSL certificates
sudo certbot --nginx -d oplex.online -d www.oplex.online -d agrovia.store -d www.agrovia.store --non-interactive --agree-tos --email admin@oplex.online

# Setup auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

print_status "SSL certificates installed and auto-renewal configured"

# Step 12: Setup Log Rotation
print_step "12. Setting up Log Rotation"
sudo tee /etc/logrotate.d/turbomails > /dev/null << EOF
/home/$USER/turbo-mails/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

print_status "Log rotation configured"

# Step 13: Setup Monitoring
print_step "13. Setting up Monitoring"
cat > /home/$USER/monitor.sh << 'EOF'
#!/bin/bash
echo "=== TurboMails Health Check ==="
echo "Date: $(date)"
echo "\n=== PM2 Status ==="
pm2 status
echo "\n=== Redis Status ==="
redis-cli ping
echo "\n=== Nginx Status ==="
sudo systemctl status nginx --no-pager -l
echo "\n=== Disk Usage ==="
df -h
echo "\n=== Memory Usage ==="
free -h
echo "\n=== SMTP Ports ==="
netstat -tlnp | grep :25
netstat -tlnp | grep :587
echo "\n=== Domain DNS Check ==="
dig MX oplex.online +short
dig MX agrovia.store +short
EOF

chmod +x /home/$USER/monitor.sh

# Add health check cron jobs
(crontab -l 2>/dev/null; echo "*/5 * * * * curl -f http://localhost:5000/health > /dev/null 2>&1 || pm2 restart turbomails-api") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$USER/monitor.sh > /home/$USER/turbo-mails/logs/health-\$(date +\%Y\%m\%d).log") | crontab -

print_status "Monitoring configured"

# Step 14: Final Tests
print_step "14. Running Final Tests"

# Test Redis
if redis-cli ping | grep -q PONG; then
    print_status "✅ Redis is working"
else
    print_error "❌ Redis test failed"
fi

# Test PM2
if pm2 status | grep -q online; then
    print_status "✅ PM2 applications are running"
else
    print_error "❌ PM2 applications test failed"
fi

# Test Nginx
if sudo nginx -t 2>/dev/null; then
    print_status "✅ Nginx configuration is valid"
else
    print_error "❌ Nginx configuration test failed"
fi

# Test HTTP response
sleep 5
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q 200; then
    print_status "✅ Frontend is responding"
else
    print_warning "⚠️  Frontend might still be starting up"
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health | grep -q 200; then
    print_status "✅ API is responding"
else
    print_warning "⚠️  API might still be starting up"
fi

print_step "🎉 TurboMails VPS Setup Complete!"
echo ""
echo "📧 Your TurboMails server is now running on:"
echo "   • Primary Domain: https://oplex.online"
echo "   • Secondary Domain: https://agrovia.store"
echo "   • Server IP: 206.189.158.244"
echo ""
echo "🔧 Management Commands:"
echo "   • Check status: pm2 status"
echo "   • View logs: pm2 logs"
echo "   • Monitor: pm2 monit"
echo "   • Health check: /home/$USER/monitor.sh"
echo ""
echo "📊 Admin Panel:"
echo "   • URL: https://oplex.online/admin"
echo "   • Username: admin"
echo "   • Password: TurboMails2024!"
echo ""
echo "🚀 Your enterprise temporary email service is ready!"
echo "   • SMTP Server: Running on ports 25 and 587"
echo "   • Redis: Configured and optimized"
echo "   • SSL: Enabled with auto-renewal"
echo "   • Monitoring: Automated health checks"
echo ""
print_warning "Important: Make sure your domain DNS records are properly configured:"
echo "   • MX records pointing to 206.189.158.244"
echo "   • A records for oplex.online and agrovia.store pointing to 206.189.158.244"
echo ""
print_status "Setup completed successfully! 🎯"