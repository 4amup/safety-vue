import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/pages/HelloWorld'
import List from '@/pages/List'
import Library from '@/pages/Library'
import Tree from '@/pages/Tree'
import SignUp from '@/pages/SignUp'
import SignIn from '@/pages/SignIn'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
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
