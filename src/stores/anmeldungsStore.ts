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
}

export const useAnmeldungStore = defineStore('anmeldung', {
  state: (): AnmeldungState => {
    // Try to load state from localStorage
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      return JSON.parse(savedState)
    }

    // Return default state if nothing in localStorage
    return {
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
    }
  },

  actions: {
    setExkursion(exkursion: Exkursion) {
      this.exkursion = exkursion
      this.saveToLocalStorage()
    },
    setPersoenlich(persoenlich: Persoenlich) {
      this.persoenlich = persoenlich
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
