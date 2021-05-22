<template>
  <span>
    <template v-if="server.game === 'csgo'">{{ server.csgo_settings.slots }}</template>
    <template v-else-if="server.game === 'valheim'">{{ server.valheim_settings.slots }}</template>
    <template v-else-if="server.game === 'teamspeak3'">{{ server.teamspeak3_settings.slots }}</template>
    <template v-else>{{ server.teamfortress2_settings.slots }}</template>
  </span>
</template>

<script lang="ts">
import VueMixin from '@/mixins/vue'
import Component from 'vue-class-component'

@Component({
  name: 'Slots',
  props: {
    server: Object
  }
})
export default class Slots extends VueMixin {}
</script>
