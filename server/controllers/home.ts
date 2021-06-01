import { Server } from '@/server/interface'

const get: Server.RouterMiddleware = async (ctx) => {
  ctx.body = {
    ok: true,
    apikey: ctx.request.query.apikey
  }
}

export default {
  get
}
