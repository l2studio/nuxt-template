import './dotenv.resolve'
import { Bootstrap } from './interface'

// See package.json scripts -> dev:nuxt
const isNuxt = process.env.BOOTSTRAP_MODE === 'nuxt'

require(isNuxt ? './premain.nuxt' : './premain.serve')
  .default()
  .then((bootstrap: Bootstrap) => {
    // Started
    bootstrap.emit(Bootstrap.Event.STARTED, bootstrap)
  })
  .catch((err: Error | any) => {
    console.error('Bootstrap start failed:', err)
    process.exit(1)
  })
