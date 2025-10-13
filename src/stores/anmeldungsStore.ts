// Pinia store powering the step-by-step registration flow.
import { defineStore } from 'pinia'

import type {
  ChecklistState,
  Exkursion,
  NotfallKontakt,
  Persoenlich,
} from '@/types/anmeldung'
import { useAdminStore } from './adminStore'

const STORAGE_KEY = 'anmeldung-store'

// Generate a unique identifier for the current registration draft/submission.
function createAnmeldungId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `anmeldung-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`
}

// Base checklist state mirrors the checkbox form and is reused after resets.
function createDefaultChecklist(): ChecklistState {
  return {
    check1: false,
    check2: false,
    check3: false,
    check4: false,
    check5: false,
    check6: false,
    check7: false,
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
    checklist: createDefaultChecklist(),
  }
}

export interface AnmeldungState {
  anmeldungId: string
  submittedAt: string | null
  exkursion: Exkursion
  persoenlich: Persoenlich
  notfall: NotfallKontakt
  note: string
  checklist: ChecklistState
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
      const parsed = JSON.parse(savedState) as Partial<AnmeldungState>
      return {
        ...defaults,
        ...parsed,
        anmeldungId: parsed?.anmeldungId || defaults.anmeldungId,
        submittedAt: parsed?.submittedAt ?? null,
        exkursion: { ...defaults.exkursion, ...(parsed?.exkursion || {}) },
        persoenlich: { ...defaults.persoenlich, ...(parsed?.persoenlich || {}) },
        notfall: { ...defaults.notfall, ...(parsed?.notfall || {}) },
        checklist: { ...defaults.checklist, ...(parsed?.checklist || {}) },
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
    setChecklist(checklist: Partial<ChecklistState>) {
      this.checklist = { ...this.checklist, ...checklist }
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
        checklist: { ...this.checklist },
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
