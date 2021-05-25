<template>
  <div>
    <div v-if="serverLoading" class="d-flex justify-content-center mb-3">
      <b-spinner style="width: 6rem; height: 6rem; margin-top: 25px;" label="Loading..."></b-spinner>
    </div>
    <div v-else class="card">
        <div class="card-header">
            <div class="row">
                <div class="col-md-6 d-xl-flex justify-content-xl-start align-items-xl-center">
                  <div class="btn-group" role="group">
                      <button v-if="serverStatus.restarting" class="btn btn-primary" type="button">
                        <b-spinner label="Spinning" style="width: 1.4em; height: 1.4em;"></b-spinner>&nbsp;Restarting
                      </button>
                      <button v-else-if="serverStatus.startingUp || server.booting" class="btn btn-primary" type="button">
                        <b-spinner label="Spinning" style="width: 1.4em; height: 1.4em;"></b-spinner>&nbsp;Starting
                      </button>
                      <button v-else-if="server.on === false" @click="startServer()" class="btn btn-primary" type="button"><b-icon icon="play-circle"></b-icon>&nbsp;Start</button>
                      <template v-else>
                        <button v-if="serverStatus.stopping" class="btn btn-secondary" type="button">
                          <b-spinner label="Spinning" style="width: 1.4em; height: 1.4em;"></b-spinner>&nbsp;Stopping
                        </button>
                        <button v-else @click="stopServer()" class="btn btn-secondary" type="button"><b-icon icon="stop-circle"></b-icon>&nbsp;Stop</button>
                      </template>
                      <b-dropdown v-if="server.game === 'csgo' || server.game === 'teamfortress2'" text="Connect" variant="secondary">
                        <b-dropdown-item :href="`steam://connect/${server.raw_ip}:${server.ports.game}${steamProtocolPass}`"><b-icon icon="arrow-up-right-square-fill"></b-icon> Connect</b-dropdown-item>
                        <b-dropdown-item @click="copyToClipboard(`connect ${server.ip}:${server.ports.game}${password}`)"><b-icon icon="clipboard"></b-icon> Dathost IP</b-dropdown-item>
                        <b-dropdown-item @click="copyToClipboard(`connect ${server.raw_ip}:${server.ports.game}${password}`)"><b-icon icon="clipboard"></b-icon> Raw IP</b-dropdown-item>
                        <b-dropdown-item v-if="gotvEnabled" @click="copyToClipboard(`connect ${server.raw_ip}:${server.ports.gotv}`)"><b-icon icon="clipboard"></b-icon> GOTV IP</b-dropdown-item>
                      </b-dropdown>
                      <b-dropdown text="More" variant="secondary">
                        <b-dropdown-item @click="cloneServer()"><b-icon icon="file-break"></b-icon> Clone</b-dropdown-item>
                        <b-dropdown-item @click="restartServer()"><b-icon icon="arrow-repeat"></b-icon> Restart</b-dropdown-item>
                        <b-dropdown-item @click="deleteServer()" style="background: var(--red);"><b-icon icon="trash"></b-icon> Delete</b-dropdown-item>
                      </b-dropdown>
                  </div>
                </div>
                <div class="col-md-6 offset-0">
                    <p class="d-flex d-xl-flex justify-content-center align-items-center justify-content-xl-end align-items-xl-center" style="margin-bottom: 0px;">
                      {{ server.name }}&nbsp;<img class="game-icon" :src="require(`@/assets/img/games/${server.game}.svg`)" style="width: 50px;">
                    </p>
                </div>
            </div>
        </div>
        <div class="card-body">
          <ServerConsoleComp :server="server" :serverObj="serverObj" v-if="$route.params.tab === 'console'" />
        </div>
        <div class="card-footer">
            <div class="row">
                <div class="col-md-6">
                    <p class="text-left" style="margin: 0px;">
                      <template v-if="server.on">
                        <b-icon variant="success" icon="circle-fill"></b-icon>&nbsp;Online
                      </template>
                      <template v-else>
                        <b-icon icon="circle-fill"></b-icon>&nbsp;Offline
                      </template>
                    </p>
                </div>
                <div class="col-md-6">
                    <p class="text-right" style="margin-bottom: 0px;">{{ server.id }}</p>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import VueMixin from '@/mixins/vue'

import { IServer } from 'dathost/src/interfaces/server'
import Server from 'dathost/src/server'

import ServerMixin from '@/mixins/server'
import ServerConsoleComp from '@/components/server-console.vue'

@Component({
  mixins: [ServerMixin],
  components: {
    ServerConsoleComp
  }
})
export default class ServerView extends VueMixin {
  server: IServer
  serverObj: Server
  serverLoading = true

  async mounted (): Promise<void> {
    this.serverObj = this.$dathost.server(this.$route.params.serverId)
    try {
      this.server = await this.serverObj.get()
    } catch {
      this.$router.push({ name: 'Home' })
    }
    this.serverLoading = false
  }
}
</script>
