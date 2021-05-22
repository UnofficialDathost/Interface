<template>
  <div class="home">
    <ActionCard />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

import ActionCard from '@/components/action-card.vue'

@Component({
  components: {
    ActionCard
  }
})
export default class Home extends Vue {}
</script>
