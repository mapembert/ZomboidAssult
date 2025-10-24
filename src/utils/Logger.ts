/**
 * Logger utility for writing console logs to a file
 * Sends logs to a Node.js server that writes to logs/game.log
 * Controlled by debug.enableLogging setting in game-settings.json
 */

class Logger {
  private static instance: Logger;
  private logs: string[] = [];
  private maxLogs: number = 1000;
  private logServerUrl: string = 'http://localhost:3100/api/logs';
  private batchQueue: Array<{ level: string; message: string; timestamp: string }> = [];
  private batchInterval: number = 1000; // Send batch every 1 second
  private isEnabled: boolean = false;
  private originalConsole: {
    log: typeof console.log;
    error: typeof console.error;
    warn: typeof console.warn;
  } | null = null;

  private constructor() {
    // Don't start immediately - wait for config to load
  }

  /**
   * Enable logging (called after config is loaded)
   */
  enable(): void {
    if (this.isEnabled) return;
    this.isEnabled = true;
    this.interceptConsole();
    this.startBatchTimer();
    console.log('[Logger] Logging enabled - sending to server');
  }

  /**
   * Disable logging
   */
  disable(): void {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    this.restoreConsole();
    console.log('[Logger] Logging disabled');
  }

  /**
   * Check if logging is enabled
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Intercept console.log, console.error, console.warn
   */
  private interceptConsole(): void {
    if (this.originalConsole) return; // Already intercepted

    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn
    };

    console.log = (...args: any[]) => {
      this.addLog('LOG', args);
      this.originalConsole!.log.apply(console, args);
    };

    console.error = (...args: any[]) => {
      this.addLog('ERROR', args);
      this.originalConsole!.error.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      this.addLog('WARN', args);
      this.originalConsole!.warn.apply(console, args);
    };
  }

  /**
   * Restore original console methods
   */
  private restoreConsole(): void {
    if (!this.originalConsole) return;

    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    this.originalConsole = null;
  }

  /**
   * Start batch timer to send logs periodically
   */
  private startBatchTimer(): void {
    setInterval(() => {
      this.sendBatch();
    }, this.batchInterval);
  }

  /**
   * Send batched logs to server
   */
  private async sendBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const logsToSend = [...this.batchQueue];
    this.batchQueue = [];

    try {
      await fetch(`${this.logServerUrl}/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: logsToSend })
      });
    } catch (error) {
      // Silently fail - don't want logging errors to break the game
      console.error('Failed to send logs to server:', error);
    }
  }

  /**
   * Add a log entry
   */
  private addLog(level: string, args: any[]): void {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    const logEntry = `[${timestamp}] [${level}] ${message}`;
    this.logs.push(logEntry);

    // Queue for batch sending to server
    this.batchQueue.push({ level, message, timestamp });

    // Keep only the last N logs in memory
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Clear all logs (both memory and server file)
   */
  async clear(): Promise<void> {
    this.logs = [];
    this.batchQueue = [];

    try {
      await fetch(`${this.logServerUrl}/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Logger: Logs cleared');
    } catch (error) {
      console.error('Failed to clear logs on server:', error);
    }
  }

  /**
   * Get all logs as a string
   */
  getLogs(): string {
    return this.logs.join('\n');
  }

  /**
   * Download logs as a file
   */
  downloadLogs(filename: string = 'game_logs.txt'): void {
    const content = this.getLogs();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Get logs as an array
   */
  getLogsArray(): string[] {
    return [...this.logs];
  }

  /**
   * Filter logs by keyword
   */
  filterLogs(keyword: string): string[] {
    return this.logs.filter(log => log.toLowerCase().includes(keyword.toLowerCase()));
  }
}

export default Logger;
