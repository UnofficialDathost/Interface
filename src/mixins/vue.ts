import { Vue, Component } from 'vue-property-decorator'
import Dathost from 'dathost'
import { IAccount } from 'dathost/src/interfaces/account'

import Steam from '@/helper/steam'

@Component
export default class VueMixin extends Vue {
  $dathost: Dathost
  $dathostAccount: IAccount
  $steam?: Steam
}
