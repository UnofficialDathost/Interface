<template>
  <div class="home">
    <ActionCardComp
    @startServers="startServers"
    @stopServers="stopServers"
    @restartServers="restartServers"
    @cloneServers="cloneServers"
    @deleteServers="deleteServers"
    @mangingServers="toggleMangement"
    @orderByPriority="orderByPriority"
    @orderByCost="orderByCost"
    @orderByName="orderByName"
    @orderBySlots="orderBySlots"
    v-model="serverSearch"/>
    <div v-if="serversLoading" class="d-flex justify-content-center mb-3">
      <b-spinner style="width: 6rem; height: 6rem; margin-top: 25px;" label="Loading..."></b-spinner>
    </div>
    <div v-else>
      <draggable @end="serverMoved" :list="servers" class="row gutter-2">
        <ServerCardComp :ref="server.id" @serverClicked="selectServer" :selected="selectedServerIds.includes(server.id)"
        @serverAdded="addServer" @serverCloned="addCloneDecoy" v-for="(server, index) in servers" :key="index" :server="server" />
      </draggable>

      <ServerCardComp v-for="(server, index) in clonedServers" :key="'clone-'+index" :server="server" :cloned="true" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator'
import { Route } from 'vue-router/types'
import draggable, { MoveEvent } from 'vuedraggable'
import VueMixin from '@/mixins/vue'

import { IServer } from 'dathost/src/interfaces/server'
import ServerSettings from 'dathost/src/settings/server'

import ActionCardComp from '@/components/action-card.vue'
import ServerCardComp from '@/components/server-card.vue'

@Component({
  components: {
    ActionCardComp,
    ServerCardComp,
    draggable
  }
})
export default class HomeView extends VueMixin {
  servers: IServer[] = []
  clonedServers: IServer[] = []
  serverSearch = ''
  selectedServerIds: string[] = []
  serversLoading = true
  beingManged = false
  serverInterval: ReturnType<typeof setInterval>
  orderFunc?: CallableFunction

  async mounted (): Promise<void> {
    await this.getServers()
    await this.setServerInterval()
  }

  @Watch('serverSearch')
  async serverSearchChange (): Promise<void> {
    clearInterval(this.serverInterval)

    if (this.serverSearch !== '') {
      this.servers = this.servers.filter((server) => {
        return this.searchHelper(this.serverSearch, server.name) || this.searchHelper(this.serverSearch, server.location
        ) || this.searchHelper(this.serverSearch, server.game) || this.searchHelper(this.serverSearch, server.id)
      })
    } else {
      await this.getServers()
      await this.setServerInterval()
    }
  }

  searchHelper (search: string, toSearch: string): boolean {
    return toSearch.toLowerCase().search(search.toLowerCase()) !== -1
  }

  orderByPriority (): void {
    this.orderFunc = this.orderByPriority

    this.servers = this.servers.sort((a, b) => {
      return a.manual_sort_order - b.manual_sort_order
    })
  }

  orderByCost (): void {
    this.orderFunc = this.orderByCost

    this.servers = this.servers.sort((a, b) => {
      return b.max_cost_per_month - a.max_cost_per_month
    })
  }

  orderByName (): void {
    this.orderFunc = this.orderByName

    this.servers = this.servers.sort((a, b) => {
      return a.name < b.name ? -1 : 1
    })
  }

  orderBySlots (): void {
    this.orderFunc = this.orderBySlots

    this.servers = this.servers.sort((a, b) => {
      let aSlots: number
      let bSlots: number
      if (a.game === 'csgo') {
        aSlots = a.csgo_settings.slots
      } else if (a.game === 'teamfortress2') {
        aSlots = a.teamfortress2_settings.slots
      } else if (a.game === 'teamspeak3') {
        aSlots = a.teamspeak3_settings.slots
      } else {
        aSlots = a.valheim_settings.slots
      }

      if (b.game === 'csgo') {
        bSlots = b.csgo_settings.slots
      } else if (b.game === 'teamfortress2') {
        bSlots = b.teamfortress2_settings.slots
      } else if (b.game === 'teamspeak3') {
        bSlots = b.teamspeak3_settings.slots
      } else {
        bSlots = b.valheim_settings.slots
      }

      return bSlots - aSlots
    })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  async serverMoved (event: any): Promise<void> {
    clearInterval(this.serverInterval)

    const indexBelow = event.newIndex - 1
    const indexAbove = event.newIndex + 1

    let newSortOrder = 0
    if (typeof this.servers[indexBelow] !== 'undefined') {
      newSortOrder = this.servers[indexBelow].manual_sort_order + 0.5
    } else if (typeof this.servers[indexAbove] !== 'undefined') {
      newSortOrder = this.servers[indexAbove].manual_sort_order - 0.5
    }

    if (newSortOrder !== 0) {
      await this.$dathost.server(this.servers[event.newIndex].id).update(new ServerSettings({
        manualSortOrder: newSortOrder
      }))
    }

    await this.setServerInterval()
  }

  beforeRouteLeave (to: Route, from: Route, next: FunctionConstructor): void {
    clearInterval(this.serverInterval)
    next()
  }

  async setServerInterval (): Promise<void> {
    this.serverInterval = setInterval(async () => {
      await this.getServers(false)
    }, 30000)
  }

  async getServers (showLoading = true): Promise<void> {
    this.serversLoading = showLoading

    // Updates everything all at once instead
    // of showing elements popping in.
    const servers = []
    for await (const server of this.$dathost.servers()) {
      servers.push(server[0])
    }
    this.servers = servers

    // If order func defined, call after updating server list.
    // Easy solution to keeping updated servers filtered correctly.
    if (typeof this.orderFunc !== 'undefined') {
      this.orderFunc()
    }

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
    clearInterval(this.serverInterval)
    await Promise.all(
      this.selectedServerIds.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (serverId) => { (this.$refs[serverId] as any)[0].startServer() }
      )
    ).then(async () => { await this.setServerInterval() })
    this.selectedServerIds = []
  }

  async stopServers (): Promise<void> {
    clearInterval(this.serverInterval)
    await Promise.all(
      this.selectedServerIds.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (serverId) => { (this.$refs[serverId] as any)[0].stopServer() }
      )
    ).then(async () => { await this.setServerInterval() })
    this.selectedServerIds = []
  }

  async restartServers (): Promise<void> {
    clearInterval(this.serverInterval)
    await Promise.all(
      this.selectedServerIds.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (serverId) => { (this.$refs[serverId] as any)[0].restartServer() }
      )
    ).then(async () => { await this.setServerInterval() })
    this.selectedServerIds = []
  }

  async cloneServers (): Promise<void> {
    clearInterval(this.serverInterval)
    await Promise.all(
      this.selectedServerIds.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (serverId) => { (this.$refs[serverId] as any)[0].cloneServer() }
      )
    ).then(async () => { await this.setServerInterval() })
    this.selectedServerIds = []
  }

  async deleteServers (): Promise<void> {
    clearInterval(this.serverInterval)
    await Promise.all(
      this.selectedServerIds.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (serverId) => { (this.$refs[serverId] as any)[0].deleteServer() }
      )
    ).then(async () => { await this.setServerInterval() })
    this.selectedServerIds = []
  }
}
</script>
