<template>
    <div class="card">
        <div class="card-body console-card">
            <div class="card">
                <div class="card-body console">
                    <p><span class="text-secondary">May 15 03:31:15:</span>&nbsp;RecordSteamInterfaceCreation (PID 15): SteamNetworkingSocketsSerialized004 /<br></p>
                </div>
            </div>
            <form class="form-inline">
              <input class="form-control" type="text" style="width: 40%;"><button class="btn btn-primary" type="button"><b-icon icon="arrow-return-right"></b-icon>&nbsp;Send</button>
            </form>
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
}
</script>
