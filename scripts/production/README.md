# Production Scripts

These scripts are used for deploying and managing Melodia in production environments.

## 📁 Files

- **`deploy-to-production.sh`** - Production deployment automation
- **`migrate-local-to-production.sh`** - Local to production data migration

## 🚀 Usage

### Deploy to Production
```bash
chmod +x scripts/production/deploy-to-production.sh
./scripts/production/deploy-to-production.sh
```

### Migrate Data to Production
```bash
chmod +x scripts/production/migrate-local-to-production.sh
./scripts/production/migrate-local-to-production.sh
```

## ⚠️ Important

- These scripts require production environment variables
- Always backup production data before running migrations
- Test in staging environment first
