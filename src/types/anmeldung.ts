// Allowed identity document types captured during the registration.
export type Ausweisart = 'Reisepass' | 'Personalausweis'

// Travel modes help the organising team understand individual logistics.
export type Reiseart =
  | 'Auto'
  | 'Bus'
  | 'Flugzeug'
  | 'Zug'
  | 'Noch nicht festgelegt/Sonstige'

// Grouping choice indicates whether the student travels alone or with others.
export type Gruppenart = 'Alleine' | 'Mit einem oder mehreren Partnern' | '-'

// Minimal excursion data injected into the public wizard.
export interface Exkursion {
  titel: string
  datum: string
  ort: string
  id: string
}

// Personal details collected from each student.
export interface Persoenlich {
  vorname: string
  nachname: string
  ausweisart: Ausweisart
  ausweisnr: string
  handy: string
  email: string
  matrikelnr: string
  reiseart?: Reiseart
  gruppe?: Gruppenart
}

// Emergency contact details requested alongside the registration.
export interface NotfallKontakt {
  name: string
  beziehung: string
  telefon: string
}

// Checklist answers confirm the mandatory declarations.
export interface ChecklistState {
  check1: boolean
  check2: boolean
  check3: boolean
  check4: boolean
  check5: boolean
  check6: boolean
  check7: boolean
}
