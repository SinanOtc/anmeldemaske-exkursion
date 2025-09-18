<script setup lang="ts">
import { OnyxInput, OnyxButton, OnyxHeadline, OnyxForm, useToast } from 'sit-onyx'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const inputValue = ref<string>('')

const router = useRouter()
const toast = useToast()

const handleSubmit = () => {
  // do something with your data here
  toast.show({
    headline: 'Form submitted',
    description: inputValue.value,
    color: 'success',
  })

  router.push('/2')
}
</script>
<template>
  <OnyxHeadline is="h1">Exkursions-ID eingeben</OnyxHeadline>
  <OnyxForm class="form" @submit.prevent="handleSubmit">
    <OnyxInput v-model="inputValue" label="Enter your ID" placeholder="ID eingeben..." />
    <OnyxButton label="Exkursions-ID bestätigen" type="submit" />
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
