const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Default configuration (no environment variables needed)
const SMTP_PORT = 25;
const SMTP_PORT_SUBMISSION = 587;
const API_URL = 'http://206.189.158.244:5000';

// Supported domains
const SUPPORTED_DOMAINS = [
  'tempmail.pro',
  'quickmail.dev',
  'fastmail.temp',
  'mailbox.ninja',
  'inbox.rapid'
];

// Create SMTP server
const server = new SMTPServer({
  // Server identification
  name: 'TurboMails SMTP Server',
  banner: 'TurboMails Temporary Email Service',
  
  // Authentication (disabled for temporary emails)
  authOptional: true,
  disabledCommands: ['AUTH'],
  
  // Connection settings
  hideSTARTTLS: true, // Disable TLS for development
  secure: false,
  
  // Size limits
  size: 10 * 1024 * 1024, // 10MB max email size
  
  // Logging
  logger: {
    info: console.log,
    debug: console.log,
    error: console.error
  },
  
  // Validate recipients
  onRcptTo(address, session, callback) {
    const domain = address.address.split('@')[1];
    
    if (!SUPPORTED_DOMAINS.includes(domain)) {
      return callback(new Error(`Domain ${domain} not supported`));
    }
    
    console.log(`📧 Accepting email for: ${address.address}`);
    callback();
  },
  
  // Handle incoming emails
  onData(stream, session, callback) {
    let emailData = '';
    
    stream.on('data', (chunk) => {
      emailData += chunk;
    });
    
    stream.on('end', async () => {
      try {
        console.log('📨 Processing incoming email...');
        
        // Parse the email
        const parsed = await simpleParser(emailData);
        
        // Extract recipient
        const recipients = session.envelope.rcptTo;
        
        for (const recipient of recipients) {
          const recipientEmail = recipient.address;
          
          console.log(`📬 Forwarding email to API for: ${recipientEmail}`);
          
          // Forward to Express API
          try {
            const response = await axios.post(`${API_URL}/smtp/receive`, emailData, {
              headers: {
                'Content-Type': 'message/rfc822',
                'X-Recipient': recipientEmail,
                'X-Sender': session.envelope.mailFrom?.address || 'unknown'
              },
              timeout: 30000
            });
            
            console.log(`✅ Email forwarded successfully for ${recipientEmail}`);
          } catch (error) {
            console.error(`❌ Failed to forward email for ${recipientEmail}:`, error.message);
            return callback(new Error('Failed to process email'));
          }
        }
        
        callback();
      } catch (error) {
        console.error('❌ Error processing email:', error);
        callback(new Error('Failed to process email'));
      }
    });
    
    stream.on('error', (error) => {
      console.error('❌ Stream error:', error);
      callback(error);
    });
  },
  
  // Connection events
  onConnect(session, callback) {
    console.log(`🔗 New SMTP connection from ${session.remoteAddress}`);
    callback();
  },
  
  onClose(session) {
    console.log(`🔌 SMTP connection closed from ${session.remoteAddress}`);
  }
});

// Error handling
server.on('error', (err) => {
  console.error('❌ SMTP Server error:', err);
});

// Start the server
server.listen(SMTP_PORT, () => {
  console.log('🚀 TurboMails SMTP Server started');
  console.log(`📧 Listening on port ${SMTP_PORT}`);
  console.log(`🌐 Supported domains: ${SUPPORTED_DOMAINS.join(', ')}`);
  console.log(`🔄 Forwarding emails to: ${API_URL}`);
});

// Also listen on submission port (587)
const submissionServer = new SMTPServer({
  name: 'TurboMails SMTP Submission Server',
  banner: 'TurboMails Temporary Email Service - Submission',
  authOptional: true,
  disabledCommands: ['AUTH'],
  hideSTARTTLS: true,
  secure: false,
  size: 10 * 1024 * 1024,
  logger: {
    info: console.log,
    debug: console.log,
    error: console.error
  },
  onRcptTo: server.options.onRcptTo,
  onData: server.options.onData,
  onConnect: server.options.onConnect,
  onClose: server.options.onClose
});

submissionServer.listen(SMTP_PORT_SUBMISSION, () => {
  console.log(`📧 SMTP Submission server listening on port ${SMTP_PORT_SUBMISSION}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down SMTP servers...');
  server.close(() => {
    submissionServer.close(() => {
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down SMTP servers...');
  server.close(() => {
    submissionServer.close(() => {
      process.exit(0);
    });
  });
});

// Health check function
function healthCheck() {
  return {
    status: 'healthy',
    smtp_port: SMTP_PORT,
    submission_port: SMTP_PORT_SUBMISSION,
    supported_domains: SUPPORTED_DOMAINS,
    api_url: API_URL,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
}

// Export for external health checks
module.exports = { server, submissionServer, healthCheck };