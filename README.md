# L2 Studio - Nuxt Template

Koa-based Nuxt template for L2 Studio

## Dependencies

* Nuxt 2
* Nuxt Composition API
* Nuxt Universal storage
* Koa 2
* Koa Router
* Koa Body parser
* Koa Response time
* Koa Session
* Koa Static
* Vue 2
* Vue Router
* Vuex
* TailwindCSS 2
* PostCSS 8

## Directory Structure

```
.
|-- assets
|   `-- styles
|       `-- tailwind.css
|-- components
|-- composables
|-- directives
|-- interfaces
|-- layouts
|-- middlewares
|-- pages
|   `-- index.vue
|-- plugins
|-- public
|-- server
|   |-- bootstrap.ts
|   |-- controllers
|   |   `-- home.ts
|   |-- dotenv.resolve.ts
|   |-- index.ts
|   |-- interface.ts
|   |-- lifecycle
|   |   `-- common.ts
|   |-- middlewares
|   |-- premain.nuxt.ts
|   |-- premain.serve.ts
|   |-- routes
|   |   `-- index.ts
|   `-- utils
|-- shims-tsx.d.ts
|-- shims-vue.d.ts
|-- store
|   `-- index.ts
|-- .editorconfig
|-- .env
|-- .eslintrc.js
|-- .gitattributes
|-- .gitignore
|-- LICENSE
|-- nodemon.nuxt.json
|-- nodemon.serve.json
|-- nuxt.config.js
|-- package.json
|-- pnpm-lock.yaml
|-- README.md
|-- shims-tsx.d.ts
|-- shims-vue.d.ts
|-- tailwind.config.js
`-- tsconfig.json
```

## Scripts

```shell
# Remove nuxt build
npm run clean

# Build production version
npm run build

# Only run Koa server during development
npm run dev:serve

# Run nuxt and koa development server
npm run dev:nuxt

# Run in production (Need to be built first)
npm run start

# Run ESLint code check
npm run lint
```

## License

MIT
