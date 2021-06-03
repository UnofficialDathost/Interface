<template>
  <div>
    <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-md-3" v-for="(game, gameCode) in games" :key="gameCode">
                    <div class="card game-select-card" style="cursor: pointer;" @click="selectedGame = gameCode" v-bind:class="{'game-selected': gameCode === selectedGame}">
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
                    <li>Finished</li>
                </ul>
            </div>
            <!-- End: Steps Progressbar -->
        </div>

        <div class="card-body d-flex justify-content-center align-self-center flex-column w-50">
            <template v-if="games[selectedGame].steps[currentStep].name === 'Details'">
              <label for="name">Server Name</label>
              <b-form-input id="name" placeholder="..."></b-form-input>

              <label style="margin-top:25px;" for="max-disk">Max disk usage</label>
              <b-form-spinbutton v-model="server.maxDiskSpace" :formatter-fn="maxDiskSpaceFormatter" id="max-disk" min="30" max="100"></b-form-spinbutton>

              <label style="margin-top:25px;" for="slots">Max disk usage</label>
              <b-form-spinbutton v-model="server.slots" :formatter-fn="slotsFormatter" id="slots" min="5" max="30"></b-form-spinbutton>
            </template>
        </div>

        <div class="card-footer">
          <template v-if="currentStep < games[selectedGame].steps.length">
            <button v-if="checkStep(currentStep)" @click="currentStep += 1" class="btn btn-primary btn-block" type="button">Next&nbsp;<b-icon icon="arrow-right"></b-icon></button>
            <button v-else class="btn btn-primary btn-block" disabled type="button">Next&nbsp;<b-icon icon="arrow-right"></b-icon></button>
          </template>
          <button v-else class="btn btn-primary btn-block" type="button">Create Server&nbsp;<b-icon icon="plus"></b-icon></button>
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import VueMixin from '@/mixins/vue'

@Component
export default class CreateServerView extends VueMixin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  games: Record<string, any> = {
    csgo: {
      name: 'CS: GO',
      steps: [
        { name: 'Details', required: true, completed: false },
        { name: 'Location', required: true, completed: false }
      ]
    },
    valheim: {
      name: 'Valheim',
      steps: [
        { name: 'Details', required: true, completed: false },
        { name: 'Location', required: true, completed: false }
      ]
    },
    teamfortress2: {
      name: 'TF2',
      steps: [
        { name: 'Details', required: true, completed: false },
        { name: 'Location', required: true, completed: false }
      ]
    },
    teamspeak3: {
      name: 'TS3',
      steps: [
        { name: 'Details', required: true, completed: false },
        { name: 'Location', required: true, completed: false }
      ]
    }
  }

  currentStep = 0

  selectedGame = ''

  server = {
    maxDiskSpace: 30,
    slots: 5
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

  maxDiskSpaceFormatter (value: number): string {
    return `${value} GB`
  }

  slotsFormatter (value: number): string {
    return `${value} Players`
  }
}
</script>
