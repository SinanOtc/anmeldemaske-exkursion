<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  OnyxAccordion,
  OnyxAccordionItem,
  OnyxButton,
  OnyxCard,
  OnyxHeadline,
  OnyxIconButton,
  OnyxSidebar,
} from 'sit-onyx'
import { iconCircleHelp, iconUser } from '@sit-onyx/icons'

const router = useRouter()
</script>

<template>
  <div class="portal-layout">
    <div class="portal-sidebar">
      <OnyxSidebar label="Navigation" collapseSidebar="md">
        <template #header>
          <OnyxHeadline is="h3" class="sidebar-title">Menü</OnyxHeadline>
        </template>

        <OnyxAccordion type="nested-large">
          <OnyxAccordionItem value="portal">
            <template #header>
              <span class="sidebar-section-title">Portal</span>
            </template>

            <div class="sidebar-links">
              <OnyxButton label="Übersicht" mode="plain" />
              <OnyxButton label="Erfahrungsberichte" mode="plain" />
              <OnyxButton label="Galerie" mode="plain" />
            </div>
          </OnyxAccordionItem>

          <OnyxAccordionItem value="anmeldung">
            <template #header>
              <span class="sidebar-section-title">Meine Anmeldung</span>
            </template>

            <div class="sidebar-links">
              <OnyxButton label="Daten bearbeiten" mode="plain" @click="router.push('/1')" />
              <OnyxButton label="PDF herunterladen" mode="plain" />
            </div>
          </OnyxAccordionItem>

          <OnyxAccordionItem value="hilfe">
            <template #header>
              <span class="sidebar-section-title">Hilfe &amp; Profil</span>
            </template>

            <div class="sidebar-links">
              <OnyxButton label="Hilfe" mode="plain"  />
              <OnyxButton label="Profil" mode="plain" />
            </div>
          </OnyxAccordionItem>
        </OnyxAccordion>
      </OnyxSidebar>
    </div>

    <div class="portal-content">
     <header class="portal-header">
  <div class="portal-header__actions">
    <OnyxIconButton :icon="iconCircleHelp" label="Hilfe" />
    <OnyxIconButton :icon="iconUser" label="Profil" />
  </div>
</header>

    </div>
  </div>
</template>

<style>
.portal-layout {
  display: grid;
  grid-template-columns: minmax(220px, 280px) 1fr;
  gap: var(--onyx-grid-gutter, 1.5rem);
  align-items: start;
}

.portal-sidebar :deep(.onyx-sidebar) {
  position: sticky;
  top: var(--portal-sticky-offset, 0);
  max-height: calc(100vh - var(--portal-sticky-offset, 0));
  overflow: auto;
}

.sidebar-title {
  margin: 0;
}

.sidebar-section-title {
  font-weight: 600;
}

.sidebar-links {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.25rem 0;
}

.portal-content {
  display: flex;
  float: right;
  flex-direction: column;
  gap: var(--onyx-grid-gutter, 1.5rem);
}

.portal-header {
  display: grid;
  grid-template-columns: 1fr auto; /* Titel links/zentriert, Icons rechts */
  align-items: center;
}

.portal-header__intro {
  display: flex;
  flex-direction: column;
  gap: var(--onyx-grid-gutter, 1rem);
  flex: 1 1 340px;
}

.portal-info-card {
  width: 100%;
}

.info-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem 1.5rem;
  margin: 0;
}

.info-list div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-list dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.info-list dd {
  margin: 0;
  font-weight: 600;
}

.portal-header__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  align-items: center;
}

.portal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--onyx-grid-gutter, 1.5rem);
}

.placeholder-text {
  margin: 0;
  color: var(--onyx-color-text-subtle, rgba(0, 0, 0, 0.65));
}

@media (max-width: 960px) {
  .portal-layout {
    grid-template-columns: 1fr;
  }

  .portal-sidebar {
    order: -1;
  }

  .portal-sidebar :deep(.onyx-sidebar) {
    position: relative;
    top: 0;
    max-height: none;
  }

  .portal-header {
    flex-direction: column;
    align-items: stretch;
  }

  .portal-header__actions {
    justify-content: flex-end;
  }
}
</style>
