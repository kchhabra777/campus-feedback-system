#!/bin/bash
set -e

echo "?? Starting Campus Feedback System AWS Deployment..."

export DATABASE_URL="postgresql://neondb_owner:npg_5cqpzoHbZ7IM@ep-quiet-pond-aycfuiga-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# 1. Write auth-service .env FIRST so Prisma has DATABASE_URL
echo "?? Configuring auth-service .env..."
cat << 'EOF' > auth-service/.env
DATABASE_URL="postgresql://neondb_owner:npg_5cqpzoHbZ7IM@ep-quiet-pond-aycfuiga-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
PORT=5001
NODE_ENV=production
JWT_SECRET="thapar_campus_feedback_jwt_secret_key_2026"
EOF

# 2. Write feedback-microservice .env FIRST
echo "?? Configuring feedback-microservice .env..."
cat << 'EOF' > feedback-microservice/.env
DATABASE_URL="postgresql://neondb_owner:npg_5cqpzoHbZ7IM@ep-quiet-pond-aycfuiga-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
PORT=5000
NODE_ENV=production
EOF

# 3. Write gateway .env
echo "?? Configuring gateway .env..."
cat << 'EOF' > gateway/.env
PORT=8000
NODE_ENV=production
AUTH_SERVICE_URL=http://localhost:5001
FEEDBACK_SERVICE_URL=http://localhost:5000
EOF

# 4. Now install all dependencies and generate Prisma clients
echo "?? Installing packages across microservices..."
npm run install:all

# 5. Start/Restart services with PM2
echo "?? Starting services with PM2..."
cd auth-service && pm2 delete campus-auth 2>/dev/null || true && pm2 start npm --name "campus-auth" -- start && cd ..
cd feedback-microservice && pm2 delete campus-feedback 2>/dev/null || true && pm2 start npm --name "campus-feedback" -- start && cd ..
cd gateway && pm2 delete campus-gateway 2>/dev/null || true && pm2 start npm --name "campus-gateway" -- start && cd ..

pm2 save

echo ""
echo "========================================================="
echo "? All 3 Campus Feedback microservices are running on AWS!"
echo "========================================================="
pm2 status