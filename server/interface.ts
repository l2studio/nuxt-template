import type { Server as HttpServer } from 'http'
import EventEmitter from 'events'
import Koa from 'koa'
import KoaSession from 'koa-session'
import KoaRouter, { RouterContext as KoaRouterContext } from '@koa/router'
import consola from 'consola'
import path from 'path'

const debug = require('debug')('lgou2w:nuxt')

interface Debugger {
  (...args: any[]): void
  (message: string, ...args: any[]): void
}

// Core server
export namespace Server {

  export interface Request extends Koa.Request {
    readonly csrfToken?: () => string // See: lifecycles/csrf.ts
  }

  export interface Response extends Koa.Response {}

  export interface Session extends KoaSession.Session {
    // TODO: Writing session properties in here...
  }

  export interface State extends Koa.DefaultState {
  }

  export interface Context extends Koa.DefaultContext {
    readonly bootstrap: Bootstrap
    readonly debug: Debugger
    request: Request
    response: Response
    session: Session | null
  }

  export type MiddlewareContext = Koa.ParameterizedContext<State, Context>

  export class Router extends KoaRouter<State, Context> {}

  export type RouterMiddleware = KoaRouter.Middleware<State, Context>

  export type RouterContext = KoaRouterContext<State, Context>

  export const HttpError = Koa.HttpError

  export class Framework extends Koa<State, Context> {}
}

// Lifecycle
export interface Lifecycle {

  name: string

  // eslint-disable-next-line no-use-before-define
  onConfigure? (bootstrap: Bootstrap): Promise<void>

  // eslint-disable-next-line no-use-before-define
  onInitializing? (bootstrap: Bootstrap): Promise<void>

  // eslint-disable-next-line no-use-before-define
  onReady? (bootstrap: Bootstrap): Promise<void>

  // eslint-disable-next-line no-use-before-define
  onClosing? (bootstrap: Bootstrap): Promise<void>
}

// Options
type BootstrapOptions = {
  debug?: Debugger
  framework: Server.Framework
  nuxt: any | null // TODO: nuxt type declaration
  lifecycles?: Lifecycle[]
}

// Core bootstrap
// @ts-ignore
export class Bootstrap extends EventEmitter {
  private configured = false
  readonly debug: Debugger
  readonly framework: Server.Framework
  readonly nuxt: any | null // TODO: nuxt type declaration
  readonly lifecycles: Lifecycle[]

  static Event = {
    CONFIGURE: 'configure',
    CONFIGURED: 'configured',
    INITIALIZING: 'initializing',
    INITIALIZED: 'initialized',
    READY: 'ready',
    STARTED: 'started'
  }

  static HttpServer = Symbol('HttpServer')

  constructor (opts: BootstrapOptions) {
    super()
    this.debug = opts.debug || debug
    this.framework = opts.framework
    this.nuxt = opts.nuxt
    this.lifecycles = opts.lifecycles || []
  }

  readonly rootDir = path.resolve(__dirname, '..')
  readonly serverDir = path.resolve(this.rootDir, 'server')
  readonly isDev = process.env.NODE_ENV !== 'production'
  readonly csrfEnabled = process.env.CSRF_ENABLE === 'true' || process.env.CSRF_ENABLE === process.env.NODE_ENV

  get isConfigured () {
    return this.configured
  }

  async configure (): Promise<this> {
    if (this.configured) return this
    this.bindExitHandler()
    this.emit(Bootstrap.Event.CONFIGURE, this)
    debug(':rootDir', this.rootDir)
    debug(':extended prototype')
    Object.defineProperties(this.framework.context, {
      bootstrap: {
        value: this,
        enumerable: true,
        writable: false,
        configurable: false
      },
      debug: {
        value: this.debug,
        enumerable: true,
        writable: false,
        configurable: false
      }
    })
    await this.onConfigure()
    this.emit(Bootstrap.Event.CONFIGURED, this)
    await this.initializing()
    this.configured = true
    return this
  }

  private async initializing () {
    this.emit(Bootstrap.Event.INITIALIZING, this)
    await this.onInitializing()
    this.emit(Bootstrap.Event.INITIALIZED, this)
  }

  protected async onConfigure () {
    debug(':configure')
    for (const lifecycle of this.lifecycles) {
      debug(':configure lifecycle:', lifecycle.name)
      await lifecycle.onConfigure?.(this)
    }
  }

  protected async onInitializing () {
    debug(':initializing')
    for (const lifecycle of this.lifecycles) {
      debug(':initializing lifecycle:', lifecycle.name)
      await lifecycle.onInitializing?.(this)
    }
  }

  installMiddlewares (...middlewares: Server.RouterMiddleware[]): this {
    if (!middlewares || middlewares.length <= 0) throw new Error('Invalid middlewares or empty')
    if (!this.configured) throw new Error('Bootstrap is not yet configured')
    for (const middleware of middlewares) this.framework.use(middleware)
    return this
  }

  async onReady (): Promise<this> {
    debug(':ready')
    for (const lifecycle of this.lifecycles) {
      debug(':ready lifecycle:', lifecycle.name)
      await lifecycle.onReady?.(this)
    }
    return this
  }

  private _bindExitHandler = false
  private bindExitHandler () {
    if (this._bindExitHandler) return
    this._bindExitHandler = true
    debug(':bind exit handler')
    process.once('exit', (code) => debug(':exit with code:', code))
    process.once('SIGINT', this.exitHandler.bind(this, 'SIGNINT'))
    process.once('SIGQUIT', this.exitHandler.bind(this, 'SIGQUIT'))
    process.once('SIGTERM', this.exitHandler.bind(this, 'SIGTERM'))
    process.once('SIGUSR1', this.exitHandler.bind(this, 'SIGUSR1'))
    process.once('SIGUSR2', this.exitHandler.bind(this, 'SIGUSR2'))
  }

  private async exitHandler (signal: string) {
    debug(':receive signal %s, closing...', signal)
    return new Promise<number>(resolve => {
      debug(':closing http server')
      const server = ((this as any)[Bootstrap.HttpServer] as HttpServer)
      if (!server) return resolve(0)
      server.close((err) => {
        if (err) {
          consola.error('Close http server failed:', err)
          resolve(1)
        } else {
          debug(':closed http server')
          resolve(0)
        }
      })
    }).then(async (exitCode) => {
      try {
        debug(':closing lifecycles')
        for (const lifecycle of this.lifecycles) {
          debug(':closing lifecycle:', lifecycle.name)
          try {
            await lifecycle.onClosing?.(this)
          } catch (err) {
            consola.error('Close lifecycle \'%s\' failed:', lifecycle.name, err)
            exitCode = 1
          }
        }
      } catch (err) {
        debug('close with error:', err)
        exitCode = 1
      }
      if (this.nuxt) {
        debug(':closing nuxt')
        try {
          await this.nuxt.close()
          debug(':closed nuxt')
        } catch (err) {
          consola.error('Close nuxt failed:', err)
          exitCode = 1
        }
      }
      process.exit(exitCode)
    })
  }
}

export function createServerFramework (): Server.Framework {
  return new Server.Framework()
}

export function createBootstrap<T extends Bootstrap> (
  ConstructorFn: new (opts: BootstrapOptions) => T,
  opts: BootstrapOptions
): T {
  return new ConstructorFn(opts)
}

export function defineLifecycle (lifecycle: {
  name: string
  onConfigure? (bootstrap: Bootstrap): Promise<void>
  onInitializing? (bootstrap: Bootstrap): Promise<void>
  onReady? (bootstrap: Bootstrap): Promise<void>
  onClosing? (bootstrap: Bootstrap): Promise<void>
}): Lifecycle {
  return lifecycle
}
