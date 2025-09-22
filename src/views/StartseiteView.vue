<script setup lang="ts">
import { OnyxButton, OnyxHeadline } from 'sit-onyx'
import { useRouter } from 'vue-router'
import { useAnmeldungStore } from '@/stores/anmeldungsStore'

const router = useRouter()
const store = useAnmeldungStore()

function startRegistration() {
  store.clearCompletion()
  router.push('/1')
}

function resetDemo() {
  store.resetStore()
  router.replace('/1')
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-10">
    <OnyxHeadline is="h1" class="mb-4">
      Exkursions-Portal
    </OnyxHeadline>

    <p class="text-sm opacity-80 mb-6">
      Beim ersten Besuch musst du dich einmalig anmelden. Danach wirst du automatisch ins Portal geleitet.
      Deine Angaben kannst du später jederzeit bearbeiten.
    </p>

    <div class="mt-6 flex gap-3">
      <OnyxButton label="Zur Anmeldung" type="button" @click="startRegistration" />
      <OnyxButton label="Demo zurücksetzen" variant="ghost" type="button" @click="resetDemo" />
    </div>

    <div class="mt-10 text-xs opacity-70">
      Hinweis: Nach erfolgreicher Anmeldung wird im Browser lokal ein Status gespeichert
      (<code>anmeldung-store</code>), um dich künftig direkt ins Portal zu bringen.
    </div>
  </div>
</template>

<style scoped>
.max-w-2xl {
  max-width: 42rem;
}
</style>
