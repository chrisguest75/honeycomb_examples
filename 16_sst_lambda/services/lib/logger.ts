import pino from 'pino'

export const Logger = pino({
  level: process.env.LOG_LEVEL || 'info',
})
