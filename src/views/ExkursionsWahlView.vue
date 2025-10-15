<script setup lang="ts">
// Wizard step 1: capture the excursion the student wants to join.
import {
  OnyxInput,
  OnyxButton,
  OnyxHeadline,
  OnyxForm,
  useToast,
  OnyxSelect,
  type SelectOption,
} from 'sit-onyx'
import { iconArrowSmallRight, iconHome } from "@sit-onyx/icons"
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

// Options (for select) are derived from active excursions in the admin store.
const exkursionOptions = computed<SelectOption<string>[]>(() => adminStore.distinctExkursionOptions)

// Resolve live details while the user types an ID manually.
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

// Persist the chosen ID and carry the user to the next form step.
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
  <div class="page">
    <!-- Provide both a dropdown of known excursions and a manual fallback -->
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

      <p v-if="selectedExkursion" class="exkursion-hinweis">
        {{ selectedExkursion.titel }} – {{ selectedExkursion.ort }} ({{ selectedExkursion.datum || 'Zeitraum offen' }})
      </p>

      <div class="wizard-nav">
        <OnyxButton label="Zur Startseite" type="button" :icon="iconHome" @click="router.push('/')" />
        <OnyxButton label="Weiter" type="submit" :icon="iconArrowSmallRight" icon-position="right" />
      </div>
    </OnyxForm>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form {
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--onyx-grid-gutter);
  flex: 1;
}

.exkursion-hinweis {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.85;
}

.wizard-nav {
  display: flex;
  gap: 1rem;
  margin-top: auto;
  padding-bottom: 2rem;
  justify-content: flex-start;
}
</style>
