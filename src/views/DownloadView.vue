<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { OnyxButton, OnyxCard, OnyxHeadline, useToast } from 'sit-onyx'

import { useAnmeldungStore } from '@/stores/anmeldungsStore'

const store = useAnmeldungStore()
const router = useRouter()
const toast = useToast()

const headers = [
  'exkursion_titel',
  'exkursion_datum',
  'exkursion_ort',
  'exkursion_id',
  'vorname',
  'nachname',
  'ausweisart',
  'ausweisnr',
  'handy',
  'notfall_name',
  'notfall_beziehung',
  'notfall_telefon',
  'note',
] as const

const row = computed<Record<(typeof headers)[number], string>>(() => {
  const s = store.$state
  return {
    exkursion_titel: s.exkursion.titel ?? '',
    exkursion_datum: s.exkursion.datum ?? '',
    exkursion_ort: s.exkursion.ort ?? '',
    exkursion_id: s.exkursion.id ?? '',
    vorname: s.persoenlich.vorname ?? '',
    nachname: s.persoenlich.nachname ?? '',
    ausweisart: s.persoenlich.ausweisart ?? '',
    ausweisnr: s.persoenlich.ausweisnr ?? '',
    handy: s.persoenlich.handy ?? '',
    notfall_name: s.notfall.name ?? '',
    notfall_beziehung: s.notfall.beziehung ?? '',
    notfall_telefon: s.notfall.telefon ?? '',
    note: s.note ?? '',
  }
})

const isSubmitted = computed(() => store.isSubmitted)

onMounted(() => {
  if (!isSubmitted.value) {
    try {
      store.submitAnmeldung()
    } catch (error) {
      console.error('Anmeldung konnte nicht automatisch gespeichert werden.', error)
      toast.show({
        headline: 'Anmeldung unvollständig',
        description: 'Bitte wählen Sie eine Exkursion aus und prüfen Sie Ihre Angaben.',
        color: 'danger',
      })
    }
  }
})

function escapeCsv(val: string, delimiter = ';') {
  const needsQuotes = val.includes(delimiter) || val.includes('"') || /\r?\n/.test(val)
  const escaped = val.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

function toCsv(data: Record<string, string>[], delimiter = ';') {
  const headerLine = headers.join(delimiter)
  const lines = data.map((r) => headers.map((h) => escapeCsv(r[h] ?? '', delimiter)).join(delimiter))
  return '\uFEFF' + [headerLine, ...lines].join('\r\n')
}

function downloadCsv() {
  const csv = toCsv([row.value], ';')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const ts = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)
  const filename = `anmeldung_${ts}.csv`

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <OnyxHeadline is="h2">Download</OnyxHeadline>

  <OnyxCard class="status-card">
    <template #title>Anmeldestatus</template>
    <p v-if="isSubmitted">Ihre Anmeldung wurde gespeichert und kann jetzt exportiert werden.</p>
    <p v-else>
      Die Anmeldung ist noch unvollständig. Bitte gehen Sie zurück und prüfen Sie Ihre Eingaben.
    </p>
  </OnyxCard>

  <div class="center-container">
    <OnyxButton label="CSV herunterladen" @click="downloadCsv" />
  </div>

  <div class="VorZurueck">
    <OnyxButton label="Vorherige Seite" type="button" @click="router.push('/5')" />
    <OnyxButton label="Zum Exkursionsportal" type="button" @click="router.push('/')" />
  </div>
</template>

<style scoped>
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40vh;
}

.status-card {
  margin-bottom: 2rem;
}
</style>
