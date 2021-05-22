<template>
    <div class="card game-card">
        <div class="card-header">
            <div class="row">
                <div class="col-md-6 d-xl-flex justify-content-xl-start align-items-xl-center"><img class="game-icon" src="https://cdn.dathost.net/assets/img/game_icons/csgo.svg"></div>
                <div class="col-md-6 d-xl-flex justify-content-xl-end align-items-xl-center">
                    <h6 class="game-name">&nbsp;Retake #1</h6>
                </div>
            </div>
        </div>
        <div class="card-body d-flex d-xl-flex flex-column justify-content-center justify-content-xl-center">
            <div class="row">
                <div class="col-md-6 col-xl-4 d-xl-flex justify-content-xl-start">
                    <p><b-icon icon="compass"></b-icon>&nbsp;Sydney&nbsp;</p>
                </div>
                <div class="col-md-6 col-xl-4 d-xl-flex justify-content-xl-center">
                    <p><b-icon icon="people"></b-icon>&nbsp;12 slots</p>
                </div>
                <div class="col-md-6 col-xl-4 d-xl-flex justify-content-xl-end">
                    <p><b-icon icon="lightning"></b-icon>&nbsp;0.0 / 11.8</p>
                </div>
            </div>
            <div class="btn-group" role="group"><button class="btn btn-primary" type="button"><i class="fa fa-play-circle-o"></i>&nbsp;Start</button>
                <div class="dropdown btn-group" role="group"><button class="btn btn-secondary dropdown-toggle" aria-expanded="false" data-toggle="dropdown" type="button"><i class="fa fa-share-alt"></i>&nbsp;Connect</button>
                    <div class="dropdown-menu"><a class="dropdown-item" href="#"><i class="fa fa-external-link"></i>&nbsp;Connect</a><a class="dropdown-item" href="#"><i class="fa fa-clipboard"></i>&nbsp;Dathost IP</a><a class="dropdown-item" href="#"><i class="fa fa-clipboard"></i>&nbsp;Raw IP</a><a class="dropdown-item" href="#"><i class="fa fa-clipboard"></i>&nbsp;GOTV IP</a></div>
                </div>
                <div class="dropdown btn-group" role="group"><button class="btn btn-secondary dropdown-toggle" aria-expanded="false" data-toggle="dropdown" type="button"><i class="fa fa-th-list"></i>&nbsp;More</button>
                    <div class="dropdown-menu"><a class="dropdown-item" href="#"><i class="fa fa-clone"></i>&nbsp;Clone</a><a class="dropdown-item" href="#"><i class="fa fa-repeat"></i>&nbsp;Restart</a><a class="dropdown-item" href="#" style="background: var(--red);"><i class="fa fa-trash-o"></i>&nbsp;Delete</a></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import VueMixin from '@/mixins/vue'
import Component from 'vue-class-component'

@Component({
  name: 'ServerCard'
})
export default class ServerCard extends VueMixin {}
</script>
