import { Component } from 'vue-property-decorator'
import VueMixin from '@/mixins/vue'

import Server from 'dathost/src/server'
import { IServer } from 'dathost/src/interfaces/server'

@Component
export default class ServerMixin extends VueMixin {
  server: IServer
  serverObj: Server

  serverStatus = {
    startingUp: false,
    stopping: false,
    deleting: false,
    restarting: false
  }

  deleted = false

  password = ''
  steamProtocolPass = ''
  gotvEnabled = false

  createServer (server: IServer): void {
    this.server = server

    this.serverObj = this.$dathost.server(this.server.id)

    if (this.server.game === 'csgo') {
      if (this.server.csgo_settings.password) {
        this.password = `; password ${this.server.csgo_settings.password}`
        this.steamProtocolPass = `/${this.server.csgo_settings.password}`
      }
      this.gotvEnabled = this.server.csgo_settings.enable_gotv
    } else if (this.server.game === 'teamfortress2') {
      if (this.server.teamfortress2_settings.password) {
        this.password = `; password ${this.server.teamfortress2_settings.password}`
        this.steamProtocolPass = `/${this.server.teamfortress2_settings.password}`
      }
      this.gotvEnabled = this.server.teamfortress2_settings.enable_gotv
    }
  }

  async copyToClipboard (txt: string): Promise<void> {
    await navigator.clipboard.writeText(txt)
  }

  async startServer (): Promise<void> {
    this.serverStatus.startingUp = true

    await this.serverObj.start()
    await new Promise(resolve => setTimeout(resolve, 5000))

    this.server = await this.serverObj.get()
    if (this.server.server_error) {
      if (this.server.server_error === 'gslt_expired') {
        alert('Your server isn\'t booting because your Steam Token (GSLT) has expired.')
      } else if (this.server.server_error === 'gslt_invalid') {
        alert('Your server isn\'t booting because your Steam Token (GSLT) is invalid.')
      } else {
        alert(this.server.server_error)
      }
      this.server.on = false
      this.server.booting = false

      await new Promise(resolve => setTimeout(resolve, 5000))
      await this.serverObj.stop()
    } else {
      this.server.on = true
    }

    this.serverStatus.startingUp = false
  }

  async stopServer (): Promise<void> {
    this.serverStatus.stopping = true
    await this.serverObj.stop()
    this.server.on = false
    this.serverStatus.stopping = false
  }

  async deleteServer (): Promise<void> {
    if (confirm(`Are you sure you want to delete this?\n\nName: ${this.server.name}\nID: ${this.server.id}`)) {
      this.serverStatus.deleting = true
      await this.serverObj.delete()
      this.deleted = true
    }
  }

  async restartServer (): Promise<void> {
    this.serverStatus.restarting = true
    await this.serverObj.stop()
    await this.serverObj.start()
    this.serverStatus.restarting = false
    this.server.on = true
  }

  async cloneServer (): Promise<void> {
    this.$emit('serverCloned', this.server)
    const clonedServer = await this.serverObj.duplicate()
    this.$emit('serverAdded', clonedServer[0])
  }
}
