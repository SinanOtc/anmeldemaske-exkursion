<script setup lang="ts">
// Wraps the entire SPA shell and controls when the stepper header should appear.
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

import { OnyxAppLayout, OnyxPageLayout, OnyxProgressSteps, type ControlledProgressStep } from 'sit-onyx'

const route = useRoute()

// Only show the stepper for numeric wizard routes (1-6) and hide it elsewhere.
const showStepper = computed<boolean>(() => {
  if (route.path === '/' || route.path === '/about' || route.path.startsWith('/admin')) {
    return false
  }
  const pathNum = Number(route.path.replace('/', ''))
  return Number.isFinite(pathNum) && pathNum > 0
})

// Map the current route to the active step in the progress component.
const activeStep = computed(() => {
  const pathNum = Number(route.path.replace('/', ''))
  return Number.isFinite(pathNum) ? pathNum : 0
})

// Ordered labels that feed the controlled progress component.
const steps: ControlledProgressStep[] = [
  { label: 'Exkursionswahl' },
  { label: 'Persönliche Daten' },
  { label: 'Notfallkontakt' },
  { label: 'Checkliste' },
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

      <!-- Wizard header solely for the Anmeldung-Schritte routes -->
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
