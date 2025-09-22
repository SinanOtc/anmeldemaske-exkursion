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
      name: 'Startseite',
      component: StartseiteView,
    },
  ],
})

export default router
