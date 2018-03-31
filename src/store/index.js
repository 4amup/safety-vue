import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: null,
    // 所有区域对象
    areas: null
  },
  mutations: {
    setUser (state, user) {
      state.user = user
    },
  },
  actions: {
    login(context, user) {
      context.commit('setUser', user)
    },
    exit(context) {
      context.commit('setUser', null)
    },
    getAreas(context) {
      //
    }
  }
})

export default store
