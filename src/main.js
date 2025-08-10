import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import '@arco-design/web-vue/dist/arco.css'

import App from '@/App.vue'
import store from '@/store'
import router from '@/router'
import '@/permission'
import '@/styles/index.css'

// 新增：引入粒子动画和数字翻牌倒计时插件
import Particles from 'vue3-particles'
import Vue3FlipCountdown from 'vue3-flip-countdown'

const app = createApp(App)
app.use(ArcoVue)
app.use(ArcoVueIcon)
app.use(store)
app.use(router)
app.use(Particles)
app.use(Vue3FlipCountdown)
app.mount('#app')
