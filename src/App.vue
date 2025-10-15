<script setup lang="ts">
// Wraps the entire SPA shell and controls when the stepper header should appear.
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

import {
  OnyxAppLayout,
  OnyxHeadline,
  OnyxIconButton,
  OnyxNavBar,
  OnyxNavItem,
  OnyxPageLayout,
  OnyxProgressSteps,
  type ControlledProgressStep,
} from 'sit-onyx'
import { useAdminStore } from '@/stores/adminStore'
import { storeToRefs } from 'pinia'
import { iconCircleHelp, iconLogin, iconLogout } from '@sit-onyx/icons'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
adminStore.ensureHydrated()
const { isAdmin } = storeToRefs(adminStore)

const wizardPaths = new Set(['/1', '/2', '/3', '/4', '/5', '/6'])

const showStepper = computed<boolean>(() => wizardPaths.has(route.path))

const showGlobalNav = computed<boolean>(() => !wizardPaths.has(route.path))

const pageHeading = computed(() => {
  switch (route.path) {
    case '/':
      return 'Exkursionsportal'
    case '/nicetoknow':
      return 'Nice to know'
    case '/about':
      return 'Über uns'
    case '/admin':
      return 'Adminbereich'
    default:
      return ''
  }
})

// Map the current route to the active step in the progress component.
const activeStep = computed(() => {
  const pathNum = Number(route.path.replace('/', ''))
  return Number.isFinite(pathNum) ? pathNum : 0
})

const goTo = (target: string) => {
  if (router.currentRoute.value.path !== target) {
    router.push(target)
  }
}

const handleLogout = () => {
  adminStore.logout()
  router.push('/')
}

// Ordered labels that feed the controlled progress component.
const steps: ControlledProgressStep[] = [
  { label: 'Exkursionswahl' },
  { label: 'Persönliche Daten' },
  { label: 'Notfallkontakt' },
  { label: 'Verbindliche Bestätigungen' },
  { label: 'Zusammenfassung' },
  { label: 'Download' },
]
</script>

<template>
  <OnyxAppLayout>
    <OnyxPageLayout>
      <!--   <template #sidebar>
        <OnyxSidebar label="Exkursionsportal" :temporary="{ open: isOpen }" @close="isOpen = false">
          <template #description> Scheibovic </template>

          <div class="sidebar__content">
            <RouterLink to="/">Startseite </RouterLink>
            <RouterLink to="/about">Über uns</RouterLink>
          </div>
        </OnyxSidebar>
      </template> -->

      <div v-if="showGlobalNav && pageHeading" class="global-heading">
        <OnyxHeadline is="h1">{{ pageHeading }}</OnyxHeadline>
      </div>

      <OnyxNavBar v-if="showGlobalNav" class="global-nav" logoUrl="/dhbw_heilbronn_logo.png">
        <div class="global-nav__items">
          <OnyxNavItem label="Startseite" @click="goTo('/')" />
          <OnyxNavItem v-if="isAdmin" label="Adminbereich" @click="goTo('/admin')" />
          <OnyxNavItem v-else label="Verbindlich anmelden" @click="goTo('/1')" />
          <OnyxNavItem label="Nice to know" @click="goTo('/nicetoknow')" />
        </div>

        <div class="global-nav__actions">
          <OnyxIconButton :icon="iconCircleHelp" label="Hilfe" @click="goTo('/nicetoknow')" />
          <OnyxIconButton
            v-if="!isAdmin"
            :icon="iconLogin"
            label="Admin Login"
            @click="goTo('/?adminLogin=1')"
          />
          <OnyxIconButton v-else :icon="iconLogout" label="Logout" @click="handleLogout" />
        </div>
      </OnyxNavBar>

      <header v-if="showStepper" class="app-header">
        <div class="app-header__branding">
          <span class="app-header__title">DHBW Exkursionsanmeldung</span>
        </div>

        <OnyxProgressSteps v-model="activeStep" :steps="steps" />
      </header>

      <!-- page content -->
      <!--  <OnyxHeadline is="h1">Page content</OnyxHeadline>
      <OnyxButton class="button" label="Open sidebar" @click="isOpen = true" /> -->

      <main>
        <RouterView />
      </main>

      <footer style="bottom: 0">
        <RouterLink to="about">About</RouterLink>
      </footer>
    </OnyxPageLayout>
  </OnyxAppLayout>
</template>

<style>
main {
  min-height: 80dvh;
}


.global-nav {
  margin-bottom: 1.5rem;
  position: relative; /* neu */
}

.global-nav__items {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex: 1;
}

.global-nav__actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  position: absolute;   /* neu */
  right: 1rem;          /* neu */
  top: 50%;             /* neu */
  transform: translateY(-50%); /* neu */
}

.global-heading {
  display: flex;
  justify-content: center;
  padding: 1.5rem 0 0.5rem;
}

.global-heading :deep(.onyx-headline) {
  margin: 0;
}

.app-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 0;
  box-sizing: border-box;
}

.app-header__branding {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-header__title {
  font-weight: 600;
  font-size: 1.25rem;
}
</style>
