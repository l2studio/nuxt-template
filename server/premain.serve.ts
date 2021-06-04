import { Bootstrap } from './interface'
import consola from 'consola'

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || '3000'

process.env.HOST = host
process.env.PORT = port
process.env.BASE_URL = port === '80' || port === '443'
  ? `${port === '443' ? 'https' : 'http'}://${host}`
  : `http://${host}:${port}`

const _port = parseInt(port)
if (!_port || isNaN(_port)) throw new Error('Invalid server port: ' + port)

export default () => require('./bootstrap')
  .default()
  .then(async (bootstrap: Bootstrap) => {
    await bootstrap.onReady()
    ;(bootstrap as any)[Bootstrap.HttpServer] = bootstrap.framework.listen(_port, host)
    consola.ready({ badge: true, message: `Server listening on ${process.env.BASE_URL}` })
    return bootstrap
  })
