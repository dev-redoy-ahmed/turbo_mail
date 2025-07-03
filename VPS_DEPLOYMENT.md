# 🌐 VPS Deployment Guide for TurboMails

This guide provides step-by-step instructions for deploying TurboMails on a VPS with real SMTP functionality, Redis, and multiple domain support.

## 📋 Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 20GB SSD
- **CPU**: 2+ cores recommended
- **Network**: Static IP address
- **Access**: Root or sudo privileges

### Domain Requirements
- 4-5 domains for temporary email service
- DNS management access
- SSL certificate capability (Let's Encrypt recommended)

## 🚀 Step 1: Server Preparation

### Update System
```bash
# Update package lists and upgrade system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common
```

### Configure Firewall
```bash
# Install and configure UFW
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow essential ports
sudo ufw allow 22/tcp          # SSH
sudo ufw allow 80/tcp          # HTTP
sudo ufw allow 443/tcp         # HTTPS
sudo ufw allow 25/tcp          # SMTP
sudo ufw allow 587/tcp         # SMTP Submission
sudo ufw allow 3000/tcp        # Frontend (temporary)
sudo ufw allow 5000/tcp        # API (temporary)

# Enable firewall
sudo ufw --force enable
sudo ufw status verbose
```

## 🔧 Step 2: Install Dependencies

### Install Node.js 18
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Install Redis
```bash
# Install Redis server
sudo apt install -y redis-server

# Configure Redis for production
sudo nano /etc/redis/redis.conf

# Key configurations to update:
# maxmemory 1gb
# maxmemory-policy allkeys-lru
# save 900 1
# save 300 10
# save 60 10000

# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test Redis
redis-cli ping
```

### Install PM2 Process Manager
```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Install Nginx
```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Test Nginx
sudo nginx -t
```

## 📧 Step 3: DNS Configuration

### Configure MX Records
For each domain (e.g., tempmail.com, quickmail.org, etc.):

```dns
# MX Records
@    MX    10    mail.yourdomain.com.
mail MX    10    mail.yourdomain.com.

# A Records
mail A     YOUR_SERVER_IP
@    A     YOUR_SERVER_IP
www  A     YOUR_SERVER_IP

# Optional: SPF Record
@    TXT   "v=spf1 ip4:YOUR_SERVER_IP ~all"
```

### Verify DNS Propagation
```bash
# Check MX records
dig MX tempmail.com
dig MX quickmail.org

# Check A records
dig A mail.yourdomain.com
```

## 🏗️ Step 4: Deploy Application

### Clone Repository
```bash
# Create application directory
sudo mkdir -p /var/www
cd /var/www

# Clone repository
sudo git clone https://github.com/yourusername/turbo-mails.git
sudo chown -R $USER:$USER turbo-mails
cd turbo-mails
```

### Install Dependencies
```bash
# Install production dependencies
npm install --production

# Build frontend
npm run build
```

### Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Production .env Configuration:**
```env
# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_very_secure_password_here

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
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com

# Supported Domains
SUPPORTED_DOMAINS=tempmail.com,quickmail.org,fastmail.temp,mailnow.io,tempbox.net

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
LOG_FILE=/var/log/turbomails/app.log
```

### Create Log Directory
```bash
# Create log directory
sudo mkdir -p /var/log/turbomails
sudo chown $USER:$USER /var/log/turbomails
```

## 🔄 Step 5: Process Management with PM2

### Create PM2 Ecosystem File
```bash
# Create ecosystem.config.js
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
      error_file: '/var/log/turbomails/api-error.log',
      out_file: '/var/log/turbomails/api-out.log',
      log_file: '/var/log/turbomails/api.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
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
      error_file: '/var/log/turbomails/frontend-error.log',
      out_file: '/var/log/turbomails/frontend-out.log',
      log_file: '/var/log/turbomails/frontend.log',
      time: true,
      max_memory_restart: '512M'
    },
    {
      name: 'turbomails-smtp',
      script: 'smtp-server.js',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/turbomails/smtp-error.log',
      out_file: '/var/log/turbomails/smtp-out.log',
      log_file: '/var/log/turbomails/smtp.log',
      time: true,
      max_memory_restart: '512M'
    }
  ]
};
EOF
```

### Start Applications
```bash
# Start all applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the instructions provided by the command above

# Check status
pm2 status
pm2 logs
```

## 🌐 Step 6: Nginx Configuration

### Create Nginx Configuration
```bash
# Create site configuration
sudo nano /etc/nginx/sites-available/turbomails
```

**Nginx Configuration:**
```nginx
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

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com tempmail.com quickmail.org fastmail.temp mailnow.io tempbox.net;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com tempmail.com quickmail.org fastmail.temp mailnow.io tempbox.net;

    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

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

    # Frontend routes
    location / {
        limit_req zone=general burst=50 nodelay;
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

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://frontend;
    }
}
```

### Enable Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/turbomails /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 🔒 Step 7: SSL Certificate Setup

### Install Certbot
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain SSL Certificates
```bash
# Get certificates for all domains
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d tempmail.com -d quickmail.org -d fastmail.temp -d mailnow.io -d tempbox.net

# Test automatic renewal
sudo certbot renew --dry-run
```

### Setup Auto-renewal
```bash
# Add cron job for auto-renewal
sudo crontab -e

# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Step 8: Monitoring and Maintenance

### Setup Log Rotation
```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/turbomails
```

**Logrotate Configuration:**
```
/var/log/turbomails/*.log {
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
```

### Setup Monitoring Script
```bash
# Create monitoring script
cat > /home/$USER/monitor.sh << 'EOF'
#!/bin/bash

# Check if services are running
echo "=== PM2 Status ==="
pm2 status

echo "\n=== Redis Status ==="
redis-cli ping

echo "\n=== Nginx Status ==="
sudo systemctl status nginx --no-pager

echo "\n=== Disk Usage ==="
df -h

echo "\n=== Memory Usage ==="
free -h

echo "\n=== SMTP Port Check ==="
netstat -tlnp | grep :25
netstat -tlnp | grep :587
EOF

chmod +x /home/$USER/monitor.sh
```

### Setup Health Check Cron
```bash
# Add health check cron job
crontab -e

# Add these lines:
*/5 * * * * curl -f http://localhost:5000/health > /dev/null 2>&1 || pm2 restart turbomails-api
0 2 * * * /home/$USER/monitor.sh > /var/log/turbomails/health-$(date +\%Y\%m\%d).log
```

## 🧪 Step 9: Testing

### Test SMTP Server
```bash
# Test SMTP connection
telnet localhost 25

# Test with external tool
echo "Subject: Test Email\n\nThis is a test email." | sendmail test@tempmail.com
```

### Test Web Interface
```bash
# Test frontend
curl -I https://yourdomain.com

# Test API
curl -I https://yourdomain.com/api/health

# Test Socket.IO
curl -I https://yourdomain.com/socket.io/
```

### Test Email Generation
1. Visit https://yourdomain.com
2. Click "Generate Email"
3. Send a test email to the generated address
4. Verify real-time delivery

## 🔧 Troubleshooting

### Common Issues

**SMTP Not Receiving Emails**
```bash
# Check SMTP server logs
pm2 logs turbomails-smtp

# Check if ports are open
sudo netstat -tlnp | grep :25
sudo ufw status

# Test DNS resolution
dig MX tempmail.com
```

**Redis Connection Issues**
```bash
# Check Redis status
sudo systemctl status redis-server

# Check Redis logs
sudo journalctl -u redis-server

# Test connection
redis-cli ping
```

**High Memory Usage**
```bash
# Check memory usage
free -h
pm2 monit

# Restart services if needed
pm2 restart all
```

### Performance Optimization

**Redis Optimization**
```bash
# Edit Redis config
sudo nano /etc/redis/redis.conf

# Key settings:
# maxmemory 2gb
# maxmemory-policy allkeys-lru
# tcp-keepalive 300
```

**Nginx Optimization**
```bash
# Edit Nginx config
sudo nano /etc/nginx/nginx.conf

# Key settings:
# worker_processes auto;
# worker_connections 1024;
# keepalive_timeout 65;
```

## 🚀 Production Checklist

- [ ] Server updated and secured
- [ ] Firewall configured
- [ ] DNS records configured
- [ ] SSL certificates installed
- [ ] All services running via PM2
- [ ] Nginx reverse proxy configured
- [ ] Redis optimized
- [ ] Log rotation setup
- [ ] Monitoring configured
- [ ] Health checks working
- [ ] Email delivery tested
- [ ] Performance optimized
- [ ] Backup strategy implemented

## 📞 Support

For deployment issues:
1. Check logs: `pm2 logs`
2. Monitor resources: `pm2 monit`
3. Review configuration files
4. Test individual components
5. Consult troubleshooting section

---

**TurboMails VPS Deployment Complete! 🎉**

Your enterprise temporary email service is now running with:
- Real SMTP functionality
- Redis for fast email storage
- Multiple domain support
- SSL/TLS encryption
- Production-ready monitoring
- Automatic scaling and recovery