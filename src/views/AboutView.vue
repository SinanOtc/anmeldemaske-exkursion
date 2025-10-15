<script setup lang="ts">
import { useRouter } from 'vue-router'
import { OnyxButton } from 'sit-onyx'
import { iconHome } from '@sit-onyx/icons'

const router = useRouter()
</script>

<template>
  <div class="about">
    <h1>Vincenzo Scheibovic, Keviño Christiano Ronaldo del Albranada, Sigfried Ottmar</h1>
    <OnyxButton label="Startseite" :icon="iconHome" @click="router.push('/')" />
  </div>
</template>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}
</style>
