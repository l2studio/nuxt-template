import { Server } from '@/server/interface'

const get: Server.RouterMiddleware = async (ctx) => {
  ctx.body = { ok: true }
}

export default {
  get
}
