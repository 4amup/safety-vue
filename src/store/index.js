import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: null,
    area: { // 当前的一个区域对象，需要不同组件之间共享数据
      editStatus: false, // 节点是否在编辑状态
      appendStatus: false, // 节点是否在添加状态
      attributes: {
        name: null,
        path: []
      }
    },
  },
  mutations: {
    setUser (state, user) {
      state.user = user
    },
    setArea (state, area) {
      state.area  = {...state.area, ...area}
    },
    setAreaEdit (state) {
      state.area.editStatus = true
    },
    setAreaAppend (state) {
      state.area.appendStatus = true
    },
    setAreaInit(state) {
      state.area.editStatus = false
      state.area.appendStatus = false
    }
  },
  actions: {
    login(context, user) {
      context.commit('setUser', user)
    },
    exit(context) {
      context.commit('setUser', null)
    },
    saveArea(context, area) {
      context.commit('setArea', area)
    }
  }
})

export default store
