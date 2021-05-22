<template>
    <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <div class="btn-group" role="group">
                        <button class="btn btn-primary" type="button"><b-icon icon="play-circle"></b-icon>&nbsp;Start</button>
                        <button class="btn btn-secondary" type="button"><b-icon icon="stop-circle"></b-icon>&nbsp;Stop</button>
                        <button class="btn btn-secondary" type="button"><b-icon icon="arrow-repeat"></b-icon>&nbsp;Restart</button>
                        <button class="btn btn-secondary" type="button"><b-icon icon="trash"></b-icon>&nbsp;Delete</button>
                    </div>
                </div>
                <div class="col-md-6">
                    <!-- Start: Search Input (responsive) -->
                    <div class="float-left float-md-right mt-5 mt-md-0 search-area">
                        <b-icon class="float-left search-icon" icon="search"></b-icon>
                        <input class="float-left float-sm-right custom-search-input" type="search" placeholder="Seach...">
                    </div>
                    <!-- End: Search Input (responsive) -->
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({ name: 'ActionCard' })
export default class ActionCard extends Vue {}
</script>
