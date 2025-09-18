<template>
  <div class="exkursions-wahl">
    <OnyxInput v-model="inputValue" label="Enter your text" placeholder="Type something..." />
  </div>
</template>

<script setup lang="ts">
import { OnyxInput } from 'sit-onyx'
import { ref } from 'vue'

const inputValue = ref<string>('')
</script>

<style scoped>
.exkursions-wahl {
  padding: 20px;
}
</style>
