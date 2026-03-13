# Claude Code + GitHub Quick Reference

## Your Setup
- **Repo:** github.com/danefrederiksen/digital-accomplice-tools
- **Local folder:** ~/Desktop/digital-accomplice-tools
- **Logged in as:** dane@digitalaccomplice.com

## Start a Work Session
```
cd ~/Desktop/digital-accomplice-tools
claude
```

## Save Your Work (from Terminal)
```
git add .
git commit -m "describe what you did"
git push
```

## Key Git Terms
- **Repository (repo)** = a project folder that GitHub tracks
- **Commit** = saving a snapshot of your current files
- **Push** = uploading your snapshots to GitHub (cloud backup)
- **Pull** = downloading the latest version
- **Branch** = a copy where you can experiment without messing up the main version

## Useful Commands

| What | Command |
|------|---------|
| Exit Claude Code | `/exit` |
| Check Git status | `git status` |
| See commit history | `git log --oneline` |
| Undo last commit (keep files) | `git reset --soft HEAD~1` |
| Pull latest from GitHub | `git pull` |
| Change Claude Code theme | `/theme` |
| Change Claude Code model/effort | `/model` |

## If Something Breaks
- Git lets you roll back: `git log --oneline` to see history, `git checkout <commit-id>` to go back
- GitHub always has your last pushed version at github.com/danefrederiksen/digital-accomplice-tools

## Costs
- Claude Code uses your Anthropic API key (or Pro subscription with limited usage)
- GitHub is free for personal use
- Monitor usage at console.anthropic.com
