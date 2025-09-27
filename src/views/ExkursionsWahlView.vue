<script setup lang="ts">
import {
  OnyxInput,
  OnyxButton,
  OnyxHeadline,
  OnyxForm,
  useToast,
  OnyxSelect,
  type SelectOption,
} from 'sit-onyx'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAnmeldungStore } from '@/stores/anmeldungsStore'
import { useAdminStore } from '@/stores/adminStore'

const inputValue = ref<string>('')
const selectedExkursionId = ref<string | null>(null)

const router = useRouter()
const toast = useToast()
const store = useAnmeldungStore()
const adminStore = useAdminStore()
adminStore.ensureHydrated()

const exkursionOptions = computed<SelectOption<string>[]>(() => adminStore.distinctExkursionOptions)

const selectedExkursion = computed(() =>
  inputValue.value.trim() ? adminStore.exkursionById(inputValue.value.trim()) : null,
)

onMounted(() => {
  inputValue.value = store.exkursion.id
  if (store.exkursion.id) {
    selectedExkursionId.value = store.exkursion.id
  }
})

watch(selectedExkursionId, (value) => {
  if (value) {
    inputValue.value = value
  }
})

const handleSubmit = () => {
  const trimmedId = inputValue.value.trim()
  if (!trimmedId) {
    toast.show({ headline: 'Exkursions-ID erforderlich', color: 'warning' })
    return
  }

  const target = adminStore.exkursionById(trimmedId)

  if (target) {
    store.setExkursion({
      id: target.id,
      titel: target.titel,
      datum: target.datum,
      ort: target.ort,
    })
  } else {
    store.setExkursion({ id: trimmedId })
    toast.show({
      headline: 'Exkursion nicht gefunden',
      description: 'Die ID ist gespeichert, konnte aber keinem Admin-Eintrag zugeordnet werden.',
      color: 'neutral',
    })
  }

  toast.show({
    headline: 'Exkursions-ID gespeichert',
    description: trimmedId,
    color: 'success',
  })

  router.push('/2')
}
</script>
<template>
  <OnyxHeadline is="h2">Exkursions-ID eingeben</OnyxHeadline>
  <OnyxForm class="form" @submit.prevent="handleSubmit">
    <OnyxSelect
      v-if="exkursionOptions.length"
      v-model="selectedExkursionId"
      label="Exkursion auswählen"
      listLabel="Exkursionen"
      placeholder="Bitte auswählen"
      :options="exkursionOptions"
    />

    <OnyxInput v-model="inputValue" label="Exkursions-ID" placeholder="ID eingeben..." required />

    <p v-if="selectedExkursion" class="exkursion-hinweis">
      {{ selectedExkursion.titel }} – {{ selectedExkursion.ort }} ({{ selectedExkursion.datum || 'Zeitraum offen' }})
    </p>

    <div class="VorZurueck">
      <OnyxButton label="Ich bin bereits angemeldet" type="button" @click="router.push('/')" />
      <OnyxButton label="Weiter" type="submit" />
    </div>
  </OnyxForm>
</template>

<style scoped>
.form {
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--onyx-grid-gutter);
}

.exkursion-hinweis {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.85;
}
</style>
