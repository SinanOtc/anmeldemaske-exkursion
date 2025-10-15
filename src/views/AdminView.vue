<script setup lang="ts">
// Main admin dashboard: manage excursions and get a quick overview of submissions.
import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { OnyxHeadline, OnyxCard, OnyxForm, OnyxInput, OnyxTextarea, OnyxButton, useToast } from 'sit-onyx'
import { useRouter } from 'vue-router'

import { useAdminStore, type AdminExkursion, type AdminTeilnehmer, type AdminTeilnehmerStatus } from '@/stores/adminStore'

const router = useRouter()
const adminStore = useAdminStore()
adminStore.ensureHydrated()

const toast = useToast()
const { exkursionen, teilnehmer } = storeToRefs(adminStore)

const formState = reactive({
  id: '',
  titel: '',
  datum: '',
  ort: '',
  beschreibung: '',
  kapazitaet: '',
  archived: false,
})
const editingId = ref<string | null>(null)

// Reset the form to a clean slate after submitting or cancelling edits.
const resetForm = () => {
  formState.id = ''
  formState.titel = ''
  formState.datum = ''
  formState.ort = ''
  formState.beschreibung = ''
  formState.kapazitaet = ''
  formState.archived = false
  editingId.value = null
}

const startEdit = (exkursion: AdminExkursion) => {
  editingId.value = exkursion.id
  formState.id = exkursion.id
  formState.titel = exkursion.titel
  formState.datum = exkursion.datum
  formState.ort = exkursion.ort
  formState.beschreibung = exkursion.beschreibung ?? ''
  formState.kapazitaet = exkursion.kapazitaet != null ? String(exkursion.kapazitaet) : ''
  formState.archived = Boolean(exkursion.archived)
}

const submitLabel = computed(() => (editingId.value ? 'Änderungen speichern' : 'Exkursion anlegen'))

// Validate and persist the current excursion form into the admin store.
const persistExkursion = () => {
  if (!formState.id.trim()) {
    toast.show({ headline: 'Ungültige Exkursion', description: 'Bitte eine eindeutige ID angeben.', color: 'danger' })
    return
  }

  if (!formState.titel.trim()) {
    toast.show({ headline: 'Angaben unvollständig', description: 'Bitte einen Titel vergeben.', color: 'warning' })
    return
  }

  const trimmedKapazitaet = formState.kapazitaet.trim()
  const kapazitaetNumber = trimmedKapazitaet ? Number.parseInt(trimmedKapazitaet, 10) : NaN

  try {
    adminStore.upsertExkursion(
      {
        id: formState.id,
        titel: formState.titel,
        datum: formState.datum,
        ort: formState.ort,
        beschreibung: formState.beschreibung || undefined,
        kapazitaet: Number.isFinite(kapazitaetNumber) ? kapazitaetNumber : undefined,
        archived: formState.archived,
      },
      editingId.value ?? undefined,
    )
    toast.show({ headline: 'Gespeichert', description: 'Die Exkursion wurde gespeichert.', color: 'success' })
    resetForm()
  } catch (error) {
    console.error('Exkursion konnte nicht gespeichert werden', error)
    toast.show({
      headline: 'Fehler',
      description: error instanceof Error ? error.message : 'Speichern fehlgeschlagen.',
      color: 'danger',
    })
  }
}

const removeExkursion = (id: string) => {
  if (!window.confirm('Exkursion wirklich löschen? Zugeordnete Anmeldungen bleiben erhalten.')) {
    return
  }
  adminStore.deleteExkursion(id)
  toast.show({ headline: 'Exkursion gelöscht', color: 'neutral' })
  if (editingId.value === id) {
    resetForm()
  }
}

const toggleArchive = (id: string, archived: boolean) => {
  adminStore.toggleArchiveExkursion(id, archived)
  toast.show({
    headline: archived ? 'Exkursion archiviert' : 'Exkursion reaktiviert',
    color: archived ? 'warning' : 'neutral',
  })
}

const formatDate = (value: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const totalTeilnehmer = computed(() => teilnehmer.value.length)

// Aggregate submission counts by status for the dashboard KPI cards.
const statusSummary = computed<Record<AdminTeilnehmerStatus, number>>(() =>
  teilnehmer.value.reduce(
    (acc, entry) => {
      acc[entry.status] += 1
      return acc
    },
    {
      eingegangen: 0,
      bestaetigt: 0,
      abgelehnt: 0,
    } as Record<AdminTeilnehmerStatus, number>,
  ),
)

const latestSubmission = computed<AdminTeilnehmer | null>(() => {
  if (!teilnehmer.value.length) {
    return null
  }
  return teilnehmer.value.reduce<AdminTeilnehmer | null>((latest, current) => {
    if (!latest) return current
    return new Date(current.submittedAt).getTime() > new Date(latest.submittedAt).getTime() ? current : latest
  }, null)
})

const goToTeilnehmerVerwaltung = () => {
  router.push({ name: 'TeilnehmerTabelle' })
}

const activeExkursionenCount = computed(() => exkursionen.value.filter((entry) => !entry.archived).length)

if (!adminStore.isAdmin) {
  toast.show({
    headline: 'Nicht angemeldet',
    description: 'Bitte melden Sie sich erneut als Administrator an.',
    color: 'warning',
  })
  router.push({ name: 'Startseite' })
}
</script>

<template>
  <section class="admin">
    <OnyxHeadline is="h2">Adminbereich</OnyxHeadline>

    <div class="admin__grid">
      <!-- Form to create or update excursions -->
      <OnyxCard class="admin__card">
        <template #title>Exkursionen verwalten</template>

        <OnyxForm class="admin-form" @submit.prevent="persistExkursion">
          <div class="admin-form__row">
            <OnyxInput v-model="formState.id" label="Exkursions-ID" required />
            <OnyxInput v-model="formState.titel" label="Titel" required />
          </div>
          <div class="admin-form__row">
            <OnyxInput v-model="formState.datum" label="Zeitraum" placeholder="z.B. 12.03. - 15.03.2025" />
            <OnyxInput v-model="formState.ort" label="Ort" />
          </div>
          <OnyxTextarea v-model="formState.beschreibung" label="Beschreibung" :rows="3" />
          <OnyxInput
            v-model="formState.kapazitaet"
            label="Kapazität"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="optional"
          />

          <div class="admin-form__actions">
            <OnyxButton :label="submitLabel" type="submit" />
            <OnyxButton label="Formular zurücksetzen" type="button" variant="ghost" @click="resetForm" />
          </div>
        </OnyxForm>

        <div class="admin-list">
          <h3>Vorhandene Exkursionen</h3>
          <p v-if="!exkursionen.length">Noch keine Exkursionen erfasst.</p>
          <ul v-else class="admin-list__items">
            <li v-for="item in exkursionen" :key="item.id" class="admin-list__item">
              <div>
                <strong>{{ item.titel || 'Unbenannte Exkursion' }}</strong>
                <div class="admin-list__meta">
                  <span>ID: {{ item.id }}</span>
                  <span v-if="item.datum">Zeitraum: {{ item.datum }}</span>
                  <span v-if="item.ort">Ort: {{ item.ort }}</span>
                  <span v-if="item.kapazitaet">Kapazität: {{ item.kapazitaet }}</span>
                  <span>Aktualisiert: {{ formatDate(item.updatedAt) }}</span>
                  <span v-if="item.archived" class="admin-list__badge">Archiviert</span>
                </div>
              </div>
              <div class="admin-list__actions">
                <OnyxButton label="Bearbeiten" variant="ghost" @click="startEdit(item)" />
                <OnyxButton
                  :label="item.archived ? 'Reaktivieren' : 'Archivieren'"
                  variant="ghost"
                  @click="toggleArchive(item.id, !item.archived)"
                />
                <OnyxButton
                  label="Löschen"
                  variant="ghost"
                  class="button-danger"
                  @click="removeExkursion(item.id)"
                />
              </div>
            </li>
          </ul>
        </div>
      </OnyxCard>

      <!-- Overview card with submission KPIs and shortcut to participant table -->
      <OnyxCard class="admin__card admin__card--overview">
        <template #title>Anmeldungen verwalten</template>

        <p class="admin-overview__intro">
          Behalte den Überblick über alle eingegangenen Anmeldungen und öffne die detaillierte Teilnehmerverwaltung
          für weitere Aktionen wie Statuspflege, Export oder Löschung einzelner Einträge.
        </p>

        <div class="admin-summary">
          <div class="admin-summary__item">
            <span class="admin-summary__label">Gesamt</span>
            <span class="admin-summary__value">{{ totalTeilnehmer }}</span>
          </div>
          <div class="admin-summary__item">
            <span class="admin-summary__label">Eingegangen</span>
            <span class="admin-summary__value">{{ statusSummary.eingegangen }}</span>
          </div>
          <div class="admin-summary__item">
            <span class="admin-summary__label">Bestätigt</span>
            <span class="admin-summary__value">{{ statusSummary.bestaetigt }}</span>
          </div>
          <div class="admin-summary__item">
            <span class="admin-summary__label">Abgelehnt</span>
            <span class="admin-summary__value">{{ statusSummary.abgelehnt }}</span>
          </div>
          <div class="admin-summary__item">
            <span class="admin-summary__label">Aktive Exkursionen</span>
            <span class="admin-summary__value">{{ activeExkursionenCount }}</span>
          </div>
        </div>

        <div v-if="latestSubmission" class="admin-latest">
          <div class="admin-latest__label">Letzte Anmeldung</div>
          <div class="admin-latest__content">
            <strong>{{ latestSubmission.persoenlich.vorname }} {{ latestSubmission.persoenlich.nachname }}</strong>
            <span>{{ formatDate(latestSubmission.submittedAt) }}</span>
          </div>
        </div>

        <div v-else class="admin-empty">
          Noch keine Anmeldungen vorhanden.
        </div>

        <div class="admin-overview__actions">
          <OnyxButton label="Teilnehmerverwaltung öffnen" @click="goToTeilnehmerVerwaltung" />
        </div>
      </OnyxCard>
    </div>
  </section>
</template>

<style scoped>
.admin {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.admin__grid {
  display: grid;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .admin__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.admin__card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin-form__row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.admin-form__row > * {
  flex: 1 1 200px;
}

.admin-form__actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.admin-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin-list__items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.admin-list__item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: var(--onyx-surface-container-low);
  border-radius: 0.75rem;
  flex-wrap: wrap;
}

.admin-list__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  opacity: 0.8;
}

.admin-list__actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.button-danger {
  color: var(--onyx-error);
}

.admin-list__badge {
  background: var(--onyx-warning-container);
  color: var(--onyx-on-warning-container);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
}

.admin-empty {
  padding: 2rem;
  text-align: center;
  background: var(--onyx-surface-container-low);
  border-radius: 0.75rem;
}

.admin-overview__intro {
  margin: 0;
  line-height: 1.5;
  color: var(--onyx-on-surface-variant);
}

.admin-summary {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.admin-summary__item {
  padding: 1rem;
  border-radius: 0.75rem;
  background: var(--onyx-surface-container-low);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.admin-summary__label {
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--onyx-on-surface-variant);
}

.admin-summary__value {
  font-size: 1.5rem;
  font-weight: 600;
}

.admin-latest {
  padding: 1rem;
  border-radius: 0.75rem;
  background: var(--onyx-surface-container-low);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.admin-latest__label {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--onyx-on-surface-variant);
}

.admin-latest__content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.admin-latest__content span {
  font-size: 0.875rem;
  color: var(--onyx-on-surface-variant);
}

.admin-overview__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.admin__card--overview {
  gap: 1.5rem;
}

.admin__back-home {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  z-index: 10;
}
</style>
