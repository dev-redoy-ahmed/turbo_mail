# 📋 VPS Deployment Checklist

**Server:** 206.189.158.244  
**Domains:** oplex.online, agrovia.store  
**Date:** ___________

## 🔍 Pre-Deployment Verification

### DNS Configuration
- [ ] **MX Records Set**
  - [ ] oplex.online MX 10 oplex.online
  - [ ] agrovia.store MX 10 agrovia.store
  
- [ ] **A Records Set**
  - [ ] oplex.online → 206.189.158.244
  - [ ] www.oplex.online → 206.189.158.244
  - [ ] agrovia.store → 206.189.158.244
  - [ ] www.agrovia.store → 206.189.158.244

- [ ] **DNS Propagation Check**
  ```bash
  dig MX oplex.online
  dig MX agrovia.store
  dig A oplex.online
  dig A agrovia.store
  ```

### VPS Access
- [ ] **SSH Access Working**
  ```bash
  ssh user@206.189.158.244
  ```
- [ ] **Sudo Privileges Confirmed**
  ```bash
  sudo whoami
  ```
- [ ] **Ubuntu Version Check**
  ```bash
  lsb_release -a
  # Should be 20.04+ or 22.04+
  ```

## 🚀 Deployment Steps

### 1. File Upload
- [ ] **Upload Project Files**
  ```bash
  scp -r turbo-mails/ user@206.189.158.244:/home/user/
  ```
- [ ] **Verify Upload**
  ```bash
  ssh user@206.189.158.244 "ls -la turbo-mails/"
  ```

### 2. Setup Script Execution
- [ ] **Make Script Executable**
  ```bash
  chmod +x vps-setup.sh
  ```
- [ ] **Run Setup Script**
  ```bash
  ./vps-setup.sh
  ```
- [ ] **Monitor Output for Errors**
  - Note any warnings or errors: ___________

### 3. Service Verification
- [ ] **Redis Status**
  ```bash
  redis-cli ping
  # Expected: PONG
  ```
- [ ] **PM2 Status**
  ```bash
  pm2 status
  # All apps should show 'online'
  ```
- [ ] **Nginx Status**
  ```bash
  sudo systemctl status nginx
  # Should be active (running)
  ```

## 🔧 Post-Deployment Testing

### Application Access
- [ ] **HTTP Access (Temporary)**
  - [ ] http://oplex.online loads
  - [ ] http://agrovia.store loads
  
- [ ] **HTTPS Access (After SSL)**
  - [ ] https://oplex.online loads
  - [ ] https://agrovia.store loads
  
- [ ] **Admin Panel Access**
  - [ ] https://oplex.online/admin loads
  - [ ] Login works (admin / TurboMails2024!)

### API Testing
- [ ] **Health Check**
  ```bash
  curl http://localhost:5000/health
  # Expected: {"status":"ok"}
  ```
- [ ] **Email Generation**
  - [ ] Generate email via web interface
  - [ ] API responds correctly
  - [ ] Email appears in admin panel

### SMTP Testing
- [ ] **Port Accessibility**
  ```bash
  telnet localhost 25
  telnet localhost 587
  ```
- [ ] **External SMTP Test**
  ```bash
  telnet 206.189.158.244 25
  # Should connect successfully
  ```
- [ ] **Send Test Email**
  - [ ] Generate temp email
  - [ ] Send email from external service
  - [ ] Verify real-time delivery
  - [ ] Check email content parsing

### SSL Certificate
- [ ] **Certificate Installation**
  ```bash
  sudo certbot certificates
  # Should show certificates for both domains
  ```
- [ ] **HTTPS Redirect**
  - [ ] HTTP redirects to HTTPS
  - [ ] SSL certificate valid
  - [ ] No browser warnings

## 📊 Monitoring Setup

### Log Files
- [ ] **Application Logs**
  ```bash
  ls -la logs/
  # Should contain: api.log, frontend.log, smtp.log
  ```
- [ ] **Log Rotation**
  ```bash
  cat /etc/logrotate.d/turbomails
  # Should exist and be configured
  ```

### Health Monitoring
- [ ] **Cron Jobs**
  ```bash
  crontab -l
  # Should show health check and backup jobs
  ```
- [ ] **Monitor Script**
  ```bash
  ./monitor.sh
  # Should run without errors
  ```

### Performance Check
- [ ] **Memory Usage**
  ```bash
  free -h
  # Should have sufficient free memory
  ```
- [ ] **Disk Space**
  ```bash
  df -h
  # Should have sufficient free space
  ```
- [ ] **Process Monitoring**
  ```bash
  pm2 monit
  # All processes should be stable
  ```

## 🔐 Security Verification

### Firewall
- [ ] **UFW Status**
  ```bash
  sudo ufw status
  # Should show active with correct rules
  ```
- [ ] **Open Ports**
  ```bash
  sudo netstat -tlnp
  # Should show: 22, 80, 443, 25, 587, 3000, 5000
  ```

### SSL Security
- [ ] **SSL Test**
  - Visit: https://www.ssllabs.com/ssltest/
  - Test: oplex.online
  - Expected: A or A+ rating

### Application Security
- [ ] **Admin Password Changed**
  - [ ] Default password updated
  - [ ] Strong password set
- [ ] **Rate Limiting**
  - [ ] API rate limits working
  - [ ] No abuse possible

## 🎯 Final Verification

### End-to-End Test
- [ ] **Complete Email Flow**
  1. [ ] Visit https://oplex.online
  2. [ ] Generate temporary email
  3. [ ] Send email from external service (Gmail, etc.)
  4. [ ] Verify real-time delivery
  5. [ ] Check email content and formatting
  6. [ ] Verify auto-expiry works

- [ ] **Multi-Domain Test**
  1. [ ] Test email generation on oplex.online
  2. [ ] Test email generation on agrovia.store
  3. [ ] Verify both domains receive emails
  4. [ ] Check admin panel shows both domains

### Performance Test
- [ ] **Load Test**
  - [ ] Generate multiple emails quickly
  - [ ] Send multiple emails simultaneously
  - [ ] Verify system stability
  - [ ] Check resource usage

### Backup Test
- [ ] **Backup Script**
  ```bash
  ./backup.sh
  # Should create backup files
  ```
- [ ] **Recovery Test**
  - [ ] Stop services
  - [ ] Restore from backup
  - [ ] Verify functionality

## 📝 Documentation

### Access Information
- [ ] **Record Credentials**
  - Server IP: 206.189.158.244
  - SSH User: ___________
  - Admin Username: admin
  - Admin Password: TurboMails2024! (change this!)

- [ ] **Service URLs**
  - Primary: https://oplex.online
  - Secondary: https://agrovia.store
  - Admin: https://oplex.online/admin

### Maintenance Commands
- [ ] **Document Key Commands**
  ```bash
  # Service management
  pm2 status
  pm2 restart all
  pm2 logs
  
  # Health monitoring
  ./monitor.sh
  
  # System updates
  sudo apt update && sudo apt upgrade
  
  # SSL renewal
  sudo certbot renew
  ```

## ✅ Deployment Complete

- [ ] **All Tests Passed**
- [ ] **Documentation Updated**
- [ ] **Monitoring Active**
- [ ] **Backups Configured**
- [ ] **Security Verified**

### Sign-off
- **Deployed by:** ___________
- **Date:** ___________
- **Time:** ___________
- **Notes:** ___________

---

## 🚨 Troubleshooting Quick Reference

### Common Issues

**DNS Not Propagated:**
```bash
# Wait 24 hours or use different DNS
nslookup oplex.online 8.8.8.8
```

**SSL Certificate Failed:**
```bash
# Manual certificate request
sudo certbot --nginx -d oplex.online -d agrovia.store
```

**SMTP Not Working:**
```bash
# Check if port 25 is blocked
telnet smtp.gmail.com 587
# If this fails, contact VPS provider
```

**Application Not Starting:**
```bash
# Check logs
pm2 logs
# Restart services
pm2 restart all
```

**High Memory Usage:**
```bash
# Check memory
free -h
# Restart if needed
pm2 restart all
sudo systemctl restart redis-server
```

### Emergency Contacts
- **VPS Provider:** ___________
- **Domain Registrar:** ___________
- **Technical Support:** ___________

---

**🎉 Congratulations! Your TurboMails enterprise temporary email service is now live!**

**Access your service at:**
- 🌐 https://oplex.online
- 🌐 https://agrovia.store
- 🔐 https://oplex.online/admin