#!/bin/bash

# 🚀 One-Command VPS Deployment Script
# Server: 206.189.158.244
# Domains: oplex.online, agrovia.store

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="206.189.158.244"
VPS_USER="root"
PROJECT_DIR="/root/turbo-mails"
LOCAL_DIR="."

# Functions
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Main deployment function
deploy_to_vps() {
    echo "🚀 Starting TurboMails VPS Deployment"
    echo "======================================"
    echo "Server: $VPS_IP"
    echo "Domains: oplex.online, agrovia.store"
    echo ""

    # Step 1: Test VPS connection
    print_step "1. Testing VPS connection..."
    if ssh -o ConnectTimeout=10 -o BatchMode=yes $VPS_USER@$VPS_IP exit 2>/dev/null; then
        print_status "✅ VPS connection successful"
    else
        print_error "❌ Cannot connect to VPS. Please check:"
        echo "   • SSH key is configured"
        echo "   • VPS IP is correct: $VPS_IP"
        echo "   • VPS is running and accessible"
        exit 1
    fi

    # Step 2: Upload project files
    print_step "2. Uploading project files to VPS..."
    print_status "Syncing files to $VPS_USER@$VPS_IP:$PROJECT_DIR"
    
    # Create project directory on VPS
    ssh $VPS_USER@$VPS_IP "mkdir -p $PROJECT_DIR"
    
    # Upload files using rsync for better performance
    if command -v rsync >/dev/null 2>&1; then
        rsync -avz --progress --exclude 'node_modules' --exclude '.next' --exclude '.git' \
              $LOCAL_DIR/ $VPS_USER@$VPS_IP:$PROJECT_DIR/
    else
        # Fallback to scp if rsync is not available
        scp -r $LOCAL_DIR/* $VPS_USER@$VPS_IP:$PROJECT_DIR/
    fi
    
    print_status "✅ Files uploaded successfully"

    # Step 3: Run setup script on VPS
    print_step "3. Running automated setup on VPS..."
    ssh $VPS_USER@$VPS_IP << 'EOF'
        cd /root/turbo-mails
        
        # Make setup script executable
        chmod +x vps-setup.sh
        
        # Run the setup script
        echo "🔧 Starting automated VPS setup..."
        ./vps-setup.sh
        
        echo "✅ VPS setup completed!"
EOF

    print_status "✅ Automated setup completed"

    # Step 4: Verify deployment
    print_step "4. Verifying deployment..."
    
    # Check if services are running
    ssh $VPS_USER@$VPS_IP << 'EOF'
        echo "📊 Checking service status..."
        
        # Check PM2 processes
        echo "PM2 Processes:"
        pm2 status || echo "PM2 not running yet"
        
        # Check Redis
        echo "Redis Status:"
        redis-cli ping || echo "Redis not responding"
        
        # Check Nginx
        echo "Nginx Status:"
        sudo systemctl is-active nginx || echo "Nginx not active"
        
        echo "✅ Service verification completed"
EOF

    # Step 5: Display access information
    print_step "5. Deployment Summary"
    echo ""
    echo "🎉 TurboMails has been deployed successfully!"
    echo ""
    echo "📧 Access your application:"
    echo "   • Primary Domain: https://oplex.online"
    echo "   • Secondary Domain: https://agrovia.store"
    echo "   • Admin Panel: https://oplex.online/admin"
    echo "   • API Health: https://oplex.online/api/health"
    echo ""
    echo "🔧 Management Commands (run on VPS):"
    echo "   • View logs: pm2 logs"
    echo "   • Restart services: pm2 restart all"
    echo "   • Check status: pm2 status"
    echo ""
    echo "🔗 SSH Access:"
    echo "   ssh $VPS_USER@$VPS_IP"
    echo ""
    
    print_warning "Important: Make sure your DNS records are configured:"
    echo "   • A records for oplex.online and agrovia.store → $VPS_IP"
    echo "   • MX records for both domains → $VPS_IP"
    echo ""
    
    print_status "🎯 Deployment completed successfully!"
}

# Pre-deployment checks
precheck() {
    print_step "Pre-deployment checks..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "vps-setup.sh" ]; then
        print_error "❌ Please run this script from the turbo-mails project directory"
        exit 1
    fi
    
    # Check if SSH is available
    if ! command -v ssh >/dev/null 2>&1; then
        print_error "❌ SSH is not available. Please install OpenSSH."
        exit 1
    fi
    
    print_status "✅ Pre-deployment checks passed"
}

# Help function
show_help() {
    echo "🚀 TurboMails VPS Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --verify   Only verify VPS connection"
    echo "  -u, --upload   Only upload files (no setup)"
    echo ""
    echo "Examples:"
    echo "  $0              # Full deployment"
    echo "  $0 --verify     # Test VPS connection"
    echo "  $0 --upload     # Upload files only"
    echo ""
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -v|--verify)
        print_step "Testing VPS connection..."
        if ssh -o ConnectTimeout=10 -o BatchMode=yes $VPS_USER@$VPS_IP exit 2>/dev/null; then
            print_status "✅ VPS connection successful"
        else
            print_error "❌ Cannot connect to VPS"
            exit 1
        fi
        exit 0
        ;;
    -u|--upload)
        precheck
        print_step "Uploading files only..."
        ssh $VPS_USER@$VPS_IP "mkdir -p $PROJECT_DIR"
        if command -v rsync >/dev/null 2>&1; then
            rsync -avz --progress --exclude 'node_modules' --exclude '.next' --exclude '.git' \
                  $LOCAL_DIR/ $VPS_USER@$VPS_IP:$PROJECT_DIR/
        else
            scp -r $LOCAL_DIR/* $VPS_USER@$VPS_IP:$PROJECT_DIR/
        fi
        print_status "✅ Files uploaded successfully"
        exit 0
        ;;
    "")
        # Full deployment
        precheck
        deploy_to_vps
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac