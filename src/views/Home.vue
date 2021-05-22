<template>
  <div class="home">
    <ActionCard />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import VueMixin from '@/mixins/vue'

import ActionCard from '@/components/action-card.vue'

@Component({
  components: {
    ActionCard
  }
})
export default class Home extends VueMixin {
  created (): void {
    console.log(this.$dathost)
  }
}
</script>
