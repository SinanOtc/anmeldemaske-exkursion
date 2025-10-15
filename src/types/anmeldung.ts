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

// Mandatory confirmations participants must accept before submitting.
export interface BestaetigungenState {
  kostenSelbsttragen: boolean
  auswaertigesAmtInformiert: boolean
  verhaltenskodexEinhaltung: boolean
  datenweitergabeErlaubt: boolean
  versicherungVorhanden: boolean
  signalGruppeBeitritt: boolean
  reiseEigenverantwortlich: boolean
}
