<template>
  <b-modal size="xl" id="interface-settings" ok-only title="Interface Settings">
    <div class="card">
      <div class="card-body">
        <div class="text-center">
          <b-avatar :src="$dathostAccount.gravatar_url" size="4rem"></b-avatar>
          <h5 style="margin:0;">{{ $dathostAccount.email }}</h5>
        </div>
      </div>
      <div class="card-footer">
        <span>Interface created by <a href="https://github.com/WardPearce" target="_blank">Ward Pearce</a></span>
      </div>
    </div>
  </b-modal>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import VueMixin from '@/mixins/vue'

@Component({ name: 'InterfaceSettings' })
export default class InterfaceSettingsComp extends VueMixin {}
</script>
