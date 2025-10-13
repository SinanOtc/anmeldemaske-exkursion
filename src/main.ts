// Entry file that wires together Vue, Pinia, routing and the Onyx UI library.
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

// Configure Onyx once so that router-linked components (e.g. dialogs) behave correctly.
const onyx = createOnyx({
  // if you are using the Vue Router, make sure to pass it here be enable the router integration for onyx
  router: router,
})

const app = createApp(App)
const pinia = createPinia()

// Register global plugins.
app.use(pinia)
app.use(router)
app.use(onyx)

// Attempt to restore persisted admin data before the app mounts.
useAdminStore(pinia).hydrate()

app.mount('#app')
