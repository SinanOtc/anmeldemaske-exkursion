export type Ausweisart = 'Reisepass' | 'Personalausweis'

export type Reiseart =
  | 'Auto'
  | 'Bus'
  | 'Flugzeug'
  | 'Zug'
  | 'Noch nicht festgelegt/Sonstige'

export type Gruppenart = 'Alleine' | 'Mit einem oder mehreren Partnern' | '-'

export interface Exkursion {
  titel: string
  datum: string
  ort: string
  id: string
}

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

export interface NotfallKontakt {
  name: string
  beziehung: string
  telefon: string
}

export interface ChecklistState {
  check1: boolean
  check2: boolean
  check3: boolean
  check4: boolean
  check5: boolean
  check6: boolean
  check7: boolean
}
