type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private isDevelopment: boolean = process.env.NODE_ENV === 'development';
  private categories: Set<string> = new Set();

  private constructor() {
    // Initialize with default categories
    this.categories = new Set(['recipe', 'inventory', 'image', 'cache', 'api', 'performance']);
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, category: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;
    return data ? `${prefix} ${message} ${JSON.stringify(data)}` : `${prefix} ${message}`;
  }

  private addLog(level: LogLevel, category: string, message: string, data?: any) {
    if (!this.categories.has(category)) {
      this.categories.add(category);
    }

    const logEntry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
    };

    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage(level, category, message, data);
      switch (level) {
        case 'debug':
          console.debug(formattedMessage);
          break;
        case 'info':
          console.info(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'error':
          console.error(formattedMessage);
          break;
      }
    }
  }

  debug(category: string, message: string, data?: any) {
    this.addLog('debug', category, message, data);
  }

  info(category: string, message: string, data?: any) {
    this.addLog('info', category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.addLog('warn', category, message, data);
  }

  error(category: string, message: string, data?: any) {
    this.addLog('error', category, message, data);
  }

  getLogs(category?: string, level?: LogLevel): LogEntry[] {
    return this.logs.filter(
      log => (!category || log.category === category) && (!level || log.level === level)
    );
  }

  clearLogs() {
    this.logs = [];
  }

  getCategories(): string[] {
    return Array.from(this.categories);
  }

  setMaxLogs(max: number) {
    this.maxLogs = max;
    while (this.logs.length > max) {
      this.logs.shift();
    }
  }
}

export const logger = Logger.getInstance();
