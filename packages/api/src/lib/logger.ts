import pino from 'pino'
import { env } from '@my-better-t-app/env/server'

const isDev = env.NODE_ENV !== 'production'

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  transport: isDev ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname,ip,userAgent',
      singleLine: true
    }
  } : undefined
})
