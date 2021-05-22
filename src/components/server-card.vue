<template>
    <div class="card game-card">
        <div class="card-header">
            <div class="row">
                <div class="col-md-6 d-xl-flex justify-content-xl-start align-items-xl-center"><img class="game-icon" :src="require(`@/assets/img/games/${server.game}.svg`)"></div>
                <div class="col-md-6 d-xl-flex justify-content-xl-end align-items-xl-center">
                    <h6 class="game-name">&nbsp;{{ server.name }}</h6>
                </div>
            </div>
        </div>
        <div class="card-body d-flex d-xl-flex flex-column justify-content-center justify-content-xl-center">
            <div class="row">
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
                <button v-if="serverStatus.startingUp" @click="startServer()" class="btn btn-primary" type="button">
                  <b-spinner label="Spinning" style="width: 1.4em; height: 1.4em;"></b-spinner>&nbsp;Starting
                </button>
                <button v-else-if="server.on === false && server.booting === false" @click="startServer()" class="btn btn-primary" type="button"><b-icon icon="play-circle"></b-icon>&nbsp;Start</button>
                <b-dropdown text="Connect" variant="secondary">
                  <b-dropdown-item href="#"><b-icon icon="arrow-up-right-square-fill"></b-icon> Connect</b-dropdown-item>
                  <b-dropdown-item href="#"><b-icon icon="clipboard"></b-icon> Dathost IP</b-dropdown-item>
                  <b-dropdown-item href="#"><b-icon icon="clipboard"></b-icon> Raw IP</b-dropdown-item>
                  <b-dropdown-item href="#"><b-icon icon="clipboard"></b-icon> GOTV IP</b-dropdown-item>
                </b-dropdown>
                <b-dropdown text="More" variant="secondary">
                  <b-dropdown-item href="#"><b-icon icon="file-break"></b-icon> Clone</b-dropdown-item>
                  <b-dropdown-item href="#"><b-icon icon="arrow-repeat"></b-icon> Restart</b-dropdown-item>
                  <b-dropdown-item href="#" style="background: var(--red);"><b-icon icon="trash"></b-icon> Delete</b-dropdown-item>
                </b-dropdown>
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

  serverObj: Server

  serverStatus = {
    startingUp: false
  }

  created (): void {
    this.serverObj = this.$dathost.server(this.server.id)
  }

  async startServer (): Promise<void> {
    this.serverStatus.startingUp = true
    await this.serverObj.start()
    this.serverStatus.startingUp = false
    this.server.on = true
  }
}
</script>
