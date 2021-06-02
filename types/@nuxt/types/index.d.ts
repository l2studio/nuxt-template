import type { Context } from '@nuxt/types'

declare module '@nuxt/types' {
  interface Context extends Context { // FIXME: Need to inherit? typescript update?
    $csrfToken: () => string | undefined
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $csrfToken: () => string | undefined
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $csrfToken: () => string | undefined
  }
}
