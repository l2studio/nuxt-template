import { Bootstrap, defineLifecycle } from '@/server/interface'
import KoaResponseTime from 'koa-response-time'
import KoaBodyParser from 'koa-bodyparser'
import KoaSession from 'koa-session'
import KoaStatic from 'koa-static'
import path from 'path'

const debug = require('debug')('lgou2w:nuxt:lifecycle:common')

process.env.SESSION_NAME = process.env.SESSION_NAME || 'NUXT_SESS'
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'yoursessionsecret'
process.env.SESSION_MAXAGE = process.env.SESSION_MAXAGE || '1209600000'

export default defineLifecycle({
  name: 'common',
  async onConfigure (bootstrap: Bootstrap) {
    debug('configure middlewares...')
    bootstrap.framework.keys = [process.env.SESSION_SECRET!]
    bootstrap.framework.use(KoaSession({
      key: process.env.SESSION_NAME,
      maxAge: parseInt(process.env.SESSION_MAXAGE!),
      store: !bootstrap.isDev ? new MemoryStore() : undefined,
      overwrite: true,
      httpOnly: true,
      signed: true
      // @ts-ignore
    }, bootstrap.framework))
    bootstrap.framework.use(KoaResponseTime())
    bootstrap.framework.use(KoaBodyParser({
      // TODO: body parser options in here...
    }))
    bootstrap.framework.use(KoaStatic(path.resolve(bootstrap.rootDir, 'public'), {
      // TODO: public static options in here...
    }))
  }
})

class MemoryStore implements KoaSession.stores {
  private readonly sessions: { [key: string]: any } = {}

  destroy (key: string): any {
    delete this.sessions[key]
  }

  get (
    key: string,
    maxAge: KoaSession.opts['maxAge'],
    data: { rolling: KoaSession.opts['rolling'] }
  ): any {
    return this.sessions[key]
  }

  set (
    key: string,
    sess: Partial<KoaSession.Session> & { _expire?: number; _maxAge?: number },
    maxAge: KoaSession.opts['maxAge'],
    data: { changed: boolean; rolling: KoaSession.opts['rolling'] }
  ): any {
    this.sessions[key] = sess
  }
}
