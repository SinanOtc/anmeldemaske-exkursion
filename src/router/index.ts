import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ExkursionsWahlView from '@/views/ExkursionsWahlView.vue'
import DatenerfassungView from '@/views/DatenerfassungView.vue'
import ChecklisteView from '@/views/ChecklisteView.vue'
import NotfallkontaktView from '@/views/NotfallkontaktView.vue'
import InfosView from '@/views/ZusammenfassungView.vue'
import ZusammenfassungView from '@/views/ZusammenfassungView.vue'
import StartseiteView from '@/views/StartseiteView.vue'
import DownloadView from '@/views/DownloadView.vue'
import { STORAGE_KEY } from '@/stores/anmeldungsStore'

const REGISTRATION_PATHS = new Set(['/', '/1', '/2', '/3', '/4', '/5', '/6'])
const PORTAL_PATH = '/7'

function loadCompletionFlag(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return parsed?.completed === true
  } catch (error) {
    console.warn('Konnte Anmeldestatus nicht aus dem localStorage lesen:', error)
    return false
  }
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Exkusrionswahl',
      component: ExkursionsWahlView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/1',
      name: 'Exkursionswahl',
      component: ExkursionsWahlView,
    },
    {
      path: '/2',
      name: 'Datenerfassung',
      component: DatenerfassungView,
    },
    {
      path: '/3',
      name: 'Notfallkontakt',
      component: NotfallkontaktView,
    },
    {
      path: '/4',
      name: 'Checkliste',
      component: ChecklisteView,
    },
    {
      path: '/5',
      name: 'Zusammenfassung',
      component: ZusammenfassungView,
    },
    {
      path: '/6',
      name: 'Download',
      component: DownloadView,
    },
    {
      path: '/7',
      name: 'Startseite',
      component: StartseiteView,
    },
  ],
})

router.beforeEach((to) => {
  const completed = loadCompletionFlag()
  const isRegistrationPath = REGISTRATION_PATHS.has(to.path)
  const isPortalPath = to.path === PORTAL_PATH

  if (completed) {
    if (isRegistrationPath && !isPortalPath) {
      return { path: PORTAL_PATH }
    }
    return true
  }

  if (isPortalPath) {
    return { path: '/1' }
  }

  if (to.path === '/' || to.path === '') {
    return { path: '/1' }
  }

  return true
})

export default router
