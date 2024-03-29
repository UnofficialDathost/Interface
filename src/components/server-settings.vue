<template>
  <div class="row">
      <div class="col-md-8 col-xl-9">
        <ServerLocationsComp v-if="selectedTab === 'location'" @locationSelected="setLocation" :currentRegion="server.location" />
      </div>
      <div class="col-md-4 col-xl-3">
          <div class="card" style="height: 100%;">
              <div class="card-body" style="padding: 0px;background-color: var(--dathost-dark-dark);">
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

  async setLocation (location: string): Promise<void> {
    this.server.location = location

    this.$bvToast.toast(`Setting location to ${location.replaceAll('_', ' ')}`, {
      noCloseButton: true,
      title: '',
      toaster: 'b-toaster-bottom-right'
    })

    await this.serverObj.update(new ServerSettings({ location: location }))

    this.$bvToast.toast('Region changed', {
      noCloseButton: true,
      title: '',
      headerClass: 'toast-header-competed',
      toaster: 'b-toaster-bottom-right'
    })
  }
}
</script>
