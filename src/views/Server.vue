<template>
  <div>
    <div v-if="serverLoading" class="d-flex justify-content-center mb-3">
      <b-spinner style="width: 6rem; height: 6rem; margin-top: 25px;" label="Loading..."></b-spinner>
    </div>
    <div v-else class="card">
        <div class="card-header">
            <div class="row">
                <div class="col-md-6 d-xl-flex justify-content-xl-start align-items-xl-center">
                </div>
                <div class="col-md-6 offset-0">
                    <p class="d-flex d-xl-flex justify-content-center align-items-center justify-content-xl-end align-items-xl-center" style="margin-bottom: 0px;">
                      {{ server.name }}&nbsp;<img class="game-icon" :src="require(`@/assets/img/games/${server.game}.svg`)" style="width: 50px;">
                    </p>
                </div>
            </div>
        </div>
        <div class="card-body"></div>
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

@Component({
  data () {
    return {
      server: null,
      serverObj: null
    }
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
