<script setup lang="ts">
// Wizard step 6: provide downloadable copies der Anmeldung; Mail-Versand aktuell deaktiviert.
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { OnyxButton, OnyxCard, OnyxHeadline, useToast } from 'sit-onyx'
import { iconFileCsv, iconFilePdf, iconCircleCheck, iconHome, iconArrowSmallLeft } from "@sit-onyx/icons"
import jsPDF from 'jspdf'

import { useAnmeldungStore } from '@/stores/anmeldungsStore'

const store = useAnmeldungStore()
const router = useRouter()
const toast = useToast()

const sending = ref(false)
const confirmationVisible = ref(false) // Persists success banner once submission is confirmed.

// Column order shared between CSV export and PDF rendering.
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

// Flatten the store state into a shape the exporters can easily reuse.
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
const canFinalize = computed(() => store.isComplete && !sending.value)

// UX-friendly labels consumed by the preview table as well as the PDF.
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

// Shape data for rendering within the summary card.
const previewFields = computed(() =>
  headers.map((key) => ({
    key,
    label: fieldLabels[key],
    value: row.value[key] || '—',
  })),
)

// Final safety net: when the user hits this step directly we still attempt to submit.
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

// Escape helper to keep exported CSV readable even when fields contain delimiters.
function escapeCsv(val: string, delimiter = ';') {
  const needsQuotes = val.includes(delimiter) || val.includes('"') || /\r?\n/.test(val)
  const escaped = val.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

// Compose a UTF-8 CSV including BOM so Excel handles umlauts correctly.
function toCsv(data: Record<string, string>[], delimiter = ';') {
  const headerLine = headers.join(delimiter)
  const lines = data.map((r) => headers.map((h) => escapeCsv(r[h] ?? '', delimiter)).join(delimiter))
  return '\uFEFF' + [headerLine, ...lines].join('\r\n')
}

// Generate a CSV download for the current registration.
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

// Convert the summary card into a printable PDF snapshot.
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

// Optional Mail-Workflow vorübergehend deaktiviert; der Button bestätigt aktuell nur die lokale Anmeldung.
async function finalizeAndSendEmail() {
  if (sending.value) {
    return
  }

  if (!store.isComplete) {
    toast.show({
      headline: 'Angaben unvollständig',
      description: 'Bitte prüfen Sie Ihre Eingaben, bevor Sie die Anmeldung absenden.',
      color: 'warning',
    })
    return
  }

  sending.value = true
  try {
    if (!store.isSubmitted) {
      try {
        store.submitAnmeldung()
      } catch (error) {
        console.error('Anmeldung konnte nicht gespeichert werden.', error)
        toast.show({
          headline: 'Speichern fehlgeschlagen',
          description: 'Bitte aktualisieren Sie Ihre Angaben und versuchen Sie es erneut.',
          color: 'danger',
        })
        return
      }
    }

    confirmationVisible.value = true
    toast.show({
      headline: 'Anmeldung bestätigt',
      description: 'Ihre Anmeldung wurde verbindlich gespeichert.',
      color: 'success',
    })

    /*
    // Versand der Bestätigungsmail vorübergehend deaktiviert.
    const response = await fetch('/api/anmeldungen/bestaetigung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anmeldungId: store.anmeldungId,
        exkursionId: store.exkursion.id,
        vorname: store.persoenlich.vorname,
        nachname: store.persoenlich.nachname,
        email: store.persoenlich.email,
      }),
    })

    if (!response.ok) {
      const message = await response.text().catch(() => '')
      toast.show({
        headline: 'Bestätigung nicht gesendet',
        description: message || 'Bitte versuchen Sie es später erneut.',
        color: 'danger',
      })
      return
    }
    */
  } catch (error) {
    console.error('Anmeldung konnte nicht finalisiert werden.', error)
    toast.show({
      headline: 'Vorgang fehlgeschlagen',
      description: 'Bitte versuchen Sie es später erneut.',
      color: 'danger',
    })
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="page-content">
      <OnyxCard v-if="confirmationVisible" class="confirmation-card">
        <template #title>
          <div class="confirmation-card__header">
            <span class="confirmation-card__icon">✔</span>
            <span>Anmeldung erfolgreich gespeichert</span>
          </div>
        </template>
        <p class="confirmation-card__message">
          Ihre Anmeldung wurde verbindlich abgeschlossen und wird nun zur weiteren Bearbeitung weitergeleitet.
        </p>
      </OnyxCard>

      <!-- Actions for CSV/PDF export or the optional confirmation mail -->
    <div class="center-container">
      <OnyxButton
        :disabled="!canFinalize"
        :icon="iconCircleCheck"
        :label="sending ? 'Wird verarbeitet…' : 'Verbindlich anmelden'"
        class="primary-action"
        @click="finalizeAndSendEmail"
      />
        <OnyxButton :icon="iconFileCsv" label="CSV herunterladen" @click="downloadCsv" />
        <OnyxButton :icon="iconFilePdf" label="PDF herunterladen" variant="outline" @click="downloadPdf" />
      </div>
    </div>

    <!-- Jump back to the summary or all the way to the portal -->
    <div class="wizard-nav">
      <OnyxButton label="Vorherige Seite" :icon="iconArrowSmallLeft" type="button" @click="router.push('/5')" />
      <OnyxButton label="Zur Startseite" :icon="iconHome" type="button" @click="router.push('/')" />
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

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

.primary-action :deep(.onyx-button) {
  background: linear-gradient(135deg, #1f8a4d 0%, #2fb874 100%);
  color: #004cff;
  font-weight: 600;
  border: none;
  box-shadow: 0 14px 24px rgba(123, 255, 0, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary-action :deep(.onyx-button:hover:not([disabled])) {
  transform: translateY(-1px);
  box-shadow: 0 18px 30px rgba(47, 184, 116, 0.35);
}

.primary-action :deep(.onyx-button:disabled) {
  background: linear-gradient(135deg, rgba(31, 138, 77, 0.65), rgba(47, 184, 116, 0.65));
  box-shadow: none;
}

.confirmation-card {
  margin-bottom: 2rem;
  border-left: 4px solid var(--onyx-success, #1f8a4d);
}

.wizard-nav {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  margin-top: auto;
  padding-bottom: 2rem;
}

.confirmation-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.confirmation-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(31, 138, 77, 0.15);
  color: var(--onyx-success, #1f8a4d);
  font-size: 1.25rem;
}

.confirmation-card__message {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.6;
}
</style>
