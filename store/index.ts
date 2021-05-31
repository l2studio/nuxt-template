import { Commit, GetterTree, MutationTree, ActionTree } from 'vuex'
import type { Server } from '@/server/interface'

interface RootState {
}

export const state = (): RootState => ({
})

export const getters: GetterTree<RootState, any> = {
}

export const mutations: MutationTree<RootState> = {
}

export const actions: ActionTree<RootState, any> = {
  nuxtServerInit (store: { commit: Commit }, { req }: { req: Server.Request & { ctx: Server.RouterContext } }) {
    // TODO: Writing nuxt server init in here...
    // This is the context of koa routing middleware, see server/premain.nuxt.ts line 35
  }
}

export const strict = process.env.NODE_ENV !== 'production'
