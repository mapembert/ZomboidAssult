/**
 * Script to read game logs from browser localStorage
 * Run with: node scripts/read-logs.js
 *
 * This script helps debug issues by showing console logs
 * from the browser in a readable format.
 */

const fs = require('fs');
const path = require('path');

console.log('==========================================');
console.log('Game Debug Log Reader');
console.log('==========================================\n');

console.log('To view logs:');
console.log('1. Open browser DevTools (F12)');
console.log('2. Go to Console tab');
console.log('3. Run: Logger.getInstance().downloadLogs()');
console.log('4. Open the downloaded file\n');

console.log('OR use the browser console directly:');
console.log('- View all logs: Logger.getInstance().getLogs()');
console.log('- Filter logs: Logger.getInstance().filterLogs("weapon_upgrade")');
console.log('- Clear logs: Logger.getInstance().clear()');
console.log('\n==========================================\n');

// Check if log file exists (if downloaded)
const logPath = path.join(__dirname, '..', 'game_logs.txt');
if (fs.existsSync(logPath)) {
  console.log('Found log file at:', logPath);
  const logs = fs.readFileSync(logPath, 'utf-8');
  console.log('\n--- LOGS ---\n');
  console.log(logs);
  console.log('\n--- END OF LOGS ---\n');
} else {
  console.log('No log file found. Download logs from browser first.');
}
