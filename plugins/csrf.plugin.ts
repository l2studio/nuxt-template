import { defineNuxtPlugin } from '@nuxtjs/composition-api'
import type { IncomingMessage } from 'http'
import type { Server } from '@/server/interface'

// See: /server/lifecycle/csrf.ts
// Type declaration: /types/@nuxt/types/index.d.ts
export default defineNuxtPlugin((ctx, inject) => {
  inject('csrfToken', () => {
    if (process.server) {
      const req = ctx.req as IncomingMessage & { ctx: Server.RouterContext }
      return req.ctx.request.csrfToken?.()
    } else {
      return ctx.nuxtState.csrfToken
    }
  })
  if (process.server) {
    ctx.beforeNuxtRender(({ nuxtState }) => {
      const req = ctx.req as IncomingMessage & { ctx: Server.RouterContext }
      nuxtState.csrfToken = req.ctx.request.csrfToken?.()
    })
  }
  if (process.client) {
    ctx.$axios.onRequest((config) => {
      const token = ctx.$csrfToken()
      if (!config.headers['x-csrf-token'] && token) {
        config.headers['x-csrf-token'] = token
      }
      return config
    })
  }
})
