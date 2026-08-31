import * as fs from 'fs'
import * as path from 'path'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  context: string
  message: string
  meta?: Record<string, any>
}

const LOGS_DIR = path.join(process.cwd(), 'logs')

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function getMonthDir(): string {
  const d = new Date()
  return path.join(LOGS_DIR, `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
}

function formatEntry(entry: LogEntry): string {
  return `[${entry.timestamp}] [${entry.level.toUpperCase().padEnd(5)}] [${entry.context}] ${entry.message}${entry.meta ? ' ' + JSON.stringify(entry.meta) : ''}`
}

function rotateLogFile(filePath: string) {
  if (!fs.existsSync(filePath)) return
  const stat = fs.statSync(filePath)
  if (stat.size > 10 * 1024 * 1024) {
    const backup = `${filePath}.${Date.now()}`
    fs.renameSync(filePath, backup)
  }
}

export class Logger {
  private context: string
  private logFilePath: string
  private errorFilePath: string
  private auditFilePath: string

  constructor(context: string) {
    this.context = context
    ensureDir(LOGS_DIR)
    ensureDir(getMonthDir())
    this.logFilePath = path.join(getMonthDir(), `${getToday()}.log`)
    this.errorFilePath = path.join(getMonthDir(), `${getToday()}-errors.log`)
    this.auditFilePath = path.join(getMonthDir(), `${getToday()}-audit.log`)
  }

  private write(filePath: string, entry: LogEntry) {
    rotateLogFile(filePath)
    const line = formatEntry(entry) + '\n'
    fs.appendFileSync(filePath, line, 'utf8')
  }

  log(message: string, meta?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      context: this.context,
      message,
      meta,
    }
    this.write(this.logFilePath, entry)
    console.log(`\x1b[32m[${this.context}]\x1b[0m ${message}`)
  }

  warn(message: string, meta?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      context: this.context,
      message,
      meta,
    }
    this.write(this.logFilePath, entry)
    this.write(this.errorFilePath, entry)
    console.warn(`\x1b[33m[${this.context}] WARN:\x1b[0m ${message}`)
  }

  error(message: string, meta?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      context: this.context,
      message,
      meta,
    }
    this.write(this.logFilePath, entry)
    this.write(this.errorFilePath, entry)
    console.error(`\x1b[31m[${this.context}] ERROR:\x1b[0m ${message}`)
  }

  debug(message: string, meta?: Record<string, any>) {
    if (process.env.NODE_ENV === 'production') return
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      context: this.context,
      message,
      meta,
    }
    this.write(this.logFilePath, entry)
  }

  audit(action: string, userId?: string, meta?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      context: 'AUDIT',
      message: action,
      meta: { userId: userId || 'anonymous', ...meta },
    }
    this.write(this.auditFilePath, entry)
    this.write(this.logFilePath, entry)
  }
}
