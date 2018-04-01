import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: null,
    area: { // 当前的一个区域对象，需要不同组件之间共享数据
      editStatus: false, // 节点是否在编辑状态
      appendStatus: false, // 节点是否在添加状态
      name: null,
      path: null,
    },
  },
  mutations: {
    setUser (state, user) {
      state.user = user
    },
    setArea (state, area) {
      state.area  = {...state.area, ...area}
    },
    setAreaPath(state, path) {
      state.area.path = path
    },
    setAreaEdit (state) {
      state.area.editStatus = !state.area.editStatus
    },
  },
  actions: {
    login(context, user) {
      context.commit('setUser', user)
    },
    exit(context) {
      context.commit('setUser', null)
    },
    getArea(context, area) {
      context.commit('setArea', area)
    },
    saveArea(context, area) {
      context.commit('setArea', area)
    }
  }
})

export default store
