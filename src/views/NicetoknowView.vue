<script setup lang="ts">
import { useRouter } from 'vue-router'
import { OnyxButton, OnyxCard, OnyxHeadline } from 'sit-onyx'
import { iconHome } from '@sit-onyx/icons'

const router = useRouter()

const checklistItems = [
  {
    title: 'Reisepass & Visum',
    detail:
      'Gültigkeit und Restlaufzeit prüfen, erforderliche Visa frühzeitig beantragen und Bestätigungen griffbereit haben.',
  },
  {
    title: 'Buchungen im Blick behalten',
    detail:
      'Flug-, Hotel- und Transferbestätigungen sowohl digital als auch ausgedruckt sichern, damit unterwegs alles verfügbar bleibt.',
  },
  {
    title: 'Versicherungsschutz',
    detail:
      'Eine Auslandskrankenversicherung abschließen und den Nachweis mitführen; zusätzliche Reiseversicherungen prüfen.',
  },
  {
    title: 'Gesundheit & Impfungen',
    detail:
      'Empfohlene Impfungen und medizinische Vorsorge für das Zielland rechtzeitig planen und dokumentieren.',
  },
  {
    title: 'Zahlungsmittel vorbereiten',
    detail:
      'Kredit- und Debitkarten prüfen, ausreichend Bargeld bereithalten und bei Bedarf Fremdwährung wechseln.',
  },
  {
    title: 'Notfallkontakte sichern',
    detail: 'Sperrnummern für Karten sowie relevante Notfallnummern separat abspeichern oder ausdrucken.',
  },
  {
    title: 'Digitale Ausrüstung',
    detail:
      'Handy, Ladegerät, Adapter sowie Datenkarten oder lokale SIM-Karten einpacken – Roaming-Konditionen prüfen.',
  },
  {
    title: 'Persönliche Packliste',
    detail:
      'Kleidung für Business und Freizeit, Hygieneartikel, benötigte Medikamente sowie Brille oder Kontaktlinsen vorbereiten.',
  },
  {
    title: 'Wichtige Dokumente doppelt sichern',
    detail:
      'Kopien von Pass, Visum, Versicherungen und Tickets sowohl in einer Cloud als auch physisch bereithalten.',
  },
  {
    title: 'Kontakte vor Ort',
    detail:
      'Adresse und Telefonnummern der deutschen Botschaft oder des Konsulats im Zielland notieren und griffbereit halten.',
  },
  {
    title: 'Mobilfunk prüfen',
    detail: 'Auslandstauglichkeit des Handytarifs klären oder rechtzeitig passende Optionen buchen.',
  },
  {
    title: 'Notfall-Checkliste',
    detail:
      'Wichtige Kontaktpersonen aus Familie, Unternehmen und Versicherung sammeln und für den Ernstfall bereit halten.',
  },
  {
    title: 'Aktuelle Lageinformationen',
    detail:
      'Regelmäßig die Hinweise des Auswärtigen Amts zu Einreisebestimmungen, Reisewarnungen und Sicherheit prüfen.',
  },
]

const openAuswaertigesAmt = () => {
  window.open('https://www.auswaertiges-amt.de/de/ReiseUndSicherheit', '_blank', 'noopener')
}
</script>

<template>
  <div class="page">
    <div class="page-content">
      <OnyxHeadline is="h2">Nice to Know: Internationale Reise-Checkliste</OnyxHeadline>
      <p class="intro">
        Damit Ihre Exkursion reibungslos verläuft, haben wir die wichtigsten To-dos vor der Abreise zusammengestellt.
      </p>

      <OnyxCard class="checklist-card">
        <template #title>Ihre Reisevorbereitung im Überblick</template>
        <ul class="checklist">
          <li v-for="(item, index) in checklistItems" :key="item.title" class="checklist__item">
            <span class="checklist__number">{{ index + 1 }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.detail }}</p>
          </li>
        </ul>
      </OnyxCard>

      <OnyxCard class="resources-card">
        <template #title>Offizielle Reisehinweise</template>
        <p>
          Nutzen Sie die Reise- und Sicherheitshinweise des Auswärtigen Amts, um aktuelle Informationen zu
          Einreise, Gesundheit und Sicherheit zu erhalten.
        </p>
        <OnyxButton label="Zum Auswärtigen Amt" variant="outline" @click="openAuswaertigesAmt" />
      </OnyxCard>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.intro {
  margin: 0;
  max-width: 720px;
  line-height: 1.6;
  color: rgba(17, 24, 39, 0.85);
}

.checklist-card,
.resources-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.checklist {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.checklist__item {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem;
  border-radius: 14px;
  background: rgba(64, 77, 255, 0.05);
  box-shadow: inset 0 0 0 1px rgba(64, 77, 255, 0.08);
}

.checklist__number {
  font-weight: 700;
  font-size: 1.2rem;
  color: #404dff;
}

.checklist__item h3 {
  grid-column: 2;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.checklist__item p {
  grid-column: 2;
  margin: 0.25rem 0 0 0;
  line-height: 1.5;
  color: rgba(17, 24, 39, 0.78);
}

@media (max-width: 720px) {
  .checklist {
    grid-template-columns: 1fr;
  }
}

.page-footer {
  margin-top: auto;
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
}
</style>
