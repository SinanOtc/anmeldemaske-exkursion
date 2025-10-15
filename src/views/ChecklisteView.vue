<script setup lang="ts">
// Wizard step 4: legally-required confirmations captured as checkboxes.
import {
  OnyxInput,
  OnyxButton,
  OnyxCheckbox,
  OnyxHeadline,
  OnyxForm,
  useToast,
  OnyxSelect,
  OnyxRadioGroup,
  type SelectOption,
} from 'sit-onyx'
import { ref, onMounted } from 'vue'
import { iconArrowSmallLeft, iconArrowSmallRight } from '@sit-onyx/icons'
import { useRouter } from 'vue-router'
import { useAnmeldungStore } from '@/stores/anmeldungsStore'

const inputValue = ref<string>('')

const kostenSelbsttragen = ref(false)
const auswaertigesAmtInformiert = ref(false)
const verhaltenskodexEinhaltung = ref(false)
const datenweitergabeErlaubt = ref(false)
const versicherungVorhanden = ref(false)
const signalGruppeBeitritt = ref(false)
const reiseEigenverantwortlich = ref(false)

const router = useRouter()
const toast = useToast()
const store = useAnmeldungStore()

onMounted(() => {
  // Vorbelegen aus Store (inkl. localStorage-Restore)
  kostenSelbsttragen.value = store.bestaetigungen.kostenSelbsttragen
  auswaertigesAmtInformiert.value = store.bestaetigungen.auswaertigesAmtInformiert
  verhaltenskodexEinhaltung.value = store.bestaetigungen.verhaltenskodexEinhaltung
  datenweitergabeErlaubt.value = store.bestaetigungen.datenweitergabeErlaubt
  versicherungVorhanden.value = store.bestaetigungen.versicherungVorhanden
  signalGruppeBeitritt.value = store.bestaetigungen.signalGruppeBeitritt
  reiseEigenverantwortlich.value = store.bestaetigungen.reiseEigenverantwortlich
})


// Persist the checkbox answers so they survive navigation.
function persistBestaetigungen() {
  store.setBestaetigungen({
    kostenSelbsttragen: kostenSelbsttragen.value,
    auswaertigesAmtInformiert: auswaertigesAmtInformiert.value,
    verhaltenskodexEinhaltung: verhaltenskodexEinhaltung.value,
    datenweitergabeErlaubt: datenweitergabeErlaubt.value,
    versicherungVorhanden: versicherungVorhanden.value,
    signalGruppeBeitritt: signalGruppeBeitritt.value,
    reiseEigenverantwortlich: reiseEigenverantwortlich.value,
  })
}

const handleSubmit = () => {
  // In Store speichern
  persistBestaetigungen()
  toast.show({
    headline: 'Form submitted',
    description: inputValue.value,
    color: 'success',
  })

  router.push('/5')
}

function goBack() {
  persistBestaetigungen()
  router.push('/3')
}
</script>

<template>
  <div class="page">
    <!-- Step headline -->
    <OnyxHeadline is="h2">Verbindliche Bestätigungen</OnyxHeadline>

    <OnyxForm class="form" @submit.prevent="handleSubmit">
      <!-- Mandatory acknowledgement items mirror organisational requirements -->
      <OnyxCheckbox
        label="Ich bin mir bewusst, dass für mich Kosten bei der Exkursion anfallen, die ich selber übernehmen muss."
        v-model="kostenSelbsttragen"
        value="example-value"
        required
      />
      <OnyxCheckbox
        label="Ich habe mich auf der Seite des Auswertigen Amts über das Reiseziel und Einreisebestimmungen informiert."
        v-model="auswaertigesAmtInformiert"
        value="example-value"
        required
      />
      <OnyxCheckbox
        label="Ich werde mich an die länderspezifischen Vorschriften und Verhaltenskodizes halten."
        v-model="verhaltenskodexEinhaltung"
        value="example-value"
        required
      />
      <OnyxCheckbox
        label="Meine Persönlichen Daten dürfen vertraulich an die Partner vor Ort weitergegeben werden."
        v-model="datenweitergabeErlaubt"
        value="example-value"
        required
      />
      <OnyxCheckbox
        label="Ich werde zum Zeitpunkt der Reise eine eigene Auslandskrankenversicherung und Haftpflichtversicherung haben."
        v-model="versicherungVorhanden"
        value="example-value"
        required
      />
      <OnyxCheckbox
        label="Ich bin einverstanden einer Signal Gruppe für die Kommunikation vor Ort beizutreten."
        v-model="signalGruppeBeitritt"
        value="example-value"
        required
      />
      <OnyxCheckbox
        label="Ich werde mich selbstständig um meine An- und Abreise kümmern (Flüge, Transfer, Visa, …) und informiere nach Freigabe und Buchung das Sekretariat über die Daten der An- und Abreise (Zeiten An- und Abflug, Flugnummer, …)."
        v-model="reiseEigenverantwortlich"
        value="example-value"
        required
      />
      <!-- Continue the wizard or revisit previous declarations -->
      <div class="wizard-nav">
        <OnyxButton label="Vorherige Seite" type="button" :icon="iconArrowSmallLeft" @click="goBack" />
        <OnyxButton
          label="Weiter"
          type="submit"
          :icon="iconArrowSmallRight"
          icon-position="right"
        />
      </div>
    </OnyxForm>
  </div>
</template>

<style>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form {
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--onyx-grid-gutter);
  flex: 1;
}

.wizard-nav {
  display: flex;
  gap: 1rem;
  margin-top: auto;
  padding-bottom: 2rem;
  justify-content: flex-start;
}
</style>
