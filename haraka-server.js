const Haraka = require('haraka');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Create Haraka configuration directory
const configDir = path.join(__dirname, 'haraka-config');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Create plugins directory
const pluginsDir = path.join(configDir, 'plugins');
if (!fs.existsSync(pluginsDir)) {
  fs.mkdirSync(pluginsDir, { recursive: true });
}

// Create basic Haraka configuration files
const configs = {
  'smtp.ini': `
[main]
listen=[::0]:25,[::0]:587
user=nobody
group=nobody
ignore_bad_plugins=false

[outbound]
enable_tls=true
max_connections=1000
`,
  
  'plugins': `
# Core plugins
auth/auth_base
auth/auth_flat_file
data.headers
mail_from.is_resolvable
rcpt_to.in_host_list
queue/smtp_forward

# Custom plugins
turbomail_receiver
`,
  
  'host_list': `
tempmail.pro
quickmail.dev
fastmail.temp
mailbox.ninja
inbox.rapid
`,
  
  'me': 'tempmail.pro',
  
  'smtp_forward.ini': `
[main]
host=127.0.0.1
port=5000
path=/smtp/receive
method=POST
max_connections=10
timeout=30
`,
  
  'auth_flat_file.ini': `
[core]
methods=PLAIN,LOGIN
`,
  
  'tls.ini': `
[main]
key=/path/to/tls_key.pem
cert=/path/to/tls_cert.pem
`
};

// Write configuration files
for (const [filename, content] of Object.entries(configs)) {
  const filePath = path.join(configDir, filename);
  fs.writeFileSync(filePath, content.trim());
}

// Create custom TurboMail receiver plugin
const turboMailPlugin = `
// TurboMail receiver plugin
const axios = require('axios');

exports.hook_data_post = function(next, connection) {
  const transaction = connection.transaction;
  const emailData = transaction.message_stream.get_data();
  
  // Forward to Express server
  axios.post('http://206.189.158.244:5000/smtp/receive', emailData, {
    headers: {
      'Content-Type': 'message/rfc822'
    },
    timeout: 30000
  })
  .then(response => {
    this.loginfo('Email forwarded successfully');
    next(OK);
  })
  .catch(error => {
    this.logerror('Failed to forward email: ' + error.message);
    next(DENYSOFT, 'Temporary failure, please try again');
  });
};

exports.hook_rcpt = function(next, connection, params) {
  const rcpt = params[0];
  const domain = rcpt.host;
  
  // Check if domain is supported
  const supportedDomains = [
    'tempmail.pro',
    'quickmail.dev', 
    'fastmail.temp',
    'mailbox.ninja',
    'inbox.rapid'
  ];
  
  if (supportedDomains.includes(domain)) {
    next(OK);
  } else {
    next(DENY, 'Domain not supported');
  }
};
`;

fs.writeFileSync(path.join(pluginsDir, 'turbomail_receiver.js'), turboMailPlugin.trim());

// Create Haraka startup script
const harakaStartup = `
const Haraka = require('haraka');
const path = require('path');

const configPath = path.join(__dirname, 'haraka-config');

// Start Haraka server
const server = new Haraka.Server({
  config_dir: configPath
});

server.on('ready', () => {
  console.log('🚀 Haraka SMTP server started');
  console.log('📧 Listening on ports 25 and 587');
  console.log('🔄 Forwarding emails to Express server on port 5000');
});

server.on('error', (err) => {
  console.error('❌ Haraka server error:', err);
});

process.on('SIGTERM', () => {
  console.log('Shutting down Haraka server...');
  server.shutdown();
});

process.on('SIGINT', () => {
  console.log('Shutting down Haraka server...');
  server.shutdown();
});
`;

fs.writeFileSync(path.join(__dirname, 'start-haraka.js'), harakaStartup.trim());

console.log('✅ Haraka SMTP server configuration created');
console.log('📁 Configuration directory:', configDir);
console.log('🔧 To start Haraka server: node start-haraka.js');
console.log('⚠️  Note: You may need to run as administrator for port 25');