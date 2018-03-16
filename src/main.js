// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import api from './api'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false
localStorage.setItem('debug', 'leancloud*') // 开启调试模式

Vue.use(ElementUI);

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
