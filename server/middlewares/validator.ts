import { Server } from '@/server/interface'
import Joi from 'joi'

type ValidatorOptions = {
  header?: Joi.ObjectSchema
  query?: Joi.ObjectSchema
  params?: Joi.ObjectSchema
  body?: Joi.ObjectSchema | Joi.ArraySchema
  errorHandler?: (ctx: Server.RouterContext, error: Joi.ValidationError) => void
}

const props = ['header', 'query', 'params', 'body']

export { Joi }
export default function validator (opts: ValidatorOptions): Server.RouterMiddleware {
  return (ctx, next) => {
    for (const prop of props) {
      if (!Object.prototype.hasOwnProperty.call(opts, prop)) {
        continue
      }
      // @ts-ignore
      const { value, error } = (opts[prop] as Joi.Schema).validate(prop === 'params' ? ctx[prop] : ctx.request[prop])
      if (error) {
        if (typeof opts.errorHandler === 'function') {
          ctx.status = 404 // flag
          opts.errorHandler(ctx, error)
          if (ctx.status === 404 && !ctx.body) {
            // Set default status and response body to prevent the error handler from doing nothing
            ctx.debug('Error handler of the route validator did not set response')
            ctx.status = 400
            ctx.body = error
          }
          return
        } else {
          // Throw error, leave it to other middleware. E.g. global error handler.
          // Instance of Joi.ValidationError
          throw error
        }
      }
      switch (prop) {
        case 'header':
        case 'query':
          Object.keys(value).forEach((key) => { ctx.request[prop][key] = value[key] })
          break
        case 'params':
          // @ts-ignore
          ctx.request.params = ctx.params = value
          break
        default:
          // @ts-ignore
          ctx.request[prop] = value
          break
      }
    }
    return next()
  }
}
