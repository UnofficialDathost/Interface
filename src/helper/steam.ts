import axios from 'axios'

import { IGlst } from '@/helper/interfaces'

export default class Steam {
  apiKey: string
  corsProxy: string

  constructor (corsProxy: string, apiKey: string) {
    this.apiKey = apiKey
    this.corsProxy = corsProxy
  }

  formatUrl (route: string, urlFlags?: Record<string, unknown>): string {
    let params: string
    if (urlFlags) {
      params = new URLSearchParams({ key: this.apiKey, ...urlFlags }).toString()
    } else {
      params = `key=${this.apiKey}`
    }
    return `${this.corsProxy}/api.steampowered.com/${route}/?${params}`
  }

  async generateGlstToken (appId: number, memo: string): Promise<IGlst> {
    return await axios.post(this.formatUrl('IGameServersService/CreateAccount/v1', { appid: appId, memo: memo })).then(resp => {
      return <IGlst> { token: resp.data.response.login_token, id: resp.data.response.steamid }
    }).catch(() => {
      throw Error('Unable to generate GLST Token')
    })
  }
}
