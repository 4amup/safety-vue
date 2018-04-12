// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import api from './api'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false
localStorage.setItem('debug', 'leancloud*') // 开启调试模式
Vue.use(ElementUI);

// 调用云端接口获取user持久化存储，刷新不丢失
const user = api.SDK.User.current()
if (user) {
  store.commit('setUser', user);
}

// 增加路由验证逻辑，有些路由必须登录后才能跳转过去
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.needLogin)) {
    if (!store.state.user) {
      Vue.prototype.$message.error("请先登录");
      next({
        path: '/signIn'
      })
    } else {
      next()
    }
  } else {
    next() // 确保一定要调用 next()
  }
})

// 使用全局混入，将api注入所有组件
Vue.mixin({
  created () {
    if(!this.$api) {
      this.$api = api
    }
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
  // render: h => h(App)
})
