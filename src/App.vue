<template>
  <div id="app">
    <div v-if="loggedIn" class="row no-gutters">
        <InterfaceSettingsComp />
        <div class="col-md-4 col-xl-2 text-center left-nav">
            <div class="nav-branding" style="padding-top:1em;">
              <router-link :to="{ name: 'Home' }"><img src="@/assets/img/logo.svg"></router-link>
              <p style="margin-top: 8px;margin-bottom: 0px;">Unofficial interface created by&nbsp;<a href="https://github.com/WardPearce" target="_blank">Ward Pearce</a></p>
            </div>
            <div class="nav-branding">
                <h6>Credits:&nbsp;<span style="color: var(--dathost-orange);">{{ $dathostAccount.credits }}</span></h6>
                <h6 style="margin-bottom: 0px;">This will last&nbsp;<span style="color: var(--dathost-orange);">{{ $dathostAccount.time_left }}</span></h6>
            </div>
            <div class="text-left nav-footer">
                <b-dropdown id="dropdown-dropright" text="Account" block size="lg" dropright variant="primary">
                    <b-dropdown-item href="https://dathost.net/control-panel/add-credits" target="_blank"><b-icon icon="credit-card"></b-icon> Add credits</b-dropdown-item>
                    <b-dropdown-item v-b-modal.interface-settings><b-icon icon="tv"></b-icon> Interface</b-dropdown-item>
                    <b-dropdown-item @click="logout()" href="#" style="background: var(--red);"><b-icon icon="arrow-bar-right"></b-icon> Logout</b-dropdown-item>
                </b-dropdown>
                <div class="disclaimer">
                  <DisclaimerComp />
                </div>
            </div>
            <div v-if="$route.name === 'Server'">
              <router-link v-for="(tab, index) in serverTabs" :key="index" :to="{ name: 'Server', params: { serverId: $route.params.serverId, 'tab': tab.name.toLowerCase() } }"
              v-bind:class="{ active: $route.params.tab === tab.name.toLowerCase() }" class="d-flex d-xl-flex align-items-center align-items-xl-center side-option side-option-large">
                <b-icon :icon="tab.icon" scale="1"></b-icon>&nbsp;{{ tab.name }}
              </router-link>
            </div>
            <router-link v-else-if="$route.name !== 'CreateServer'" class="btn btn-primary btn-lg text-uppercase" :to="{ name: 'CreateServer' }">&nbsp;<b-icon icon="plus" scale="1.5"></b-icon>&nbsp;Add Game Server</router-link>
        </div>
        <div class="col-md-8 col-xl-10">
            <div class="container-fluid content">
                <router-view/>
            </div>
        </div>
    </div>
    <!-- Start: 1 Row 3 Columns -->
    <div v-else class="container d-flex d-xl-flex justify-content-center align-items-center justify-content-xl-center align-items-xl-center content" style="height: 100vh;">
        <div class="card login">
            <div class="card-header text-center"><img src="@/assets/img/logo.svg">
                <p style="margin-top: 8px;margin-bottom: 0px;">Unofficial interface created by&nbsp;<a href="https://github.com/WardPearce" target="_blank">Ward Pearce</a></p>
            </div>
            <div class="card-body">
                <template v-if="!loginLoading">
                  <b-alert v-if="invalidLogin" show variant="warning" style="margin-bottom: 1.5rem;">Login is invalid! If you are using a custom cors proxy, this could also be causing the error.</b-alert>

                  <label for="email">Email</label>
                  <input v-model="login.email" class="form-control" type="email" placeholder="..." name="email">

                  <label for="password" style="margin-top: .5rem;">Password</label>
                  <input v-model="login.password" class="form-control" type="password" name="password" placeholder="...">

                  <label for="steam" style="margin-top: .5rem;" v-b-tooltip.hover.right title="Provides automation using the steam API if provided.">Steam API Key (optional) <b-icon scale=".7" icon="info-circle"></b-icon></label>
                  <input v-model="login.steam" class="form-control" type="password" name="steam" placeholder="...">

                  <label for="proxy" style="margin-top: .5rem;">CORS Proxy</label>
                  <div class="d-flex">
                    <input v-model="login.proxy" @input="proxyChanged()" class="form-control" type="text" name="proxy" placeholder="...">
                    <button v-if="login.proxy !== defaultProxy" @click="login.proxy = defaultProxy" class="btn btn-primary" style="width: 30%;" type="button">Reset</button>
                  </div>

                  <button @click="checkLogin()" class="btn btn-primary btn-block" style="margin-top: 1.5rem;"><b-icon icon="box-arrow-in-right"></b-icon>&nbsp;Login</button>
                </template>
                <div v-else class="d-flex justify-content-center mb-3">
                  <b-spinner label="Loading..."></b-spinner>
                </div>
            </div>
            <div class="card-footer">
              <DisclaimerComp />
            </div>
        </div>
    </div>
    <!-- End: 1 Row 3 Columns -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Dathost from 'dathost'

import DisclaimerComp from '@/components/disclaimer.vue'
import InterfaceSettingsComp from '@/components/interface-settings.vue'

import VueMixin from '@/mixins/vue'

import Steam from '@/helper/steam'

@Component({
  components: {
    DisclaimerComp,
    InterfaceSettingsComp
  }
})
export default class App extends VueMixin {
  login: Record<string, string> = {
    email: '',
    password: '',
    steam: '',
    proxy: ''
  }

  defaultProxy = 'https://cors-anywhere.wardpearce.com'

  loggedIn = false
  invalidLogin = false
  loginLoading = false

  accountInterval: ReturnType<typeof setInterval>

  serverTabs = [
    { name: 'Status', icon: 'thermometer' },
    { name: 'Console', icon: 'terminal' },
    { name: 'Settings', icon: 'gear' },
    { name: 'Mods', icon: 'list-nested' },
    { name: 'Config', icon: 'pencil-square' },
    { name: 'Files', icon: 'folder' },
    { name: 'Commands', icon: 'code-slash' },
    { name: 'Backups', icon: 'clock-history' }
  ]

  async mounted (): Promise<void> {
    const loginDetails = localStorage.getItem('loginDetails')
    if (loginDetails !== null) {
      this.login = JSON.parse(loginDetails)
      await this.checkLogin()
    } else {
      this.login.proxy = this.defaultProxy
    }
  }

  async checkLogin (): Promise<void> {
    const dathost = new Dathost(this.login.email, this.login.password, `${this.login.proxy}/dathost.net/api/0.1/`)
    this.loginLoading = true
    try {
      Vue.prototype.$dathostAccount = await dathost.account()
      this.invalidLogin = false

      Vue.prototype.$dathost = dathost
      localStorage.setItem('loginDetails', JSON.stringify(this.login))

      // Update account details every 30 seconds in the background.
      this.accountInterval = setInterval(async () => {
        Vue.prototype.$dathostAccount = await dathost.account()
      }, 30000)

      if (this.login.steam !== '') {
        Vue.prototype.$steam = new Steam(this.login.proxy, this.login.steam)
      } else {
        Vue.prototype.$steam = undefined
      }

      Vue.prototype.$corsProxy = this.login.proxy

      this.loggedIn = true
    } catch {
      this.invalidLogin = true
    }
    this.loginLoading = false
  }

  logout (): void {
    clearInterval(this.accountInterval)
    localStorage.removeItem('loginDetails')

    this.login.email = ''
    this.login.password = ''
    this.login.steam = ''

    this.loggedIn = false
  }
}
</script>
