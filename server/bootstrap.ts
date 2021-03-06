import { Bootstrap, createBootstrap, createServerFramework } from './interface'
import CommonLifecycle from './lifecycle/common'
import CSRFLifecycle from './lifecycle/csrf'
import routes from './routes'

export default async function bootstrap (nuxt?: any | null): Promise<Bootstrap> {
  return createBootstrap(Bootstrap, {
    framework: createServerFramework(),
    nuxt,
    lifecycles: [
      CommonLifecycle,
      CSRFLifecycle
    ]
  }).configure()
    .then(bootstrap => bootstrap.installMiddlewares(
      routes.routes(),
      routes.allowedMethods()
    ))
}
