# 🚀 VPS Deployment Steps for TurboMails

**Server IP:** 206.189.158.244  
**Domains:** oplex.online, agrovia.store  
**Terminal:** Git Bash

## 📋 Pre-Deployment Checklist

### 1. DNS Configuration
Make sure your domains are configured with these DNS records:

```
# A Records
oplex.online.     300    IN    A     206.189.158.244
agrovia.store.    300    IN    A     206.189.158.244
www.oplex.online. 300    IN    A     206.189.158.244
www.agrovia.store.300    IN    A     206.189.158.244

# MX Records (for email)
oplex.online.     300    IN    MX    10 oplex.online.
agrovia.store.    300    IN    MX    10 agrovia.store.
```

### 2. VPS Access Test
```bash
# Test SSH connection
ssh root@206.189.158.244
```

## 🚀 Deployment Commands

### Step 1: Upload Project to VPS
```bash
# From your local Git Bash terminal (in turbo-mails directory)
scp -r . root@206.189.158.244:/root/turbo-mails/
```

### Step 2: Connect to VPS
```bash
ssh root@206.189.158.244
```

### Step 3: Navigate to Project Directory
```bash
cd /root/turbo-mails
ls -la  # Verify files are uploaded
```

### Step 4: Make Setup Script Executable
```bash
chmod +x vps-setup.sh
```

### Step 5: Run Automated Setup
```bash
# This will install everything automatically
./vps-setup.sh
```

## 📊 What the Setup Script Does

The automated setup will:

1. **System Updates**
   - Update Ubuntu packages
   - Install security updates

2. **Firewall Configuration**
   - Configure UFW firewall
   - Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS), 25 (SMTP), 587 (SMTP)

3. **Install Dependencies**
   - Node.js 18.x
   - Redis server
   - PM2 process manager
   - Nginx web server
   - Certbot for SSL certificates

4. **Application Setup**
   - Install npm dependencies
   - Configure environment variables
   - Build Next.js application

5. **Service Configuration**
   - Configure Nginx reverse proxy
   - Set up PM2 for process management
   - Install SSL certificates
   - Configure log rotation

6. **Start Services**
   - Redis server
   - TurboMails API
   - SMTP server
   - Next.js frontend

## ✅ Verification Steps

### 1. Check Service Status
```bash
# Check PM2 processes
pm2 status

# Check Redis
redis-cli ping

# Check Nginx
sudo systemctl status nginx
```

### 2. Test Application Access
```bash
# Test HTTP access
curl -I http://oplex.online
curl -I http://agrovia.store

# Test HTTPS access (after SSL setup)
curl -I https://oplex.online
curl -I https://agrovia.store
```

### 3. Test SMTP Server
```bash
# Test SMTP connection
telnet localhost 25
# Type: QUIT to exit
```

## 🌐 Access Your Application

After successful deployment:

- **Primary Domain**: https://oplex.online
- **Secondary Domain**: https://agrovia.store
- **Admin Panel**: https://oplex.online/admin
- **API Health**: https://oplex.online/api/health

## 🔧 Management Commands

### PM2 Process Management
```bash
# View all processes
pm2 status

# View logs
pm2 logs

# Restart all services
pm2 restart all

# Stop all services
pm2 stop all

# Start all services
pm2 start all
```

### Service Management
```bash
# Restart Nginx
sudo systemctl restart nginx

# Restart Redis
sudo systemctl restart redis-server

# Check system logs
sudo journalctl -f
```

### Application Logs
```bash
# API logs
pm2 logs turbo-api

# Frontend logs
pm2 logs turbo-frontend

# SMTP logs
pm2 logs turbo-smtp

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔒 Security Features

- **Firewall**: UFW configured with minimal required ports
- **SSL/TLS**: Automatic HTTPS with Let's Encrypt
- **Rate Limiting**: Built-in API and SMTP rate limiting
- **Input Validation**: Comprehensive input sanitization
- **CORS**: Properly configured cross-origin policies

## 📈 Monitoring

### Health Checks
```bash
# API health
curl https://oplex.online/api/health

# Redis health
redis-cli ping

# System resources
htop
df -h
free -h
```

### Performance Monitoring
```bash
# PM2 monitoring
pm2 monit

# System monitoring
sudo netstat -tulpn
sudo ss -tulpn
```

## 🚨 Troubleshooting

### Common Issues

1. **SSL Certificate Issues**
   ```bash
   sudo certbot renew --dry-run
   sudo systemctl reload nginx
   ```

2. **PM2 Process Issues**
   ```bash
   pm2 delete all
   pm2 start ecosystem.config.js
   ```

3. **Redis Connection Issues**
   ```bash
   sudo systemctl restart redis-server
   redis-cli ping
   ```

4. **Nginx Configuration Issues**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Log Locations
- **Application Logs**: `~/.pm2/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **System Logs**: `/var/log/syslog`
- **Redis Logs**: `/var/log/redis/`

## 🔄 Updates and Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build frontend
npm run build

# Restart services
pm2 restart all
```

### System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js (if needed)
sudo npm install -g n
sudo n stable
```

## 📞 Support

If you encounter any issues during deployment:

1. Check the logs using the commands above
2. Verify DNS propagation: `nslookup oplex.online`
3. Test connectivity: `ping 206.189.158.244`
4. Ensure all ports are open: `sudo ufw status`

---

**Ready to deploy?** Run the commands above step by step, and your TurboMails server will be live! 🚀