<script setup lang="ts">
import { OnyxButton, OnyxHeadline } from 'sit-onyx'
import { useRouter } from 'vue-router'
import { useAnmeldungStore } from '@/stores/anmeldungsStore'

const router = useRouter()
const store = useAnmeldungStore()

function startRegistration() {
  router.push('/1')
}

function resetDemo() {
  store.resetStore()
  router.replace('/1')
}
</script>

<template>



</template>

<style scoped>
.max-w-2xl {
  max-width: 42rem;
}
</style>
