import './router/componentHooks'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

import './registerServiceWorker'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './assets/css/bootstrap.min.css'
import './assets/css/styles.css'

Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
