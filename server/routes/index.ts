import { Server } from '@/server/interface'
import HomeController from '@/server/controllers/home'
import validator, { Joi } from '@/server/middlewares/validator'

const routes = new Server.Router({ prefix: '/api' })
  .get('/',
    validator({
      query: Joi.object({
        apikey: Joi.string().required()
      }),
      errorHandler (ctx, error) {
        ctx.status = 400
        ctx.body = {
          ok: false,
          error
        }
      }
    }),
    HomeController.get
  )

export default routes
