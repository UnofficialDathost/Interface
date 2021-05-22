import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import Home from '@/views/Home.vue'
import CreateServer from '@/views/CreateServer.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/create',
    name: 'CreateServer',
    component: CreateServer
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
