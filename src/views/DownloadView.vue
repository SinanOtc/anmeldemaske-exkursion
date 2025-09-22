<script setup lang="ts">
import { OnyxButton } from 'sit-onyx'
import { computed } from 'vue'
import { useAnmeldungStore } from '@/stores/anmeldungsStore'

const store = useAnmeldungStore()

// 1) Flaches Objekt in gewünschter Reihenfolge
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

// 2) CSV-Utils (Semikolon = Excel-freundlich im DACH-Raum)
function escapeCsv(val: string, delimiter = ';') {
  const needsQuotes = val.includes(delimiter) || val.includes('"') || /\r?\n/.test(val)
  const escaped = val.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

function toCsv(data: Record<string, string>[], headers: readonly string[], delimiter = ';') {
  const headerLine = headers.join(delimiter)
  const lines = data.map((r) =>
    headers.map((h) => escapeCsv(r[h] ?? '', delimiter)).join(delimiter),
  )
  // BOM für Excel
  return '\uFEFF' + [headerLine, ...lines].join('\r\n')
}

// 3) Download auslösen
function downloadCsv() {
  const csv = toCsv([row.value], headers, ';')
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
  <OnyxButton label="CSV herunterladen" @click="downloadCsv" />
</template>
