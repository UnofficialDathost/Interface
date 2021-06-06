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
    @filterByNothing="filterByNothing"
    @filterByServerbooting="filterByServerBooting"
    @filterByServeron="filterByServerOn"
    @filterByServeroff="filterByServerOff"
    @filterByAutostopon="filterByAutostopOn"
    @filterByAutostopoff="filterByAutostopOff"
    @filterByPlayersonline="filterByPlayersOnline"
    v-model="serverSearch"/>
    <div v-if="serversLoading" class="d-flex justify-content-center mb-3">
      <b-spinner style="width: 6rem; height: 6rem; margin-top: 25px;" label="Loading..."></b-spinner>
    </div>
    <div v-else>
      <template v-if="serversDisplay.length === 0">
        <h3 class="text-center" style="margin-top:25px;">No result...</h3>
      </template>
      <draggable v-else @end="serverMoved" :delay=".3" :force-fallback="true" ghost-class="ghost" drag-class="moved" draggable=".draggable-server" :list="serversDisplay" class="row gutter-2">
        <ServerCardComp class="draggable-server" :ref="server.id" @serverClicked="selectServer" :selected="selectedServerIds.includes(server.id)"
         @serverAdded="addServer" @serverCloned="addCloneDecoy" v-for="server in serversDisplay" :key="server.id" :serverData="server" />

        <ServerCardComp v-for="(server, index) in clonedServers" :key="'clone-'+index" :serverData="server" :cloned="true" />
      </draggable>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator'
import { Route } from 'vue-router/types'
import draggable from 'vuedraggable'
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
  serversDisplay: IServer[] = []

  clonedServers: IServer[] = []
  serverSearch = ''
  selectedServerIds: string[] = []
  serversLoading = true
  beingManged = false
  serverInterval: ReturnType<typeof setInterval>
  orderFunc?: CallableFunction | null = null
  filterFunc?: CallableFunction | null = null

  async mounted (): Promise<void> {
    await this.getServers()
    await this.setServerInterval()
  }

  @Watch('serverSearch')
  async serverSearchChange (): Promise<void> {
    clearInterval(this.serverInterval)

    if (this.serverSearch !== '') {
      this.serversDisplay = this.serversDisplay.filter((server) => {
        return this.searchHelper(this.serverSearch, server.name) || this.searchHelper(this.serverSearch, server.location
        ) || this.searchHelper(this.serverSearch, server.game) || this.searchHelper(this.serverSearch, server.id)
      })
      this.servers = this.serversDisplay
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

    this.serversDisplay.sort((a, b) => {
      return a.manual_sort_order - b.manual_sort_order
    })
  }

  orderByCost (): void {
    this.orderFunc = this.orderByCost

    this.serversDisplay.sort((a, b) => {
      return b.max_cost_per_month - a.max_cost_per_month
    })
  }

  orderByName (): void {
    this.orderFunc = this.orderByName

    this.serversDisplay.sort((a, b) => {
      return a.name < b.name ? -1 : 1
    })
  }

  orderBySlots (): void {
    this.orderFunc = this.orderBySlots

    this.serversDisplay.sort((a, b) => {
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

  filterByNothing (): void {
    this.filterFunc = null
    this.serversDisplay = this.servers
  }

  filterByServerBooting (): void {
    this.filterFunc = this.filterByServerBooting
    this.serversDisplay = this.servers

    this.serversDisplay = this.servers.filter(server => {
      return server.booting === true
    })
  }

  filterByServerOn (): void {
    this.filterFunc = this.filterByServerOn
    this.serversDisplay = this.servers

    this.serversDisplay = this.servers.filter(server => {
      return server.on === true
    })
  }

  filterByServerOff (): void {
    this.filterFunc = this.filterByServerOff
    this.serversDisplay = this.servers

    this.serversDisplay = this.servers.filter(server => {
      return server.on === false
    })
  }

  filterByAutostopOn (): void {
    this.filterFunc = this.filterByAutostopOn
    this.serversDisplay = this.servers

    this.serversDisplay = this.servers.filter(server => {
      return server.autostop === true
    })
  }

  filterByAutostopOff (): void {
    this.filterFunc = this.filterByAutostopOff
    this.serversDisplay = this.servers

    this.serversDisplay = this.servers.filter(server => {
      return server.autostop !== true
    })
  }

  filterByPlayersOnline (): void {
    this.filterFunc = this.filterByPlayersOnline
    this.serversDisplay = this.servers

    this.serversDisplay = this.servers.filter(server => {
      return server.players_online > 0
    })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  async serverMoved (event: any): Promise<void> {
    if (event.newIndex !== event.oldIndex && typeof this.serversDisplay[event.oldIndex] !== 'undefined') {
      clearInterval(this.serverInterval)

      const indexBelow = event.newIndex + 1
      const indexAbove = event.newIndex - 1

      let newSortOrder: number
      if (typeof this.serversDisplay[indexAbove] === 'undefined') {
        if (typeof this.serversDisplay[indexBelow] !== 'undefined') {
          newSortOrder = this.serversDisplay[indexBelow].manual_sort_order - 0.5
        } else {
          newSortOrder = this.serversDisplay[event.newIndex].manual_sort_order
        }
      } else {
        if (typeof this.serversDisplay[indexBelow] !== 'undefined') {
          newSortOrder = Math.random() * (this.serversDisplay[indexAbove].manual_sort_order - this.serversDisplay[indexBelow].manual_sort_order) + this.serversDisplay[indexBelow].manual_sort_order
        } else {
          newSortOrder = this.serversDisplay[indexAbove].manual_sort_order + 0.5
        }
      }

      // For some reason draggable gives us the wrong index randomly.
      // sometimes the index is one off, this only occurs when a item is moved to the very list item.
      let serverIndex: number
      if (typeof this.serversDisplay[event.newIndex] === 'undefined') {
        serverIndex = event.newIndex - 1
      } else {
        serverIndex = event.newIndex
      }

      this.serversDisplay[serverIndex].manual_sort_order = newSortOrder

      await this.$dathost.server(this.serversDisplay[serverIndex].id).update(new ServerSettings({
        manualSortOrder: newSortOrder
      }))

      await this.setServerInterval()
    }
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
    this.serversDisplay = servers
    this.servers = servers

    // If order func defined, call after updating server list.
    // Easy solution to keeping updated servers filtered correctly.
    if (this.orderFunc != null) {
      this.orderFunc()
    }

    if (this.filterFunc != null) {
      this.filterFunc()
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
    this.serversDisplay.push(server)
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
