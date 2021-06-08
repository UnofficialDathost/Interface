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
    <h5 style="margin-top: .5rem;">Statistics</h5>
    <p style="margin:0px">Total Servers: <b v-if="!statsLoading">{{ stats.totalServers }}</b><b-spinner v-else label="Spinning" style="width: 1.4em; height: 1.4em;"></b-spinner></p>
    <p style="margin:0px">Total players online: <b v-if="!statsLoading">{{ stats.totalPlayersOnline }}</b><b-spinner v-else label="Spinning" style="width: 1.4em; height: 1.4em;"></b-spinner></p>
    <button style="margin-top: 10px;" @click="getStats()" class="btn btn-secondary" type="button">
      <template v-if="!statsLoading">Get stats</template>
      <template v-else>
        <b-spinner label="Spinning" style="width: 1.4em; height: 1.4em;"></b-spinner>&nbsp;Getting stats
      </template>
    </button>

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

  stats = {
    totalPlayersOnline: 0,
    totalServers: 0
  }

  statsLoading = false

  created (): void {
    if (this.$steam) {
      this.steamApiKey = this.$steam.apiKey
    }
  }

  async getStats (): Promise<void> {
    this.statsLoading = true

    this.stats.totalServers = 0
    this.stats.totalPlayersOnline = 0
    for await (const server of this.$dathost.servers()) {
      this.stats.totalServers++
      this.stats.totalPlayersOnline += server[0].players_online
    }
    this.statsLoading = false
  }

  setSteamToken (): void {
    if (this.steamApiKey !== '') {
      Vue.prototype.$steam = new Steam(this.$corsProxy, this.steamApiKey)
    } else {
      Vue.prototype.$steam = undefined
    }

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
  }
}
</script>
