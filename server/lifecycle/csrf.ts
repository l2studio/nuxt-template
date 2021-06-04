import { Bootstrap, Server, defineLifecycle } from '@/server/interface'
import crypto from 'crypto'
import Tokens from 'csrf'

const debug = require('debug')('lgou2w:nuxt:lifecycle:csrf')
const disabledQuery = process.env.CSRF_DISABLE_QUERY === 'true'
const isEnabled = process.env.CSRF_ENABLE === 'true' || process.env.CSRF_ENABLE === process.env.NODE_ENV

const CSRF_SECRET = process.env.SESSION_SECRET || 'yoursesssionsecret'
const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME || '_csrf'
const CSRF_COOKIE_MAXAGE = process.env.CSRF_COOKIE_MAXAGE = process.env.CSRF_COOKIE_MAXAGE || process.env.SESSION_MAXAGE || '1209600000'

const _csrfCookieMaxAge = parseInt(CSRF_COOKIE_MAXAGE)
if (!_csrfCookieMaxAge || isNaN(_csrfCookieMaxAge)) throw new Error('Invalid csrf max age: ' + typeof CSRF_COOKIE_MAXAGE)

const tokens = new Tokens()
const ignoreMethods = getIgnoreMethods()

export default defineLifecycle({
  name: 'csrf',
  async onConfigure (bootstrap: Bootstrap) {
    if (isEnabled) {
      debug('configure csrf...')
      debug('- Cookie name:', CSRF_COOKIE_NAME)
      debug('- Cookie max age:', _csrfCookieMaxAge)
      debug('- Ignore methods:', Object.keys(ignoreMethods).join(', '))
      debug('- Disable query:', disabledQuery)
      bootstrap.framework.use((ctx, next) => {
        let secret = ctx.cookies.get(CSRF_COOKIE_NAME)
        let token: string
        Object.defineProperty(ctx.request, 'csrfToken', {
          enumerable: true,
          writable: false,
          configurable: false,
          value: function csrfToken (): string {
            let sec = ctx.cookies.get(CSRF_COOKIE_NAME)
            if (token && sec === secret) {
              return ctx.state.csrfToken
            }
            if (!sec) {
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
        if (!ignoreMethods[ctx.method] && !tokens.verify(secret, bodyToken)) {
          ctx.throw(403, 'Invalid csrf token', {
            code: 'EBADCSRFTOKEN'
          })
        }
        return next()
      })
      debug('csrf active')
    }
  }
})

function setSecret (ctx: Server.MiddlewareContext, secret: string) {
  const val = secret + '.' + crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(secret)
    .digest('base64')
    .replace(/=+$/, '')
  // TODO: more environment variables
  ctx.cookies.set(CSRF_COOKIE_NAME, val, {
    path: '/',
    signed: false,
    secure: false,
    maxAge: _csrfCookieMaxAge,
    httpOnly: true,
    sameSite: 'strict'
  })
}

function getIgnoreMethods (): Record<string, true> {
  const result = Object.create(null)
  const methods = typeof process.env.CSRF_IGNORE_METHODS !== 'undefined'
    ? process.env.CSRF_IGNORE_METHODS.split(',').map(it => it.toUpperCase()) // uppercase
    : ['GET', 'HEAD', 'OPTIONS']
  for (const method of methods) result[method.toUpperCase()] = true
  return result
}
