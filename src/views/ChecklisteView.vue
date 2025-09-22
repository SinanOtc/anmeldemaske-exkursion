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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

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

const handleSubmit = () => {
  // do something with your data here
  toast.show({
    headline: 'Form submitted',
    description: inputValue.value,
    color: 'success',
  })

  router.push('/5')
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
    <OnyxButton label="Bestätigen" type="submit" />
    <OnyxButton label="Vorherige Seite" type="button" @click="router.push('/3')" />
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
