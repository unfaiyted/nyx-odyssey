#!/bin/bash
set -e

echo "🚀 Deploying Odyssey..."

cd /root/clawd/odyssey

echo "📦 Pulling latest changes..."
git pull

echo "📦 Installing dependencies..."
bun install

echo "🔨 Building..."
bun run build

echo "🗃️ Running database migrations..."
bun run db:migrate

echo "🔄 Restarting service..."
sudo systemctl restart odyssey

echo "✅ Deployed successfully!"
