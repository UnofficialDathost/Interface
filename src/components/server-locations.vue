<template>
    <div class="row">
        <div v-for="(location, index) in locations" :key="index" class="col-md-3" style="cursor: pointer;">
            <div class="card location-card" v-bind:class="{ 'game-selected': selectedLocation === location.id || (currentRegion === location.id && !selectedLocation) }" @click="selectedLocation = location.id; $emit('locationSelected', location.id, location.pricingMultiplier)">
                <div class="card-header">
                  <div class="row">
                      <div class="col-md-8">
                          <p v-if="location.ping !== 0" style="margin: 0px;">{{ location.ping }} ms ping</p>
                          <template v-else>
                            <p style="margin: 0px;"><b-spinner label="Spinning" style="width: 1.4em; height: 1.4em;"></b-spinner> Fetching ping</p>
                          </template>
                      </div>
                      <div class="col-md-4 d-flex justify-content-end">
                        <img class="flag" :src="`https://cdn.dathost.net/assets/img/flags/${location.id}.gif`">
                      </div>
                  </div>
                </div>
                <div class="card-body d-flex justify-content-between">
                  <h6 style="margin: 0px;">{{ location.name }}</h6>
                  <b-badge v-if="location.pricingMultiplier !== 1" variant="warning">Increases cost</b-badge>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import VueMixin from '@/mixins/vue'
import { Component, Prop } from 'vue-property-decorator'

import { WebsocketBuilder } from 'websocket-ts'

@Component({ name: 'ServerLocations' })
export default class ServerLocationsComp extends VueMixin {
  @Prop({ type: String, default: '' })
  currentRegion: string

  locations = [
    { name: 'Düsseldorf, Germany', id: 'dusseldorf', console: 'tyrion', ping: 0, pricingMultiplier: 1 },
    { name: 'Strasbourg, France', id: 'strasbourg', console: 'luwin', ping: 0, pricingMultiplier: 1 },
    { name: 'Bristol, UK', id: 'bristol', console: 'sansa', ping: 0, pricingMultiplier: 1 },
    { name: 'Barcelona, Spain', id: 'barcelona', console: 'osha', ping: 0, pricingMultiplier: 1 },
    { name: 'Sydney, Australia', id: 'sydney', console: 'ygritte', ping: 0, pricingMultiplier: 1 },
    { name: 'Stockholm, Sweden', id: 'stockholm', console: 'jaqen', ping: 0, pricingMultiplier: 1 },
    { name: 'Warsaw, Poland', id: 'warsaw', console: 'alliser', ping: 0, pricingMultiplier: 1 },
    { name: 'Amsterdam, Netherlands', id: 'amsterdam', console: 'joffrey', ping: 0, pricingMultiplier: 1 },
    { name: 'Moscow, Russia', id: 'moscow', console: 'grey', ping: 0, pricingMultiplier: 1 },
    { name: 'Istanbul, Turkey', id: 'istanbul', console: 'pypar', ping: 0, pricingMultiplier: 1 },
    { name: 'Singapore, Singapore', id: 'singapore', console: 'umber', ping: 0, pricingMultiplier: 1 },
    { name: 'Los Angeles, CA, USA', id: 'los_angeles', console: 'cersei', ping: 0, pricingMultiplier: 1 },
    { name: 'Dallas, TX, USA', id: 'dallas', console: 'jaime', ping: 0, pricingMultiplier: 1 },
    { name: 'Chicago, IL, USA', id: 'chicago', console: 'gilly', ping: 0, pricingMultiplier: 1 },
    { name: 'Portland, OR, USA', id: 'portland', console: 'marillion', ping: 0, pricingMultiplier: 1 },
    { name: 'New York City, NY, USA', id: 'new_york_city', console: 'hodor', ping: 0, pricingMultiplier: 1 },
    { name: 'São Paulo, Brazil', id: 'sao_paulo', console: 'edmure', ping: 0, pricingMultiplier: 1.75 }
  ]

  selectedLocation = null

  mounted (): void {
    for (const location of this.locations) {
      let startTime: Date
      new WebsocketBuilder(`wss://${location.console}.dathost.net/console-server/`
      ).onOpen((i) => {
        startTime = new Date()
        i.send(JSON.stringify({ cmd: 'datPing' }))
      }).onMessage((i, ev) => {
        if (JSON.parse(ev.data).cmd === 'datPong') {
          location.ping = new Date().getTime() - startTime.getTime()

          this.locations.sort((a, b) => {
            if (a.ping !== 0) {
              if (b.ping !== 0) {
                return a.ping - b.ping
              } else {
                return -1
              }
            } else {
              return 1
            }
          })
        }
        i.close()
      }).build()
    }
  }
}
</script>
