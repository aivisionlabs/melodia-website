# Maintenance Scripts

These scripts are used for ongoing maintenance and monitoring of the Melodia application.

## 📁 Files

- **`check-song-requests.mjs`** - Monitor song request status and health
- **`run-timestamped-lyrics-cleanup.sh`** - Clean up timestamped lyrics data

## 🔧 Usage

### Check Song Requests
```bash
node scripts/maintenance/check-song-requests.mjs
```

### Run Lyrics Cleanup
```bash
chmod +x scripts/maintenance/run-timestamped-lyrics-cleanup.sh
./scripts/maintenance/run-timestamped-lyrics-cleanup.sh
```

## 📊 Monitoring

The `check-song-requests.mjs` script is particularly useful for:
- Monitoring song generation status
- Checking for stuck requests
- Verifying API connectivity
- Database health checks

## ⚠️ Maintenance Notes

- Run cleanup scripts during low-traffic periods
- Monitor logs for any issues
- Consider setting up automated monitoring for production
