<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { OnyxButton, OnyxCard, OnyxHeadline, useToast } from 'sit-onyx'
import jsPDF from 'jspdf'

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

const fieldLabels: Record<(typeof headers)[number], string> = {
  exkursion_titel: 'Exkursionstitel',
  exkursion_datum: 'Exkursionszeitraum',
  exkursion_ort: 'Zielort',
  exkursion_id: 'Exkursions-ID',
  vorname: 'Vorname',
  nachname: 'Nachname',
  ausweisart: 'Ausweisart',
  ausweisnr: 'Ausweisnummer',
  handy: 'Handy',
  notfall_name: 'Notfallkontakt – Name',
  notfall_beziehung: 'Notfallkontakt – Beziehung',
  notfall_telefon: 'Notfallkontakt – Telefon',
  note: 'Anmerkungen',
}

const previewFields = computed(() =>
  headers.map((key) => ({
    key,
    label: fieldLabels[key],
    value: row.value[key] || '—',
  })),
)

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
  const vorname = store.persoenlich.vorname?.trim().replace(/\s+/g, '_') || 'Unbekannt'
  const nachname = store.persoenlich.nachname?.trim().replace(/\s+/g, '_') || 'Unbekannt'
  const filename = `daten_${vorname}_${nachname}.csv`

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function downloadPdf() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const marginX = 48
  const marginY = 60
  const lineHeight = 18
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = doc.internal.pageSize.getWidth() - marginX * 2

  const vorname = store.persoenlich.vorname?.trim().replace(/\s+/g, '_') || 'Unbekannt'
  const nachname = store.persoenlich.nachname?.trim().replace(/\s+/g, '_') || 'Unbekannt'
  const filename = `daten_${vorname}_${nachname}.pdf`

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Anmeldung – Exkursionsportal', marginX, marginY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(120)
  doc.text(`Exportiert am ${new Date().toLocaleString()}`, marginX, marginY + 20)
  doc.setTextColor(0)

  let cursorY = marginY + 50

  previewFields.value.forEach(({ label, value }) => {
    if (cursorY > pageHeight - marginY) {
      doc.addPage()
      cursorY = marginY
    }

    doc.setFont('helvetica', 'bold')
    doc.text(`${label}:`, marginX, cursorY)

    doc.setFont('helvetica', 'normal')
    const text = value || '—'
    const lines = doc.splitTextToSize(text, contentWidth)
    doc.text(lines, marginX, cursorY + 14)
    cursorY += lineHeight + (lines.length - 1) * lineHeight
  })

  doc.save(filename)
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

  <OnyxCard class="preview-card">
    <template #title>Datenvorschau</template>
    <table class="preview-table">
      <tbody>
        <tr v-for="field in previewFields" :key="field.key">
          <th scope="row">{{ field.label }}</th>
          <td>{{ field.value }}</td>
        </tr>
      </tbody>
    </table>
  </OnyxCard>

  <div class="center-container">
    <OnyxButton label="CSV herunterladen" @click="downloadCsv" />
    <OnyxButton label="PDF herunterladen" variant="outline" @click="downloadPdf" />
  </div>

  <div class="VorZurueck">
    <OnyxButton label="Vorherige Seite" type="button" @click="router.push('/4')" />
    <OnyxButton label="Zum Exkursionsportal" type="button" @click="router.push('/')" />
  </div>
</template>

<style scoped>
.center-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  min-height: 40vh;
}

.center-container :deep(.onyx-button) {
  width: min(240px, 100%);
}

.status-card {
  margin-bottom: 2rem;
}

.preview-card {
  margin-bottom: 2rem;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
}

.preview-table tr {
  border-bottom: 1px solid var(--onyx-outline-variant);
}

.preview-table tr:last-child {
  border-bottom: none;
}

.preview-table th,
.preview-table td {
  text-align: left;
  padding: 0.75rem 0;
}

.preview-table th {
  font-weight: 600;
  width: 45%;
  padding-right: 1rem;
  opacity: 0.8;
}
</style>
