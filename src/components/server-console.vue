<template>
    <div class="card">
        <div class="card-body console-card">
            <div class="card">
                <div class="card-body console" id="console">
                    <div v-if="consoleLoading" class="d-flex justify-content-center mb-3">
                      <b-spinner style="width: 6rem; height: 6rem; margin-top: 25px;" label="Loading..."></b-spinner>
                    </div>
                    <template v-else>
                      <p v-for="(line, index) in consoleLines" :key="index"><span class="text-secondary"></span>{{ line }}<br></p>
                    </template>
                </div>
            </div>
            <div class="form-inline">
              <input class="form-control" type="text" style="width: 40%;">
              <button class="btn btn-primary" type="button"><b-icon icon="arrow-return-right"></b-icon>&nbsp;Send</button>
              <b-form-checkbox style="margin-left: 25px;" :checked="true" @input="toggleAutoScroll">Autoscroll</b-form-checkbox>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import VueMixin from '@/mixins/vue'
import { Component, Prop } from 'vue-property-decorator'

import Server from 'dathost/src/server'

@Component({ name: 'ServerConsole' })
export default class ServerConsoleComp extends VueMixin {
  @Prop({ type: Object })
  serverObj: Server

  consoleLines: string[] = []
  consoleLoading = true

  autoScroll: ReturnType<typeof setInterval>

  async mounted (): Promise<void> {
    this.consoleLoading = true
    this.consoleLines = await this.serverObj.consoleRetrieve()
    this.consoleLoading = false

    this.toggleAutoScroll(true)
  }

  toggleAutoScroll (enabled: boolean): void {
    if (enabled) {
      this.autoScroll = setInterval(() => {
        const consoleDiv = document.getElementById('console')
        if (consoleDiv) {
          consoleDiv.scrollTop = consoleDiv.scrollHeight
        }
      }, 1000)
    } else {
      clearInterval(this.autoScroll)
    }
  }
}
</script>
