import { Bootstrap, Server, defineLifecycle } from '@/server/interface'
import crypto from 'crypto'
import Tokens from 'csrf'

const debug = require('debug')('lgou2w:nuxt:lifecycle:csrf')
const disabledQuery = process.env.CSRF_DISABLE_QUERY === 'true'
const isEnabled = process.env.CSRF_ENABLE === 'true' || process.env.CSRF_ENABLE === process.env.NODE_ENV

const CSRF_NAME = process.env.CSRF_NAME = process.env.CSRF_NAME || '_csrf'
const CSRF_SECRET = process.env.CSRF_SECRET = process.env.CSRF_SECRET || 'yourcsrfsecret'
const CSRF_MAXAGE = process.env.CSRF_MAXAGE = process.env.CSRF_MAXAGE || process.env.SESSION_MAXAGE || '1209600000'

const _csrfMaxAge = parseInt(CSRF_MAXAGE)
if (!_csrfMaxAge || isNaN(_csrfMaxAge)) throw new Error('Invalid csrf max age: ' + typeof CSRF_MAXAGE)

const tokens = new Tokens()
const ignoreMethods = typeof process.env.CSRF_IGNORE_METHODS !== 'undefined'
  ? process.env.CSRF_IGNORE_METHODS.split(',').map(it => it.toUpperCase()) // uppercase
  : ['GET', 'HEAD', 'OPTIONS']

export default defineLifecycle({
  name: 'csrf',
  async onConfigure (bootstrap: Bootstrap) {
    if (isEnabled) {
      debug('configure csrf...')
      bootstrap.framework.use((ctx, next) => {
        let secret = ctx.cookies.get(CSRF_NAME)
        let token: string
        Object.defineProperty(ctx.request, 'csrfToken', {
          enumerable: true,
          writable: false,
          configurable: false,
          value: function csrfToken (): string {
            let sec = ctx.cookies.get(CSRF_NAME)
            if (token && sec === secret) {
              return token
            }
            if (sec === undefined) {
              sec = tokens.secretSync()
              setSecret(ctx, sec)
            }
            secret = sec
            token = tokens.create(secret)
            return token
          }
        })
        if (!secret) {
          secret = tokens.secretSync()
          setSecret(ctx, secret)
        }
        const _csrf = ctx.request.body && typeof ctx.request.body._csrf === 'string'
          ? ctx.request.body._csrf as string
          : false
        const bodyToken = _csrf ||
          (!disabledQuery && ctx.query && ctx.query._csrf as string) ||
          ctx.get('csrf-token') ||
          ctx.get('xsrf-token') ||
          ctx.get('x-csrf-token') ||
          ctx.get('x-xsrf-token')
        if (!ignoreMethods.includes(ctx.method.toUpperCase()) && !tokens.verify(secret, bodyToken)) {
          ctx.throw(403, 'Invalid csrf token', {
            code: 'EBADCSRFTOKEN'
          })
        }
        return next()
      })
      debug('csrf active')
    }
  },
  async onInitializing (bootstrap: Bootstrap) {
  },
  async onReady (bootstrap: Bootstrap) {
  }
})

function setSecret (ctx: Server.MiddlewareContext, secret: string) {
  const val = secret + '.' + crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(secret)
    .digest('base64')
    .replace(/=+$/, '')
  // TODO: more environment variables
  ctx.cookies.set(CSRF_NAME, val, {
    path: '/',
    signed: false,
    secure: false,
    maxAge: _csrfMaxAge,
    httpOnly: true,
    sameSite: 'strict'
  })
}
