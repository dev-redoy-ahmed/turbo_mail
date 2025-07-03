# 🚀 GitHub Deployment Guide for TurboMails

**VPS IP:** 206.189.158.244  
**Domains:** oplex.online, agrovia.store

## 📋 Step 1: Push to GitHub

### Initialize Git Repository (if not done)
```bash
# In your turbo-mails directory
git init
git add .
git commit -m "Initial TurboMails commit"
```

### Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New Repository"
3. Name it `turbo-mails`
4. Make it **Private** (recommended for production apps)
5. Don't initialize with README (we already have files)

### Push to GitHub
```bash
# Replace 'yourusername' with your GitHub username
git remote add origin https://github.com/yourusername/turbo-mails.git
git branch -M main
git push -u origin main
```

## 🔒 Step 2: Environment Variables Security

The `.gitignore` file ensures `.env` files are **NOT** pushed to GitHub for security.

### What's Protected:
- ✅ `.env` files are ignored
- ✅ `node_modules/` excluded
- ✅ `.next/` build files excluded
- ✅ Logs and sensitive files excluded
- ✅ Only `.env.example` is included as template

## 🚀 Step 3: Deploy from GitHub to VPS

### Method 1: Direct Clone (Recommended)

**On your VPS (you're already connected):**

```bash
# Update system first
apt update && apt upgrade -y

# Install Git if not installed
apt install git -y

# Clone your repository
cd /root
git clone https://github.com/yourusername/turbo-mails.git
cd turbo-mails

# Create environment file from template
cp .env.example .env

# Edit environment variables
nano .env
```

### Environment Configuration
Edit the `.env` file with your specific settings:

```bash
# Basic Configuration
NODE_ENV=production
PORT=3001
FRONTEND_PORT=3000
SMTP_PORT=25
SMTP_PORT_SUBMISSION=587

# Domain Configuration
SUPPORTED_DOMAINS=oplex.online,agrovia.store
PRIMARY_DOMAIN=oplex.online

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration
EMAIL_EXPIRY_HOURS=24
MAX_EMAILS_PER_ADDRESS=100

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SMTP_RATE_LIMIT_MAX=50
SMTP_RATE_LIMIT_WINDOW=3600000

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here

# Security
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/turbo-mails.log

# Cleanup
CLEANUP_INTERVAL_HOURS=6
CLEANUP_BATCH_SIZE=1000
```

### Run Automated Setup
```bash
# Make setup script executable
chmod +x vps-setup.sh

# Run the automated setup
./vps-setup.sh
```

### Method 2: Using Deployment Script

**From your local machine:**

```bash
# Update the deploy script to use GitHub
# Edit deploy-to-vps.sh and replace upload section with git clone
```

## 🔄 Step 4: Future Updates

### Update from GitHub
```bash
# On your VPS
cd /root/turbo-mails

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Rebuild frontend
npm run build

# Restart services
pm2 restart all
```

### Automated Update Script
Create an update script on your VPS:

```bash
# Create update script
cat > /root/update-turbo-mails.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating TurboMails from GitHub..."
cd /root/turbo-mails
git pull origin main
npm install
npm run build
pm2 restart all
echo "✅ Update completed!"
EOF

# Make it executable
chmod +x /root/update-turbo-mails.sh
```

## 🔐 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use strong passwords
- ✅ Generate secure JWT secrets
- ✅ Use different secrets for production

### 2. GitHub Repository
- ✅ Use private repository for production
- ✅ Enable two-factor authentication
- ✅ Use SSH keys for authentication
- ✅ Regular security updates

### 3. VPS Security
- ✅ Regular system updates
- ✅ Firewall configuration
- ✅ SSH key authentication
- ✅ Fail2ban for intrusion prevention

## 📊 Monitoring & Maintenance

### Check Application Status
```bash
# PM2 status
pm2 status

# View logs
pm2 logs

# System resources
htop
df -h
```

### Backup Strategy
```bash
# Backup environment file
cp .env .env.backup.$(date +%Y%m%d)

# Backup Redis data
cp /var/lib/redis/dump.rdb /root/redis-backup-$(date +%Y%m%d).rdb
```

## 🚨 Troubleshooting

### Common Issues

**1. Git Authentication Issues:**
```bash
# Use personal access token instead of password
git remote set-url origin https://username:token@github.com/username/turbo-mails.git
```

**2. Environment Variables Not Loading:**
```bash
# Check if .env file exists
ls -la .env

# Verify environment variables
cat .env
```

**3. Permission Issues:**
```bash
# Fix permissions
chown -R root:root /root/turbo-mails
chmod +x vps-setup.sh
```

## 🎯 Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] `.gitignore` configured properly
- [ ] VPS connected via SSH
- [ ] Repository cloned on VPS
- [ ] `.env` file created and configured
- [ ] Setup script executed
- [ ] Services running (PM2, Redis, Nginx)
- [ ] SSL certificates installed
- [ ] Domains accessible
- [ ] Admin panel working
- [ ] SMTP server functional

---

**Ready to deploy?** Follow the steps above and your TurboMails will be live from GitHub! 🚀