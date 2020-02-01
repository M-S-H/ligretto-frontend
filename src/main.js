import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'
import dragDir from './directives/Drag'
import card from './components/Card'
import pile from './components/Pile'
import axios from 'axios'
import AvComponents from '@aetherial/aetherial-vue'
import { Socket } from 'phoenix'

// Import stylesheet
import './styles/application.scss'

const host = 'localhost:4000'
const baseUrl = `http://${host}/api/`
const socketUrl = `ws://${host}/socket`
// const host = 'warm-refuge-03953.herokuapp.com'
// const baseUrl = `https://${host}/api/`
// const socketUrl = `wss://${host}/socket`

Vue.prototype.$axios = axios.create({
  baseURL: baseUrl
})

Vue.prototype.$socket = new Socket(socketUrl, { params: { userToken: '123' } })

Vue.directive('drag', dragDir)
Vue.component('card', card)
Vue.component('pile', pile)

Vue.use(AvComponents)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
