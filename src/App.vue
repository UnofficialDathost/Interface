<template>
  <div id="app">
    <div v-if="loggedIn" class="row no-gutters">
        <div class="col-md-4 col-xl-2 text-center left-nav">
            <div class="nav-branding" style="padding-top:1em;">
              <router-link :to="{ name: 'Home' }"><img src="@/assets/img/logo.svg"></router-link>
              <p style="margin-top: 8px;margin-bottom: 0px;">Unofficial interface created by&nbsp;<a href="https://github.com/WardPearce" target="_blank">Ward Pearce</a></p>
            </div>
            <div class="nav-branding">
                <h6>Credits:&nbsp;<span style="color: var(--dathost-orange);">{{ account.credits }}</span></h6>
                <h6 style="margin-bottom: 0px;">This will last&nbsp;<span style="color: var(--dathost-orange);">{{ account.time_left }}</span></h6>
            </div>
            <div class="text-left nav-footer">
                <b-dropdown id="dropdown-dropright" block size="lg" dropright text="Account" variant="primary">
                    <b-dropdown-item href="https://dathost.net/control-panel/add-credits" target="_blank"><b-icon icon="credit-card"></b-icon> Add credits</b-dropdown-item>
                    <b-dropdown-item href="#"><b-icon icon="tv"></b-icon> Interface</b-dropdown-item>
                    <b-dropdown-item @click="logout()" href="#" style="background: var(--red);"><b-icon icon="arrow-bar-right"></b-icon> Logout</b-dropdown-item>
                </b-dropdown>
                <div class="disclaimer">
                  <DisclaimerComp />
                </div>
            </div>
            <div v-if="$route.name === 'Server'">
              <a class="d-flex d-xl-flex align-items-center align-items-xl-center side-option side-option-large" v-bind:class="{ active: $route.hash === '#status' }" href="#status">
                <b-icon icon="thermometer" scale="1"></b-icon>&nbsp;Status
              </a>
              <a class="d-flex d-xl-flex align-items-center align-items-xl-center side-option side-option-large" v-bind:class="{ active: $route.hash === '#console' }" href="#console">
                <b-icon icon="terminal" scale=".9"></b-icon>&nbsp; Console
              </a>
              <a class="d-flex d-xl-flex align-items-center align-items-xl-center side-option side-option-large" v-bind:class="{ active: $route.hash === '#settings' }" href="#settings">
                <b-icon icon="gear" scale=".9"></b-icon>&nbsp;Settings
              </a>
              <a class="d-flex d-xl-flex align-items-center align-items-xl-center side-option side-option-large" v-bind:class="{ active: $route.hash === '#mods' }" href="#mods">
                <b-icon icon="list-nested" scale=".9"></b-icon>&nbsp; Mods
              </a>
              <a class="d-flex d-xl-flex align-items-center align-items-xl-center side-option side-option-large" v-bind:class="{ active: $route.hash === '#config' }" href="#config">
                <b-icon icon="pencil-square" scale=".9"></b-icon>&nbsp; Config
              </a>
              <a class="d-flex d-xl-flex align-items-center align-items-xl-center side-option side-option-large" v-bind:class="{ active: $route.hash === '#files' }" href="#files">
                <b-icon icon="folder" scale=".9"></b-icon>&nbsp; Files
              </a>
              <a class="d-flex d-xl-flex align-items-center align-items-xl-center side-option side-option-large" v-bind:class="{ active: $route.hash === '#commands' }" href="#commands">
                <b-icon icon="code-slash" scale=".9"></b-icon>&nbsp; Commands
              </a>
              <a class="d-flex d-xl-flex align-items-center align-items-xl-center side-option side-option-large" v-bind:class="{ active: $route.hash === '#backups' }" href="#backups">
                <b-icon icon="clock-history" scale=".9"></b-icon>&nbsp; Backups
              </a>
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
                  <b-alert v-if="invalidLogin" show variant="warning" style="margin-bottom: 1.5rem;">Login is invalid!</b-alert>

                  <label for="email">Email</label>
                  <input v-model="login.email" class="form-control" type="email" placeholder="..." name="email">

                  <label for="password" style="margin-top: .5rem;">Password</label>
                  <input v-model="login.password" class="form-control" type="password" name="password" placeholder="...">

                  <label for="proxy" style="margin-top: .5rem;">CORS Proxy</label>
                  <input v-model="login.proxy" class="form-control" type="text" name="proxy" placeholder="...">

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
import { IAccount } from 'dathost/src/interfaces/account'

import DisclaimerComp from '@/components/disclaimer.vue'

import VueMixin from '@/mixins/vue'

@Component({
  components: {
    DisclaimerComp
  }
})
export default class App extends VueMixin {
  login: Record<string, string> = {
    email: '',
    password: '',
    proxy: 'https://cors-anywhere.wardpearce.com'
  }

  loggedIn = false
  invalidLogin = false
  loginLoading = false

  account: IAccount

  async mounted (): Promise<void> {
    const loginDetails = localStorage.getItem('loginDetails')
    if (loginDetails !== null) {
      this.login = JSON.parse(loginDetails)
      await this.checkLogin()
    }
  }

  async checkLogin (): Promise<void> {
    const dathost = new Dathost(this.login.email, this.login.password, `${this.login.proxy}/dathost.net/api/0.1/`)
    this.loginLoading = true
    try {
      this.account = await dathost.account()
      this.invalidLogin = false
      this.loggedIn = true

      Vue.prototype.$dathost = dathost
      localStorage.setItem('loginDetails', JSON.stringify(this.login))
    } catch {
      this.invalidLogin = true
    }
    this.loginLoading = false
  }

  logout (): void {
    this.loggedIn = false
    localStorage.removeItem('loginDetails')
  }
}
</script>
