#!/bin/bash
# Sync ~/.claude/skills/ into this repo so custom skills get backed up to GitHub.
# Run this at the end of every session before "back it up".
# Source of truth stays at ~/.claude/skills/ — this folder is just a mirror for git.

set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="$HOME/.claude/skills/"
DEST="$REPO_DIR/claude-skills-backup/"

mkdir -p "$DEST"

rsync -a --delete \
  --exclude='.DS_Store' \
  --exclude='*.tmp' \
  "$SOURCE" "$DEST"

echo "Synced $(ls "$DEST" | wc -l | tr -d ' ') skill folder(s) from ~/.claude/skills/ to claude-skills-backup/"
echo "Now run: git add claude-skills-backup/ && git commit && git push"
