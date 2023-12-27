import { Component, createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
// import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import 'video.js/dist/video-js.min.css'
import 'element-plus/dist/index.css'

const app = createApp(App)

// for (const [key, component] of Object.entries<Component>(ElementPlusIconsVue)) {
//   app.component(key, component)
// }

app.use(router).use(ElementPlus).mount('#app')
