const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  dir: {
    assets: 'assets',
    layouts: 'layouts',
    middleware: 'middlewares',
    pages: 'pages',
    static: 'public',
    store: 'store'
  },
  server: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || '3000'
  },
  head: {
    titleTemplate: (chunk) => chunk ? `${chunk} - L2 Studio` : 'L2 Studio',
    meta: [
      { charset: 'utf-8' },
      { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' },
      { hid: 'renderer', name: 'renderer', content: 'webkit' },
      { hid: 'author', name: 'author', content: 'lgou2w,L2 Studio' },
      { hid: 'description', name: 'description', content: 'L2 Studio' },
      { hid: 'keywords', name: 'keywords', content: 'lgou2w,L2 Studio' }
    ]
  },
  telemetry: false,
  loading: false,
  css: ['~/assets/styles/tailwind.css'],
  modules: [
    '@nuxtjs/universal-storage'
  ],
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/eslint-module',
    '@nuxtjs/composition-api/module'
  ],
  build: {
    parallel: !isProduction,
    cache: !isProduction,
    postcss: {
      plugins: {
        'postcss-import': {},
        'postcss-nested': {},
        tailwindcss: {},
        autoprefixer: {}
      },
      preset: {
        autoprefixer: {
          grid: true
        }
      }
    },
    extend (config, ctx) {
      if (ctx.isDev && ctx.isClient) {
        const ESLintPlugin = require('eslint-webpack-plugin')
        config.plugins.push(new ESLintPlugin())
      }
    }
  }
}
