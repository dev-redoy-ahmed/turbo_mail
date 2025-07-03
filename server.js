const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const Redis = require('ioredis');
const { simpleParser } = require('mailparser');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Redis client setup
const redis = new Redis(REDIS_URL);

// Available domains for temporary emails
const DOMAINS = [
  'tempmail.pro',
  'quickmail.dev',
  'fastmail.temp',
  'mailbox.ninja',
  'inbox.rapid'
];

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.raw({ type: 'message/rfc822', limit: '10mb' }));

// In-memory fallback for admin users
let adminUsers = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' }
];

// Utility functions
function generateTempEmail() {
  const randomString = Math.random().toString(36).substring(2, 12);
  const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
  return `${randomString}@${domain}`;
}

function getEmailKey(email) {
  return `email:${email}`;
}

function getInboxKey(emailId) {
  return `inbox:${emailId}`;
}

function getStatsKey() {
  return 'stats:global';
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('subscribe', (emailId) => {
    socket.join(`email:${emailId}`);
    console.log(`Client ${socket.id} subscribed to email:${emailId}`);
  });
  
  socket.on('unsubscribe', (emailId) => {
    socket.leave(`email:${emailId}`);
    console.log(`Client ${socket.id} unsubscribed from email:${emailId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// SMTP Email receiving endpoint (for Haraka integration)
app.post('/smtp/receive', async (req, res) => {
  try {
    const rawEmail = req.body;
    const parsed = await simpleParser(rawEmail);
    
    // Extract recipient email
    const recipientEmail = parsed.to?.text || parsed.to?.value?.[0]?.address;
    if (!recipientEmail) {
      return res.status(400).json({ error: 'No recipient found' });
    }
    
    // Check if email exists in Redis
    const emailData = await redis.get(getEmailKey(recipientEmail));
    if (!emailData) {
      return res.status(404).json({ error: 'Email not found or expired' });
    }
    
    const email = JSON.parse(emailData);
    
    // Create message object
    const message = {
      id: uuidv4(),
      subject: parsed.subject || 'No Subject',
      sender: parsed.from?.text || parsed.from?.value?.[0]?.address || 'Unknown',
      content: parsed.text || parsed.html || 'No content',
      html: parsed.html || null,
      attachments: parsed.attachments || [],
      receivedAt: moment().toISOString(),
      size: Buffer.byteLength(rawEmail)
    };
    
    // Store message in Redis
    await redis.lpush(getInboxKey(email.id), JSON.stringify(message));
    await redis.expire(getInboxKey(email.id), 3600); // 1 hour expiry
    
    // Update email message count
    email.messageCount = (email.messageCount || 0) + 1;
    await redis.setex(getEmailKey(recipientEmail), 3600, JSON.stringify(email));
    
    // Update global stats
    await redis.incr('stats:total_messages');
    await redis.incr(`stats:messages:${moment().format('YYYY-MM-DD')}`);
    
    // Emit real-time update to connected clients
    io.to(`email:${email.id}`).emit('new_message', message);
    
    console.log(`New email received for ${recipientEmail}:`, message.subject);
    res.json({ success: true, messageId: message.id });
    
  } catch (error) {
    console.error('Error processing email:', error);
    res.status(500).json({ error: 'Failed to process email' });
  }
});

// API Routes

// Generate temporary email
app.post('/api/generate-email', async (req, res) => {
  try {
    const tempEmail = {
      id: uuidv4(),
      email: generateTempEmail(),
      createdAt: moment().toISOString(),
      expiresAt: moment().add(1, 'hour').toISOString(),
      messageCount: 0,
      domain: null
    };
    
    // Extract domain from email
    tempEmail.domain = tempEmail.email.split('@')[1];
    
    // Store in Redis with 1 hour expiry
    await redis.setex(getEmailKey(tempEmail.email), 3600, JSON.stringify(tempEmail));
    await redis.setex(`emailid:${tempEmail.id}`, 3600, tempEmail.email);
    
    // Update global stats
    await redis.incr('stats:total_emails');
    await redis.incr(`stats:emails:${moment().format('YYYY-MM-DD')}`);
    
    res.json(tempEmail);
  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({ error: 'Failed to generate email' });
  }
});

// Get email details and messages
app.get('/api/email/:id', async (req, res) => {
  try {
    const emailAddress = await redis.get(`emailid:${req.params.id}`);
    if (!emailAddress) {
      return res.status(404).json({ error: 'Email not found or expired' });
    }
    
    const emailData = await redis.get(getEmailKey(emailAddress));
    if (!emailData) {
      return res.status(404).json({ error: 'Email not found or expired' });
    }
    
    const email = JSON.parse(emailData);
    
    // Get messages from Redis
    const messages = await redis.lrange(getInboxKey(email.id), 0, -1);
    email.messages = messages.map(msg => JSON.parse(msg)).reverse(); // Newest first
    
    res.json(email);
  } catch (error) {
    console.error('Error fetching email:', error);
    res.status(500).json({ error: 'Failed to fetch email' });
  }
});

// Get all emails (admin only)
app.get('/api/admin/emails', async (req, res) => {
  try {
    const keys = await redis.keys('email:*');
    const emails = [];
    
    for (const key of keys) {
      const emailData = await redis.get(key);
      if (emailData) {
        const email = JSON.parse(emailData);
        // Get message count
        const messageCount = await redis.llen(getInboxKey(email.id));
        email.messageCount = messageCount;
        emails.push(email);
      }
    }
    
    // Sort by creation date (newest first)
    emails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Delete email (admin only)
app.delete('/api/admin/email/:id', async (req, res) => {
  try {
    const emailAddress = await redis.get(`emailid:${req.params.id}`);
    if (!emailAddress) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    // Delete email and its messages
    await redis.del(getEmailKey(emailAddress));
    await redis.del(`emailid:${req.params.id}`);
    await redis.del(getInboxKey(req.params.id));
    
    res.json({ message: 'Email deleted successfully' });
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(500).json({ error: 'Failed to delete email' });
  }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const admin = adminUsers.find(u => u.username === username && u.password === password);
  
  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  res.json({ 
    message: 'Login successful',
    user: { id: admin.id, username: admin.username, role: admin.role }
  });
});

// Get statistics (admin only)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalEmails = await redis.get('stats:total_emails') || 0;
    const totalMessages = await redis.get('stats:total_messages') || 0;
    const todayEmails = await redis.get(`stats:emails:${moment().format('YYYY-MM-DD')}`) || 0;
    const todayMessages = await redis.get(`stats:messages:${moment().format('YYYY-MM-DD')}`) || 0;
    
    // Count active emails
    const emailKeys = await redis.keys('email:*');
    let activeEmails = 0;
    
    for (const key of emailKeys) {
      const ttl = await redis.ttl(key);
      if (ttl > 0) activeEmails++;
    }
    
    const stats = {
      totalEmails: parseInt(totalEmails),
      activeEmails,
      totalMessages: parseInt(totalMessages),
      todayEmails: parseInt(todayEmails),
      todayMessages: parseInt(todayMessages),
      domains: DOMAINS,
      redisConnected: redis.status === 'ready'
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get domain status
app.get('/api/admin/domains', async (req, res) => {
  try {
    const domainStats = [];
    
    for (const domain of DOMAINS) {
      const emailKeys = await redis.keys(`email:*@${domain}`);
      const activeCount = emailKeys.length;
      
      domainStats.push({
        domain,
        activeEmails: activeCount,
        status: 'active' // In production, check DNS/MX records
      });
    }
    
    res.json(domainStats);
  } catch (error) {
    console.error('Error fetching domain stats:', error);
    res.status(500).json({ error: 'Failed to fetch domain statistics' });
  }
});

// Simulate receiving an email (for testing)
app.post('/api/simulate-email/:emailId', async (req, res) => {
  try {
    const { subject, sender, content } = req.body;
    const emailAddress = await redis.get(`emailid:${req.params.emailId}`);
    
    if (!emailAddress) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    const message = {
      id: uuidv4(),
      subject: subject || 'Test Email',
      sender: sender || 'test@example.com',
      content: content || 'This is a test email message.',
      html: null,
      attachments: [],
      receivedAt: moment().toISOString(),
      size: Buffer.byteLength(content || 'This is a test email message.')
    };
    
    // Store message
    await redis.lpush(getInboxKey(req.params.emailId), JSON.stringify(message));
    await redis.expire(getInboxKey(req.params.emailId), 3600);
    
    // Update stats
    await redis.incr('stats:total_messages');
    
    // Emit real-time update
    io.to(`email:${req.params.emailId}`).emit('new_message', message);
    
    res.json(message);
  } catch (error) {
    console.error('Error simulating email:', error);
    res.status(500).json({ error: 'Failed to simulate email' });
  }
});

// Cleanup expired emails (cron job)
cron.schedule('*/10 * * * *', async () => {
  try {
    console.log('Running cleanup job...');
    
    const emailKeys = await redis.keys('email:*');
    let cleanedCount = 0;
    
    for (const key of emailKeys) {
      const ttl = await redis.ttl(key);
      if (ttl <= 0) {
        // Email expired, clean up
        const emailData = await redis.get(key);
        if (emailData) {
          const email = JSON.parse(emailData);
          await redis.del(getInboxKey(email.id));
          await redis.del(`emailid:${email.id}`);
        }
        await redis.del(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired emails`);
    }
  } catch (error) {
    console.error('Error in cleanup job:', error);
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const redisStatus = redis.status;
    const uptime = process.uptime();
    
    res.json({
      status: 'healthy',
      uptime: Math.floor(uptime),
      redis: redisStatus,
      domains: DOMAINS.length,
      timestamp: moment().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Error handling
redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await redis.quit();
  server.close(() => {
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 TurboMails server running on port ${PORT}`);
  console.log(`📧 Supporting domains: ${DOMAINS.join(', ')}`);
  console.log(`🔄 Redis status: ${redis.status}`);
  console.log(`⚡ Real-time updates enabled via Socket.IO`);
});