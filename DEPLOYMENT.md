# Deployment Guide

This guide provides quick steps to build and deploy the TODO Planner app.

## Quick Start (Local)

```bash
npm install
npm start
# Visit http://localhost:3000
```

---

## Docker Deployment (Recommended)

### Build Docker Image
```bash
npm run docker:build
```

### Run Container
```bash
npm run docker:run
```

### Using Docker Compose (Single Command)
```bash
npm run docker:compose
# Visit http://localhost:3000
# Stop with: npm run docker:stop
```

---

## Cloud Deployments

### Heroku
```bash
# Prerequisites: Heroku CLI installed
heroku login
heroku create your-app-name
git push heroku main
heroku logs --tail
```

### Railway (Recommended - Easiest)
1. Go to https://railway.app/
2. Click "New Project" → "Deploy from GitHub"
3. Select this repository
4. Set `PORT=3000` in variables
5. Deploy

### AWS EC2
```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone your-repo
cd your-repo
npm install
npm start
```

### Google Cloud Run
```bash
gcloud run deploy todo-app \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars PORT=3000
```

### DigitalOcean App Platform
1. Connect GitHub repository
2. Auto-detect Node.js
3. Set PORT to 3000
4. Deploy

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Test app locally: `npm start`
- [ ] Docker image builds: `npm run docker:build`
- [ ] Container runs: `npm run docker:run`
- [ ] Check health endpoint: `curl http://localhost:3000`
- [ ] tasks.json persists after restart
- [ ] All API endpoints working

---

## Monitoring & Maintenance

### View Logs
```bash
# Docker
docker logs todo-app

# Heroku
heroku logs --tail

# Direct
npm start
```

### Scale
- Docker: Increase replicas in docker-compose.yml
- Cloud: Use provider's auto-scaling features

### Backup Data
```bash
# Save tasks.json
cp tasks.json tasks.json.backup
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 3000 in use | `PORT=8080 npm start` |
| Docker not building | `docker --version` check, then `npm run docker:build` |
| App crashes on start | Check `npm install` completed |
| Data not persisting | Verify volume mount in docker-compose.yml |

---

## Next Steps

1. **Install Node.js** if not already: https://nodejs.org/
2. **Run locally**: `npm install && npm start`
3. **Choose deployment**: Docker (easiest) or cloud platform
4. **Deploy**: Follow steps above for your chosen method
