<template>
  <div v-if="!deleted" class="col-md-4">
    <div class="card game-card" style="cursor: pointer;" v-bind:class="{'game-selected': selected}">
        <div class="card-header" @click="$emit('serverClicked', server)">
            <div class="row">
                <div class="col-md-6 d-xl-flex justify-content-xl-start align-items-xl-center"><img class="game-icon" :src="require(`@/assets/img/games/${server.game}.svg`)"></div>
                <div class="col-md-6 d-xl-flex justify-content-xl-end align-items-xl-center">
                    <h6 class="game-name">&nbsp;{{ server.name }}</h6>
                </div>
            </div>
        </div>
        <div v-if="cloned" class="card-body">
          <h6 class="text-center">Cloning server</h6>
          <div class="d-flex justify-content-center mb-3">
            <b-spinner label="Loading..."></b-spinner>
          </div>
        </div>
        <div v-else-if="!serverStatus.deleting" @click.self="$emit('serverClicked', server)" class="card-body d-flex d-xl-flex flex-column justify-content-center justify-content-xl-center">
            <div class="row" @click="$emit('serverClicked', server)">
                <div class="col-md-6 col-xl-4 d-xl-flex justify-content-xl-start">
                    <p class="text-capitalize"><b-icon icon="compass"></b-icon>&nbsp;{{ server.location }}&nbsp;</p>
                </div>
                <div class="col-md-6 col-xl-4 d-xl-flex justify-content-xl-center">
                    <p>
                      <b-icon icon="people"></b-icon>&nbsp;
                      <Slots :server="server" /> slots
                    </p>
                </div>
                <div class="col-md-6 col-xl-4 d-xl-flex justify-content-xl-end">
                    <p><b-icon icon="lightning"></b-icon>&nbsp;{{ server.month_credits }} / {{ server.max_cost_per_month }}</p>
                </div>
            </div>
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
        <div v-else class="card-body">
          <h6 class="text-center">Deleting server</h6>
          <div class="d-flex justify-content-center mb-3">
            <b-spinner label="Loading..."></b-spinner>
          </div>
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import VueMixin from '@/mixins/vue'
import { Component, Prop } from 'vue-property-decorator'

import Server from 'dathost/src/server'
import { IServer } from 'dathost/src/interfaces/server'

import Slots from '@/components/slots.vue'

@Component({
  name: 'ServerCard',
  components: { Slots }
})
export default class ServerCard extends VueMixin {
  @Prop({ type: Object })
  server: IServer

  @Prop({ type: Boolean, default: false })
  cloned: boolean

  @Prop({ type: Boolean, default: false })
  selected: boolean

  serverObj: Server

  serverStatus = {
    startingUp: false,
    stopping: false,
    deleting: false,
    restarting: false
  }

  deleted = false

  password = ''
  steamProtocolPass = ''
  gotvEnabled = false

  created (): void {
    this.serverObj = this.$dathost.server(this.server.id)

    if (this.server.game === 'csgo') {
      if (this.server.csgo_settings.password) {
        this.password = `; password ${this.server.csgo_settings.password}`
        this.steamProtocolPass = `/${this.server.csgo_settings.password}`
      }
      this.gotvEnabled = this.server.csgo_settings.enable_gotv
    } else if (this.server.game === 'teamfortress2') {
      if (this.server.teamfortress2_settings.password) {
        this.password = `; password ${this.server.teamfortress2_settings.password}`
        this.steamProtocolPass = `/${this.server.teamfortress2_settings.password}`
      }
      this.gotvEnabled = this.server.teamfortress2_settings.enable_gotv
    }
  }

  async copyToClipboard (txt: string): Promise<void> {
    await navigator.clipboard.writeText(txt)
  }

  async startServer (): Promise<void> {
    this.serverStatus.startingUp = true
    await this.serverObj.start()
    await new Promise(resolve => setTimeout(resolve, 5000))
    this.server = await this.serverObj.get()
    if (this.server.server_error) {
      if (this.server.server_error === 'gslt_expired') {
        alert('Your server isn\'t booting because your Steam Token (GSLT) has expired. A valid token is required by Valve to start your server.')
      } else {
        alert(this.server.server_error)
      }
      this.server.on = false
      this.server.booting = false
      await this.serverObj.stop()
    } else {
      this.server.on = true
    }
    this.serverStatus.startingUp = false
  }

  async stopServer (): Promise<void> {
    this.serverStatus.stopping = true
    await this.serverObj.stop()
    this.server.on = false
    this.serverStatus.stopping = false
  }

  async deleteServer (): Promise<void> {
    if (confirm(`Are you sure you want to delete this?\n\nName: ${this.server.name}\nID: ${this.server.id}`)) {
      this.serverStatus.deleting = true
      await this.serverObj.delete()
      this.deleted = true
    }
  }

  async restartServer (): Promise<void> {
    this.serverStatus.restarting = true
    await this.serverObj.stop()
    await this.serverObj.start()
    this.serverStatus.restarting = false
    this.server.on = true
  }

  async cloneServer (): Promise<void> {
    this.$emit('serverCloned', this.server)
    const clonedServer = await this.serverObj.duplicate()
    this.$emit('serverAdded', clonedServer[0])
  }
}
</script>
