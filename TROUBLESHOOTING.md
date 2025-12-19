# Troubleshooting Guide

## Common Issues

### Application Fails to Start
**Symptoms**: The application window opens but remains blank, or closes immediately.
**Solutions**:
1. Check the logs at `~/.pflegedienst/logs/app.log` (Linux) or `%APPDATA%/pflegedienst/logs/app.log` (Windows).
2. Ensure you have write permissions to the data directory.
3. Try deleting the temporary files in the data directory (NOT the `.db` file).

### Database Locked / Busy
**Symptoms**: "Database is locked" error message.
**Solutions**:
1. Ensure no other instance of the application is running.
2. Check if a backup process is running in the background.
3. Restart the computer to clear any file locks.

### OCR Not Working
**Symptoms**: Uploaded documents are not being processed for text.
**Solutions**:
1. Check your internet connection (first run requires downloading language data).
2. Verify that the file is a supported image format (JPG, PNG, TIFF).
3. Ensure the image is clear and legible.

### Backup Failed
**Symptoms**: Error message during backup creation.
**Solutions**:
1. Check if the destination drive has enough space.
2. Verify write permissions for the destination folder.
3. Check the logs for specific error codes.

## Reporting Bugs
If you encounter an issue not listed here, please use the in-app **Feedback Button** (bottom right) to report it.
Include:
- Steps to reproduce the error.
- What you expected to happen vs. what happened.
- Any error messages displayed.
