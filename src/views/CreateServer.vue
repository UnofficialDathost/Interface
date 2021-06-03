<template>
  <div>
    <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-md-3" v-for="(game, gameCode) in games" :key="gameCode">
                    <div class="card game-select-card" style="cursor: pointer;" @click="changeSelectedGame(gameCode)" v-bind:class="{'game-selected': gameCode === selectedGame}">
                        <div class="card-body d-flex d-xl-flex flex-column justify-content-center align-items-center justify-content-xl-center align-items-xl-center">
                          <img class="game-icon game-select-icon" :src="require(`@/assets/img/games/${gameCode}.svg`)">
                          <h5 style="margin-bottom: 0px;">{{ game.name }}</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-if="selectedGame !== ''" class="card" style="margin-top: 10px;">
        <div class="card-header">
            <!-- Start: Steps Progressbar -->
            <div class="steps-progressbar">
                <ul>
                    <li class="previous">Game</li>
                    <li v-for="(step, index) in games[selectedGame].steps" @click="stepPointClick(index)" :key="index" v-bind:class="{ active: index === currentStep, previous: index < currentStep }" style="cursor: pointer;">{{ step.name }}</li>
                    <li v-bind:class="{ active: currentStep >= games[selectedGame].steps.length }">Finished</li>
                </ul>
            </div>
            <!-- End: Steps Progressbar -->

            <div class="text-center">
              <h5 style="margin: 0px;" v-b-tooltip.hover.top title="Pricing may not be accurate.">Cost:<b-icon scale=".4" icon="info-circle"></b-icon></h5>
              <span>Hourly: {{ ((( selectedGame === 'csgo' && server.tickRate === 64 ? games[selectedGame].cost.perHourLow : games[selectedGame].cost.perHour) * server.slots) * pricingMultiplier).toFixed(2) }}</span> |
              <span>Monthly: {{ (((( selectedGame === 'csgo' && server.tickRate === 64 ? games[selectedGame].cost.perMonthLow : games[selectedGame].cost.perMonth) * server.slots) + extraSpaceCost) * pricingMultiplier).toFixed(2) }}</span> |
              <span>Annually: {{ ((((( selectedGame === 'csgo' && server.tickRate === 64 ? games[selectedGame].cost.perMonthLow : games[selectedGame].cost.perMonth) * server.slots) * 12) + extraSpaceCost) * pricingMultiplier).toFixed(2) }}</span>
            </div>
        </div>

        <template v-if="stepExists()">
          <div v-if="games[selectedGame].steps[currentStep].name === 'Details'" class="card-body d-flex justify-content-center align-self-center flex-column w-50">
              <label for="name">Server Name</label>
              <b-form-input @input="nameValid" v-model="server.name" id="name" placeholder="..."></b-form-input>

              <label style="margin-top:25px;" for="max-disk">Max disk usage</label>
              <b-form-spinbutton v-model="server.maxDiskSpace" :formatter-fn="maxDiskSpaceFormatter" id="max-disk" min="30" max="100"></b-form-spinbutton>

              <label style="margin-top:25px;" for="slots">Max slots</label>
              <b-form-spinbutton v-model="server.slots" :formatter-fn="slotsFormatter" id="slots" :min="games[selectedGame].minSlots" :max="games[selectedGame].maxSlots"></b-form-spinbutton>

              <template v-if="selectedGame === 'csgo'">
                <label style="margin-top:25px;" for="tickrate">Tickrate</label>
                <b-form-spinbutton :value="0" :formatter-fn="tickRateFormatter" id="tickrate" min="0" max="4"></b-form-spinbutton>
              </template>

              <button @click="server.autostop ? server.autostop = false : server.autostop = true" class="btn btn-secondary" style="margin-top:25px;">
                <template v-if="!server.autostop">Enable</template><template v-else>Disable</template> Auto stop
              </button>
              <template v-if="server.autostop">
                <label style="margin-top:10px;" for="autostop">Auto stop</label>
                <b-form-spinbutton v-model="server.autostopMinutes" :formatter-fn="autoStopFormatter" id="autostop" min="1" max="1000"></b-form-spinbutton>
              </template>
          </div>
          <div v-else-if="games[selectedGame].steps[currentStep].name === 'Location'" class="card-body">
            <ServerLocations @locationSelected="setLocation" />
          </div>

          <div class="card-footer">
            <button v-if="checkStep(currentStep)" @click="currentStep += 1" class="btn btn-primary btn-block" type="button">Next&nbsp;<b-icon icon="arrow-right"></b-icon></button>
            <button v-else class="btn btn-primary btn-block" disabled type="button">Next&nbsp;<b-icon icon="arrow-right"></b-icon></button>
          </div>
        </template>
        <template v-else>
          <div class="card-body"></div>
          <div class="card-footer">
            <button class="btn btn-primary btn-block" type="button">Create Server&nbsp;<b-icon icon="plus"></b-icon></button>
          </div>
        </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator'
import VueMixin from '@/mixins/vue'
import ServerLocations from '@/components/server-locations.vue'

@Component({
  components: { ServerLocations }
})
export default class CreateServerView extends VueMixin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  games: Record<string, any> = {
    csgo: {
      name: 'CS: GO',
      steps: [
        { name: 'Details', required: true, completed: false },
        { name: 'Location', required: true, completed: false }
      ],
      maxSlots: 64,
      minSlots: 5,
      cost: {
        perHour: 0.033,
        perHourLow: 0.025,
        perMonth: 0.99,
        perMonthLow: 0.75
      }
    },
    valheim: {
      name: 'Valheim',
      steps: [
        { name: 'Details', required: true, completed: false },
        { name: 'Location', required: true, completed: false }
      ],
      maxSlots: 10,
      minSlots: 10,
      cost: {
        perHour: 0.033,
        perMonth: 0.99
      }
    },
    teamfortress2: {
      name: 'TF2',
      steps: [
        { name: 'Details', required: true, completed: false },
        { name: 'Location', required: true, completed: false }
      ],
      maxSlots: 32,
      minSlots: 5,
      cost: {
        perHour: 0.025,
        perMonth: 0.75
      }
    },
    teamspeak3: {
      name: 'TS3',
      steps: [
        { name: 'Details', required: true, completed: false },
        { name: 'Location', required: true, completed: false }
      ],
      maxSlots: 1000,
      minSlots: 5,
      cost: {
        perHour: 0.01,
        perMonth: 0.3
      }
    }
  }

  currentStep = 0

  selectedGame = ''

  server = {
    name: '',
    maxDiskSpace: 30,
    slots: 5,
    autostop: false,
    autostopMinutes: 5,
    tickRate: 64,
    location: ''
  }

  tickRates = [64, 85, 100, 102.4, 128]

  extraSpaceCost = 0
  pricingMultiplier = 1

  @Watch('server.maxDiskSpace')
  watchMaxDiskSpace (): void {
    this.extraSpaceCost = (this.server.maxDiskSpace - 30) * 0.5
  }

  setLocation (location: string, pricingMultiplier: number): void {
    this.server.location = location
    this.pricingMultiplier = pricingMultiplier
    this.games[this.selectedGame].steps[this.currentStep].completed = true
  }

  checkStep (index: number): boolean {
    if (this.selectedGame !== '' && this.selectedGame in this.games) {
      const currentStepIndex = this.games[this.selectedGame].steps[index]
      return (currentStepIndex.required && currentStepIndex.completed) || !currentStepIndex.required
    }
    return false
  }

  stepPointClick (index: number): void {
    if (this.checkStep(index)) {
      this.currentStep = index
    }
  }

  nameValid (): void {
    if (this.server.name) {
      this.games[this.selectedGame].steps[this.currentStep].completed = true
    } else {
      this.games[this.selectedGame].steps[this.currentStep].completed = false
    }
  }

  stepExists (): boolean {
    return typeof this.games[this.selectedGame].steps[this.currentStep] !== 'undefined'
  }

  changeSelectedGame (game: string): void {
    if (this.server.name !== '') {
      this.$bvModal.msgBoxConfirm('You have started to create a server already, changing game will clear everything.', {
        title: 'You are about to lose your progress!',
        okTitle: 'Lose my progress',
        okVariant: 'secondary',
        cancelVariant: 'primary',
        headerClass: 'p-2 border-bottom-0',
        footerClass: 'p-2 border-top-0',
        centered: true
      }).then(value => {
        if (value) {
          this.selectedGame = game
          this.resetEverything()
        }
      })
    } else {
      this.selectedGame = game
      this.resetEverything()
    }
  }

  resetEverything (): void {
    this.extraSpaceCost = 0
    this.pricingMultiplier = 1
    this.currentStep = 0
    this.server = {
      name: '',
      maxDiskSpace: 30,
      slots: 5,
      autostop: false,
      autostopMinutes: 5,
      tickRate: 64,
      location: ''
    }
  }

  maxDiskSpaceFormatter (value: number): string {
    return `${value} GB`
  }

  slotsFormatter (value: number): string {
    return `${value} Slots`
  }

  autoStopFormatter (value: number): string {
    return `${value} Minutes`
  }

  tickRateFormatter (value: number): string {
    this.server.tickRate = this.tickRates[value]
    return `${this.tickRates[value]} Tick`
  }
}
</script>
