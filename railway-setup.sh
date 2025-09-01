#!/bin/bash

# Railway Setup Script for LINE Exercise Bot
echo "🚂 Setting up Railway deployment for LINE Exercise Bot..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging in to Railway..."
railway login

# Initialize Railway project
echo "🚀 Initializing Railway project..."
railway init

# Set environment variables
echo "⚙️ Setting up environment variables..."
echo "Please enter your environment variables:"

read -p "LINE_CHANNEL_ACCESS_TOKEN: " LINE_TOKEN
read -p "LINE_CHANNEL_SECRET: " LINE_SECRET
read -p "GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
read -p "GOOGLE_CLIENT_SECRET: " GOOGLE_CLIENT_SECRET
read -p "GOOGLE_REFRESH_TOKEN: " GOOGLE_REFRESH_TOKEN
read -p "SHEET_ID: " SHEET_ID

# Set variables in Railway
railway variables set LINE_CHANNEL_ACCESS_TOKEN="$LINE_TOKEN"
railway variables set LINE_CHANNEL_SECRET="$LINE_SECRET"
railway variables set GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
railway variables set GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
railway variables set GOOGLE_REFRESH_TOKEN="$GOOGLE_REFRESH_TOKEN"
railway variables set SHEET_ID="$SHEET_ID"
railway variables set NODE_ENV=production

echo "✅ Environment variables set successfully!"

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

# Get the deployment URL
echo "🌐 Getting deployment URL..."
DEPLOY_URL=$(railway domain)

echo "🎉 Deployment completed!"
echo "📱 Your LINE Bot webhook URL: https://$DEPLOY_URL/line/webhook"
echo "🔍 Health check URL: https://$DEPLOY_URL/line/health"
echo ""
echo "📋 Next steps:"
echo "1. Set webhook URL in LINE Developers Console: https://$DEPLOY_URL/line/webhook"
echo "2. Test your bot by sending 'ช่วยเหลือ' message"
echo "3. Monitor logs with: railway logs"
echo ""
echo "🔧 Useful commands:"
echo "- View logs: railway logs"
echo "- Check status: railway status"
echo "- View variables: railway variables"
echo "- Redeploy: railway redeploy"
