<template>
    <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <div v-if="bulkActions" class="btn-group" role="group">
                        <button @click="toggleActions()" class="btn btn-secondary" style="margin-right: 20px;" type="button"><b-icon icon="collection"></b-icon>&nbsp;Stop managing</button>
                        <button class="btn btn-primary" @click="$emit('startServers')" type="button"><b-icon icon="play-circle"></b-icon>&nbsp;Start</button>
                        <button class="btn btn-secondary" @click="$emit('stopServers')" type="button"><b-icon icon="stop-circle"></b-icon>&nbsp;Stop</button>
                        <button class="btn btn-secondary" @click="$emit('restartServers')" type="button"><b-icon icon="arrow-repeat"></b-icon>&nbsp;Restart</button>
                        <button class="btn btn-secondary" @click="$emit('cloneServers')" type="button"><b-icon icon="file-break"></b-icon>&nbsp;Clone</button>
                        <button class="btn btn-secondary" @click="$emit('deleteServers')" type="button"><b-icon icon="trash"></b-icon>&nbsp;Delete</button>
                    </div>
                    <button @click="toggleActions()" v-else class="btn btn-secondary" type="button"><b-icon icon="collection"></b-icon>&nbsp;Manage Servers</button>
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
export default class ActionCard extends Vue {
  bulkActions = false

  toggleActions (): void {
    this.bulkActions = !this.bulkActions
    this.$emit('mangingServers', this.bulkActions)
  }
}
</script>
