import { Vue, Component } from 'vue-property-decorator'
import Dathost from 'dathost'

@Component
export default class VueMixin extends Vue {
  $dathost: Dathost
}
