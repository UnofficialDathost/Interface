<template>
  <div id="app">
    <div v-if="loggedIn" class="row no-gutters">
        <div class="col-md-4 col-xl-2 text-center left-nav">
            <div class="nav-branding" style="padding-top:1em;"><img src="@/assets/img/logo.svg">
                <p style="margin-top: 8px;margin-bottom: 0px;">Unofficial interface created by&nbsp;<a href="https://github.com/WardPearce" target="_blank">Ward Pearce</a></p>
            </div>
            <div class="nav-branding">
                <h6>Credits:&nbsp;<span style="color: var(--dathost-orange);">16.76 NZD</span></h6>
                <h6 style="margin-bottom: 0px;">This will last&nbsp;<span style="color: var(--dathost-orange);">indefinitely</span></h6>
            </div>
            <div class="text-left nav-footer">
                <b-dropdown id="dropdown-dropright" block size="lg" dropright text="Account" variant="primary">
                    <b-dropdown-item href="#"><b-icon icon="credit-card"></b-icon> Billing</b-dropdown-item>
                    <b-dropdown-item href="#"><b-icon icon="tv"></b-icon> Interface</b-dropdown-item>
                    <b-dropdown-item href="#" style="background: var(--red);"><b-icon icon="arrow-bar-right"></b-icon> Logout</b-dropdown-item>
                </b-dropdown>
                <div class="disclaimer">
                    <p style="margin-bottom: 5px;">This site stores local cookies what contain identifiers, this is purely for functionality.</p>
                    <p style="margin-bottom: 5px;">This website has zero&nbsp;affiliation with dathost.net.</p><a href="https://github.com/UnofficialDathost/Interface" target="_blank">Proudly licensed under&nbsp;GNU Affero 3</a>
                </div>
            </div><button class="btn btn-primary btn-lg text-uppercase" type="button">&nbsp;<b-icon icon="plus" scale="1.7"></b-icon>&nbsp;Add Game Server</button>
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

                  <button @click="checkLogin()" class="btn btn-primary btn-block" style="margin-top: 1.5rem;"><i class="fa fa-sign-in"></i>&nbsp;Login</button>
                </template>
                <div v-else class="d-flex justify-content-center mb-3">
                  <b-spinner label="Loading..."></b-spinner>
                </div>
            </div>
            <div class="card-footer">
                <p style="margin-bottom: 5px;">This site stores local cookies that contain identifiers, this is purely for functionality.</p>
                <p style="margin-bottom: 5px;">This website has zero&nbsp;affiliation with dathost.net.</p><a href="https://github.com/UnofficialDathost/Interface" target="_blank">Proudly licensed under&nbsp;GNU Affero 3</a>
            </div>
        </div>
    </div>
    <!-- End: 1 Row 3 Columns -->
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Dathost from 'dathost'

@Component
export default class App extends Vue {
  login: Record<string, string> = {
    email: '',
    password: ''
  }

  loggedIn = false
  invalidLogin = false
  loginLoading = false

  async checkLogin (): Promise<void> {
    const dathost = new Dathost(this.login.email, this.login.password, 'https://cors-anywhere.wardpearce.com/dathost.net/api/0.1/')
    this.loginLoading = true
    try {
      await dathost.account()
      this.invalidLogin = false
      this.loggedIn = true
    } catch {
      this.invalidLogin = true
    }
    this.loginLoading = false
  }
}
</script>
