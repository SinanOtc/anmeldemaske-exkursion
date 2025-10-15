<script setup lang="ts">
import { useRouter } from 'vue-router'
import { OnyxButton, OnyxCard, OnyxHeadline } from 'sit-onyx'
import { iconHome } from '@sit-onyx/icons'

const router = useRouter()

const teamMembers = [
  {
    name: 'Vincenzo Scheibovic',
    role: 'Programmleitung & Stakeholdermanagement',
    focus:
      'Behält den Überblick über Budget, Timelines und Abstimmung mit Partnern. Vincenzo sorgt dafür, dass jede Exkursion strategisch sauber landet.',
    tags: ['Projektsteuerung', 'Budgetklarheit', 'Stakeholderkommunikation'],
  },
  {
    name: 'Keviño Christiano Ronaldo del Albranada',
    role: 'Teilnehmenden-Erlebnis & Kommunikation',
    focus:
      'Gestaltet Informationsfluss, Feedback-Loops und Onboarding. Keviño steht für reibungslose Teilnehmendenkommunikation – charmant und verbindlich.',
    tags: ['Community Care', 'Kommunikation', 'Feedback-Schleifen'],
  },
  {
    name: 'Sigfried Ottmar',
    role: 'Sicherheit & operative Umsetzung',
    focus:
      'Koordiniert Reisebedingungen, Risikoabschätzungen und Notfallprozesse. Sigfried sorgt dafür, dass Sicherheitsstandards nicht nur erfüllt, sondern gelebt werden.',
    tags: ['Risikomanagement', 'Regelkonformität', 'Qualitätssicherung'],
  },
]

const focusAreas = [
  {
    title: 'Reibungslose Planung',
    detail:
      'Wir orchestrieren Behörden, Partnerhochschulen und Dienstleister, damit alle Informationen frühzeitig und zuverlässig vorliegen.',
  },
  {
    title: 'Digitale Transparenz',
    detail:
      'Von der Anmeldung bis zum finalen Reiseplan: Teilnehmende verfolgen jeden Schritt in Echtzeit und behalten alle Unterlagen im Zugriff.',
  },
  {
    title: 'Sicherheit zuerst',
    detail:
      'Gesundheit, Versicherung und Notfallkontakte haben Priorität. Wir testen Abläufe regelmäßig und halten Notfallpläne stets aktuell.',
  },
]

const milestones = [
  {
    year: '2022',
    title: 'Pilotierungsphase',
    description:
      'Erste Exkursion mit 40 Teilnehmenden und manuellen Prozessen. Learnings: zentrale Datenhaltung ist Pflicht.',
  },
  {
    year: '2023',
    title: 'Digitale Plattform',
    description:
      'Einführung des neuen Portals und Automatisierung der Registrierung. Ergebnis: 60 % weniger Rückfragen.',
  },
  {
    year: '2024',
    title: 'Skalierung & QA',
    description:
      'Standardisierte Qualitätskontrollen, erweiterte Reise-Checklisten und enger Austausch mit Safety-Teams weltweit.',
  },
]

const goToStart = () => router.push('/')
const goToNiceToKnow = () => router.push('/nicetoknow')
</script>

<template>
  <div class="about">
    <div class="about__inner">
      <section class="about__hero">
        <OnyxHeadline is="h2">Wir gestalten Exkursionen mit Fokus und Feingefühl</OnyxHeadline>
        <p class="about__lead">
          Hinter dem Portal stehen Vincenzo, Keviño und Sigfried – ein Team, das Organisation, Kommunikation und
          Sicherheit miteinander verzahnt. Unser Anspruch: internationale Exkursionen, die inhaltlich inspirieren und
          logistisch überzeugen.
        </p>
        <div class="about__actions">
          <OnyxButton label="Zur Startseite" :icon="iconHome" variant="outline" @click="goToStart" />
          <OnyxButton label="Nice to know" variant="ghost" @click="goToNiceToKnow" />
        </div>
      </section>

      <section class="about__team">
        <OnyxHeadline is="h3" class="about__section-title">Das Kernteam</OnyxHeadline>
        <div class="team-grid">
          <OnyxCard v-for="member in teamMembers" :key="member.name" class="team-card">
            <template #title>{{ member.name }}</template>
            <p class="team-card__role">{{ member.role }}</p>
            <p class="team-card__focus">{{ member.focus }}</p>
            <ul class="team-card__tags">
              <li v-for="tag in member.tags" :key="tag">{{ tag }}</li>
            </ul>
          </OnyxCard>
        </div>
      </section>

      <section class="about__focus">
        <OnyxHeadline is="h3" class="about__section-title">Wofür wir stehen</OnyxHeadline>
        <div class="focus-grid">
          <OnyxCard v-for="item in focusAreas" :key="item.title" class="focus-card">
            <template #title>{{ item.title }}</template>
            <p>{{ item.detail }}</p>
          </OnyxCard>
        </div>
      </section>

      <section class="about__timeline">
        <OnyxHeadline is="h3" class="about__section-title">Meilensteine</OnyxHeadline>
        <ul class="timeline">
          <li v-for="milestone in milestones" :key="milestone.title" class="timeline-item">
            <span class="timeline-item__year">{{ milestone.year }}</span>
            <div class="timeline-item__content">
              <h4>{{ milestone.title }}</h4>
              <p>{{ milestone.description }}</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about {
  display: flex;
  justify-content: center;
  padding: 0 1.5rem 4rem;
}

.about__inner {
  width: min(960px, 100%);
  display: flex;
  flex-direction: column;
  gap: 2.75rem;
}

.about__hero {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 1.75rem 2rem;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(64, 77, 255, 0.12), rgba(17, 24, 39, 0.04));
  box-shadow: inset 0 0 0 1px rgba(64, 77, 255, 0.08);
}

.about__lead {
  margin: 0;
  line-height: 1.6;
  color: rgba(17, 24, 39, 0.78);
  max-width: 720px;
}

.about__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.about__section-title {
  margin-bottom: 1.1rem;
}

.team-grid {
  display: grid;
  gap: 1.25rem;
}

@media (min-width: 780px) {
  .team-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.team-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 100%;
}

.team-card__role {
  margin: 0;
  font-weight: 600;
  color: #1f2937;
}

.team-card__focus {
  margin: 0;
  line-height: 1.5;
  color: rgba(17, 24, 39, 0.78);
}

.team-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.team-card__tags li {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.85rem;
  background: rgba(64, 77, 255, 0.12);
  color: #404dff;
  font-weight: 600;
}

.focus-grid {
  display: grid;
  gap: 1.25rem;
}

@media (min-width: 720px) {
  .focus-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.focus-card {
  min-height: 100%;
}

.focus-card p {
  margin: 0;
  line-height: 1.52;
  color: rgba(17, 24, 39, 0.78);
}

.timeline {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 1rem;
}

.timeline-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem 1rem;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  background: rgba(17, 24, 39, 0.04);
  box-shadow: inset 0 0 0 1px rgba(17, 24, 39, 0.05);
}

.timeline-item__year {
  font-weight: 700;
  color: #404dff;
  letter-spacing: 0.04em;
}

.timeline-item__content h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.timeline-item__content p {
  margin: 0.4rem 0 0 0;
  line-height: 1.55;
  color: rgba(17, 24, 39, 0.78);
}

@media (max-width: 720px) {
  .about {
    padding: 0 1rem 3rem;
  }

  .about__hero {
    padding: 1.5rem;
  }

  .timeline-item {
    grid-template-columns: 1fr;
  }

  .timeline-item__year {
    order: -1;
  }
}
</style>
