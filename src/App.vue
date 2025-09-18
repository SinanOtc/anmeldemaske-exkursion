<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed, ref } from 'vue'

import {
  OnyxAppLayout,
  OnyxPageLayout,
  OnyxProgressSteps,
  type ControlledProgressStep,
} from 'sit-onyx'

const route = useRoute()

const activeStep = computed(() => {
  const pathNum = Number(route.path.replace('/', ''))
  return pathNum
})

const steps: ControlledProgressStep[] = [
  { label: 'Exkursionswahl' },
  { label: 'Datenerfassung' },
  { label: 'Checkliste' },
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

      <header style="width: 100%">
        <nav style="display: flex; justify-content: center">
          <OnyxProgressSteps v-model="activeStep" :steps="steps" />
        </nav>
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
</style>
