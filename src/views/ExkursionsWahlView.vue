<script setup lang="ts">
import { OnyxInput, OnyxButton, OnyxHeadline, OnyxForm, useToast } from 'sit-onyx'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnmeldungStore } from '@/stores/anmeldungsStore'

const inputValue = ref<string>('')

const router = useRouter()
const toast = useToast()
const store = useAnmeldungStore()

onMounted(() => {
  // Vorbelegen der ID aus Store (falls vorhanden)
  inputValue.value = store.exkursion.id
})

const handleSubmit = () => {
  // Exkursions-ID im Store speichern
  store.setExkursion({
    titel: store.exkursion.titel || '',
    datum: store.exkursion.datum || '',
    ort: store.exkursion.ort || '',
    id: inputValue.value,
  })

  toast.show({
    headline: 'Form submitted',
    description: inputValue.value,
    color: 'success',
  })

  router.push('/2')
}
</script>
<template>
  <OnyxHeadline is="h2">Exkursions-ID eingeben</OnyxHeadline>
  <OnyxForm class="form" @submit.prevent="handleSubmit">
    
    <OnyxInput v-model="inputValue" label="Enter your ID" placeholder="ID eingeben..." />

  <div class="VorZurueck">
    <OnyxButton label="Ich bin bereits Angemeldet" type="button" @click="router.push('/7')" />
    <OnyxButton label="Weiter" type="submit" />
  </div>

  </OnyxForm>
</template>

<style>
.form {
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--onyx-grid-gutter);
}
</style>