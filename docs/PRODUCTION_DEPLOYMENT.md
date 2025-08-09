# Production Deployment Guide for Melodia Website

## Overview

This guide provides a step-by-step approach to deploy the Melodia website to production while ensuring zero downtime and no breaking changes to the existing system.

## Phase 1: Pre-Deployment Preparation

### 1.1 Environment Setup

#### Production Environment Variables
Create a `.env.production` file with the following variables:

```bash
# Database (Production PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# Supabase (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key

# Suno API
SUNO_API_TOKEN=your_production_suno_api_token

# Base URL for webhooks
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com

# Node Environment
NODE_ENV=production
```

#### Database Backup
```bash
# Create a backup of the current production database
pg_dump -h your-db-host -U your-username -d your-database > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 1.2 Code Preparation

#### 1.2.1 Create Production Branch
```bash
# Create a production branch from main
git checkout -b production-deployment
git push origin production-deployment
```

#### 1.2.2 Update Dependencies
```bash
# Update all dependencies to latest stable versions
npm update
npm audit fix
```

#### 1.2.3 Build Test
```bash
# Test the production build locally
npm run build
npm run start
```

### 1.3 Database Migration Preparation

#### 1.3.1 Create Migration Scripts
Create a comprehensive migration script that handles all schema changes:

```sql
-- production-migration.sql
-- This script should be run in order

-- 1. Add new columns for timestamped lyrics (if not exists)
ALTER TABLE songs ADD COLUMN IF NOT EXISTS timestamped_lyrics_variants JSONB DEFAULT '{}'::jsonb;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS timestamped_lyrics_api_responses JSONB DEFAULT '{}'::jsonb;

-- 2. Add comments for documentation
COMMENT ON COLUMN songs.timestamped_lyrics_variants IS 'Stores synchronized lyrics for both variants as JSON object with variant index as key';
COMMENT ON COLUMN songs.timestamped_lyrics_api_responses IS 'Stores raw Suno API responses for timestamped lyrics as JSON object with variant index as key';

-- 3. Update existing records to have default values
UPDATE songs SET timestamped_lyrics_variants = '{}'::jsonb WHERE timestamped_lyrics_variants IS NULL;
UPDATE songs SET timestamped_lyrics_api_responses = '{}'::jsonb WHERE timestamped_lyrics_api_responses IS NULL;

-- 4. Make columns NOT NULL (only after ensuring all records have values)
ALTER TABLE songs ALTER COLUMN timestamped_lyrics_variants SET NOT NULL;
ALTER TABLE songs ALTER COLUMN timestamped_lyrics_api_responses SET NOT NULL;
```

## Phase 2: Staging Deployment

### 2.1 Staging Environment Setup

#### 2.1.1 Deploy to Staging
```bash
# Deploy to staging environment first
# This should be a mirror of production
git checkout production-deployment
git push origin staging
```

#### 2.1.2 Test Staging Deployment
- [ ] Verify all existing functionality works
- [ ] Test new synchronized lyrics feature
- [ ] Test song generation flow
- [ ] Test admin portal
- [ ] Test MediaPlayer with existing songs
- [ ] Test MediaPlayer with new synchronized lyrics

### 2.2 Database Migration Testing

#### 2.2.1 Test Migration Script
```bash
# Run migration on staging database
psql -h staging-db-host -U staging-username -d staging-database -f production-migration.sql
```

#### 2.2.2 Verify Data Integrity
```sql
-- Check that all existing songs still work
SELECT COUNT(*) FROM songs WHERE is_deleted = false;
SELECT COUNT(*) FROM songs WHERE timestamped_lyrics_variants IS NOT NULL;
SELECT COUNT(*) FROM songs WHERE timestamped_lyrics_api_responses IS NOT NULL;
```

## Phase 3: Production Deployment

### 3.1 Database Migration

#### 3.1.1 Pre-Migration Checklist
- [ ] Database backup completed
- [ ] Staging testing successful
- [ ] Rollback plan prepared
- [ ] Maintenance window scheduled

#### 3.1.2 Execute Migration
```bash
# Run the migration script
psql -h production-db-host -U production-username -d production-database -f production-migration.sql
```

#### 3.1.3 Verify Migration
```sql
-- Verify migration was successful
SELECT COUNT(*) FROM songs;
SELECT COUNT(*) FROM songs WHERE timestamped_lyrics_variants IS NOT NULL;
SELECT COUNT(*) FROM songs WHERE timestamped_lyrics_api_responses IS NOT NULL;
```

### 3.2 Application Deployment

#### 3.2.1 Deploy Application
```bash
# Deploy the application
git checkout production-deployment
git push origin main

# Or if using a deployment platform like Vercel/Netlify
# The deployment should be automatic after push
```

#### 3.2.2 Health Checks
- [ ] Verify application starts successfully
- [ ] Check all API endpoints respond
- [ ] Verify database connections
- [ ] Test admin portal access
- [ ] Test song playback functionality

### 3.3 Post-Deployment Verification

#### 3.3.1 Functional Testing
- [ ] Test existing song playback (should work unchanged)
- [ ] Test new song generation flow
- [ ] Test synchronized lyrics generation
- [ ] Test admin portal functionality
- [ ] Test MediaPlayer with both old and new songs

#### 3.3.2 Performance Testing
- [ ] Check page load times
- [ ] Verify API response times
- [ ] Test concurrent user access
- [ ] Monitor database performance

## Phase 4: Monitoring and Rollback

### 4.1 Monitoring Setup

#### 4.1.1 Application Monitoring
- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor API response times
- Track user interactions

#### 4.1.2 Database Monitoring
- Monitor database performance
- Track slow queries
- Monitor disk space usage

### 4.2 Rollback Plan

#### 4.2.1 Application Rollback
```bash
# If application needs to be rolled back
git checkout previous-stable-commit
git push origin main --force
```

#### 4.2.2 Database Rollback
```bash
# If database migration needs to be rolled back
psql -h production-db-host -U production-username -d production-database -f rollback-migration.sql
```

## Phase 5: Post-Deployment

### 5.1 Documentation Update

#### 5.1.1 Update Documentation
- Update deployment guides
- Document new features
- Update API documentation

#### 5.1.2 Team Training
- Train team on new features
- Update admin portal usage guide
- Document troubleshooting procedures

### 5.2 Performance Optimization

#### 5.2.1 Monitor and Optimize
- Monitor application performance
- Optimize database queries if needed
- Implement caching strategies

## Emergency Procedures

### Database Issues
1. Check database connectivity
2. Verify migration status
3. Rollback if necessary
4. Contact database administrator

### Application Issues
1. Check application logs
2. Verify environment variables
3. Rollback to previous version
4. Contact development team

### Performance Issues
1. Monitor resource usage
2. Check for memory leaks
3. Optimize database queries
4. Scale resources if needed

## Success Criteria

- [ ] All existing functionality works unchanged
- [ ] New synchronized lyrics feature works correctly
- [ ] Database migration completed successfully
- [ ] Performance metrics are within acceptable ranges
- [ ] No user-facing errors reported
- [ ] Admin portal functions correctly
- [ ] MediaPlayer works with both old and new songs

## Contact Information

- **Development Team**: [Contact Info]
- **Database Administrator**: [Contact Info]
- **DevOps Team**: [Contact Info]
- **Emergency Contact**: [Contact Info]