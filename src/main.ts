import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createOnyx } from 'sit-onyx'

import App from './App.vue'
import router from './router'
import { useAdminStore } from '@/stores/adminStore'

// Neuer Absatz weils eine CSS ist
import 'sit-onyx/style.css'

import './assets/main.css'

// Schriftarten
import "@fontsource-variable/source-code-pro";
import "@fontsource-variable/source-sans-3";

const onyx = createOnyx({
  // if you are using the Vue Router, make sure to pass it here be enable the router integration for onyx
  router: router,
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(onyx)

useAdminStore(pinia).hydrate()

app.mount('#app')
