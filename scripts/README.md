# Melodia Scripts Directory

This directory contains all the scripts needed for setting up, developing, testing, and deploying the Melodia application.

## 🚀 Quick Start

For new users, start here:

```bash
# Essential setup (required)
chmod +x scripts/essential/setup-complete.sh
./scripts/essential/setup-complete.sh
```

## 📁 Directory Structure

### 🎯 [Essential Scripts](essential/) - **Start Here**
Required for basic setup and operation
- `setup-complete.sh` - One-command setup from scratch
- `setup-complete-database.sql` - Complete database schema
- `SETUP_README.md` - Detailed setup documentation

### 🚀 [Production Scripts](production/)
For deployment and production management
- `deploy-to-production.sh` - Production deployment automation
- `migrate-local-to-production.sh` - Local to production migration

### 🧪 [Testing Scripts](testing/)
For development and testing
- `test-phase5.js` - Comprehensive testing suite
- `test-lyrics-api.mjs` - Lyrics API testing
- `test-slug-generation.mjs` - Slug generation testing

### 🔧 [Utility Scripts](utilities/)
For specific content and data management tasks
- `optimize-og-image.mjs` - Open Graph image optimization
- `set-song-sequence.mjs` - Song sequence management
- `convert-aligned-words.mjs` - Lyrics alignment conversion

### 🔧 [Maintenance Scripts](maintenance/)
For ongoing maintenance and monitoring
- `check-song-requests.mjs` - Song request monitoring
- `run-timestamped-lyrics-cleanup.sh` - Lyrics cleanup utility

## 📖 Documentation

Each subdirectory contains its own README with detailed usage instructions.

## 🎯 For New Users

1. **Start with Essential Scripts** - Run the setup script first
2. **Explore Testing Scripts** - Run tests to verify everything works
3. **Use Utilities as Needed** - For specific content management tasks
4. **Check Maintenance Scripts** - For ongoing monitoring and cleanup

## 🔄 For Developers

- Edit scripts in their respective categories
- Update category READMEs when adding new scripts
- Keep the main `SCRIPTS_SUMMARY.md` updated
- Test scripts before committing changes

## 📊 Summary

- **Total Scripts**: 13 files
- **Categories**: 5 organized directories
- **Essential**: 3 files (required for setup)
- **Optional**: 10 files (for specific use cases)

This organization makes it easy to find the right script for any task! 🎉
