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
                      <SlotsComp :server="server" /> slots
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
import { mixins } from 'vue-class-component'

import { IServer } from 'dathost/src/interfaces/server'

import SlotsComp from '@/components/slots.vue'
import ServerMixin from '@/mixins/server'

@Component({
  name: 'ServerCard',
  components: { SlotsComp }
})
export default class ServerCardComp extends mixins(VueMixin, ServerMixin) {
  @Prop({ type: Object })
  server: IServer

  @Prop({ type: Boolean, default: false })
  cloned: boolean

  @Prop({ type: Boolean, default: false })
  selected: boolean

  mounted (): void {
    this.createServer(this.server)
  }
}
</script>
