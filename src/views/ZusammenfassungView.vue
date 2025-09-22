<script setup lang="ts">
import { OnyxHeadline, OnyxCard, OnyxButton, OnyxTextarea } from 'sit-onyx'
import { useRouter } from 'vue-router'

import { useAnmeldungStore } from '@/stores/anmeldungsStore'
import { storeToRefs } from 'pinia'

const store = useAnmeldungStore()
const { exkursion, persoenlich, notfall, note } = storeToRefs(store)

const router = useRouter()
</script>

<template>
  <OnyxHeadline is="h2">Zusammenfassung</OnyxHeadline>

  <div class="grid gap-6 md:grid-cols-2 mt-6">
    <OnyxCard>
      <template #title>Exkursionsdaten</template>
      <dl class="kv">
        <dt>Titel</dt>
        <dd>{{ exkursion.titel || '—' }}</dd>
        <dt>Datum</dt>
        <dd>{{ exkursion.datum || '—' }}</dd>
        <dt>Ort</dt>
        <dd>{{ exkursion.ort || '—' }}</dd>
        <dt>ID</dt>
        <dd>{{ exkursion.id || '—' }}</dd>
      </dl>
      <OnyxButton label="Bearbeiten" variant="ghost" class="mt-3" @click="router.push('/1')"
        >Bearbeiten</OnyxButton
      >
    </OnyxCard>

    <!-- 2) Persönliche Angaben -->
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

    <!-- 3) Notfallkontakt -->
    <OnyxCard>
      <template #title>Notfallkontakt</template>
      <dl class="kv">
        <dt>Name</dt>
        <dd>{{ notfall.name || '—' }}</dd>
        <dt>Beziehung</dt>
        <dd>{{ notfall.beziehung || '—' }}</dd>
        <dt>Telefon</dt>
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

  <div class="mt-6 flex gap-3 justify-end">
    <OnyxButton label="Weiter" type="button" @click="router.push('/6')" />
    <OnyxButton label="Vorherige Seite" type="button" @click="router.push('/4')" />
  </div>
</template>

<style scoped>
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
</style>
