import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { registerPwaAutoUpdate } from './pwa'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')

// Register 100% automatic PWA Service Worker updates
registerPwaAutoUpdate()
