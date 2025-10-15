// Pinia store powering the step-by-step registration flow.
import { defineStore } from 'pinia'

import type { BestaetigungenState, Exkursion, NotfallKontakt, Persoenlich } from '@/types/anmeldung'
import { useAdminStore } from './adminStore'

const STORAGE_KEY = 'anmeldung-store'

// Generate a unique identifier for the current registration draft/submission.
function createAnmeldungId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `anmeldung-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`
}

// Default confirmations align with the consent statements in the checklist view.
function createDefaultBestaetigungen(): BestaetigungenState {
  return {
    kostenSelbsttragen: false,
    auswaertigesAmtInformiert: false,
    verhaltenskodexEinhaltung: false,
    datenweitergabeErlaubt: false,
    versicherungVorhanden: false,
    signalGruppeBeitritt: false,
    reiseEigenverantwortlich: false,
  }
}

type LegacyChecklist = Partial<{
  check1: boolean
  check2: boolean
  check3: boolean
  check4: boolean
  check5: boolean
  check6: boolean
  check7: boolean
}>

function normalizeBestaetigungen(
  bestaetigungen?: Partial<BestaetigungenState> | null,
  legacyChecklist?: LegacyChecklist | null,
): BestaetigungenState {
  const defaults = createDefaultBestaetigungen()
  const current = (bestaetigungen ?? {}) as Partial<BestaetigungenState>
  const legacy = (legacyChecklist ?? {}) as LegacyChecklist

  return {
    kostenSelbsttragen: current.kostenSelbsttragen ?? legacy.check1 ?? defaults.kostenSelbsttragen,
    auswaertigesAmtInformiert:
      current.auswaertigesAmtInformiert ?? legacy.check2 ?? defaults.auswaertigesAmtInformiert,
    verhaltenskodexEinhaltung:
      current.verhaltenskodexEinhaltung ?? legacy.check3 ?? defaults.verhaltenskodexEinhaltung,
    datenweitergabeErlaubt:
      current.datenweitergabeErlaubt ?? legacy.check4 ?? defaults.datenweitergabeErlaubt,
    versicherungVorhanden: current.versicherungVorhanden ?? legacy.check5 ?? defaults.versicherungVorhanden,
    signalGruppeBeitritt: current.signalGruppeBeitritt ?? legacy.check6 ?? defaults.signalGruppeBeitritt,
    reiseEigenverantwortlich:
      current.reiseEigenverantwortlich ?? legacy.check7 ?? defaults.reiseEigenverantwortlich,
  }
}

// Creates a fresh default draft that we can rehydrate on init or after reset.
function createDefaultState(): AnmeldungState {
  return {
    anmeldungId: createAnmeldungId(),
    submittedAt: null,
    exkursion: {
      titel: '',
      datum: '',
      ort: '',
      id: '',
    },
    persoenlich: {
      vorname: '',
      nachname: '',
      ausweisart: 'Personalausweis',
      ausweisnr: '',
      handy: '',
      email: '',
      matrikelnr: '',
    },
    notfall: {
      name: '',
      beziehung: '',
      telefon: '',
    },
    note: '',
    bestaetigungen: createDefaultBestaetigungen(),
  }
}

export interface AnmeldungState {
  anmeldungId: string
  submittedAt: string | null
  exkursion: Exkursion
  persoenlich: Persoenlich
  notfall: NotfallKontakt
  note: string
  bestaetigungen: BestaetigungenState
}

export const useAnmeldungStore = defineStore('anmeldung', {
  state: (): AnmeldungState => {
    const defaults = createDefaultState()

    if (typeof localStorage === 'undefined') {
      return defaults
    }

    // Restore persisted drafts for returning users.
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (!savedState) {
      return defaults
    }

    try {
      const parsed = JSON.parse(savedState) as Partial<AnmeldungState> & { checklist?: LegacyChecklist }
      return {
        ...defaults,
        ...parsed,
        anmeldungId: parsed?.anmeldungId || defaults.anmeldungId,
        submittedAt: parsed?.submittedAt ?? null,
        exkursion: { ...defaults.exkursion, ...(parsed?.exkursion || {}) },
        persoenlich: { ...defaults.persoenlich, ...(parsed?.persoenlich || {}) },
        notfall: { ...defaults.notfall, ...(parsed?.notfall || {}) },
        bestaetigungen: normalizeBestaetigungen(parsed?.bestaetigungen ?? null, parsed?.checklist ?? null),
      }
    } catch (error) {
      console.warn('AnmeldungStore konnte nicht aus dem Storage geladen werden.', error)
      return defaults
    }
  },

  actions: {
    // Field-level update helpers keep the views thin.
    setExkursion(exkursion: Partial<Exkursion>) {
      this.exkursion = { ...this.exkursion, ...exkursion }
      this.touchDraft()
    },
    setPersoenlich(persoenlich: Partial<Persoenlich>) {
      this.persoenlich = { ...this.persoenlich, ...persoenlich }
      this.touchDraft()
    },
    setNotfall(notfall: Partial<NotfallKontakt>) {
      this.notfall = { ...this.notfall, ...notfall }
      this.touchDraft()
    },
    setNote(note: string) {
      this.note = note
      this.touchDraft()
    },
    setBestaetigungen(bestaetigungen: Partial<BestaetigungenState>) {
      this.bestaetigungen = { ...this.bestaetigungen, ...bestaetigungen }
      this.touchDraft()
    },
    // Resets the entire draft and clears persisted data.
    resetStore() {
      const defaults = createDefaultState()
      this.$patch(defaults)
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
      }
    },
    // Mark the draft dirty so the submission timestamp resets.
    touchDraft() {
      this.submittedAt = null
      this.saveToLocalStorage()
    },
    // Ensure an ID is always set before we submit or export.
    ensureAnmeldungId() {
      if (!this.anmeldungId) {
        this.anmeldungId = createAnmeldungId()
      }
    },
    // Finalises the registration and pushes a snapshot into the admin store.
    submitAnmeldung() {
      this.ensureAnmeldungId()

      if (!this.exkursion.id) {
        throw new Error('Es wurde keine Exkursions-ID hinterlegt.')
      }

      const adminStore = useAdminStore()
      adminStore.recordSubmission({
        id: this.anmeldungId,
        exkursionId: this.exkursion.id,
        persoenlich: { ...this.persoenlich },
        notfall: { ...this.notfall },
        note: this.note,
        bestaetigungen: { ...this.bestaetigungen },
        exkursionSnapshot: { ...this.exkursion },
      })

      this.submittedAt = new Date().toISOString()
      this.saveToLocalStorage()
    },
    // Persist the current draft for continuity across reloads.
    saveToLocalStorage() {
      if (typeof localStorage === 'undefined') {
        return
      }

      const snapshot = JSON.parse(JSON.stringify(this.$state)) as AnmeldungState
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    },
  },

  getters: {
    // Convenience derived values used throughout the wizard.
    fullName: (state) => `${state.persoenlich.vorname} ${state.persoenlich.nachname}`.trim(),
    isComplete: (state) =>
      Boolean(state.exkursion.id) &&
      Boolean(state.persoenlich.vorname) &&
      Boolean(state.persoenlich.nachname) &&
      Boolean(state.persoenlich.email) &&
      Boolean(state.persoenlich.matrikelnr) &&
      Boolean(state.notfall.name),
    isSubmitted: (state) => Boolean(state.submittedAt),
  },
})
