# Week 4: Production Deployment & 24/7 Keep-Alive

## 🎯 Objectives
- Deploy microservices and gateway to Render cloud containers.
- Deploy frontend to Vercel with SPA routing (`vercel.json`).
- Configure 24/7 keep-alive cron jobs to eliminate Render cold start delays.

---

## 🛠️ Key Implementation Details

1. **Vercel Frontend Deployment**:
   - Configured `frontend/vercel.json` rewrites for SPA client routing.
   - Set dynamic `VITE_API_BASE_URL` environment variable pointing to the Render API Gateway.
2. **Render Linux Build Fixes**:
   - Switched build commands from `npx prisma generate` to direct `node ./node_modules/prisma/build/index.js generate` to eliminate Linux binary permission errors.
3. **Automated Pingers**:
   - Set up `cron-job.org` jobs pinging `/health` across all 3 services every 10 minutes.
