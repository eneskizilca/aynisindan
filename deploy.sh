#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Configuration
EC2_IP="18.192.48.116"
SSH_KEY="/Users/eneskizilca/Downloads/aynisindan-key.pem"
ECR_REGISTRY="669403677178.dkr.ecr.eu-central-1.amazonaws.com"
APP_DIR="/home/ec2-user/app"

echo "--------------------------------------------------"
echo "🚀 Aynısından Otomatik Canlı Yayınlama Başlatıldı"
echo "--------------------------------------------------"

# 1. AWS ECR Login
echo "🔐 AWS ECR'a giriş yapılıyor..."
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin $ECR_REGISTRY

# 2. Build and Push Frontend
echo "⚛️ Frontend (Next.js) linux/amd64 için derleniyor..."
docker build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL="http://$EC2_IP:8080/api/v1" \
  --build-arg NEXT_PUBLIC_CATALOG_API_URL="http://$EC2_IP:8081/api/v1" \
  -t aynisindan-workspace-frontend:latest ./apps/web

echo "🏷️ Frontend imajı etiketleniyor ve ECR'a pushlanıyor..."
docker tag aynisindan-workspace-frontend:latest $ECR_REGISTRY/aynisindan-frontend:latest
docker push $ECR_REGISTRY/aynisindan-frontend:latest

# 3. Copy Docker Compose to EC2
echo "📁 Docker Compose konfigürasyonu sunucuya kopyalanıyor..."
scp -o StrictHostKeyChecking=no -i $SSH_KEY docker-compose.prod.yml ec2-user@$EC2_IP:$APP_DIR/docker-compose.yml

# 4. Copy Infrastructure Folder (Prometheus & Grafana configs)
echo "📊 İzleme (Prometheus/Grafana) klasörü kopyalanıyor..."
scp -o StrictHostKeyChecking=no -i $SSH_KEY -r infrastructure ec2-user@$EC2_IP:$APP_DIR/

# 5. Remote Deploy (Pull & Restart)
echo "🔄 Sunucuda konteynerlar güncelleniyor ve yeniden başlatılıyor..."
ssh -o StrictHostKeyChecking=no -i $SSH_KEY ec2-user@$EC2_IP << EOF
  cd $APP_DIR
  # ECR Girişi (Sunucu tarafı)
  aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin $ECR_REGISTRY
  # Yeni frontend imajını çek ve servisleri yeniden başlat
  docker compose pull frontend
  docker compose up -d
  # Gereksiz eski imajları silerek disk yerini koru
  docker image prune -f
EOF

echo "--------------------------------------------------"
echo "✅ Canlıya alma başarıyla tamamlandı!"
echo "🎯 Adres: http://$EC2_IP:3000"
echo "--------------------------------------------------"
