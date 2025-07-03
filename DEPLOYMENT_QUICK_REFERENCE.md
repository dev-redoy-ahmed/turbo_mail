# 🚀 TurboMails VPS Deployment - Quick Reference

**VPS IP:** 206.189.158.244  
**Domains:** oplex.online, agrovia.store  
**Terminal:** Git Bash

## 🎯 One-Command Deployment

```bash
# Make deployment script executable
chmod +x deploy-to-vps.sh

# Deploy everything automatically
./deploy-to-vps.sh
```

## 📋 Step-by-Step Commands

### Option 1: Automated Deployment (Recommended)
```bash
# 1. Test VPS connection
./deploy-to-vps.sh --verify

# 2. Full deployment
./deploy-to-vps.sh
```

### Option 2: Manual Deployment
```bash
# 1. Upload files
scp -r . root@206.189.158.244:/root/turbo-mails/

# 2. Connect to VPS
ssh root@206.189.158.244

# 3. Run setup (on VPS)
cd /root/turbo-mails
chmod +x vps-setup.sh
./vps-setup.sh
```

## 🔧 Management Commands (Run on VPS)

### Service Management
```bash
# Connect to VPS
ssh root@206.189.158.244

# Check all services
pm2 status

# View logs
pm2 logs

# Restart all services
pm2 restart all

# Stop all services
pm2 stop all
```

### Health Checks
```bash
# Check Redis
redis-cli ping

# Check Nginx
sudo systemctl status nginx

# Check API health
curl http://localhost:3001/api/health
```

## 🌐 Access URLs

After deployment:
- **Main Site**: https://oplex.online
- **Secondary**: https://agrovia.store
- **Admin Panel**: https://oplex.online/admin
- **API Health**: https://oplex.online/api/health

## 📊 Monitoring

```bash
# Real-time monitoring
pm2 monit

# System resources
htop
df -h
free -h

# Network connections
sudo netstat -tulpn
```

## 🔒 Security Status

✅ **Firewall**: UFW configured  
✅ **SSL/TLS**: Let's Encrypt certificates  
✅ **Rate Limiting**: API and SMTP protection  
✅ **Input Validation**: Comprehensive sanitization  

## 🚨 Troubleshooting

### Common Issues

**Connection Issues:**
```bash
# Test SSH
ssh -v root@206.189.158.244

# Test DNS
nslookup oplex.online
ping 206.189.158.244
```

**Service Issues:**
```bash
# Restart everything
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart redis-server
```

**SSL Issues:**
```bash
# Renew certificates
sudo certbot renew
sudo systemctl reload nginx
```

## 📁 Important Files

- `deploy-to-vps.sh` - One-command deployment
- `vps-setup.sh` - VPS setup script
- `ecosystem.config.js` - PM2 configuration
- `.env.example` - Environment template
- `VPS_DEPLOYMENT_STEPS.md` - Detailed guide

## 🔄 Updates

```bash
# Update application (on VPS)
cd /root/turbo-mails
git pull origin main
npm install
npm run build
pm2 restart all
```

## 📞 Quick Help

**Deployment Script Options:**
```bash
./deploy-to-vps.sh --help     # Show help
./deploy-to-vps.sh --verify   # Test connection
./deploy-to-vps.sh --upload   # Upload files only
./deploy-to-vps.sh            # Full deployment
```

**Log Locations:**
- PM2 Logs: `~/.pm2/logs/`
- Nginx Logs: `/var/log/nginx/`
- System Logs: `/var/log/syslog`

---

**Ready to deploy?** Just run `./deploy-to-vps.sh` and your TurboMails server will be live! 🎉