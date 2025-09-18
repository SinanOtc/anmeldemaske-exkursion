import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ExkursionsWahlView from '@/views/ExkursionsWahlView.vue'
import DatenerfassungView from '@/views/DatenerfassungView.vue'
import ChecklisteView from '@/views/ChecklisteView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
      name: 'Checkliste',
      component: ChecklisteView,
    },
  ],
})

export default router
