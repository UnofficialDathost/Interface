<template>
    <div class="row">
        <div v-for="(location, index) in locations" :key="index" class="col-md-3">
            <div class="card location-card" v-bind:class="{ 'game-selected': selectedLocation === location.id }" @click="selectedLocation = location.id; $emit('locationSelected', location.id)">
                <div class="card-header">
                  <div class="row">
                      <div class="col-md-6">
                          <p v-if="location.ping !== 0" style="margin: 0px;">{{ location.ping }} ms ping</p>
                          <template v-else>
                            <b-spinner label="Spinning" style="width: 1.4em; height: 1.4em;"></b-spinner> Calculating ping
                          </template>
                      </div>
                      <div class="col-md-6 d-flex justify-content-end">
                        <img class="flag" :src="`https://cdn.dathost.net/assets/img/flags/${location.id}.gif`">
                      </div>
                  </div>
                </div>
                <div class="card-body">
                  <h6 style="margin: 0px;">{{ location.html }}</h6>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import VueMixin from '@/mixins/vue'
import Component from 'vue-class-component'

import { WebsocketBuilder } from 'websocket-ts'

@Component({ name: 'ServerLocations' })
export default class DisclaimerComp extends VueMixin {
  locations = [
    { html: 'Düsseldorf, Germany', id: 'dusseldorf', pingtest: 'tyrion', ping: 0 },
    { html: 'Strasbourg, France', id: 'strasbourg', pingtest: 'luwin', ping: 0 },
    { html: 'Bristol, UK', id: 'bristol', pingtest: 'sansa', ping: 0 },
    { html: 'Barcelona, Spain', id: 'barcelona', pingtest: 'osha', ping: 0 },
    { html: 'Sydney, Australia', id: 'sydney', pingtest: 'ygritte', ping: 0 },
    { html: 'Stockholm, Sweden', id: 'stockholm', pingtest: 'jaqen', ping: 0 },
    { html: 'Warsaw, Poland', id: 'warsaw', pingtest: 'alliser', ping: 0 },
    { html: 'Amsterdam, Netherlands', id: 'amsterdam', pingtest: 'joffrey', ping: 0 },
    { html: 'Moscow, Russia', id: 'moscow', pingtest: 'grey', ping: 0 },
    { html: 'Istanbul, Turkey', id: 'istanbul', pingtest: 'pypar', ping: 0 },
    { html: 'Singapore, Singapore', id: 'singapore', pingtest: 'umber', ping: 0 },
    { html: 'Los Angeles, CA, USA', id: 'los_angeles', pingtest: 'cersei', ping: 0 },
    { html: 'Dallas, TX, USA', id: 'dallas', pingtest: 'jaime', ping: 0 },
    { html: 'Chicago, IL, USA', id: 'chicago', pingtest: 'gilly', ping: 0 },
    { html: 'Portland, OR, USA', id: 'portland', pingtest: 'marillion', ping: 0 },
    { html: 'New York City, NY, USA', id: 'new_york_city', pingtest: 'hodor', ping: 0 },
    { html: 'São Paulo, Brazil', id: 'sao_paulo', pingtest: 'edmure', ping: 0 }
  ]

  selectedLocation = null

  mounted (): void {
    for (const location of this.locations) {
      let startTime: Date
      new WebsocketBuilder(`wss://${location.pingtest}.dathost.net/console-server/`
      ).onOpen((i) => {
        startTime = new Date()
        i.send(JSON.stringify({ cmd: 'datPing' }))
      }).onMessage((i, ev) => {
        if (JSON.parse(ev.data).cmd === 'datPong') {
          location.ping = new Date().getTime() - startTime.getTime()

          this.locations.sort((a, b) => {
            if (b.ping === 0) {
              return -1
            }
            return a.ping - b.ping
          })
        }
        i.close()
      }).build()
    }
  }
}
</script>
