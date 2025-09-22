import { defineStore } from 'pinia'

const STORAGE_KEY = 'anmeldung-store'

interface Exkursion {
  titel: string
  datum: string
  ort: string
  id: string
}

interface Persoenlich {
  vorname: string
  nachname: string
  ausweisart: 'Reisepass' | 'Personalausweis'
  ausweisnr: string
  handy: string
  reiseart?: 'Auto' | 'Bus' | 'Flugzeug'
  gruppe?: 'Alleine' | 'Mit einem oder mehreren Partnern'
}

interface NotfallKontakt {
  name: string
  beziehung: string
  telefon: string
}

interface AnmeldungState {
  exkursion: Exkursion
  persoenlich: Persoenlich
  notfall: NotfallKontakt
  note: string
  checklist: ChecklistState
}

interface ChecklistState {
  check1: boolean
  check2: boolean
  check3: boolean
  check4: boolean
  check5: boolean
  check6: boolean
  check7: boolean
}

export const useAnmeldungStore = defineStore('anmeldung', {
  state: (): AnmeldungState => {
    // Try to load state from localStorage
    const savedState = localStorage.getItem(STORAGE_KEY)
    const defaults: AnmeldungState = {
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
      },
      notfall: {
        name: '',
        beziehung: '',
        telefon: '',
      },
      note: '',
      checklist: {
        check1: false,
        check2: false,
        check3: false,
        check4: false,
        check5: false,
        check6: false,
        check7: false,
      },
    }

    if (savedState) {
      const parsed = JSON.parse(savedState)
      // Merge deep to keep backward compatibility when new fields are added
      return {
        ...defaults,
        ...parsed,
        exkursion: { ...defaults.exkursion, ...(parsed.exkursion || {}) },
        persoenlich: { ...defaults.persoenlich, ...(parsed.persoenlich || {}) },
        notfall: { ...defaults.notfall, ...(parsed.notfall || {}) },
        checklist: { ...defaults.checklist, ...(parsed.checklist || {}) },
      }
    }

    // Return default state if nothing in localStorage
    return defaults
  },

  actions: {
    setExkursion(exkursion: Exkursion) {
      this.exkursion = exkursion
      this.saveToLocalStorage()
    },
    setPersoenlich(persoenlich: Partial<Persoenlich>) {
      this.persoenlich = { ...this.persoenlich, ...persoenlich }
      this.saveToLocalStorage()
    },
    setNotfall(notfall: NotfallKontakt) {
      this.notfall = notfall
      this.saveToLocalStorage()
    },
    setNote(note: string) {
      this.note = note
      this.saveToLocalStorage()
    },
    setChecklist(checklist: ChecklistState) {
      this.checklist = checklist
      this.saveToLocalStorage()
    },
    resetStore() {
      this.$reset()
      localStorage.removeItem(STORAGE_KEY)
    },
    saveToLocalStorage() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state))
    },
  },

  getters: {
    fullName: (state) => `${state.persoenlich.vorname} ${state.persoenlich.nachname}`,
    isComplete: (state) =>
      Boolean(state.exkursion.id) &&
      Boolean(state.persoenlich.vorname) &&
      Boolean(state.persoenlich.nachname) &&
      Boolean(state.notfall.name),
  },
})
