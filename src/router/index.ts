import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import HomeView from '@/views/Home.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/create',
    name: 'CreateServer',
    component: () => import('../views/CreateServer.vue')
  },
  {
    path: '/server/:serverId',
    name: 'Server',
    component: () => import('../views/Server.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
