<script setup lang="ts">
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
import { useRouter } from 'vue-router'
import { useAnmeldungStore } from '@/stores/anmeldungsStore'

const inputValue = ref<string>('')

const check1 = ref(false)
const check2 = ref(false)
const check3 = ref(false)
const check4 = ref(false)
const check5 = ref(false)
const check6 = ref(false)
const check7 = ref(false)

const router = useRouter()
const toast = useToast()
const store = useAnmeldungStore()

onMounted(() => {
  // Vorbelegen aus Store (inkl. localStorage-Restore)
  check1.value = store.checklist.check1
  check2.value = store.checklist.check2
  check3.value = store.checklist.check3
  check4.value = store.checklist.check4
  check5.value = store.checklist.check5
  check6.value = store.checklist.check6
  check7.value = store.checklist.check7
})


function persistChecklist() {
  store.setChecklist({
    check1: check1.value,
    check2: check2.value,
    check3: check3.value,
    check4: check4.value,
    check5: check5.value,
    check6: check6.value,
    check7: check7.value,
  })
}

const handleSubmit = () => {
  // In Store speichern
  persistChecklist()
  toast.show({
    headline: 'Form submitted',
    description: inputValue.value,
    color: 'success',
  })

  router.push('/5')
}

function goBack() {
  persistChecklist()
  router.push('/3')
}
</script>

<template>
  <OnyxHeadline is="h2">Checkliste</OnyxHeadline>

  <OnyxForm class="form" @submit.prevent="handleSubmit">
    
    <OnyxCheckbox
      label="Ich bin mir bewusst, dass für mich Kosten bei der Exkursion anfallen, die ich selber übernehmen muss."
      v-model="check1"
      value="example-value"
      required
    />
    <OnyxCheckbox
      label="Ich habe mich auf der Seite des Auswertigen Amts über das Reiseziel und Einreisebestimmungen informiert."
      v-model="check2"
      value="example-value"
      required
    />
    <OnyxCheckbox
      label="Ich werde mich an die länderspezifischen Vorschriften und Verhaltenskodizes halten."
      v-model="check3"
      value="example-value"
      required
    />
    <OnyxCheckbox
      label="Meine Persönlichen Daten dürfen vertraulich an die Partner vor Ort weitergegeben werden."
      v-model="check4"
      value="example-value"
      required
    />
    <OnyxCheckbox
      label="Ich werde zum Zeitpunkt der Reise eine eigene Auslandskrankenversicherung und Haftpflichtversicherung haben."
      v-model="check5"
      value="example-value"
      required
    />
    <OnyxCheckbox
      label="Ich bin einverstanden einer Signal Gruppe für die Kommunikation vor Ort beizutreten."
      v-model="check6"
      value="example-value"
      required
    />
    <OnyxCheckbox
      label="Ich werde mich selbstständig um meine An- und Abreise kümmern (Flüge, Transfer, Visa, …) und informiere nach Freigabe und Buchung das Sekretariat über die Daten der An- und Abreise (Zeiten An- und Abflug, Flugnummer, …)."
      v-model="check7"
      value="example-value"
      required
    />
    <div class="VorZurueck">
      <OnyxButton label="Vorherige Seite" type="button" @click="goBack" />
      <OnyxButton label="Weiter" type="submit" @click="router.push('/6')" />
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
</style>
