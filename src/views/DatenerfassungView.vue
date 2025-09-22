<script setup lang="ts">
import {
  OnyxInput,
  OnyxButton,
  OnyxHeadline,
  OnyxForm,
  useToast,
  OnyxSelect,
  OnyxRadioGroup,
  type SelectOption,
} from 'sit-onyx'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnmeldungStore } from '@/stores/anmeldungsStore'

const inputValue = ref<string>('')

const inputFlugzeug = ref<string>('')

const inputNummer = ref<string>('')

const inputAusweis = ref<string>('')
const ausweisTyp = ref<string>('')

const inputVorname = ref<string>('')
const inputNachname = ref<string>('')

const router = useRouter()
const toast = useToast()
const store = useAnmeldungStore()

const travel = ref<string | null>(null)
const travelOpen = ref(false)

const company = ref<string | null>(null)
const companyOpen = ref(false)

const options1: SelectOption<string>[] = [
  {
    value: 'auto',
    label: 'Auto',
  },
  {
    value: 'bus',
    label: 'Bus',
  },
  {
    value: 'flugzeug',
    label: 'Flugzeug',
  },
]

const options2: SelectOption<string>[] = [
  {
    value: 'alleine',
    label: 'Alleine',
  },
  {
    value: 'nichtAlleine',
    label: 'Mit einem oder mehreren Partnern',
  },
]

const options3: SelectOption<string>[] = [
  {
    label: 'Personalausweis',
    value: 'personalausweis',
  },
  {
    label: 'Reisepass',
    value: 'reisepass',
  },
]

onMounted(() => {
  // Vorbelegen aus Store (inkl. localStorage-Restore)
  inputVorname.value = store.persoenlich.vorname
  inputNachname.value = store.persoenlich.nachname
  inputAusweis.value = store.persoenlich.ausweisnr
  inputNummer.value = store.persoenlich.handy
  // Mapping: Store ('Personalausweis' | 'Reisepass') -> UI values ('personalausweis' | 'reisepass')
  ausweisTyp.value = store.persoenlich.ausweisart === 'Reisepass' ? 'reisepass' : 'personalausweis'

  // Mapping Reisetyp: 'Auto' | 'Bus' | 'Flugzeug' -> 'auto' | 'bus' | 'flugzeug'
  if (store.persoenlich.reiseart === 'Auto') travel.value = 'auto'
  else if (store.persoenlich.reiseart === 'Bus') travel.value = 'bus'
  else if (store.persoenlich.reiseart === 'Flugzeug') travel.value = 'flugzeug'

  // Mapping Gruppe -> UI values
  if (store.persoenlich.gruppe === 'Alleine') company.value = 'alleine'
  else if (store.persoenlich.gruppe === 'Mit einem oder mehreren Partnern') company.value = 'nichtAlleine'
})

const handleSubmit = () => {
  // In Store speichern (inkl. Mapping zurück)
  store.setPersoenlich({
    vorname: inputVorname.value,
    nachname: inputNachname.value,
    ausweisart: ausweisTyp.value === 'reisepass' ? 'Reisepass' : 'Personalausweis',
    ausweisnr: inputAusweis.value,
    handy: inputNummer.value,
    reiseart:
      travel.value === 'auto'
        ? 'Auto'
        : travel.value === 'bus'
        ? 'Bus'
        : travel.value === 'flugzeug'
        ? 'Flugzeug'
        : undefined,
    gruppe:
      company.value === 'alleine'
        ? 'Alleine'
        : company.value === 'nichtAlleine'
        ? 'Mit einem oder mehreren Partnern'
        : undefined,
  })

  toast.show({
    headline: 'Form submitted',
    description: inputValue.value,
    color: 'success',
  })

  router.push('/3')
}
</script>

<template>
  <OnyxHeadline is="h2">Persönliche Daten</OnyxHeadline>

  <OnyxForm class="form" @submit.prevent="handleSubmit">
    <div class="vorUndNachname">
      <OnyxInput label="Vorname" v-model="inputVorname" required />
      <OnyxInput label="Nachname" v-model="inputNachname" required />
    </div>

    <div class="ausweisdaten">
      <OnyxInput label="Ausweisnummer" v-model="inputAusweis" required class="ausweisnummer" />
      <div class="radio-inline">
        <OnyxRadioGroup label="Ausweistyp" v-model="ausweisTyp" :options="options3" required />
      </div>
    </div>

    <OnyxInput label="Handynummer" v-model="inputNummer" required />

    <OnyxSelect
      label="Wie reisen Sie an?"
      listLabel="List label"
      v-model="travel"
      v-model:open="travelOpen"
      :options="options1"
      placeholder="Anreisen mit dem..."
      required
    />

    <OnyxInput
      v-if="travel === 'flugzeug'"
      v-model="inputFlugzeug"
      label="Flugnummer"
      placeholder="Flugnummer eingeben..."
      required
    />

    <OnyxSelect
      label="Kommen Sie alleine oder in einer Gruppe?"
      listLabel="List label"
      v-model="company"
      v-model:open="companyOpen"
      :options="options2"
      placeholder="Bin ich alleine?"
      required
    />

  <div class="VorZurueck">
    <OnyxButton label="Vorherige Seite" type="button" @click="router.push('/1')" />
    <OnyxButton label="Weiter" type="button" @click="router.push('/3')" />
  </div>

  </OnyxForm>
</template>

<style>
.form {
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--onyx-grid-gutter);
}

.vorUndNachname {
  display: flex;
  gap: 1.5rem;
}

.ausweisdaten {
  display: flex;
  align-items: flex-end; /* Eingabe + Radios schön bündig unten */
  gap: 1.5rem; /* Abstand dazwischen */
}

/* Eingabefeld schmaler machen */
.ausweisnummer {
  max-width: 250px;
}

/* Radio-Buttons nebeneinander */
.radio-inline .onyx-radio-group {
  display: flex;
  gap: 2rem; /* Abstand zwischen den Buttons */
}
</style>
