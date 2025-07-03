# TurboMails - Enterprise Temporary Email Service

A modern, scalable, and secure temporary email service built with Next.js, Express.js, Redis, and real SMTP functionality. TurboMails provides instant temporary email addresses with real-time delivery, perfect for protecting privacy online while supporting multiple domains and VPS deployment.

## ✨ Features

### 🌐 Main Website
- **Instant Email Generation**: Create temporary emails in seconds across 5 domains
- **Real-time Inbox**: Live email delivery via Socket.IO
- **Auto-Expiry**: Emails automatically delete after 1 hour
- **Privacy-First**: No registration, no tracking, minimal data retention
- **Responsive Design**: Works perfectly on all devices
- **Black Theme**: Modern dark UI for better user experience
- **Push Notifications**: Browser notifications for new emails
- **Multiple Domains**: 5 different domains for variety

### 🔐 Admin Panel
- **Secure Dashboard**: Protected admin interface with real-time stats
- **Email Management**: View and delete all temporary emails
- **Domain Analytics**: Monitor usage per domain
- **Real-time Monitoring**: Live connection status and metrics
- **Bulk Operations**: Delete multiple emails at once
- **Redis Health**: Monitor Redis connection and performance
- **SMTP Status**: Track SMTP server health

### 📧 SMTP & Email Features
- **Real SMTP Server**: Custom SMTP server for receiving emails
- **Multiple Ports**: Support for port 25 and 587
- **Email Parsing**: Full email parsing with attachments
- **Redis Storage**: Fast, in-memory email storage
- **Auto Cleanup**: Automated cleanup of expired emails
- **Rate Limiting**: Protection against spam and abuse

### 🚀 Production Ready
- **VPS Deployment**: Complete VPS deployment instructions
- **Docker Support**: Full Docker containerization
- **Nginx Integration**: Reverse proxy configuration
- **SSL/TLS Support**: HTTPS and secure email delivery
- **Process Management**: PM2 configuration for production
- **Health Monitoring**: Built-in health checks

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with SSR
- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Socket.IO Client**: Real-time communication
- **Lucide React**: Modern icon library
- **Axios**: HTTP client for API calls
- **Moment.js**: Date and time handling

### Backend
- **Express.js**: Web application framework
- **Node.js**: JavaScript runtime
- **Socket.IO**: Real-time bidirectional communication
- **Redis**: In-memory data structure store
- **SMTP Server**: Custom SMTP implementation
- **Mailparser**: Email parsing library
- **Node-cron**: Scheduled tasks
- **IORedis**: Redis client for Node.js

### Infrastructure
- **Docker**: Containerization platform
- **Nginx**: Web server and reverse proxy
- **PM2**: Process manager for Node.js
- **Let's Encrypt**: Free SSL certificates
- **Ubuntu/CentOS**: Linux server support

## 🚀 Installation

### Prerequisites
- Node.js 18+ installed
- Redis server (local or remote)
- npm or yarn package manager
- Docker (optional, for containerized deployment)

### Quick Start (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/turbo-mails.git
   cd turbo-mails
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   # Admin Configuration
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   
   # Server Configuration
   PORT=5000
   FRONTEND_PORT=3000
   
   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   
   # SMTP Configuration
   SMTP_PORT=25
   SMTP_PORT_SECURE=587
   
   # Supported Domains
   SUPPORTED_DOMAINS=tempmail.com,quickmail.org,fastmail.temp,mailnow.io,tempbox.net
   ```

4. **Start Redis server**
   ```bash
   # On Ubuntu/Debian
   sudo systemctl start redis-server
   
   # On macOS with Homebrew
   brew services start redis
   
   # Using Docker
   docker run -d -p 6379:6379 redis:alpine
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend (Next.js) on http://localhost:3000
   - Backend (Express) on http://localhost:5000
   - SMTP Server on ports 25 and 587

6. **Access the application**
   - **Main Website**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin

### Docker Deployment

1. **Build and start all services**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## 🌐 VPS Deployment

### Automated Deployment

Run the automated deployment script:
```bash
node deploy.js
```

### Manual VPS Setup

1. **Server Requirements**
   - Ubuntu 20.04+ or CentOS 8+
   - 2GB+ RAM
   - 20GB+ storage
   - Root or sudo access

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Redis
   sudo apt install redis-server -y
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx -y
   ```

3. **Configure Firewall**
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw allow 25
   sudo ufw allow 587
   sudo ufw enable
   ```

4. **Deploy Application**
   ```bash
   git clone https://github.com/yourusername/turbo-mails.git
   cd turbo-mails
   npm install --production
   npm run build
   ```

5. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with production settings
   ```

6. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx**
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/turbomails
   sudo ln -s /etc/nginx/sites-available/turbomails /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 📧 Usage

### For Users
1. Visit the main website
2. Click "Generate Email" to create a temporary email
3. Choose from 5 available domains
4. Use the generated email for registrations or verifications
5. Receive emails in real-time with push notifications
6. Emails automatically expire after 1 hour

### For Administrators
1. Navigate to `/admin`
2. Login with your admin credentials
3. Monitor real-time statistics and domain usage
4. View all temporary emails across all domains
5. Delete emails manually or in bulk
6. Monitor Redis and SMTP server health
7. Track system performance metrics

## 📁 Project Structure

```
turbo-mails/
├── components/
│   ├── AdminLayout.js      # Admin panel layout
│   └── MainLayout.js       # Main website layout
├── pages/
│   ├── admin/
│   │   ├── index.js        # Admin login page
│   │   └── dashboard.js    # Admin dashboard
│   ├── _app.js             # App wrapper with routing logic
│   ├── index.js            # Homepage
│   ├── about.js            # About page
│   └── privacy.js          # Privacy policy
├── styles/
│   └── globals.css         # Global styles with Tailwind
├── server.js               # Express.js backend server
├── smtp-server.js          # Custom SMTP server
├── deploy.js               # Automated deployment script
├── docker-compose.yml      # Docker services configuration
├── Dockerfile.api          # API server Docker image
├── Dockerfile.frontend     # Frontend Docker image
├── Dockerfile.smtp         # SMTP server Docker image
├── nginx.conf              # Nginx reverse proxy config
├── redis.conf              # Redis configuration
├── ecosystem.config.js     # PM2 process configuration
├── .env.example            # Environment variables template
├── VPS_DEPLOYMENT.md       # Detailed VPS deployment guide
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── next.config.js          # Next.js configuration
└── README.md               # This file
```

## 🔌 API Documentation

### Public Endpoints
- `POST /api/generate-email` - Generate a new temporary email
- `GET /api/email/:id` - Get email details and messages
- `POST /api/simulate-email/:emailId` - Send a test email (for demo)
- `DELETE /api/emails/:email` - Delete all emails for an address

### Admin Endpoints
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/emails` - Get all emails
- `DELETE /api/admin/email/:id` - Delete an email
- `DELETE /api/admin/emails` - Bulk delete emails (admin only)
- `GET /api/admin/domains` - Get domain statistics (admin only)

### SMTP API
- `POST /smtp/receive` - Receive emails from SMTP server
- `GET /health` - Health check endpoint

### Socket.IO Events
- `connection` - Client connects to real-time updates
- `join-email` - Subscribe to specific email updates
- `new-message` - New email received notification
- `disconnect` - Client disconnects

## ⚙️ Configuration

### Environment Variables

```env
# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# Server Configuration
PORT=5000
FRONTEND_PORT=3000
NODE_ENV=production

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# SMTP Configuration
SMTP_HOST=0.0.0.0
SMTP_PORT=25
SMTP_PORT_SECURE=587
SMTP_MAX_CONNECTIONS=100

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Supported Domains (comma-separated)
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
LOG_FILE=logs/app.log
```

### Tailwind CSS Theme
The project uses a custom black theme defined in `tailwind.config.js`. Key colors:
- Background: `#000000` (pure black)
- Cards: `#111111` (dark gray)
- Text: `#ffffff` (white) and `#a1a1aa` (gray)
- Accent: `#3b82f6` (blue)

### Domain Configuration

To add new domains:
1. Update `SUPPORTED_DOMAINS` in `.env`
2. Configure DNS MX records to point to your server
3. Update firewall rules for SMTP ports
4. Restart the SMTP server

### Auto-Cleanup
The server automatically cleans up expired emails every hour to maintain performance and privacy.

## 🔧 Troubleshooting

### Common Issues

**Redis Connection Failed**
```bash
# Check Redis status
sudo systemctl status redis-server

# Start Redis
sudo systemctl start redis-server

# Test Redis connection
redis-cli ping
```

**SMTP Server Not Receiving Emails**
```bash
# Check if ports are open
sudo netstat -tlnp | grep :25
sudo netstat -tlnp | grep :587

# Check firewall
sudo ufw status

# Test SMTP connection
telnet your-server.com 25
```

**Frontend Not Loading**
```bash
# Check if Next.js is running
pm2 status

# Check logs
pm2 logs frontend

# Restart frontend
pm2 restart frontend
```

### Performance Optimization

1. **Redis Memory Optimization**
   - Set appropriate `maxmemory` in redis.conf
   - Use `allkeys-lru` eviction policy
   - Monitor memory usage with `redis-cli info memory`

2. **SMTP Performance**
   - Increase `SMTP_MAX_CONNECTIONS` for high traffic
   - Use connection pooling
   - Monitor with `pm2 monit`

3. **Nginx Optimization**
   - Enable gzip compression
   - Set appropriate cache headers
   - Use HTTP/2 for better performance

## Development Scripts

- `npm run dev` - Start development servers (both frontend and backend)
- `npm run client` - Start only Next.js frontend
- `npm run server` - Start only Express.js backend
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

3. **Environment Variables**
   Set the following in production:
   ```env
   NODE_ENV=production
   PORT=5000
   ```

## Security Features

- 🔒 **Auto-Expiry** - All emails automatically delete after 1 hour
- 🛡️ **Rate Limiting** - Prevents abuse and spam
- 🔐 **Admin Authentication** - Secure admin panel access
- 🚫 **No Personal Data** - No registration or personal information required
- 🔄 **Regular Cleanup** - Automatic deletion of expired data

## Customization

### Changing Email Expiry Time
Edit the expiry time in `server.js`:
```javascript
expiresAt: moment().add(1, 'hour').toISOString() // Change '1, hour' to desired duration
```

### Adding New Domains
Add domains in `server.js`:
```javascript
const domains = ['tempmail.com', 'quickmail.net', 'fastmail.org', 'your-domain.com'];
```

### Customizing Theme
Modify colors in `tailwind.config.js` and `styles/globals.css`.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure Docker builds pass

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check VPS_DEPLOYMENT.md for detailed setup
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Security**: Report security issues privately

## 🚀 Roadmap

- [ ] Email forwarding to external addresses
- [ ] Custom domain support
- [ ] Email templates and filtering
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API rate limiting per user
- [ ] Email encryption support

---

**TurboMails** - Enterprise Temporary Email Service with Real SMTP, Redis, and Multi-Domain Support