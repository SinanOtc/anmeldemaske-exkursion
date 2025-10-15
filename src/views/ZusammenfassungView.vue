<script setup lang="ts">
// Wizard step 5: summarise collected data, allow corrections, trigger final submission.
import { OnyxHeadline, OnyxCard, OnyxButton, OnyxTextarea, useToast } from 'sit-onyx'
import { iconArrowSmallLeft, iconArrowSmallRight } from '@sit-onyx/icons'
import { useRouter } from 'vue-router'

import { useAnmeldungStore } from '@/stores/anmeldungsStore'
import { storeToRefs } from 'pinia'

const store = useAnmeldungStore()
const { exkursion, persoenlich, notfall, note } = storeToRefs(store)

const router = useRouter()
const toast = useToast()

// Submit the finished registration; fall back to the relevant step if required fields are missing.
const goToDownload = () => {
  try {
    store.submitAnmeldung()
    router.push('/6')
  } catch (error) {
    console.error('Anmeldung konnte nicht gespeichert werden.', error)
    toast.show({
      headline: 'Anmeldung unvollständig',
      description: 'Bitte wählen Sie eine Exkursion aus, bevor Sie fortfahren.',
      color: 'danger',
    })
  }
}
</script>

<template>
  <!-- Recap of all gathered information before submission -->
  <OnyxHeadline is="h2">Zusammenfassung</OnyxHeadline>

  <div class="grid gap-6 md:grid-cols-2 mt-6">
    <!-- Overview of the chosen excursion -->
    <OnyxCard>
      <template #title>Exkursionsdaten</template>
      <dl class="kv">
        <dt>Exkursionstitel</dt>
        <dd>{{ exkursion.titel || '—' }}</dd>
        <dt>Exkursionszeitraum</dt>
        <dd>{{ exkursion.datum || '—' }}</dd>
        <dt>Zielort</dt>
        <dd>{{ exkursion.ort || '—' }}</dd>
        <dt>Exkursions-ID</dt>
        <dd>{{ exkursion.id || '—' }}</dd>
      </dl>
      <OnyxButton label="Bearbeiten" variant="ghost" class="mt-3" @click="router.push('/1')"
        >Bearbeiten</OnyxButton
      >
    </OnyxCard>

    <!-- Personal details -->
    <OnyxCard>
      <template #title>Persönliche Angaben</template>
      <dl class="kv">
        <dt>Name</dt>
        <dd>{{ persoenlich.vorname }} {{ persoenlich.nachname }}</dd>
        <dt>Ausweisart</dt>
        <dd>{{ persoenlich.ausweisart || '—' }}</dd>
        <dt>Ausweisnummer</dt>
        <dd>{{ persoenlich.ausweisnr || '—' }}</dd>
        <dt>Handynummer</dt>
        <dd>{{ persoenlich.handy || '—' }}</dd>
      </dl>
      <OnyxButton label="Bearbeiten" variant="ghost" class="mt-3" @click="router.push('/2')"
        >Bearbeiten</OnyxButton
      >
    </OnyxCard>

    <!-- Emergency contact details -->
    <OnyxCard>
      <template #title>Notfallkontakt</template>
      <dl class="kv">
        <dt>Name des Notfallkontakts</dt>
        <dd>{{ notfall.name || '—' }}</dd>
        <dt>Beziehung zum Notfallkontakt</dt>
        <dd>{{ notfall.beziehung || '—' }}</dd>
        <dt>Nummer des Notfallkontakts</dt>
        <dd>{{ notfall.telefon || '—' }}</dd>
      </dl>
      <OnyxButton label="Bearbeiten" variant="ghost" class="mt-3" @click="router.push('/3')"
        >Bearbeiten</OnyxButton
      >
    </OnyxCard>
    <OnyxCard class="md:col-span-2">
      <template #title>Sonstige Anmerkungen</template>

      <OnyxTextarea
        :modelValue="note"
        label="Anmerkungen"
        @update:modelValue="store.setNote"
        placeholder="Hier können Sie besondere Wünsche oder Hinweise eintragen"
        :rows="4"
      />
    </OnyxCard>
  </div>

  <!-- Navigate back to declarations or continue to the download -->
  <div class="form-actions">
    <OnyxButton
      label="Vorherige Seite"
      type="button"
      :icon="iconArrowSmallLeft"
      @click="router.push('/4')"
    />
    <OnyxButton
      label="Weiter"
      type="button"
      :icon="iconArrowSmallRight"
      icon-position="right"
      @click="goToDownload"
    />
  </div>
</template>

<style>

/* schönes, kompaktes Key-Value-Layout */
.kv {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 0.5rem 1rem;
}
.kv dt {
  opacity: 0.7;
}
.kv dd {
  margin: 0;
  font-weight: 600;
  word-break: break-word;
}
/* optional: Karten etwas luftiger */
:deep(.onyx-card) {
  padding-bottom: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-start;
}
</style>
