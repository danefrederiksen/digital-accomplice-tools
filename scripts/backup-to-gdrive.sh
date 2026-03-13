#!/bin/bash
# Daily backup: Digital Accomplice → Google Drive
# Runs via macOS launchd every day at 11:00 PM

SOURCE="/Users/danefrederiksen/Desktop/Digital Accomplice/"
DEST="/Users/danefrederiksen/Library/CloudStorage/GoogleDrive-dane@digitalaccomplice.com/My Drive/Digital Accomplice Backup/"
LOG="/Users/danefrederiksen/Desktop/Claude code/data/backup-log.txt"

# Create destination if it doesn't exist
mkdir -p "$DEST"

# Timestamp
echo "=== Backup started: $(date '+%Y-%m-%d %I:%M %p') ===" >> "$LOG"

# rsync: mirror source to dest, delete files removed from source, skip .DS_Store
rsync -av --delete --exclude='.DS_Store' "$SOURCE" "$DEST" >> "$LOG" 2>&1

if [ $? -eq 0 ]; then
    echo "Backup completed successfully." >> "$LOG"
else
    echo "ERROR: Backup failed with exit code $?" >> "$LOG"
fi

echo "" >> "$LOG"
