#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const config = {
  redis: {
    port: 6379,
    host: '127.0.0.1',
    password: null
  },
  api: {
    port: 5000
  },
  frontend: {
    port: 3000
  },
  smtp: {
    port: 25,
    submissionPort: 587
  },
  domains: [
    'tempmail.pro',
    'quickmail.dev',
    'fastmail.temp',
    'mailbox.ninja',
    'inbox.rapid'
  ]
};

class TurboMailsDeployer {
  constructor() {
    this.processes = [];
    this.isWindows = os.platform() === 'win32';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async checkRedis() {
    return new Promise((resolve) => {
      const redis = spawn('redis-cli', ['ping'], { stdio: 'pipe' });
      
      redis.on('close', (code) => {
        resolve(code === 0);
      });
      
      redis.on('error', () => {
        resolve(false);
      });
    });
  }

  async startRedis() {
    this.log('Starting Redis server...', 'info');
    
    const redisRunning = await this.checkRedis();
    if (redisRunning) {
      this.log('Redis is already running', 'success');
      return true;
    }

    return new Promise((resolve, reject) => {
      const redisArgs = ['--port', config.redis.port.toString()];
      
      if (fs.existsSync('./redis.conf')) {
        redisArgs.push('./redis.conf');
      }

      const redis = spawn('redis-server', redisArgs, {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: !this.isWindows
      });

      redis.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Ready to accept connections')) {
          this.log('Redis server started successfully', 'success');
          resolve(true);
        }
      });

      redis.stderr.on('data', (data) => {
        this.log(`Redis error: ${data}`, 'error');
      });

      redis.on('error', (error) => {
        this.log(`Failed to start Redis: ${error.message}`, 'error');
        reject(error);
      });

      this.processes.push({ name: 'redis', process: redis });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        this.log('Redis startup timeout', 'warning');
        resolve(false);
      }, 10000);
    });
  }

  async startAPI() {
    this.log('Starting TurboMails API server...', 'info');
    
    return new Promise((resolve) => {
      const api = spawn('node', ['server.js'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          PORT: config.api.port,
          REDIS_URL: `redis://${config.redis.host}:${config.redis.port}`,
          NODE_ENV: 'production'
        }
      });

      api.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[API] ${output.trim()}`);
        if (output.includes('TurboMails server running')) {
          this.log('API server started successfully', 'success');
          resolve(true);
        }
      });

      api.stderr.on('data', (data) => {
        console.error(`[API Error] ${data}`);
      });

      api.on('error', (error) => {
        this.log(`Failed to start API: ${error.message}`, 'error');
        resolve(false);
      });

      this.processes.push({ name: 'api', process: api });
    });
  }

  async startSMTP() {
    this.log('Starting SMTP server...', 'info');
    
    return new Promise((resolve) => {
      const smtp = spawn('node', ['smtp-server.js'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          SMTP_PORT: config.smtp.port,
          SMTP_PORT_SUBMISSION: config.smtp.submissionPort,
          API_URL: `http://206.189.158.244:${config.api.port}`
        }
      });

      smtp.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[SMTP] ${output.trim()}`);
        if (output.includes('TurboMails SMTP Server started')) {
          this.log('SMTP server started successfully', 'success');
          resolve(true);
        }
      });

      smtp.stderr.on('data', (data) => {
        console.error(`[SMTP Error] ${data}`);
      });

      smtp.on('error', (error) => {
        this.log(`Failed to start SMTP: ${error.message}`, 'error');
        resolve(false);
      });

      this.processes.push({ name: 'smtp', process: smtp });
    });
  }

  async startFrontend() {
    this.log('Starting Next.js frontend...', 'info');
    
    return new Promise((resolve) => {
      const frontend = spawn('npm', ['run', 'dev'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          PORT: config.frontend.port,
          NEXT_PUBLIC_API_URL: `http://206.189.158.244:${config.api.port}`
        }
      });

      frontend.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Frontend] ${output.trim()}`);
        if (output.includes('ready') || output.includes('compiled')) {
          this.log('Frontend started successfully', 'success');
          resolve(true);
        }
      });

      frontend.stderr.on('data', (data) => {
        console.error(`[Frontend Error] ${data}`);
      });

      frontend.on('error', (error) => {
        this.log(`Failed to start frontend: ${error.message}`, 'error');
        resolve(false);
      });

      this.processes.push({ name: 'frontend', process: frontend });
    });
  }

  generateVPSInstructions() {
    const instructions = `
# TurboMails VPS Deployment Instructions

## Prerequisites
1. Ubuntu 20.04+ or CentOS 8+ VPS
2. Root or sudo access
3. Domain names pointing to your VPS IP

## Step 1: Install Dependencies
\`\`\`bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Redis
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install Nginx
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx

# Install PM2 for process management
sudo npm install -g pm2
\`\`\`

## Step 2: Setup TurboMails
\`\`\`bash
# Clone or upload your TurboMails project
cd /var/www
sudo git clone <your-repo> turbomail
cd turbomail

# Install dependencies
sudo npm install

# Build frontend
sudo npm run build
\`\`\`

## Step 3: Configure Environment
\`\`\`bash
# Create production environment file
sudo nano .env.production
\`\`\`

Add the following:
\`\`\`
NODE_ENV=production
PORT=5000
REDIS_URL=redis://localhost:6379
SMTP_PORT=25
SMTP_PORT_SUBMISSION=587
API_URL=http://localhost:5000
\`\`\`

## Step 4: Setup DNS Records
For each domain (${config.domains.join(', ')}):

\`\`\`
A     @           YOUR_VPS_IP
A     www         YOUR_VPS_IP
MX    @           10 mail.yourdomain.com
A     mail        YOUR_VPS_IP
TXT   @           "v=spf1 ip4:YOUR_VPS_IP ~all"
\`\`\`

## Step 5: Configure Nginx
\`\`\`bash
sudo cp nginx.conf /etc/nginx/sites-available/turbomail
sudo ln -s /etc/nginx/sites-available/turbomail /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

## Step 6: Setup SSL with Let's Encrypt
\`\`\`bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d ${config.domains[0]} -d www.${config.domains[0]}
\`\`\`

## Step 7: Start Services with PM2
\`\`\`bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'turbomail-api',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'turbomail-smtp',
      script: 'smtp-server.js',
      env: {
        NODE_ENV: 'production',
        SMTP_PORT: 25,
        SMTP_PORT_SUBMISSION: 587
      }
    },
    {
      name: 'turbomail-frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
EOF

# Start all services
pm2 start ecosystem.config.js
pm2 save
pm2 startup
\`\`\`

## Step 8: Configure Firewall
\`\`\`bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 25
sudo ufw allow 587
sudo ufw enable
\`\`\`

## Step 9: Monitor Services
\`\`\`bash
# Check PM2 status
pm2 status
pm2 logs

# Check Redis
redis-cli ping

# Check Nginx
sudo systemctl status nginx
\`\`\`

## Maintenance Commands
\`\`\`bash
# Restart services
pm2 restart all

# Update application
cd /var/www/turbomail
git pull
npm install
npm run build
pm2 restart all

# View logs
pm2 logs turbomail-api
pm2 logs turbomail-smtp
pm2 logs turbomail-frontend
\`\`\`

## Security Recommendations
1. Change default Redis password
2. Setup fail2ban for SSH protection
3. Regular security updates
4. Monitor logs for suspicious activity
5. Backup Redis data regularly

## Performance Optimization
1. Enable Redis persistence
2. Configure Nginx caching
3. Use CDN for static assets
4. Monitor resource usage
5. Scale horizontally if needed
`;

    fs.writeFileSync('./VPS_DEPLOYMENT.md', instructions);
    this.log('VPS deployment instructions saved to VPS_DEPLOYMENT.md', 'success');
  }

  async deploy() {
    this.log('🚀 Starting TurboMails deployment...', 'info');
    
    try {
      // Start Redis first
      await this.startRedis();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Start API server
      await this.startAPI();
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Start SMTP server (requires elevated privileges)
      this.log('⚠️  SMTP server requires elevated privileges for port 25', 'warning');
      await this.startSMTP();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Start frontend
      await this.startFrontend();
      
      // Generate VPS instructions
      this.generateVPSInstructions();
      
      this.log('✅ TurboMails deployment completed successfully!', 'success');
      this.log('', 'info');
      this.log('🌐 Services running:', 'info');
      this.log(`   Frontend: http://localhost:${config.frontend.port}`, 'info');
      this.log(`   API: http://localhost:${config.api.port}`, 'info');
      this.log(`   SMTP: Port ${config.smtp.port} & ${config.smtp.submissionPort}`, 'info');
      this.log(`   Redis: Port ${config.redis.port}`, 'info');
      this.log('', 'info');
      this.log('📧 Supported domains:', 'info');
      config.domains.forEach(domain => {
        this.log(`   ${domain}`, 'info');
      });
      this.log('', 'info');
      this.log('📋 Check VPS_DEPLOYMENT.md for production deployment instructions', 'info');
      
    } catch (error) {
      this.log(`Deployment failed: ${error.message}`, 'error');
      this.cleanup();
    }
  }

  cleanup() {
    this.log('🧹 Cleaning up processes...', 'info');
    this.processes.forEach(({ name, process }) => {
      try {
        process.kill();
        this.log(`Stopped ${name}`, 'info');
      } catch (error) {
        this.log(`Failed to stop ${name}: ${error.message}`, 'warning');
      }
    });
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  deployer.cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  deployer.cleanup();
  process.exit(0);
});

// Start deployment
const deployer = new TurboMailsDeployer();

if (require.main === module) {
  deployer.deploy().catch(console.error);
}

module.exports = TurboMailsDeployer;