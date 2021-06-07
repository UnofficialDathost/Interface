import axios from 'axios'

import { IGslt } from '@/helper/interfaces'

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

  async generateGsltToken (appId: number, memo: string): Promise<IGslt> {
    return await axios.post(this.formatUrl('IGameServersService/CreateAccount/v1', { appid: appId, memo: memo })).then(resp => {
      return <IGslt> { token: resp.data.response.login_token, id: resp.data.response.steamid }
    }).catch(() => {
      throw Error('Unable to generate GSLT Token')
    })
  }
}
