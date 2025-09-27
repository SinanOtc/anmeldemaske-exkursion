<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  OnyxHeadline,
  OnyxCard,
  OnyxForm,
  OnyxInput,
  OnyxTextarea,
  OnyxButton,
  OnyxSelect,
  type SelectOption,
  useToast,
} from 'sit-onyx'
import { useRouter } from 'vue-router'

import {
  useAdminStore,
  type AdminExkursion,
  type AdminTeilnehmer,
  type AdminTeilnehmerStatus,
} from '@/stores/adminStore'

const router = useRouter()
const adminStore = useAdminStore()
adminStore.ensureHydrated()

const toast = useToast()
const { exkursionen, teilnehmer, distinctExkursionOptions } = storeToRefs(adminStore)

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
    adminStore.upsertExkursion({
      id: formState.id,
      titel: formState.titel,
      datum: formState.datum,
      ort: formState.ort,
      beschreibung: formState.beschreibung || undefined,
      kapazitaet: Number.isFinite(kapazitaetNumber) ? kapazitaetNumber : undefined,
      archived: formState.archived,
    })
    toast.show({ headline: 'Gespeichert', description: 'Die Exkursion wurde gespeichert.', color: 'success' })
    resetForm()
  } catch (error) {
    console.error('Exkursion konnte nicht gespeichert werden', error)
    toast.show({ headline: 'Fehler', description: 'Speichern fehlgeschlagen.', color: 'danger' })
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

const teilnehmerFilter = ref<string | null>(null)

const teilnehmerOptions = computed<SelectOption<string>[]>(() => [
  { label: 'Alle Exkursionen', value: 'all' },
  ...distinctExkursionOptions.value,
])

const filteredTeilnehmer = computed(() => {
  if (!teilnehmerFilter.value || teilnehmerFilter.value === 'all') {
    return teilnehmer.value
  }
  return teilnehmer.value.filter((entry) => entry.exkursionId === teilnehmerFilter.value)
})

const statusOptions: SelectOption<AdminTeilnehmerStatus>[] = [
  { label: 'Eingegangen', value: 'eingegangen' },
  { label: 'Bestätigt', value: 'bestaetigt' },
  { label: 'Abgelehnt', value: 'abgelehnt' },
]

const formatDate = (value: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const updateStatus = (entry: AdminTeilnehmer, status: AdminTeilnehmerStatus) => {
  adminStore.updateTeilnehmerStatus(entry.id, status)
  toast.show({ headline: 'Status aktualisiert', color: 'success' })
}

const removeTeilnehmer = (entry: AdminTeilnehmer) => {
  if (!window.confirm(`Anmeldung von ${entry.persoenlich.vorname} ${entry.persoenlich.nachname} löschen?`)) {
    return
  }
  adminStore.deleteTeilnehmer(entry.id)
  toast.show({ headline: 'Anmeldung gelöscht', color: 'neutral' })
}

const exportTeilnehmer = () => {
  const id = teilnehmerFilter.value && teilnehmerFilter.value !== 'all' ? teilnehmerFilter.value : undefined
  const csv = adminStore.exportTeilnehmerCsv(id)
  if (!csv || csv.trim().length === 0) {
    toast.show({ headline: 'Keine Daten', description: 'Es liegen keine Anmeldungen vor.', color: 'neutral' })
    return
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const suffix = id ? `_${id}` : '_alle'
  const filename = `admin-teilnehmer${suffix}_${new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)}.csv`
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

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

      <OnyxCard class="admin__card">
        <template #title>Anmeldungen</template>

        <div class="admin-filter">
          <OnyxSelect
            v-model="teilnehmerFilter"
            label="Exkursion filtern"
            placeholder="Alle"
            :options="teilnehmerOptions"
            listLabel="Exkursionsauswahl"
          />
          <OnyxButton label="CSV exportieren" variant="ghost" @click="exportTeilnehmer" />
        </div>

        <p class="admin-counter">
          {{ filteredTeilnehmer.length }} Anmeldung(en) gefunden.
        </p>

        <div v-if="!filteredTeilnehmer.length" class="admin-empty">
          Noch keine Anmeldungen vorhanden.
        </div>

        <div v-else class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Exkursion</th>
                <th>Status</th>
                <th>Übermittelt</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in filteredTeilnehmer" :key="entry.id">
                <td>
                  <div class="td-primary">
                    {{ entry.persoenlich.vorname }} {{ entry.persoenlich.nachname }}
                  </div>
                  <div class="td-secondary">
                    {{ entry.persoenlich.email }} · {{ entry.persoenlich.handy }}
                  </div>
                </td>
                <td>
                  {{ entry.exkursionSnapshot?.titel || entry.exkursionId }}
                  <div class="td-secondary">ID: {{ entry.exkursionId }}</div>
                </td>
                <td>
                  <OnyxSelect
                    :modelValue="entry.status"
                    :options="statusOptions"
                    label="Status"
                    listLabel="Status wählen"
                    @update:modelValue="(value) => updateStatus(entry, value as AdminTeilnehmerStatus)"
                  />
                </td>
                <td>
                  <div class="td-primary">{{ formatDate(entry.submittedAt) }}</div>
                  <div class="td-secondary">Aktualisiert: {{ formatDate(entry.updatedAt) }}</div>
                </td>
                <td class="td-actions">
                  <OnyxButton label="Anmeldung löschen" variant="ghost" @click="removeTeilnehmer(entry)" />
                </td>
              </tr>
            </tbody>
          </table>
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

.admin-filter {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.admin-counter {
  font-weight: 600;
}

.admin-empty {
  padding: 2rem;
  text-align: center;
  background: var(--onyx-surface-container-low);
  border-radius: 0.75rem;
}

.admin-table-wrapper {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid var(--onyx-outline-variant);
}

.td-primary {
  font-weight: 600;
}

.td-secondary {
  font-size: 0.8125rem;
  opacity: 0.7;
}

.td-actions {
  display: flex;
  align-items: center;
}
</style>
