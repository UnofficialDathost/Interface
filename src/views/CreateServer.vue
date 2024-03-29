<template>
  <div>
    <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-md-3" v-for="(game, gameCode) in games" :key="gameCode">
                    <div class="card game-select-card" style="cursor: pointer;" @click="changeSelectedGame(gameCode)" v-bind:class="{'game-selected': gameCode === selectedGame}">
                        <div class="card-body d-flex d-xl-flex flex-column justify-content-center align-items-center justify-content-xl-center align-items-xl-center" style="background-color: var(--dathost-dark-dark);">
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

        <template v-if="!creatingServer">
          <div v-if="games[selectedGame].steps[currentStep].name === 'Details'" class="card-body d-flex justify-content-center align-self-center flex-column w-50">
              <label for="name">Server Name</label>
              <b-form-input @input="stepValid" v-model="server.name" id="name" placeholder="..."></b-form-input>

              <label style="margin-top:25px;" for="max-disk">Max disk usage</label>
              <b-form-spinbutton v-model="server.maxDiskSpace" :formatter-fn="maxDiskSpaceFormatter" id="max-disk" min="30" max="100"></b-form-spinbutton>

              <label style="margin-top:25px;" for="slots">Max slots</label>
              <b-form-spinbutton v-model="server.slots" :formatter-fn="slotsFormatter" id="slots" :min="games[selectedGame].minSlots" :max="games[selectedGame].maxSlots"></b-form-spinbutton>

              <template v-if="selectedGame === 'csgo'">
                <label style="margin-top:25px;" for="tickrate">Tickrate</label>
                <b-form-spinbutton :value="0" :formatter-fn="tickRateFormatter" id="tickrate" min="0" max="4"></b-form-spinbutton>

                <label style="margin-top:25px;" for="rcon">Rcon</label>
                <b-form-input @input="stepValid" v-model="server.rcon" id="rcon" placeholder="..."></b-form-input>
              </template>

              <button @click="server.autostop ? server.autostop = false : server.autostop = true" class="btn btn-secondary" style="margin-top:25px;">
                <template v-if="!server.autostop">Enable</template><template v-else>Disable</template> Auto stop
              </button>
              <template v-if="server.autostop">
                <label style="margin-top:10px;" for="autostop">Auto stop</label>
                <b-form-spinbutton v-model="server.autostopMinutes" :formatter-fn="autoStopFormatter" id="autostop" min="1" max="1000"></b-form-spinbutton>
              </template>
          </div>

          <div v-else-if="games[selectedGame].steps[currentStep].name === 'GSLT Token'" class="card-body d-flex justify-content-center align-self-center flex-column w-50">
              <label for="gslt">GSLT Token</label>
              <div class="d-flex">
                <b-form-input @input="games[selectedGame].steps[currentStep].completed = true" v-model="server.gameToken" id="gslt" placeholder="..."></b-form-input>
                <button v-if="$steam" @click="generateGsltToken()" class="btn btn-primary" style="width: 30%;" type="button">
                  <template v-if="creatingToken">
                    <span><b-spinner label="Spinning" style="width: 1.4em; height: 1.4em;"></b-spinner> Generating</span>
                  </template>
                  <template v-else>Generate</template>
                </button>
              </div>
              <a style="margin-bottom:0px;margin-top:10px;" href="https://steamcommunity.com/dev/managegameservers" target="_blank" rel="noopener noreferrer">Server Account Management</a>
          </div>

          <div v-else-if="games[selectedGame].steps[currentStep].name === 'Location'" class="card-body">
            <ServerLocationsComp @locationSelected="setLocation" />
          </div>

          <div class="card-footer">
            <template v-if="!nextStepExist()">
              <button v-if="checkStep(currentStep)" @click="createServer(); currentStep += 1" class="btn btn-primary btn-block" type="button">Create Server&nbsp;<b-icon icon="plus"></b-icon></button>
              <button v-else disabled class="btn btn-primary btn-block" type="button">Create Server&nbsp;<b-icon icon="plus"></b-icon></button>
            </template>
            <template v-else>
              <button v-if="checkStep(currentStep)" @click="currentStep += 1" class="btn btn-primary btn-block" type="button">Next&nbsp;<b-icon icon="arrow-right"></b-icon></button>
              <button v-else class="btn btn-primary btn-block" disabled type="button">Next&nbsp;<b-icon icon="arrow-right"></b-icon></button>
            </template>
          </div>
        </template>
        <div v-else class="card-body text-center">
          <b-spinner style="width: 8rem; height: 8rem; margin: 25px 0;" label="Loading..."></b-spinner>
          <h4>Creating Server...</h4>
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator'
import VueMixin from '@/mixins/vue'
import ServerLocationsComp from '@/components/server-locations.vue'

import ServerSettings from 'dathost/src/settings/server'

@Component({
  components: { ServerLocationsComp }
})
export default class CreateServerView extends VueMixin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  games: Record<string, any> = {
    csgo: {
      name: 'CS: GO',
      steps: [
        { name: 'Details', required: true, completed: false },
        { name: 'GSLT Token', required: true, completed: false },
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
    location: '',
    rcon: '',
    gameToken: ''
  }

  tickRates = [64, 85, 100, 102.4, 128]
  creatingServer = false
  creatingToken = false

  extraSpaceCost = 0
  pricingMultiplier = 1

  async createServer (): Promise<void> {
    this.creatingServer = true

    const settings = new ServerSettings({
      name: this.server.name,
      maxDiskUsageGb: this.server.maxDiskSpace,
      autostop: this.server.autostop,
      autostopMinutes: this.server.autostopMinutes,
      location: this.server.location
    })

    if (this.selectedGame === 'csgo') {
      settings.csgo({
        tickrate: this.server.tickRate,
        rconPassword: this.server.rcon,
        gameToken: this.server.gameToken
      })
    } else if (this.selectedGame === 'valheim') {
      settings.valheim()
    } else if (this.selectedGame === 'teamfortress2') {
      settings.tf2()
    } else {
      settings.teamspeak()
    }

    this.$bvToast.toast(`Creating ${this.server.name}`, {
      noCloseButton: true,
      title: '',
      toaster: 'b-toaster-bottom-right'
    })

    const server = await this.$dathost.createServer(settings)

    this.$bvToast.toast(`${this.server.name} Created`, {
      noCloseButton: true,
      title: '',
      headerClass: 'toast-header-competed',
      toaster: 'b-toaster-bottom-right'
    })

    this.$router.push({ name: 'Server', params: { serverId: server[0].id, tab: 'status' } })
  }

  async generateGsltToken (): Promise<void> {
    if (this.$steam) {
      this.creatingToken = true

      this.$bvToast.toast(`Creating GSLT token for ${this.server.name}`, {
        noCloseButton: true,
        title: '',
        toaster: 'b-toaster-bottom-right'
      })

      this.server.gameToken = (await this.$steam.generateGsltToken(730, `${this.server.name}, by dathost`)).token

      this.$bvToast.toast('GSLT token created', {
        noCloseButton: true,
        title: '',
        headerClass: 'toast-header-competed',
        toaster: 'b-toaster-bottom-right'
      })

      this.creatingToken = false
      this.games[this.selectedGame].steps[this.currentStep].completed = true
    }
  }

  @Watch('server.maxDiskSpace')
  watchMaxDiskSpace (): void {
    this.extraSpaceCost = (this.server.maxDiskSpace - 30) * 0.5
  }

  nextStepExist (): boolean {
    return typeof this.games[this.selectedGame].steps[this.currentStep + 1] !== 'undefined'
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

  stepValid (): void {
    if ((this.server.name && this.selectedGame !== 'csgo') || (this.selectedGame === 'csgo' && this.server.name && this.server.rcon)) {
      this.games[this.selectedGame].steps[this.currentStep].completed = true
    } else {
      this.games[this.selectedGame].steps[this.currentStep].completed = false
    }
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
    this.creatingServer = false
    this.currentStep = 0
    this.server = {
      name: '',
      maxDiskSpace: 30,
      slots: 5,
      autostop: false,
      autostopMinutes: 5,
      tickRate: 64,
      location: '',
      rcon: '',
      gameToken: ''
    }

    for (const game in this.games) {
      for (const step of this.games[game].steps) {
        step.completed = false
      }
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
