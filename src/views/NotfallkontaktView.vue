<script setup lang="ts">
import {
  OnyxHeadline,
  OnyxForm,
  OnyxButton,
  useToast,
  OnyxInput,
  OnyxSelect,
  type SelectOption,
} from 'sit-onyx'

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnmeldungStore } from '@/stores/anmeldungsStore'

const inputValue = ref<string>('')

const inputNotfallkontaktName = ref<string>('')
const inputNotfallkontaktBeziehung = ref<string>('')
const inputNotfallkontaktTelefonnummer = ref<string>('')

const router = useRouter()
const toast = useToast()
const store = useAnmeldungStore()

onMounted(() => {
  // Vorbelegen aus Store (inkl. localStorage-Restore)
  inputNotfallkontaktName.value = store.notfall.name
  inputNotfallkontaktBeziehung.value = store.notfall.beziehung
  inputNotfallkontaktTelefonnummer.value = store.notfall.telefon
})

const handleSubmit = () => {
  // In Store speichern
  store.setNotfall({
    name: inputNotfallkontaktName.value,
    beziehung: inputNotfallkontaktBeziehung.value,
    telefon: inputNotfallkontaktTelefonnummer.value,
  })

  toast.show({
    headline: 'Form submitted',
    description: inputValue.value,
    color: 'success',
  })

  router.push('/4')
}
</script>

<template>
  <OnyxHeadline is="h2">Notfallkontakt</OnyxHeadline>

  <OnyxForm class="form" @submit.prevent="handleSubmit">
    <OnyxInput label="Name des Notfallkontakts" v-model="inputNotfallkontaktName" required />
    <OnyxInput label="Beziehung zum Teilnehmer" v-model="inputNotfallkontaktBeziehung" required />
    <OnyxInput
      label="Telefonnummer des Notfallkontakts"
      v-model="inputNotfallkontaktTelefonnummer"
      required
    />

    <OnyxButton label="Weiter" type="submit" />
    <OnyxButton label="Vorherige Seite" type="button" @click="router.push('/2')" />

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
