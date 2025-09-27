<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  OnyxHeadline,
  OnyxIconButton,
  OnyxNavBar,
  OnyxNavItem,
  OnyxButton,
  OnyxCard,
  OnyxInput,
  useToast,
} from 'sit-onyx'
import {
  iconCircleHelp,
  iconUser,
  iconClipboardLock,
  iconCircleInformation,
  iconCircleX,
} from '@sit-onyx/icons'

import { useAdminStore } from '@/stores/adminStore'

const router = useRouter()
const toast = useToast()
const adminStore = useAdminStore()
adminStore.ensureHydrated()

const { isAdmin, exkursionen } = storeToRefs(adminStore)

const showLoginPanel = ref(false)
const adminToken = ref('')
const loginBusy = ref(false)

const sortedAktiveExkursionen = computed(() =>
  [...exkursionen.value]
    .filter((item) => !item.archived)
    .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
    .slice(0, 5),
)

const openLogin = () => {
  adminToken.value = ''
  showLoginPanel.value = true
}

const closeLogin = () => {
  showLoginPanel.value = false
}

const attemptLogin = async () => {
  if (!adminToken.value.trim()) {
    toast.show({ headline: 'Token erforderlich', description: 'Bitte Admin-Token eingeben.', color: 'warning' })
    return
  }

  loginBusy.value = true
  try {
    const success = adminStore.login(adminToken.value.trim())
    if (success) {
      toast.show({ headline: 'Erfolgreich angemeldet', color: 'success' })
      showLoginPanel.value = false
      router.push('/admin')
    } else {
      toast.show({ headline: 'Login fehlgeschlagen', description: 'Token ungültig.', color: 'danger' })
    }
  } finally {
    loginBusy.value = false
    adminToken.value = ''
  }
}

const logout = () => {
  adminStore.logout()
  toast.show({ headline: 'Abgemeldet', color: 'neutral' })
}
</script>

<template>
  <div class="Headline">
    <OnyxHeadline is="h1">Exkursionsportal</OnyxHeadline>
  </div>

  <div class="portal-content">
    <header class="portal-header">
      <div class="portal-header__actions">
        <OnyxIconButton :icon="iconCircleHelp" label="Hilfe" />
        <OnyxIconButton v-if="!isAdmin" :icon="iconClipboardLock" label="Admin Login" @click="openLogin" />
        <OnyxIconButton
          v-else
          :icon="iconCircleInformation"
          label="Adminbereich"
          @click="router.push('/admin')"
        />
        <OnyxIconButton v-if="isAdmin" :icon="iconCircleX" label="Logout" @click="logout" />
        <OnyxIconButton :icon="iconUser" label="Profil" />
      </div>
    </header>
  </div>

  <div class="NavbarOben">
    <OnyxNavBar appName="Exkursionsportal der DHBW" logoUrl="/kevin.JPG">
      <OnyxNavItem label="Daten bearbeiten" @click="router.push('/1')"> </OnyxNavItem>
      <OnyxNavItem v-if="isAdmin" label="Adminbereich" @click="router.push('/admin')"> </OnyxNavItem>
      <OnyxNavItem label="Erfahrungsberichte" type="button" />
    </OnyxNavBar>
  </div>

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
.Headline {
  display: flex;
  justify-content: center;
}

.portal-content {
  display: flex;
  float: right;
  flex-direction: column;
  gap: var(--onyx-grid-gutter, 1.5rem);
}

.portal-header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
}

.portal-header__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  align-items: center;
}

.NavbarOben {
  margin-top: 2rem;
}

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
