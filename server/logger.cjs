const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3100;

// Enable CORS for local development
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Logs directory
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'game.log');

// Clear log endpoint
app.post('/api/logs/clear', (req, res) => {
  try {
    fs.writeFileSync(logFile, '');
    console.log('Logs cleared');
    res.json({ success: true, message: 'Logs cleared' });
  } catch (error) {
    console.error('Error clearing logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Write log endpoint
app.post('/api/logs/write', (req, res) => {
  try {
    const { level, message, timestamp } = req.body;
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    fs.appendFileSync(logFile, logEntry);
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing log:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Batch write logs endpoint
app.post('/api/logs/batch', (req, res) => {
  try {
    const { logs } = req.body;
    const logEntries = logs.map(log => `[${log.timestamp}] [${log.level}] ${log.message}`).join('\n') + '\n';
    fs.appendFileSync(logFile, logEntries);
    res.json({ success: true, count: logs.length });
  } catch (error) {
    console.error('Error writing batch logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Read logs endpoint
app.get('/api/logs', (req, res) => {
  try {
    if (fs.existsSync(logFile)) {
      const logs = fs.readFileSync(logFile, 'utf-8');
      res.json({ success: true, logs });
    } else {
      res.json({ success: true, logs: '' });
    }
  } catch (error) {
    console.error('Error reading logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Logger server running on http://localhost:${PORT}`);
  console.log(`Logs directory: ${logsDir}`);
  console.log(`Log file: ${logFile}`);
});
