# 🚀 Quick VPS Setup Guide

**Server IP:** 206.189.158.244  
**Domains:** oplex.online, agrovia.store

## 📋 Pre-Setup Checklist

✅ **DNS Records Configured:**
- MX records for both domains pointing to 206.189.158.244
- A records for oplex.online and agrovia.store pointing to 206.189.158.244
- A records for www.oplex.online and www.agrovia.store pointing to 206.189.158.244

✅ **VPS Access:**
- SSH access to 206.189.158.244
- Ubuntu 20.04+ installed
- Non-root user with sudo privileges

## 🎯 One-Command Setup

### Step 1: Upload Files to VPS
```bash
# From your local machine, upload the project to VPS
scp -r turbo-mails/ user@206.189.158.244:/home/user/
```

### Step 2: Run Setup Script
```bash
# SSH into your VPS
ssh user@206.189.158.244

# Navigate to project directory
cd turbo-mails

# Make setup script executable
chmod +x vps-setup.sh

# Run the automated setup
./vps-setup.sh
```

## 🔧 Manual DNS Verification

Before running the setup, verify your DNS records:

```bash
# Check MX records
dig MX oplex.online
dig MX agrovia.store

# Check A records
dig A oplex.online
dig A agrovia.store
```

Expected output:
```
oplex.online.     300    IN    MX    10 oplex.online.
agrovia.store.    300    IN    MX    10 agrovia.store.
oplex.online.     300    IN    A     206.189.158.244
agrovia.store.    300    IN    A     206.189.158.244
```

## 📧 What the Setup Script Does

1. **System Updates** - Updates Ubuntu and installs essential packages
2. **Firewall Configuration** - Opens ports 22, 80, 443, 25, 587
3. **Node.js Installation** - Installs Node.js 18 and npm
4. **Redis Setup** - Installs and configures Redis for production
5. **PM2 Installation** - Process manager for Node.js applications
6. **Nginx Setup** - Web server and reverse proxy configuration
7. **Application Deployment** - Clones, builds, and configures TurboMails
8. **Environment Configuration** - Sets up production environment variables
9. **SSL Certificates** - Installs Let's Encrypt certificates for HTTPS
10. **Process Management** - Starts all services with PM2
11. **Monitoring Setup** - Configures health checks and log rotation
12. **Final Testing** - Verifies all components are working

## 🌐 After Setup

### Access Your Application
- **Primary Site:** https://oplex.online
- **Secondary Site:** https://agrovia.store
- **Admin Panel:** https://oplex.online/admin
  - Username: `admin`
  - Password: `TurboMails2024!`

### Management Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart services
pm2 restart all

# Health check
./monitor.sh
```

### Test Email Functionality
1. Visit https://oplex.online
2. Generate a temporary email
3. Send a test email to the generated address
4. Verify real-time delivery

## 🔍 Troubleshooting

### If Setup Fails

**Check DNS propagation:**
```bash
nslookup oplex.online 8.8.8.8
nslookup agrovia.store 8.8.8.8
```

**Check firewall:**
```bash
sudo ufw status
```

**Check services:**
```bash
sudo systemctl status nginx
sudo systemctl status redis-server
pm2 status
```

**Check logs:**
```bash
pm2 logs
sudo journalctl -u nginx
sudo journalctl -u redis-server
```

### Common Issues

**SSL Certificate Failed:**
- Ensure domains are pointing to your server
- Wait for DNS propagation (up to 24 hours)
- Try manual certificate installation:
  ```bash
  sudo certbot --nginx -d oplex.online -d agrovia.store
  ```

**SMTP Not Working:**
- Check if port 25 is blocked by your VPS provider
- Verify MX records are correct
- Test SMTP connection:
  ```bash
  telnet localhost 25
  ```

**Application Not Starting:**
- Check Node.js version: `node --version`
- Verify dependencies: `npm list`
- Check environment file: `cat .env`

## 📊 Monitoring

### Health Checks
The setup includes automated monitoring:
- API health check every 5 minutes
- Daily system health report
- Automatic service restart on failure
- Log rotation to prevent disk space issues

### Performance Monitoring
```bash
# Real-time monitoring
pm2 monit

# System resources
htop

# Redis monitoring
redis-cli monitor

# Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

## 🔐 Security

### Default Security Measures
- UFW firewall enabled with minimal open ports
- SSL/TLS encryption for all web traffic
- Rate limiting on API endpoints
- Secure Redis configuration
- Regular security updates via cron

### Additional Security (Recommended)
```bash
# Change default admin password
# Edit .env file and restart services
nano .env
pm2 restart all

# Setup fail2ban for SSH protection
sudo apt install fail2ban

# Configure automatic security updates
sudo apt install unattended-upgrades
```

## 🚀 Production Optimization

### Performance Tuning
```bash
# Increase file limits
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimize Redis
sudo sysctl vm.overcommit_memory=1
echo 'vm.overcommit_memory = 1' | sudo tee -a /etc/sysctl.conf

# Optimize Nginx
sudo nano /etc/nginx/nginx.conf
# Increase worker_connections to 2048
```

### Backup Strategy
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /home/backup/turbomails_$DATE.tar.gz /home/$USER/turbo-mails
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb /home/backup/redis_$DATE.rdb
EOF

chmod +x backup.sh

# Schedule daily backups
echo "0 3 * * * /home/$USER/backup.sh" | crontab -
```

---

## 🎉 Success!

After running the setup script, your TurboMails enterprise temporary email service will be fully operational with:

✅ **Real SMTP server** receiving emails on both domains  
✅ **Redis-powered** fast email storage  
✅ **SSL-secured** HTTPS access  
✅ **Real-time** email delivery via Socket.IO  
✅ **Production-ready** monitoring and logging  
✅ **Automatic** health checks and recovery  

**Your temporary email service is now live at:**
- 🌐 https://oplex.online
- 🌐 https://agrovia.store

**Admin access:**
- 🔐 https://oplex.online/admin (admin / TurboMails2024!)

Enjoy your enterprise-grade temporary email service! 🚀