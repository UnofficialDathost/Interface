<template>
  <div class="row">
      <div class="col-md-8 col-xl-9">
        <ServerLocationsComp v-if="selectedTab === 'location'" @locationSelected="setLocation" :currentRegion="currentRegion" />
      </div>
      <div class="col-md-4 col-xl-3">
          <div class="card">
              <div class="card-body" style="padding: 0px;">
                <span v-for="tab in tabs" :key="tab" @click="selectedTab = tab" v-bind:class="{ 'active-right': selectedTab === tab }" style="cursor: pointer;" class="text-capitalize d-flex d-xl-flex align-items-center align-items-xl-center side-option side-option-large">&nbsp;{{ tab }}</span>
              </div>
          </div>
      </div>
  </div>
</template>

<script lang="ts">
import VueMixin from '@/mixins/vue'
import { Component, Prop } from 'vue-property-decorator'

import ServerLocationsComp from '@/components/server-locations.vue'

import { IServer } from 'dathost/src/interfaces/server'
import ServerSettings from 'dathost/src/settings/server'
import Server from 'dathost/src/server'

@Component({
  name: 'ServerSettings',
  components: { ServerLocationsComp }
})
export default class ServerSettingsComp extends VueMixin {
  @Prop({ type: Object })
  server: IServer

  @Prop({ type: Object })
  serverObj: Server

  selectedTab = 'location'
  tabs = [
    'location',
    'slots',
    'name',
    'rcon',
    'password',
    'domain'
  ]

  currentRegion = ''

  mounted (): void {
    this.currentRegion = this.server.location
  }

  async setLocation (location: string): Promise<void> {
    this.currentRegion = location
    await this.serverObj.update(new ServerSettings({ location: location }))
  }
}
</script>
