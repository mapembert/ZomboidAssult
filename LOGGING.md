# Game Logging System

The game now includes a comprehensive logging system that captures all console output and stores it for debugging.

## Features

- **Auto-capture**: All `console.log`, `console.error`, and `console.warn` calls are automatically captured
- **Auto-clear**: Logs are cleared at the start of each chapter to keep them relevant
- **Browser storage**: Logs are saved to localStorage (survives page refreshes)
- **Easy access**: Exposed to browser console for quick debugging

## How to Use

### View Logs in Browser Console

1. Open the game in your browser
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Run one of these commands:

```javascript
// View all logs
Logger.getInstance().getLogs()

// Filter logs by keyword (e.g., find all weapon upgrade logs)
Logger.getInstance().filterLogs("weapon_upgrade")

// Filter for DEBUG messages
Logger.getInstance().filterLogs("DEBUG")

// Filter for timer events
Logger.getInstance().filterLogs("timer")

// Filter for hero count changes
Logger.getInstance().filterLogs("hero count")

// Clear logs manually
Logger.getInstance().clear()

// Download logs as a text file
Logger.getInstance().downloadLogs()
```

### Download Logs for Analysis

1. In browser console, run:
   ```javascript
   Logger.getInstance().downloadLogs()
   ```

2. This will download a `game_logs.txt` file to your Downloads folder

3. You can then share this file or analyze it in your text editor

### Automated Log Clearing

Logs are automatically cleared when:
- You start a new chapter
- You restart the game

This ensures logs remain relevant to the current game session.

## Debugging the Hero Reset Issue

To debug why the hero count isn't resetting, play the game and then run:

```javascript
// Get all DEBUG messages
Logger.getInstance().filterLogs("DEBUG")

// Get all weapon upgrade events
Logger.getInstance().filterLogs("weapon_upgrade")

// Get all timer completion events
Logger.getInstance().filterLogs("Timer completed")

// Get hero count changes
Logger.getInstance().filterLogs("Hero count reset")
```

## Log Format

Each log entry includes:
- Timestamp (ISO format)
- Log level (LOG, ERROR, WARN)
- Message content

Example:
```
[2025-10-24T13:00:00.123Z] [LOG] Timer completed instantly: weapon_upgrade_timer with value 0, resetHeroCount: true
[2025-10-24T13:00:00.125Z] [LOG] DEBUG: resetHeroCount=true, type=boolean, heroManager=true
[2025-10-24T13:00:00.127Z] [LOG] Hero count reset from 4 to 1 for weapon upgrade
```

## Storage Limits

- Maximum 1000 log entries stored
- Older logs are automatically removed when limit is reached
- Stored in browser localStorage (typically 5-10MB limit)

## Troubleshooting

**Logs not appearing:**
- Make sure you've refreshed the page after the logging system was added
- Check that localStorage is enabled in your browser

**Storage full error:**
- Clear logs: `Logger.getInstance().clear()`
- Download current logs before clearing if needed

**Can't find specific logs:**
- Use `filterLogs()` to search by keyword
- Remember logs are cleared at chapter start
- Play through the problematic section again to capture fresh logs

## For Developers

The logging system is implemented in `src/utils/Logger.ts` and:
- Uses the Singleton pattern
- Intercepts native console methods
- Stores logs in localStorage with key `'game_debug_logs'`
- Provides filtering and export capabilities

To extend the logger:
```typescript
import Logger from '@/utils/Logger';

const logger = Logger.getInstance();
// Logger will automatically capture all console.log calls
console.log('This will be captured');
```
