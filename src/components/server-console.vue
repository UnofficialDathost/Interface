<template>
    <div class="card">
        <div class="card-body console-card">
            <div class="card">
                <div class="card-body console" id="console">
                    <div v-if="consoleLoading" class="d-flex justify-content-center mb-3">
                      <b-spinner style="width: 6rem; height: 6rem; margin-top: 25px;" label="Loading..."></b-spinner>
                    </div>
                    <template v-else>
                      <p v-for="(line, index) in consoleLines" :key="index">{{ line }}<br></p>
                    </template>
                </div>
            </div>
            <div class="form-inline">
              <input v-model="consoleCommand" placeholder="..." class="form-control" type="text" style="width: 40%;">
              <button @click="sendCommand()" class="btn btn-primary" v-bind:class="{ disabled: consoleCommand === '' }" type="button">
                <template v-if="consoleCommandSending">
                  <b-spinner label="Spinning" style="width: 1.4em; height: 1.4em;"></b-spinner>&nbsp;Sending
                </template>
                <template v-else><b-icon icon="arrow-return-right"></b-icon>&nbsp;Send</template>
              </button>
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
  consoleCommand = ''
  consoleCommandSending = false

  autoScroll: ReturnType<typeof setInterval>

  async mounted (): Promise<void> {
    this.consoleLoading = true
    this.consoleLines = await this.serverObj.consoleRetrieve()
    this.consoleLoading = false

    this.toggleAutoScroll(true)
  }

  async sendCommand (): Promise<void> {
    this.consoleCommandSending = true
    await this.serverObj.consoleSend(this.consoleCommand)
    this.consoleCommand = ''
    this.consoleCommandSending = false
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
