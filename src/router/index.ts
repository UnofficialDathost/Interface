import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import HomeView from '@/views/Home.vue'
import CreateServerView from '@/views/CreateServer.vue'
import ServerView from '@/views/Server.vue'

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
    component: CreateServerView
  },
  {
    path: '/server/:serverId',
    name: 'Server',
    component: ServerView
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
