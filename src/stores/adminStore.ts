import { defineStore } from 'pinia'

import type {
  ChecklistState,
  Exkursion,
  NotfallKontakt,
  Persoenlich,
} from '@/types/anmeldung'

const AUTH_STORAGE_KEY = 'admin-auth'
const DATA_STORAGE_KEY = 'admin-data'
const FALLBACK_ADMIN_TOKEN = 'hallo-admin'

export type AdminTeilnehmerStatus = 'eingegangen' | 'bestaetigt' | 'abgelehnt'

export interface AdminExkursion extends Exkursion {
  beschreibung?: string
  kapazitaet?: number
  createdAt: string
  updatedAt: string
  archived?: boolean
}

export interface AdminTeilnehmer {
  id: string
  exkursionId: string
  persoenlich: Persoenlich
  notfall: NotfallKontakt
  note: string
  checklist: ChecklistState
  status: AdminTeilnehmerStatus
  submittedAt: string
  updatedAt: string
  exkursionSnapshot?: Exkursion
}

interface AdminDataSnapshot {
  exkursionen: AdminExkursion[]
  teilnehmer: AdminTeilnehmer[]
}

interface AdminState extends AdminDataSnapshot {
  isAdmin: boolean
  adminToken: string
  loading: boolean
  error: string | null
  hydrated: boolean
}

function nowIso() {
  return new Date().toISOString()
}

function sanitizeExkursion(payload: AdminExkursion): AdminExkursion {
  const cleaned: AdminExkursion = {
    titel: payload.titel.trim(),
    datum: payload.datum.trim(),
    ort: payload.ort.trim(),
    id: payload.id.trim(),
    beschreibung: payload.beschreibung?.trim() || undefined,
    kapazitaet: payload.kapazitaet && payload.kapazitaet > 0 ? payload.kapazitaet : undefined,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
    archived: payload.archived ?? false,
  }

  return cleaned
}

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    isAdmin: false,
    adminToken: '',
    loading: false,
    error: null,
    hydrated: false,
    exkursionen: [],
    teilnehmer: [],
  }),

  getters: {
    hasExkursionen: (state) => state.exkursionen.length > 0,
    exkursionById: (state) => (id: string) => state.exkursionen.find((e) => e.id === id) ?? null,
    teilnehmerByExkursion: (state) => (exkursionId: string | null) =>
      exkursionId
        ? state.teilnehmer.filter((eintrag) => eintrag.exkursionId === exkursionId)
        : state.teilnehmer,
    distinctExkursionOptions: (state) =>
      state.exkursionen
        .filter((item) => !item.archived)
        .map((item) => ({ label: `${item.titel} (${item.id || 'ohne ID'})`, value: item.id })),
  },

  actions: {
    hydrate() {
      if (this.hydrated) {
        return
      }

      try {
        const authRaw = localStorage.getItem(AUTH_STORAGE_KEY)
        if (authRaw) {
          const parsed = JSON.parse(authRaw) as Partial<Pick<AdminState, 'isAdmin' | 'adminToken'>>
          this.isAdmin = Boolean(parsed.isAdmin)
          this.adminToken = typeof parsed.adminToken === 'string' ? parsed.adminToken : ''
        }

        const dataRaw = localStorage.getItem(DATA_STORAGE_KEY)
        if (dataRaw) {
          const parsed = JSON.parse(dataRaw) as Partial<AdminDataSnapshot>
          this.exkursionen = Array.isArray(parsed.exkursionen)
            ? parsed.exkursionen.map((exkursion) => sanitizeExkursion({
                ...exkursion,
                createdAt: exkursion?.createdAt ?? nowIso(),
                updatedAt: exkursion?.updatedAt ?? nowIso(),
              }))
            : []
          this.teilnehmer = Array.isArray(parsed.teilnehmer)
            ? parsed.teilnehmer.map((teilnehmer) => ({
                ...teilnehmer,
                status: teilnehmer?.status ?? 'eingegangen',
                submittedAt: teilnehmer?.submittedAt ?? nowIso(),
                updatedAt: teilnehmer?.updatedAt ?? nowIso(),
              }))
            : []
        }
      } catch (err) {
        console.error('AdminStore hydrate error', err)
        this.error = 'Persistierte Admin-Daten konnten nicht geladen werden.'
      } finally {
        this.hydrated = true
      }
    },

    persistAuth() {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          isAdmin: this.isAdmin,
          adminToken: this.adminToken,
        }),
      )
    },

    persistData() {
      const payload: AdminDataSnapshot = {
        exkursionen: this.exkursionen,
        teilnehmer: this.teilnehmer,
      }

      const snapshot = JSON.parse(JSON.stringify(payload)) as AdminDataSnapshot
      localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(snapshot))
    },

    ensureHydrated() {
      if (!this.hydrated) {
        this.hydrate()
      }
    },

    login(token: string) {
      this.ensureHydrated()
      const expectedToken = import.meta.env.VITE_ADMIN_TOKEN || FALLBACK_ADMIN_TOKEN
      if (token.trim() === String(expectedToken).trim()) {
        this.isAdmin = true
        this.adminToken = token
        this.persistAuth()
        return true
      }

      this.isAdmin = false
      this.adminToken = ''
      this.persistAuth()
      return false
    },

    logout() {
      this.isAdmin = false
      this.adminToken = ''
      this.persistAuth()
    },

    upsertExkursion(
      payload: Omit<AdminExkursion, 'createdAt' | 'updatedAt'> & { id: string },
      originalId?: string,
    ) {
      this.ensureHydrated()

      const trimmedId = payload.id.trim()
      if (!trimmedId) {
        throw new Error('Eine Exkursions-ID ist erforderlich.')
      }

      const matchId = (originalId ? originalId.trim() : trimmedId) || trimmedId
      const existingIndex = this.exkursionen.findIndex((item) => item.id === matchId)
      const conflictIndex = this.exkursionen.findIndex(
        (item) => item.id === trimmedId && item.id !== matchId,
      )

      if (conflictIndex >= 0 && conflictIndex !== existingIndex) {
        throw new Error('Die gewünschte Exkursions-ID ist bereits vergeben.')
      }

      if (existingIndex >= 0) {
        const previous = this.exkursionen[existingIndex]
        const updated: AdminExkursion = sanitizeExkursion({
          ...previous,
          ...payload,
          id: trimmedId,
          updatedAt: nowIso(),
        })
        this.exkursionen.splice(existingIndex, 1, updated)
      } else {
        const now = nowIso()
        const created: AdminExkursion = sanitizeExkursion({
          ...payload,
          id: trimmedId,
          createdAt: now,
          updatedAt: now,
        })
        this.exkursionen.push(created)
      }

      this.persistData()
    },

    toggleArchiveExkursion(id: string, archived: boolean) {
      this.ensureHydrated()
      const target = this.exkursionen.find((entry) => entry.id === id)
      if (!target) {
        return
      }
      target.archived = archived
      target.updatedAt = nowIso()
      this.persistData()
    },

    deleteExkursion(id: string) {
      this.ensureHydrated()
      this.exkursionen = this.exkursionen.filter((entry) => entry.id !== id)
      this.persistData()
    },

    recordSubmission(payload: Omit<AdminTeilnehmer, 'status' | 'submittedAt' | 'updatedAt'> & {
      status?: AdminTeilnehmerStatus
      submittedAt?: string
      updatedAt?: string
    }) {
      this.ensureHydrated()

      const now = nowIso()
      const index = this.teilnehmer.findIndex((entry) => entry.id === payload.id)
      const base: AdminTeilnehmer = {
        ...payload,
        exkursionSnapshot: payload.exkursionSnapshot ?? this.exkursionById(payload.exkursionId) ?? undefined,
        status: payload.status ?? 'eingegangen',
        submittedAt: payload.submittedAt ?? now,
        updatedAt: now,
      }

      if (index >= 0) {
        this.teilnehmer.splice(index, 1, base)
      } else {
        this.teilnehmer.push(base)
      }

      this.persistData()
    },

    updateTeilnehmerStatus(id: string, status: AdminTeilnehmerStatus) {
      this.ensureHydrated()
      const target = this.teilnehmer.find((entry) => entry.id === id)
      if (!target) {
        return
      }
      target.status = status
      target.updatedAt = nowIso()
      this.persistData()
    },

    deleteTeilnehmer(id: string) {
      this.ensureHydrated()
      this.teilnehmer = this.teilnehmer.filter((entry) => entry.id !== id)
      this.persistData()
    },

    exportTeilnehmerCsv(exkursionId?: string) {
      this.ensureHydrated()

      const delimiter = ';'
      const headers = [
        'teilnehmer_id',
        'status',
        'submitted_at',
        'updated_at',
        'exkursion_id',
        'exkursion_titel',
        'vorname',
        'nachname',
        'ausweisart',
        'ausweisnr',
        'handy',
        'email',
        'matrikelnr',
        'reiseart',
        'gruppe',
        'notfall_name',
        'notfall_beziehung',
        'notfall_telefon',
        'note',
      ]

      const rows = this.teilnehmer
        .filter((entry) => (exkursionId ? entry.exkursionId === exkursionId : true))
        .map((entry) => {
          const exkursion = this.exkursionById(entry.exkursionId)
          const perso = entry.persoenlich
          return {
            teilnehmer_id: entry.id,
            status: entry.status,
            submitted_at: entry.submittedAt,
            updated_at: entry.updatedAt,
            exkursion_id: entry.exkursionId,
            exkursion_titel: exkursion?.titel ?? entry.exkursionSnapshot?.titel ?? '',
            vorname: perso.vorname ?? '',
            nachname: perso.nachname ?? '',
            ausweisart: perso.ausweisart ?? '',
            ausweisnr: perso.ausweisnr ?? '',
            handy: perso.handy ?? '',
            email: perso.email ?? '',
            matrikelnr: perso.matrikelnr ?? '',
            reiseart: perso.reiseart ?? '',
            gruppe: perso.gruppe ?? '',
            notfall_name: entry.notfall.name ?? '',
            notfall_beziehung: entry.notfall.beziehung ?? '',
            notfall_telefon: entry.notfall.telefon ?? '',
            note: entry.note ?? '',
          }
        })

      const escapeCsv = (val: string) => {
        if (val.includes(delimiter) || val.includes('"') || /\r?\n/.test(val)) {
          return '"' + val.replace(/"/g, '""') + '"'
        }
        return val
      }

      const headerLine = headers.join(delimiter)
      const lines = rows.map((row) =>
        headers.map((header) => escapeCsv(String(row[header as keyof typeof row] ?? ''))).join(delimiter),
      )

      return '\uFEFF' + [headerLine, ...lines].join('\r\n')
    },
  },
})
