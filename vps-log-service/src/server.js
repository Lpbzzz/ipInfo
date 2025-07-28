const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const { body, validationResult } = require('express-validator')
const fs = require('fs-extra')
const path = require('node:path')
const moment = require('moment')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001
const LOG_API_KEY = process.env.LOG_API_KEY || 'default-secret-key'
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '../logs')

// 确保日志目录存在
async function ensureLogDirectories() {
  const dirs = ['access', 'error', 'system', 'api']
  for (const dir of dirs) {
    await fs.ensureDir(path.join(LOG_DIR, dir))
  }
}

// 中间件配置
app.use(helmet())
app.use(compression())
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
    credentials: true,
  })
)

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 限制每个IP 15分钟内最多1000个请求
  message: { error: '请求过于频繁，请稍后再试' },
})
app.use(limiter)

// 日志中间件
app.use(
  morgan('combined', {
    stream: {
      write: (message) => {
        const logFile = path.join(LOG_DIR, 'access', `${moment().format('YYYY-MM-DD')}.log`)
        fs.appendFileSync(logFile, message)
      },
    },
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// API Key 验证中间件
function authenticateApiKey(req, res, next) {
  const apiKey = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-api-key']

  if (!apiKey || apiKey !== LOG_API_KEY) {
    return res.status(401).json({ error: '未授权访问' })
  }

  next()
}

// 写入日志文件的函数
async function writeLogToFile(logEntry) {
  try {
    const date = moment().format('YYYY-MM-DD')
    const logType = logEntry.level === 'error' ? 'error' : 'api'
    const logFile = path.join(LOG_DIR, logType, `${date}.log`)

    const logLine = `${JSON.stringify({
      ...logEntry,
      serverTimestamp: new Date().toISOString(),
    })}\n`

    await fs.appendFile(logFile, logLine)

    // 系统日志
    const systemLogFile = path.join(LOG_DIR, 'system', `${date}.log`)
    const systemLogLine = `[${new Date().toISOString()}] Log written: ${logEntry.level} - ${logEntry.message}\n`
    await fs.appendFile(systemLogFile, systemLogLine)
  } catch (error) {
    console.error('写入日志文件失败:', error)
  }
}

// 健康检查接口
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'log-service',
    version: '1.0.0',
    uptime: process.uptime(),
  })
})

// 接收日志的接口
app.post(
  '/api/logs',
  authenticateApiKey,
  [
    body('timestamp').isISO8601().withMessage('时间戳格式无效'),
    body('level').isIn(['error', 'warn', 'info', 'debug']).withMessage('日志级别无效'),
    body('message').isString().isLength({ min: 1, max: 1000 }).withMessage('消息内容无效'),
    body('requestId').optional().isString(),
    body('metadata').optional().isObject(),
  ],
  async (req, res) => {
    try {
      // 验证请求数据
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: '请求数据验证失败',
          details: errors.array(),
        })
      }

      const logEntry = req.body

      // 添加服务器端信息
      logEntry.serverIp = req.ip
      logEntry.userAgent = req.get('User-Agent')
      logEntry.receivedAt = new Date().toISOString()

      // 写入日志文件
      await writeLogToFile(logEntry)

      res.status(200).json({
        success: true,
        message: '日志已记录',
        logId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })
    } catch (error) {
      console.error('处理日志请求失败:', error)
      res.status(500).json({
        error: '服务器内部错误',
        message: error.message,
      })
    }
  }
)

// 查询日志接口
app.get('/api/logs', authenticateApiKey, async (req, res) => {
  try {
    const {
      date = moment().format('YYYY-MM-DD'),
      level = 'all',
      limit = 100,
      offset = 0,
    } = req.query

    const logType = level === 'error' ? 'error' : 'api'
    const logFile = path.join(LOG_DIR, logType, `${date}.log`)

    if (!(await fs.pathExists(logFile))) {
      return res.json({ logs: [], total: 0, date })
    }

    const content = await fs.readFile(logFile, 'utf8')
    const lines = content
      .trim()
      .split('\n')
      .filter((line) => line)

    let logs = lines
      .map((line) => {
        try {
          return JSON.parse(line)
        } catch {
          return null
        }
      })
      .filter((log) => log !== null)

    // 按级别过滤
    if (level !== 'all') {
      logs = logs.filter((log) => log.level === level)
    }

    // 分页
    const total = logs.length
    const paginatedLogs = logs
      .reverse() // 最新的在前
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))

    res.json({
      logs: paginatedLogs,
      total,
      date,
      level,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total,
      },
    })
  } catch (error) {
    console.error('查询日志失败:', error)
    res.status(500).json({
      error: '查询日志失败',
      message: error.message,
    })
  }
})

// 获取日志统计信息
app.get('/api/logs/stats', authenticateApiKey, async (req, res) => {
  try {
    const { date = moment().format('YYYY-MM-DD') } = req.query

    const stats = {
      date,
      total: 0,
      byLevel: { error: 0, warn: 0, info: 0, debug: 0 },
      byHour: {},
    }

    // 读取API日志
    const apiLogFile = path.join(LOG_DIR, 'api', `${date}.log`)
    if (await fs.pathExists(apiLogFile)) {
      const content = await fs.readFile(apiLogFile, 'utf8')
      const lines = content
        .trim()
        .split('\n')
        .filter((line) => line)

      lines.forEach((line) => {
        try {
          const log = JSON.parse(line)
          stats.total++
          stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1

          const hour = moment(log.timestamp).format('HH')
          stats.byHour[hour] = (stats.byHour[hour] || 0) + 1
        } catch (_error) {
          // 忽略解析错误的行
        }
      })
    }

    // 读取错误日志
    const errorLogFile = path.join(LOG_DIR, 'error', `${date}.log`)
    if (await fs.pathExists(errorLogFile)) {
      const content = await fs.readFile(errorLogFile, 'utf8')
      const lines = content
        .trim()
        .split('\n')
        .filter((line) => line)

      lines.forEach((line) => {
        try {
          const log = JSON.parse(line)
          if (log.level === 'error') {
            stats.total++
            stats.byLevel.error++

            const hour = moment(log.timestamp).format('HH')
            stats.byHour[hour] = (stats.byHour[hour] || 0) + 1
          }
        } catch (_error) {
          // 忽略解析错误的行
        }
      })
    }

    res.json(stats)
  } catch (error) {
    console.error('获取统计信息失败:', error)
    res.status(500).json({
      error: '获取统计信息失败',
      message: error.message,
    })
  }
})

// 清理旧日志接口
app.delete('/api/logs/cleanup', authenticateApiKey, async (_req, res) => {
  try {
    const retentionDays = parseInt(process.env.LOG_RETENTION_DAYS) || 30
    const cutoffDate = moment().subtract(retentionDays, 'days')

    const logTypes = ['access', 'error', 'system', 'api']
    let deletedFiles = 0

    for (const logType of logTypes) {
      const logDir = path.join(LOG_DIR, logType)
      const files = await fs.readdir(logDir)

      for (const file of files) {
        if (file.endsWith('.log')) {
          const fileDate = moment(file.replace('.log', ''), 'YYYY-MM-DD')
          if (fileDate.isValid() && fileDate.isBefore(cutoffDate)) {
            await fs.remove(path.join(logDir, file))
            deletedFiles++
          }
        }
      }
    }

    res.json({
      success: true,
      message: `清理完成，删除了 ${deletedFiles} 个日志文件`,
      retentionDays,
      cutoffDate: cutoffDate.format('YYYY-MM-DD'),
    })
  } catch (error) {
    console.error('清理日志失败:', error)
    res.status(500).json({
      error: '清理日志失败',
      message: error.message,
    })
  }
})

// 错误处理中间件
app.use((error, req, res, _next) => {
  console.error('服务器错误:', error)

  // 记录错误日志
  const errorLog = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  }

  writeLogToFile(errorLog).catch(console.error)

  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? error.message : '请稍后再试',
  })
})

// 404 处理
app.use((_req, res) => {
  res.status(404).json({ error: '接口不存在' })
})

// 启动服务器
async function startServer() {
  try {
    await ensureLogDirectories()

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`日志服务已启动`)
      console.log(`端口: ${PORT}`)
      console.log(`日志目录: ${LOG_DIR}`)
      console.log(`API Key: ${LOG_API_KEY.substring(0, 8)}...`)
      console.log(`时间: ${new Date().toISOString()}`)
    })
  } catch (error) {
    console.error('启动服务器失败:', error)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...')
  process.exit(0)
})

startServer()
