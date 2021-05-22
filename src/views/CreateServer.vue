<template>
  <div>
    <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-md-3" v-for="(game, index) in games" :key="index">
                    <div class="card game-select-card" @click="selectedGame = game.name" v-bind:class="{'game-selected': game.name === selectedGame}">
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
                    <li class="active">Plugin Bundles</li>
                    <li>Slots &amp; Tickrate</li>
                    <li>Settings</li>
                    <li>Finished</li>
                </ul>
            </div>
            <!-- End: Steps Progressbar -->
        </div>

        <div class="card-body">
        </div>

        <div class="card-footer">
          <button class="btn btn-primary btn-block" type="button">Next&nbsp;<i class="fa fa-arrow-right"></i></button>
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import VueMixin from '@/mixins/vue'

@Component
export default class CreateServer extends VueMixin {
  games = [
    { name: 'CS: GO', logo: 'csgo' },
    { name: 'Valheim', logo: 'valheim' },
    { name: 'TF2', logo: 'teamfortress2' },
    { name: 'TS3', logo: 'teamspeak3' }
  ]

  selectedGame = null
}
</script>
