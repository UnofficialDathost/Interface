<template>
    <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-md-8">
                    <b-dropdown style="margin-right:10px;">
                      <template #button-content>
                        Order by <strong>{{ selectedOrder }}</strong>
                      </template>
                      <div v-for="(order, index) in orders" :key="index">
                        <b-dropdown-item @click="changeOrder(order)" v-if="order !== selectedOrder">{{ order }}</b-dropdown-item>
                      </div>
                    </b-dropdown>

                    <b-dropdown style="margin-right:10px;">
                      <template #button-content>
                        Filter by <strong>{{ selectedFilter }}</strong>
                      </template>
                      <div v-for="(filter, index) in filters" :key="index">
                        <b-dropdown-item @click="changeFilter(filter)" v-if="filter !== selectedFilter">{{ filter }}</b-dropdown-item>
                      </div>
                    </b-dropdown>
                    <div v-if="bulkActions" class="btn-group" role="group">
                        <button @click="toggleActions()" class="btn btn-secondary" style="margin-right: 10px;" type="button"><b-icon icon="collection"></b-icon>&nbsp;Stop managing</button>
                        <button class="btn btn-primary" @click="$emit('startServers')" type="button"><b-icon icon="play-circle"></b-icon>&nbsp;Start</button>
                        <button class="btn btn-secondary" @click="$emit('stopServers')" type="button"><b-icon icon="stop-circle"></b-icon>&nbsp;Stop</button>
                        <button class="btn btn-secondary" @click="$emit('restartServers')" type="button"><b-icon icon="arrow-repeat"></b-icon>&nbsp;Restart</button>
                        <button class="btn btn-secondary" @click="$emit('cloneServers')" type="button"><b-icon icon="file-break"></b-icon>&nbsp;Clone</button>
                        <button class="btn btn-secondary" @click="$emit('deleteServers')" type="button"><b-icon icon="trash"></b-icon>&nbsp;Delete</button>
                    </div>
                    <button @click="toggleActions()" v-else class="btn btn-secondary" type="button"><b-icon icon="collection"></b-icon>&nbsp;Manage Servers</button>
                </div>
                <div class="col-md-4 d-flex align-items-center justify-content-end">
                    <!-- Start: Search Input (responsive) -->
                    <div class="search-area">
                        <b-icon class="float-left search-icon" icon="search"></b-icon>
                        <input @input="$emit('input', $event.target.value)" class="custom-search-input" type="search" placeholder="Seach...">
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
export default class ActionCardComp extends Vue {
  bulkActions = false

  selectedOrder = 'Priority'
  orders: string[] = [
    'Priority',
    'Cost',
    'Name',
    'Slots'
  ]

  selectedFilter = 'Nothing'
  filters: string[] = [
    'Nothing',
    'Server booting',
    'Server on',
    'Server off',
    'Autostop on',
    'Autostop off',
    'Players online'
  ]

  created (): void {
    this.$emit(`orderBy${this.selectedOrder}`)
  }

  toggleActions (): void {
    this.bulkActions = !this.bulkActions
    this.$emit('mangingServers', this.bulkActions)
  }

  changeOrder (order: string): void {
    this.selectedOrder = order
    this.$emit(`orderBy${order}`)
  }

  changeFilter (filter: string): void {
    this.selectedFilter = filter
    this.$emit(`filterBy${filter.replaceAll(' ', '')}`)
  }
}
</script>
