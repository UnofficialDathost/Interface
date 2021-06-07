<template>
  <b-modal size="xl" id="interface-settings" ok-only title="Interface Settings">
    <div class="card" style="margin-bottom:25px;">
      <div class="card-body">
        <div class="text-center">
          <b-avatar :src="$dathostAccount.gravatar_url" size="4rem"></b-avatar>
          <h5 style="margin:0;">{{ $dathostAccount.email }}</h5>
        </div>
      </div>
      <div class="card-footer">
        <span>Interface created by <a href="https://github.com/WardPearce" target="_blank">Ward Pearce</a></span>
      </div>
    </div>
    <h5 style="margin-top: .5rem;">Settings</h5>
    <label for="steam" v-b-tooltip.hover.right title="Provides automation using the steam API if provided.">Steam API Key (optional) <b-icon scale=".7" icon="info-circle"></b-icon></label>
    <input @input="setSteamToken()" v-model="steamApiKey" class="form-control" type="password" name="steam" placeholder="...">
  </b-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import VueMixin from '@/mixins/vue'

import Steam from '@/helper/steam'

@Component({ name: 'InterfaceSettings' })
export default class InterfaceSettingsComp extends VueMixin {
  steamApiKey = ''

  created (): void {
    if (this.$steam) {
      this.steamApiKey = this.$steam.apiKey
    }
  }

  setSteamToken (): void {
    if (this.steamApiKey !== '') {
      Vue.prototype.$steam = new Steam(this.$corsProxy, this.steamApiKey)

      const loginDetails = localStorage.getItem('loginDetails')
      if (loginDetails != null) {
        const currentDetails = JSON.parse(loginDetails)
        currentDetails.steam = this.steamApiKey
        localStorage.setItem('loginDetails', JSON.stringify(currentDetails))
      }

      this.$bvToast.toast('GSLT Token Updated', {
        noCloseButton: true,
        title: '',
        headerClass: 'toast-header-competed',
        toaster: 'b-toaster-bottom-right'
      })
    } else {
      Vue.prototype.$steam = undefined
    }
  }
}
</script>
