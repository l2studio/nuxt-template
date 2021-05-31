import { Server } from '@/server/interface'
import HomeController from '@/server/controllers/home'

const routes = new Server.Router({ prefix: '/api' })
  .get('/', HomeController.get)

export default routes
