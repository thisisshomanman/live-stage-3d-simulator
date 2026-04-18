/**
 * ファイル概要:
 * - フェーズ再生を管理する Pinia ストア
 *
 * このファイルの目的:
 * - phase 一覧を順番に自動再生する
 * - Play / Pause / Stop の状態を管理する
 * - 現在アクティブな phase を UI へ共有する
 */

import { defineStore } from 'pinia'

import { usePhaseStore } from '@/stores/phaseStore'

/**
 * browser timer を安全に消す。
 *
 * @param timeoutId timer ID
 */
function clearPlaybackTimeout(timeoutId: number | null): void {
  if (timeoutId === null || typeof window === 'undefined') {
    return
  }

  window.clearTimeout(timeoutId)
}

export const usePlaybackStore = defineStore('playback', {
  state: () => ({
    /**
     * 再生中かどうか。
     */
    isPlaying: false,

    /**
     * 一時停止中かどうか。
     */
    isPaused: false,

    /**
     * 現在アクティブな phase ID。
     * 未選択時は空文字。
     */
    activePhaseId: '',

    /**
     * 現在アクティブな phase index。
     * 未選択時は -1。
     */
    currentPhaseIndex: -1,

    /**
     * 次の phase へ進む timer ID。
     */
    timeoutId: null as number | null,
  }),

  getters: {
    /**
     * アクティブな phase があるかどうか。
     *
     * @param state 現在の state
     * @returns アクティブ phase があれば true
     */
    hasActivePhase: (state): boolean => state.activePhaseId !== '',
  },

  actions: {
    /**
     * 内部 timer をクリアする。
     */
    clearScheduledAdvance(): void {
      clearPlaybackTimeout(this.timeoutId)
      this.timeoutId = null
    },

    /**
     * 再生開始位置を解決する。
     *
     * 優先順位:
     * 1. pause からの再開位置
     * 2. 現在選択中 phase
     * 3. 先頭 phase
     *
     * @returns 開始 index。見つからなければ -1
     */
    resolveStartIndex(): number {
      const phaseStore = usePhaseStore()

      if (phaseStore.phases.length === 0) {
        return -1
      }

      if (this.isPaused && this.activePhaseId !== '') {
        const pausedIndex = phaseStore.phases.findIndex((phase) => phase.id === this.activePhaseId)
        if (pausedIndex !== -1) {
          return pausedIndex
        }
      }

      if (phaseStore.selectedPhaseId !== '') {
        const selectedIndex = phaseStore.phases.findIndex(
          (phase) => phase.id === phaseStore.selectedPhaseId,
        )

        if (selectedIndex !== -1) {
          return selectedIndex
        }
      }

      return 0
    },

    /**
     * 現在アクティブな phase の durationMs で次送り timer を設定する。
     */
    scheduleAdvanceForCurrentPhase(): void {
      const phaseStore = usePhaseStore()
      const currentPhase = phaseStore.phases[this.currentPhaseIndex]

      this.clearScheduledAdvance()

      if (!this.isPlaying || !currentPhase || typeof window === 'undefined') {
        return
      }

      /**
       * arrow function を使って store の this を保持する。
       */
      this.timeoutId = window.setTimeout(() => {
        this.advanceToNextPhase()
      }, currentPhase.durationMs)
    },

    /**
     * 再生を開始する。
     *
     * @returns 開始できたら true
     */
    play(): boolean {
      const phaseStore = usePhaseStore()
      phaseStore.initialize()

      if (phaseStore.phases.length === 0) {
        return false
      }

      if (this.isPlaying) {
        return true
      }

      const startIndex = this.resolveStartIndex()
      if (startIndex === -1) {
        return false
      }

      const startPhase = phaseStore.phases[startIndex]
      if (!startPhase) {
        return false
      }

      this.isPlaying = true
      this.isPaused = false
      this.currentPhaseIndex = startIndex
      this.activePhaseId = startPhase.id

      phaseStore.loadPhaseById(startPhase.id)
      this.scheduleAdvanceForCurrentPhase()

      return true
    },

    /**
     * 一時停止する。
     *
     * @returns 一時停止できたら true
     */
    pause(): boolean {
      if (!this.isPlaying) {
        return false
      }

      this.clearScheduledAdvance()
      this.isPlaying = false
      this.isPaused = true

      return true
    },

    /**
     * 停止して先頭 phase に戻す。
     *
     * @returns 停止できたら true
     */
    stop(): boolean {
      const phaseStore = usePhaseStore()

      this.clearScheduledAdvance()
      this.isPlaying = false
      this.isPaused = false

      if (phaseStore.phases.length === 0) {
        this.activePhaseId = ''
        this.currentPhaseIndex = -1
        return true
      }

      const firstPhase = phaseStore.phases[0]
      this.activePhaseId = firstPhase.id
      this.currentPhaseIndex = 0

      phaseStore.loadPhaseById(firstPhase.id)

      return true
    },

    /**
     * 次の phase へ進む。
     * 最後まで行ったら stop する。
     */
    advanceToNextPhase(): void {
      const phaseStore = usePhaseStore()

      if (!this.isPlaying) {
        return
      }

      const nextIndex = this.currentPhaseIndex + 1

      if (nextIndex >= phaseStore.phases.length) {
        this.stop()
        return
      }

      const nextPhase = phaseStore.phases[nextIndex]
      if (!nextPhase) {
        this.stop()
        return
      }

      this.currentPhaseIndex = nextIndex
      this.activePhaseId = nextPhase.id

      phaseStore.loadPhaseById(nextPhase.id)
      this.scheduleAdvanceForCurrentPhase()
    },

    /**
     * 現在アクティブ phase の timer を張り直す。
     *
     * duration 編集時に使う。
     */
    restartCurrentPhaseTimer(): void {
      if (!this.isPlaying) {
        return
      }

      this.scheduleAdvanceForCurrentPhase()
    },

    /**
     * ストア破棄時の後片付けを行う。
     */
    dispose(): void {
      this.clearScheduledAdvance()
      this.isPlaying = false
      this.isPaused = false
      this.activePhaseId = ''
      this.currentPhaseIndex = -1
    },
  },
})
