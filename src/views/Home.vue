<template>
  <div class="home">
    <ActionCardComp
    @startServers="startServers"
    @stopServers="stopServers"
    @restartServers="restartServers"
    @cloneServers="cloneServers"
    @deleteServers="deleteServers"
    @mangingServers="toggleMangement" />
    <div v-if="serversLoading" class="d-flex justify-content-center mb-3">
      <b-spinner style="width: 6rem; height: 6rem; margin-top: 25px;" label="Loading..."></b-spinner>
    </div>
    <div v-else class="row gutter-2">
      <ServerCardComp :ref="server.id" @serverClicked="selectServer" :selected="selectedServerIds.includes(server.id)"
      @serverAdded="addServer" @serverCloned="addCloneDecoy" v-for="(server, index) in servers" :key="index" :server="server" />

      <ServerCardComp v-for="(server, index) in clonedServers" :key="index" :server="server" :cloned="true" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import { Route } from 'vue-router/types'
import VueMixin from '@/mixins/vue'

import { IServer } from 'dathost/src/interfaces/server'

import ActionCardComp from '@/components/action-card.vue'
import ServerCardComp from '@/components/server-card.vue'

@Component({
  components: {
    ActionCardComp,
    ServerCardComp
  }
})
export default class HomeView extends VueMixin {
  servers: IServer[] = []
  clonedServers: IServer[] = []
  selectedServerIds: string[] = []
  serversLoading = true
  beingManged = false
  serverInterval: ReturnType<typeof setInterval>

  async mounted (): Promise<void> {
    await this.getServers()

    this.serverInterval = setInterval(async () => {
      await this.getServers(false)
    }, 30000)
  }

  beforeRouteLeave (to: Route, from: Route, next: FunctionConstructor): void {
    clearInterval(this.serverInterval)
    next()
  }

  async getServers (showLoading = true): Promise<void> {
    this.serversLoading = showLoading

    const servers = []
    for await (const server of this.$dathost.servers()) {
      servers.push(server[0])
    }

    this.servers = servers

    this.serversLoading = false
  }

  addServer (server: IServer): void {
    for (const clonedServer of this.clonedServers) {
      if (clonedServer.name === server.name) {
        this.clonedServers.splice(this.clonedServers.indexOf(clonedServer), 1)
        break
      }
    }
    this.servers.push(server)
  }

  toggleMangement (beingManged: boolean): void {
    this.beingManged = beingManged
    if (!beingManged) {
      this.selectedServerIds = []
    }
  }

  selectServer (server: IServer): void {
    if (this.beingManged) {
      if (this.selectedServerIds.includes(server.id)) {
        this.selectedServerIds.splice(this.selectedServerIds.indexOf(server.id), 1)
      } else {
        this.selectedServerIds.push(server.id)
      }
    } else {
      this.$router.push({ name: 'Server', params: { serverId: server.id, tab: 'status' } })
    }
  }

  addCloneDecoy (server: IServer): void {
    this.clonedServers.push(server)
  }

  async startServers (): Promise<void> {
    await Promise.all(
      this.selectedServerIds.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (serverId) => { (this.$refs[serverId] as any)[0].startServer() }
      )
    )
    this.selectedServerIds = []
  }

  async stopServers (): Promise<void> {
    await Promise.all(
      this.selectedServerIds.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (serverId) => { (this.$refs[serverId] as any)[0].stopServer() }
      )
    )
    this.selectedServerIds = []
  }

  async restartServers (): Promise<void> {
    await Promise.all(
      this.selectedServerIds.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (serverId) => { (this.$refs[serverId] as any)[0].restartServer() }
      )
    )
    this.selectedServerIds = []
  }

  async cloneServers (): Promise<void> {
    await Promise.all(
      this.selectedServerIds.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (serverId) => { (this.$refs[serverId] as any)[0].cloneServer() }
      )
    )
    this.selectedServerIds = []
  }

  async deleteServers (): Promise<void> {
    await Promise.all(
      this.selectedServerIds.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (serverId) => { (this.$refs[serverId] as any)[0].deleteServer() }
      )
    )
    this.selectedServerIds = []
  }
}
</script>
