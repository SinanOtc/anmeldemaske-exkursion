// Central router map for public wizard pages and admin-only views.
import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '../views/AboutView.vue'
import ExkursionsWahlView from '@/views/ExkursionsWahlView.vue'
import DatenerfassungView from '@/views/DatenerfassungView.vue'
import ChecklisteView from '@/views/ChecklisteView.vue'
import NotfallkontaktView from '@/views/NotfallkontaktView.vue'
import ZusammenfassungView from '@/views/ZusammenfassungView.vue'
import StartseiteView from '@/views/StartseiteView.vue'
import DownloadView from '@/views/DownloadView.vue'
import AdminView from '@/views/AdminView.vue'
import { useAdminStore } from '@/stores/adminStore'
import TabelleView from '@/views/TabelleView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Startseite',
      component: StartseiteView,
    },
    {
      path: '/admin',
      name: 'AdminPanel',
      component: AdminView,
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/tabelle',
      name: 'TeilnehmerTabelle',
      component: TabelleView,
      meta: { requiresAdmin: true },
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
      name: 'Bestaetigungen',
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
  ],
})

// Lightweight navigation guard that keeps the admin area locked unless the store indicates an active session.
router.beforeEach((to) => {
  if (!to.meta.requiresAdmin) {
    return true
  }

  const adminStore = useAdminStore()
  adminStore.ensureHydrated()

  if (!adminStore.isAdmin) {
    return { name: 'Startseite', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
