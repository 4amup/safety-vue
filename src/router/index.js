import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'
import List from '@/pages/List'
import Library from '@/pages/Library'
import Tree from '@/pages/Tree'
import Todo from '@/pages/Todo'
import SignUp from '@/pages/SignUp'
import SignIn from '@/pages/SignIn'

import TodoShow from '@/pages/todo/index'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/list',
      name: 'List',
      component: List
    },
    {
      path: '/library',
      name: 'Library',
      component: Library
    },
    {
      path: '/tree',
      name: 'Tree',
      component: Tree
    },
    {
      path: '/todo',
      name: 'Todo',
      component: Todo,
      meta: { // 如何测试一下meta值
        needLogin: true
      }
    },
    {
      path: '/todo/:id',
      name: 'TodoShow',
      component: TodoShow,
      meta: { // 如何测试一下meta值
        needLogin: true
      }
    },
    {
      path: '/signup',
      name: 'SignUp',
      component: SignUp
    },
    {
      path: '/signin',
      name: 'SignIn',
      component: SignIn
    }
  ]
})
