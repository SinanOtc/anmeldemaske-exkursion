<script setup lang="ts">
// Wizard step 2: capture personal and travel information for the participant.
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
const inputFlugnummer = ref<string>('')

const inputMatrikelNr = ref<string>('')
const inputEmail = ref<string>('')

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

// Normalised options for travel modes, companion preference and identity document.
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
  {
    value: 'zug',
    label: 'Zug',
  },
  {
    value: 'keineAhnung',
    label: 'Noch nicht festgelegt/Sonstige',
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
  {
    value: '-',
    label: '-',
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
  inputMatrikelNr.value = store.persoenlich.matrikelnr
  inputEmail.value = store.persoenlich.email
  inputNummer.value = store.persoenlich.handy
  // Mapping: Store ('Personalausweis' | 'Reisepass') -> UI values ('personalausweis' | 'reisepass')
  ausweisTyp.value = store.persoenlich.ausweisart === 'Reisepass' ? 'reisepass' : 'personalausweis'

  // Mapping Reisetyp: 'Auto' | 'Bus' | 'Flugzeug' -> 'auto' | 'bus' | 'flugzeug'
  if (store.persoenlich.reiseart === 'Auto') travel.value = 'auto'
  else if (store.persoenlich.reiseart === 'Bus') travel.value = 'bus'
  else if (store.persoenlich.reiseart === 'Flugzeug') travel.value = 'flugzeug'
  else if (store.persoenlich.reiseart === 'Zug') travel.value = 'zug'
  else if (store.persoenlich.reiseart === 'Noch nicht festgelegt/Sonstige') travel.value = 'keineAhnung'

  // Mapping Gruppe -> UI values
  if (store.persoenlich.gruppe === 'Alleine') company.value = 'alleine'
  else if (store.persoenlich.gruppe === 'Mit einem oder mehreren Partnern') company.value = 'nichtAlleine'
    else if (store.persoenlich.gruppe === '-') company.value = '-'

})

// Push the current form state into the Pinia store using domain enums.
function persistPerson() {
  store.setPersoenlich({
    vorname: inputVorname.value,
    nachname: inputNachname.value,
    ausweisart: ausweisTyp.value === 'reisepass' ? 'Reisepass' : 'Personalausweis',
    matrikelnr: inputMatrikelNr.value,
    email: inputEmail.value,
    ausweisnr: inputAusweis.value,
    handy: inputNummer.value,
    reiseart:
      travel.value === 'auto'
        ? 'Auto'
        : travel.value === 'bus'
        ? 'Bus'
        : travel.value === 'flugzeug'
        ? 'Flugzeug'
        : travel.value === 'zug'
        ? 'Zug'
        : travel.value === 'keineAhnung'
        ? 'Noch nicht festgelegt/Sonstige'
        : undefined,
    gruppe:
      company.value === 'alleine'
        ? 'Alleine'
        : company.value === 'nichtAlleine'
        ? 'Mit einem oder mehreren Partnern'
        : company.value === '-'
        ? '-'
        : undefined,
  })
}

const handleSubmit = () => {
  // In Store speichern (inkl. Mapping zurück)
  persistPerson()
  toast.show({
    headline: 'Form submitted',
    description: inputValue.value,
    color: 'success',
  })

  router.push('/3')
}

function goBack() {
  persistPerson()
  router.push('/1')
}
</script>

<template>
  <!-- Step headline keeps the wizard consistent -->
  <OnyxHeadline is="h2">Persönliche Daten</OnyxHeadline>

  <OnyxForm class="form" @submit.prevent="handleSubmit">
    <!-- Core identity information -->
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
    <OnyxInput label="Matrikelnummer" v-model="inputMatrikelNr" required />
    <OnyxInput label="Email-Adresse" v-model="inputEmail" required />


    <!-- Travel preference helps the organisers coordinate logistics -->
    <OnyxSelect
      label="Wie reisen Sie an?"
      listLabel="List label"
      v-model="travel"
      v-model:open="travelOpen"
      :options="options1"
      placeholder="Anreisen mit dem..."
    />

    <!-- Show plane-specific field only when relevant -->
    <OnyxInput
      v-if="travel === 'flugzeug'"
      v-model="inputFlugzeug"
      label="Flugnummer"
      placeholder="Flugnummer eingeben..."
    />

    <!-- Capture whether the participant travels solo or with company -->
    <OnyxSelect
      label="Kommen Sie alleine oder in einer Gruppe?"
      listLabel="List label"
      v-model="company"
      v-model:open="companyOpen"
      :options="options2"
      placeholder="Bin ich alleine?"
    />

  <!-- Navigation buttons to move between wizard steps -->
  <div class="VorZurueck">
    <OnyxButton label="Vorherige Seite" type="button" @click="goBack" />
    <OnyxButton label="Weiter" type="submit" />
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
