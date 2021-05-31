<template>
  <div>
    <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-md-3" v-for="(game, index) in games" :key="index">
                    <div class="card game-select-card" style="cursor: pointer;" @click="selectedGame = game.name" v-bind:class="{'game-selected': game.name === selectedGame}">
                        <div class="card-body d-flex d-xl-flex flex-column justify-content-center align-items-center justify-content-xl-center align-items-xl-center">
                          <img class="game-icon game-select-icon" :src="require(`@/assets/img/games/${game.logo}.svg`)">
                          <h5 style="margin-bottom: 0px;">{{ game.name }}</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-if="selectedGame != null" class="card" style="margin-top: 10px;">
        <div class="card-header">
            <!-- Start: Steps Progressbar -->
            <div class="steps-progressbar">
                <ul>
                    <li class="previous">Game</li>
                    <li v-for="(step, index) in steps" @click="stepPointClick(index)" :key="index" v-bind:class="{ active: index === currentStep, previous: index < currentStep }" style="cursor: pointer;">{{ step.name }}</li>
                    <li>Finished</li>
                </ul>
            </div>
            <!-- End: Steps Progressbar -->
        </div>

        <div class="card-body">
        </div>

        <div class="card-footer">
          <template v-if="currentStep < steps.length">
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
  games = [
    { name: 'CS: GO', logo: 'csgo' },
    { name: 'Valheim', logo: 'valheim' },
    { name: 'TF2', logo: 'teamfortress2' },
    { name: 'TS3', logo: 'teamspeak3' }
  ]

  steps = [
    { name: 'Plugin Bundles', required: false, completed: false },
    { name: 'Slots & Tickrate', required: true, completed: false },
    { name: 'Settings', required: true, completed: false }
  ]

  currentStep = 0

  selectedGame = null

  checkStep (index: number): boolean {
    return (this.steps[index].required && this.steps[index].completed) || !this.steps[index].required
  }

  stepPointClick (index: number): void {
    if (this.checkStep(index)) {
      this.currentStep = index
    }
  }
}
</script>
