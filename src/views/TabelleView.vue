<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  OnyxButton,
  OnyxCard,
  OnyxHeadline,
  OnyxInput,
  OnyxSelect,
  type SelectOption,
  useToast,
} from 'sit-onyx'

import {
  useAdminStore,
  type AdminTeilnehmer,
  type AdminTeilnehmerStatus,
} from '@/stores/adminStore'

const router = useRouter()
const toast = useToast()

const adminStore = useAdminStore()
adminStore.ensureHydrated()

const { teilnehmer, distinctExkursionOptions } = storeToRefs(adminStore)

const searchTerm = ref('')
const exkursionFilter = ref<string>('all')
const statusFilter = ref<'all' | AdminTeilnehmerStatus>('all')
const sortDescending = ref(true)

const statusOptions: SelectOption<AdminTeilnehmerStatus>[] = [
  { label: 'Eingegangen', value: 'eingegangen' },
  { label: 'Bestätigt', value: 'bestaetigt' },
  { label: 'Abgelehnt', value: 'abgelehnt' },
]

const statusFilterOptions: SelectOption<'all' | AdminTeilnehmerStatus>[] = [
  { label: 'Alle Status', value: 'all' },
  ...statusOptions,
]

const exkursionOptions = computed<SelectOption<string>[]>(() => [
  { label: 'Alle Exkursionen', value: 'all' },
  ...distinctExkursionOptions.value,
])

const statusLabels: Record<AdminTeilnehmerStatus, string> = {
  eingegangen: 'Eingegangen',
  bestaetigt: 'Bestätigt',
  abgelehnt: 'Abgelehnt',
}

const statusChipClass: Record<AdminTeilnehmerStatus, string> = {
  eingegangen: 'status-chip--neutral',
  bestaetigt: 'status-chip--success',
  abgelehnt: 'status-chip--danger',
}

const filteredTeilnehmer = computed<AdminTeilnehmer[]>(() => {
  const search = searchTerm.value.trim().toLowerCase()
  const selectedStatus = statusFilter.value
  const selectedExkursion = exkursionFilter.value

  return teilnehmer.value.filter((entry) => {
    if (selectedStatus !== 'all' && entry.status !== selectedStatus) {
      return false
    }

    if (selectedExkursion !== 'all' && entry.exkursionId !== selectedExkursion) {
      return false
    }

    if (!search) {
      return true
    }

    const haystack = [
      entry.persoenlich.vorname,
      entry.persoenlich.nachname,
      entry.persoenlich.email,
      entry.persoenlich.matrikelnr,
      entry.persoenlich.handy,
      entry.exkursionSnapshot?.titel,
      entry.exkursionId,
      entry.note,
      entry.notfall.name,
      entry.notfall.telefon,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
})

const sortedTeilnehmer = computed<AdminTeilnehmer[]>(() => {
  const list = [...filteredTeilnehmer.value]
  return list.sort((a, b) => {
    const aDate = new Date(a.submittedAt).getTime()
    const bDate = new Date(b.submittedAt).getTime()
    return sortDescending.value ? bDate - aDate : aDate - bDate
  })
})

const resultCount = computed(() => sortedTeilnehmer.value.length)

const formatDate = (value: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const isEintragVollstaendig = (entry: AdminTeilnehmer) => {
  const perso = entry.persoenlich
  const notfall = entry.notfall

  return Boolean(
    entry.exkursionId &&
      perso.vorname?.trim() &&
      perso.nachname?.trim() &&
      perso.email?.trim() &&
      perso.matrikelnr?.trim() &&
      notfall.name?.trim(),
  )
}

const toggleSort = () => {
  sortDescending.value = !sortDescending.value
}

const goBack = () => {
  router.push({ name: 'AdminPanel' })
}

const updateStatus = (entry: AdminTeilnehmer, value: AdminTeilnehmerStatus) => {
  if (entry.status === value) {
    return
  }
  adminStore.updateTeilnehmerStatus(entry.id, value)
  toast.show({ headline: 'Status aktualisiert', color: 'success' })
}

const removeTeilnehmer = (entry: AdminTeilnehmer) => {
  if (!window.confirm(`Anmeldung von ${entry.persoenlich.vorname} ${entry.persoenlich.nachname} löschen?`)) {
    return
  }
  adminStore.deleteTeilnehmer(entry.id)
  toast.show({ headline: 'Anmeldung gelöscht', color: 'neutral' })
}

const mailTeilnehmer = (entry: AdminTeilnehmer) => {
  window.location.href = `mailto:${entry.persoenlich.email}`
}

const escapeCsv = (value: unknown) => {
  if (value == null) {
    return '""'
  }
  const stringValue = String(value)
  return `"${stringValue.replace(/"/g, '""')}"`
}

const exportFilteredCsv = () => {
  const data = sortedTeilnehmer.value
  if (!data.length) {
    toast.show({ headline: 'Keine Daten', description: 'Es gibt keine Anmeldungen für den aktuellen Filter.', color: 'neutral' })
    return
  }

  const headers = [
    'teilnehmer_id',
    'status',
    'submitted_at',
    'updated_at',
    'vollstaendig',
    'exkursion_id',
    'exkursion_titel',
    'exkursion_datum',
    'exkursion_ort',
    'vorname',
    'nachname',
    'ausweisart',
    'ausweisnr',
    'handy',
    'email',
    'matrikelnr',
    'reiseart',
    'gruppe',
    'notfall_name',
    'notfall_beziehung',
    'notfall_telefon',
    'note',
  ]

  const rows = data.map((entry) => [
    entry.id,
    entry.status,
    entry.submittedAt,
    entry.updatedAt,
    isEintragVollstaendig(entry) ? 'ja' : 'nein',
    entry.exkursionId,
    entry.exkursionSnapshot?.titel ?? '',
    entry.exkursionSnapshot?.datum ?? '',
    entry.exkursionSnapshot?.ort ?? '',
    entry.persoenlich.vorname,
    entry.persoenlich.nachname,
    entry.persoenlich.ausweisart,
    entry.persoenlich.ausweisnr,
    entry.persoenlich.handy,
    entry.persoenlich.email,
    entry.persoenlich.matrikelnr,
    entry.persoenlich.reiseart ?? '',
    entry.persoenlich.gruppe ?? '',
    entry.notfall.name,
    entry.notfall.beziehung,
    entry.notfall.telefon,
    entry.note ?? '',
  ])

  const csv = [
    headers.map(escapeCsv).join(';'),
    ...rows.map((row) => row.map(escapeCsv).join(';')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const filename = `teilnehmer_${new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)}.csv`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  toast.show({ headline: 'Export erfolgreich', color: 'success' })
}
</script>

<template>
  <section class="table-view">
    <OnyxHeadline is="h2">Teilnehmerverwaltung</OnyxHeadline>

    <OnyxCard class="table-view__filters">
      <template #title>Filter &amp; Suche</template>
      <div class="filters">
        <OnyxInput
          v-model="searchTerm"
          label="Suche"
          placeholder="Name, E-Mail, Matrikelnummer…"
          autocomplete="off"
        />
        <OnyxSelect
          v-model="exkursionFilter"
          label="Exkursion"
          :options="exkursionOptions"
          listLabel="Exkursionsauswahl"
        />
        <OnyxSelect
          v-model="statusFilter"
          label="Status"
          :options="statusFilterOptions"
          listLabel="Status wählen"
        />
        <OnyxButton
          class="filters__sort"
          variant="ghost"
          :label="sortDescending ? 'Neueste zuerst' : 'Älteste zuerst'"
          @click="toggleSort"
        />
      </div>
      <div class="filters__actions">
        <OnyxButton label="CSV exportieren" variant="ghost" @click="exportFilteredCsv" />
        <OnyxButton label="Zurück zum Adminbereich" @click="goBack" />
      </div>
    </OnyxCard>

    <p class="table-view__result-info">
      {{ resultCount }} Anmeldung(en) gefunden.
    </p>

    <OnyxCard class="table-view__card">
      <template #title>Teilnehmerliste</template>

      <div v-if="!sortedTeilnehmer.length" class="admin-empty">
        Keine Anmeldungen für die gewählten Filter gefunden.
      </div>

      <div v-else class="table-wrapper">
        <table class="teilnehmer-table">
          <thead>
            <tr>
              <th>Teilnehmer</th>
              <th>Exkursion</th>
              <th>Reise &amp; Dokumente</th>
              <th>Notfallkontakt &amp; Notiz</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in sortedTeilnehmer" :key="entry.id">
              <td>
                <div class="td-main">{{ entry.persoenlich.vorname }} {{ entry.persoenlich.nachname }}</div>
                <div class="td-sub">Matrikel: {{ entry.persoenlich.matrikelnr || '—' }}</div>
                <div class="td-sub">
                  E-Mail:
                  <a class="td-link" :href="`mailto:${entry.persoenlich.email}`">{{ entry.persoenlich.email }}</a>
                </div>
                <div class="td-sub">Telefon: {{ entry.persoenlich.handy || '—' }}</div>
                <div class="td-sub">
                  Ausweis: {{ entry.persoenlich.ausweisart }} · {{ entry.persoenlich.ausweisnr || '—' }}
                </div>
              </td>
              <td>
                <div class="td-main">{{ entry.exkursionSnapshot?.titel || 'Unbenannte Exkursion' }}</div>
                <div class="td-sub">ID: {{ entry.exkursionId }}</div>
                <div v-if="entry.exkursionSnapshot?.datum" class="td-sub">
                  Zeitraum: {{ entry.exkursionSnapshot.datum }}
                </div>
                <div v-if="entry.exkursionSnapshot?.ort" class="td-sub">
                  Ort: {{ entry.exkursionSnapshot.ort }}
                </div>
                <div class="td-sub">
                  Eingereicht: {{ formatDate(entry.submittedAt) }}
                </div>
                <div class="td-sub">
                  Aktualisiert: {{ formatDate(entry.updatedAt) }}
                </div>
              </td>
              <td>
                <div class="td-sub">Reiseart: {{ entry.persoenlich.reiseart || '—' }}</div>
                <div class="td-sub">Gruppe: {{ entry.persoenlich.gruppe || '—' }}</div>
                <div class="td-sub">Ausweisart: {{ entry.persoenlich.ausweisart }}</div>
                <div class="td-sub">Ausweisnummer: {{ entry.persoenlich.ausweisnr || '—' }}</div>
              </td>
              <td>
                <div class="td-main">{{ entry.notfall.name }}</div>
                <div class="td-sub">{{ entry.notfall.beziehung }}</div>
                <div class="td-sub">Telefon: {{ entry.notfall.telefon || '—' }}</div>
                <div v-if="entry.note" class="td-note">Notiz: {{ entry.note }}</div>
              </td>
              <td>
                <div class="td-status">
                  <span class="status-chip" :class="statusChipClass[entry.status]">
                    {{ statusLabels[entry.status] }}
                  </span>
                  <span
                    class="status-chip status-chip--muted"
                  >
                    {{ isEintragVollstaendig(entry) ? 'Vollständig' : 'Unvollständig' }}
                  </span>
                </div>
                <OnyxSelect
                  :modelValue="entry.status"
                  label="Status"
                  listLabel="Status wählen"
                  :options="statusOptions"
                  @update:modelValue="(value) => updateStatus(entry, value as AdminTeilnehmerStatus)"
                />
              </td>
              <td class="td-actions">
                <OnyxButton
                  label="Anmeldung löschen"
                  variant="ghost"
                  class="button-danger"
                  @click="removeTeilnehmer(entry)"
                />
                <OnyxButton
                  label="Mail an Teilnehmer"
                  variant="ghost"
                  @click="mailTeilnehmer(entry)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </OnyxCard>
  </section>
</template>

<style scoped>
.table-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.table-view__filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filters {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  align-items: end;
}

.filters__sort {
  justify-self: flex-start;
}

.filters__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-end;
}

.table-view__result-info {
  font-weight: 600;
  margin: 0;
}

.table-view__card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.table-wrapper {
  overflow-x: auto;
}

.teilnehmer-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1024px;
}

.teilnehmer-table th,
.teilnehmer-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--onyx-outline-variant);
  vertical-align: top;
}

.teilnehmer-table thead th {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--onyx-on-surface-variant);
}

.td-main {
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.td-sub {
  font-size: 0.875rem;
  color: var(--onyx-on-surface-variant);
}

.td-link {
  color: inherit;
  text-decoration: underline;
}

.td-note {
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: var(--onyx-surface-container-low);
  font-size: 0.875rem;
}

.td-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  background: var(--onyx-surface-container);
  color: var(--onyx-on-surface);
  width: fit-content;
}

.status-chip--neutral {
  background: var(--onyx-secondary-container);
  color: var(--onyx-on-secondary-container);
}

.status-chip--success {
  background: var(--onyx-success-container);
  color: var(--onyx-on-success-container);
}

.status-chip--danger {
  background: var(--onyx-error-container);
  color: var(--onyx-on-error-container);
}

.status-chip--muted {
  background: var(--onyx-surface-container-high);
  color: var(--onyx-on-surface-variant);
}

.td-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.button-danger {
  color: var(--onyx-error);
}

@media (max-width: 1024px) {
  .teilnehmer-table {
    min-width: 100%;
  }
}
</style>
