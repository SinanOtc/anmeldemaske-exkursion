<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  OnyxHeadline,
  OnyxIconButton,
  OnyxNavBar,
  OnyxNavItem,
} from 'sit-onyx'
import { iconCircleHelp, iconUser } from '@sit-onyx/icons'

const router = useRouter()
</script>

<template>
  <div class="Headline">
    <OnyxHeadline is="h1">Exkursionsportal</OnyxHeadline>
  </div>

  <div class="portal-content">
     <header class="portal-header">
      <div class="portal-header__actions">
        <OnyxIconButton :icon="iconCircleHelp" label="Hilfe" />
        <OnyxIconButton :icon="iconUser" label="Profil" />
      </div>
    </header>
  </div>

  <div class="NavbarOben">
    <OnyxNavBar appName="Exkursionsportal der DHBW" logoUrl="/kevin.JPG">
      <OnyxNavItem label="Daten bearbeiten" @click="router.push('/1')">
      </OnyxNavItem>
      <OnyxNavItem label="Erfahrungsberichte" type="button" />
    </OnyxNavBar>
    
  </div>
</template>

<style>
/* Überschrift */
.Headline{
  display: flex;
  justify-content: center;
}


/* Profil und Hilfe */
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
</style>
