<template>
  <div class="home">
    <ActionCard />
    <div v-if="serversLoading" class="d-flex justify-content-center mb-3">
      <b-spinner style="width: 6rem; height: 6rem; margin-top: 25px;" label="Loading..."></b-spinner>
    </div>
    <div v-else class="row gutter-2">
      <div v-for="(server, index) in servers" :key="index" class="col-md-4">
        <ServerCard :server="server" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import VueMixin from '@/mixins/vue'

import { IServer } from 'dathost/src/interfaces/server'

import ActionCard from '@/components/action-card.vue'
import ServerCard from '@/components/server-card.vue'

@Component({
  components: {
    ActionCard,
    ServerCard
  }
})
export default class Home extends VueMixin {
  servers: IServer[] = []
  serversLoading = true

  async mounted (): Promise<void> {
    await this.getServers()
  }

  async getServers (): Promise<void> {
    this.serversLoading = true

    for await (const server of this.$dathost.servers()) {
      this.servers.push(server[0])
    }

    this.serversLoading = false
  }
}
</script>
