<script setup lang="ts">
// Public landing page that lists highlighted excursions and exposes admin shortcuts.
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { OnyxHeadline, OnyxButton, OnyxCard, OnyxInput, useToast } from 'sit-onyx'

import { useAdminStore } from '@/stores/adminStore'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
adminStore.ensureHydrated()

const { isAdmin, exkursionen } = storeToRefs(adminStore)

const showLoginPanel = ref(false)
const adminToken = ref('')
const loginBusy = ref(false)

// Present at most five of the freshest, active excursions in the hero cards.
const sortedAktiveExkursionen = computed(() =>
  [...exkursionen.value]
    .filter((item) => !item.archived)
    .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
    .slice(0, 5),
)

// Modal helpers for the lightweight token login.
const openLogin = () => {
  adminToken.value = ''
  showLoginPanel.value = true
}

const closeLogin = () => {
  showLoginPanel.value = false
}

const attemptLogin = async () => {
  if (!adminToken.value.trim()) {
    toast.show({ headline: 'Passwort erforderlich', description: 'Bitte Admin-Passwort eingeben.', color: 'warning' })
    return
  }

  loginBusy.value = true
  try {
    const success = adminStore.login(adminToken.value.trim())
    if (success) {
      toast.show({ headline: 'Gommemode aktiviert trollololol', color: 'success' })
      showLoginPanel.value = false
    } else {
      toast.show({ headline: 'Versuchs nochmal', description: 'Passwort ungültig.', color: 'danger' })
    }
  } finally {
    loginBusy.value = false
    adminToken.value = ''
  }
}

// Drop any admin state and revert to the public view.
const logout = () => {
  adminStore.logout()
  toast.show({ headline: 'Godmode deaktiviert', color: 'neutral' })
}

const maybeOpenLoginFromQuery = () => {
  if (route.query.adminLogin === '1' && !isAdmin.value) {
    openLogin()
    const nextQuery = { ...route.query }
    delete nextQuery.adminLogin
    router.replace({ path: route.path, query: nextQuery })
  }
}

onMounted(maybeOpenLoginFromQuery)

watch(
  () => route.query.adminLogin,
  () => {
    maybeOpenLoginFromQuery()
  },
)
</script>

<template>
  <!-- Highlight active excursions for fast orientation -->
  <section v-if="sortedAktiveExkursionen.length" class="exkursionen">
    <OnyxHeadline is="h3">Aktive Exkursionen</OnyxHeadline>
    <div class="exkursionen__grid">
      <OnyxCard v-for="exkursion in sortedAktiveExkursionen" :key="exkursion.id" class="exkursion-card">
        <template #title>{{ exkursion.titel || 'Unbenannte Exkursion' }}</template>
        <dl>
          <dt>ID</dt>
          <dd>{{ exkursion.id }}</dd>
          <dt v-if="exkursion.datum">Zeitraum</dt>
          <dd v-if="exkursion.datum">{{ exkursion.datum }}</dd>
          <dt v-if="exkursion.ort">Ort</dt>
          <dd v-if="exkursion.ort">{{ exkursion.ort }}</dd>
          <dt v-if="exkursion.kapazitaet">Kapazität</dt>
          <dd v-if="exkursion.kapazitaet">{{ exkursion.kapazitaet }}</dd>
        </dl>
        <p v-if="exkursion.beschreibung" class="exkursion-card__description">
          {{ exkursion.beschreibung }}
        </p>
      </OnyxCard>
    </div>
  </section>

  <!-- Minimal token login overlay for admins -->
  <div v-if="showLoginPanel" class="login-panel">
    <OnyxCard class="login-card">
      <template #title>Admin-Login</template>
      <OnyxInput v-model="adminToken" label="Admin-Token" type="password" autocomplete="off" />
      <div class="login-card__actions">
        <OnyxButton label="Anmelden" :disabled="loginBusy" @click="attemptLogin" />
        <OnyxButton label="Abbrechen" variant="ghost" @click="closeLogin" />
      </div>
    </OnyxCard>
  </div>
</template>

<style scoped>
.exkursionen {
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.exkursionen__grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 900px) {
  .exkursionen__grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

.exkursion-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.exkursion-card dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 0.75rem;
  margin: 0;
}

.exkursion-card dt {
  opacity: 0.7;
}

.exkursion-card__description {
  margin-top: 1rem;
  opacity: 0.9;
}

.login-panel {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 50;
}

.login-card {
  width: min(420px, 100%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-card__actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
</style>
