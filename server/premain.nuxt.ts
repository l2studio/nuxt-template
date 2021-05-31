import { Bootstrap } from './interface'
import consola from 'consola'

const { Nuxt, Builder } = require('nuxt')
const { showBanner } = require('@nuxt/cli/dist/cli-banner') // FIXME: unsafe require
const nuxtConfig = require('../nuxt.config')

const isProduction = process.env.NODE_ENV === 'production'
nuxtConfig.dev = !isProduction

const nuxt = new Nuxt(nuxtConfig)
const { host, port } = nuxt.options.server

process.env.HOST = host
process.env.PORT = port
process.env.BASE_URL = port === '80' || port === '443'
  ? `${port === '443' ? 'https' : 'http'}://${host}`
  : `http://${host}:${port}`

const _port = parseInt(port)
if (!_port || isNaN(_port)) throw new Error('Invalid server port: ' + port)

export default () => nuxt
  .ready(consola)
  .then(() => showBanner(nuxt, true))
  .then(() => nuxtConfig.dev ? new Builder(nuxt).build() : Promise.resolve())
  .then(() => require('./bootstrap').default(nuxt))
  .then(async (bootstrap: Bootstrap) => {
    await bootstrap.onReady()
    bootstrap.framework.use((ctx) => {
      ctx.status = 200
      ctx.respond = false
      // Nuxt request context
      // @ts-ignore
      ctx.req.ctx = ctx
      nuxt.render(ctx.req, ctx.res)
    })
    bootstrap.framework.listen(_port, host)
    consola.ready({ badge: true, message: `Server listening on ${process.env.BASE_URL}` })
    return bootstrap
  })
