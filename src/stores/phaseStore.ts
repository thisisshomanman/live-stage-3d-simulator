/**
 * ファイル概要:
 * - フェーズ保存 / 読込 / 編集 / 削除を管理する Pinia ストア
 *
 * このファイルの目的:
 * - 現在の view / speaker 状態を phase として保存する
 * - 保存済み phase を選択して読み込めるようにする
 * - localStorage へ永続化して、リロード後も phase を残す
 */

import { defineStore } from 'pinia'

import { useSelectionStore } from '@/stores/selectionStore'
import { useSpeakerStore } from '@/stores/speakerStore'
import { useViewStore } from '@/stores/viewStore'

import type {
  PhaseItem,
  PhaseSnapshot,
  PhaseSpeakerSnapshot,
  PhaseViewSnapshot,
} from '@/types/phase'
import type { SpeakerSettings, SpeakerTypeVisibility } from '@/types/speaker'

/**
 * localStorage 保存キー。
 */
const PHASE_STORAGE_KEY = 'live-stage-3d-simulator:phases'

/**
 * speaker 一覧を複製する。
 *
 * @param speakers 複製元一覧
 * @returns 複製後一覧
 */
function cloneSpeakers(speakers: SpeakerSettings[]): SpeakerSettings[] {
  return speakers.map((speaker) => ({
    ...speaker,
  }))
}

/**
 * 種別表示状態を複製する。
 *
 * @param typeVisibility 複製元
 * @returns 複製後
 */
function cloneTypeVisibility(typeVisibility: SpeakerTypeVisibility): SpeakerTypeVisibility {
  return {
    ...typeVisibility,
  }
}

/**
 * phase snapshot を deep clone する。
 *
 * @param snapshot 複製元 snapshot
 * @returns 複製後 snapshot
 */
function cloneSnapshot(snapshot: PhaseSnapshot): PhaseSnapshot {
  return {
    view: {
      currentView: snapshot.view.currentView,
    },
    speaker: {
      showSpeakers: snapshot.speaker.showSpeakers,
      typeVisibility: cloneTypeVisibility(snapshot.speaker.typeVisibility),
      speakers: cloneSpeakers(snapshot.speaker.speakers),
    },
  }
}

/**
 * phase ID を生成する。
 *
 * @returns 一意な phase ID
 */
function createPhaseId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `phase-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/**
 * localStorage が使えるかどうかを判定する。
 *
 * @returns 利用可能なら true
 */
function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export const usePhaseStore = defineStore('phase', {
  state: () => ({
    /**
     * 保存済み phase 一覧。
     */
    phases: [] as PhaseItem[],

    /**
     * 現在選択中の phase ID。
     * 未選択時は空文字。
     */
    selectedPhaseId: '',

    /**
     * localStorage 読込済みかどうか。
     */
    isInitialized: false,
  }),

  getters: {
    /**
     * 現在選択中の phase。
     *
     * @param state 現在の state
     * @returns 選択中 phase。なければ null
     */
    selectedPhase: (state): PhaseItem | null => {
      return state.phases.find((phase) => phase.id === state.selectedPhaseId) ?? null
    },

    /**
     * phase が選択されているかどうか。
     *
     * @param state 現在の state
     * @returns 選択中なら true
     */
    hasSelectedPhase: (state): boolean => state.selectedPhaseId !== '',
  },

  actions: {
    /**
     * localStorage から phase 一覧を読み込む。
     * 多重初期化を防ぐため、2回目以降は何もしない。
     */
    initialize(): void {
      if (this.isInitialized) {
        return
      }

      if (!canUseLocalStorage()) {
        this.isInitialized = true
        return
      }

      const rawValue = window.localStorage.getItem(PHASE_STORAGE_KEY)

      if (!rawValue) {
        this.isInitialized = true
        return
      }

      try {
        const parsed = JSON.parse(rawValue) as PhaseItem[]

        this.phases = Array.isArray(parsed)
          ? parsed.map((phase) => ({
              ...phase,
              snapshot: cloneSnapshot(phase.snapshot),
            }))
          : []

        this.selectedPhaseId = this.phases[0]?.id ?? ''
      } catch (error) {
        console.error('Failed to parse saved phases from localStorage.', error)
        this.phases = []
        this.selectedPhaseId = ''
      }

      this.isInitialized = true
    },

    /**
     * 現在の view / speaker 状態から snapshot を生成する。
     *
     * @returns 現在状態の snapshot
     */
    createSnapshotFromCurrentState(): PhaseSnapshot {
      const viewStore = useViewStore()
      const speakerStore = useSpeakerStore()

      const viewSnapshot: PhaseViewSnapshot = {
        currentView: viewStore.currentView,
      }

      const speakerSnapshot: PhaseSpeakerSnapshot = {
        showSpeakers: speakerStore.showSpeakers,
        typeVisibility: cloneTypeVisibility(speakerStore.typeVisibility),
        speakers: cloneSpeakers(speakerStore.speakers),
      }

      return {
        view: viewSnapshot,
        speaker: speakerSnapshot,
      }
    },

    /**
     * 現在状態を新しい phase として保存する。
     *
     * @param name 保存名
     * @returns 保存した phase
     */
    saveCurrentPhase(name: string): PhaseItem {
      const trimmedName = name.trim()
      const resolvedName = trimmedName !== '' ? trimmedName : `Phase ${this.phases.length + 1}`

      const phase: PhaseItem = {
        id: createPhaseId(),
        name: resolvedName,
        createdAt: new Date().toISOString(),
        snapshot: this.createSnapshotFromCurrentState(),
      }

      this.phases.push(phase)
      this.selectedPhaseId = phase.id
      this.persistToLocalStorage()

      return phase
    },

    /**
     * 指定 phase を選択状態にする。
     *
     * @param phaseId 選択対象 phase ID
     */
    selectPhase(phaseId: string): void {
      this.selectedPhaseId = phaseId
    },

    /**
     * 選択中 phase を現在の store 群へ適用する。
     *
     * @returns 適用できたら true
     */
    loadSelectedPhase(): boolean {
      const phase = this.selectedPhase
      if (!phase) {
        return false
      }

      return this.loadPhaseById(phase.id)
    },

    /**
     * 指定 phase を現在の store 群へ適用する。
     *
     * @param phaseId 読み込み対象 phase ID
     * @returns 適用できたら true
     */
    loadPhaseById(phaseId: string): boolean {
      const phase = this.phases.find((item) => item.id === phaseId)
      if (!phase) {
        return false
      }

      const viewStore = useViewStore()
      const speakerStore = useSpeakerStore()
      const selectionStore = useSelectionStore()

      viewStore.applyPhaseViewSnapshot(phase.snapshot.view)
      speakerStore.applyPhaseSpeakerSnapshot(phase.snapshot.speaker)
      selectionStore.clearSelection()

      this.selectedPhaseId = phase.id

      return true
    },

    /**
     * 選択中 phase の名前を変更する。
     *
     * @param name 新しい phase 名
     * @returns 変更できたら true
     */
    renameSelectedPhase(name: string): boolean {
      const phase = this.selectedPhase
      if (!phase) {
        return false
      }

      const trimmedName = name.trim()
      if (trimmedName === '') {
        return false
      }

      phase.name = trimmedName
      this.persistToLocalStorage()

      return true
    },

    /**
     * 選択中 phase を削除する。
     *
     * @returns 削除できたら true
     */
    deleteSelectedPhase(): boolean {
      if (!this.selectedPhaseId) {
        return false
      }

      return this.deletePhaseById(this.selectedPhaseId)
    },

    /**
     * 指定 phase を削除する。
     *
     * @param phaseId 削除対象 phase ID
     * @returns 削除できたら true
     */
    deletePhaseById(phaseId: string): boolean {
      const targetIndex = this.phases.findIndex((phase) => phase.id === phaseId)
      if (targetIndex === -1) {
        return false
      }

      this.phases.splice(targetIndex, 1)

      if (this.selectedPhaseId === phaseId) {
        this.selectedPhaseId =
          this.phases[targetIndex]?.id ?? this.phases[targetIndex - 1]?.id ?? ''
      }

      this.persistToLocalStorage()

      return true
    },

    /**
     * phase 一覧を localStorage へ保存する。
     */
    persistToLocalStorage(): void {
      if (!canUseLocalStorage()) {
        return
      }

      window.localStorage.setItem(PHASE_STORAGE_KEY, JSON.stringify(this.phases))
    },
  },
})
