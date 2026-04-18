/**
 * ファイル概要:
 * - スピーカー関連の状態を管理する Pinia ストア
 *
 * このファイルの目的:
 * - スピーカーの表示ON/OFF状態を管理する
 * - 種別ごとの表示切替状態を管理する
 * - 各スピーカーの gain / delay / visibility を保持する
 * - phase 読込時に speaker 状態を復元できるようにする
 */

import { defineStore } from 'pinia'

import { speakerPlacements } from '@/core/scene/speakerCatalog'

import type { PhaseSpeakerSnapshot } from '@/types/phase'
import type { SpeakerSettings, SpeakerType, SpeakerTypeVisibility } from '@/types/speaker'

/**
 * 初期スピーカー設定を生成する。
 * speakerCatalog 側の配置定義をもとに、UI / Store 用の状態を作る。
 *
 * @returns 初期 speaker 一覧
 */
const createInitialSpeakerSettings = (): SpeakerSettings[] => {
  return speakerPlacements.map((placement) => ({
    id: placement.id,
    label: placement.label,
    type: placement.type,
    gain: 1.0,
    delayMs: 0,
    isVisible: true,
  }))
}

/**
 * 初期の種別表示状態を返す。
 *
 * @returns 初期種別表示状態
 */
const createInitialTypeVisibility = (): SpeakerTypeVisibility => {
  return {
    main: true,
    sub: true,
    delay: true,
  }
}

/**
 * speaker 一覧を複製する。
 *
 * @param speakers 複製元一覧
 * @returns 複製後一覧
 */
const cloneSpeakers = (speakers: SpeakerSettings[]): SpeakerSettings[] => {
  return speakers.map((speaker) => ({
    ...speaker,
  }))
}

export const useSpeakerStore = defineStore('speaker', {
  state: () => ({
    /**
     * スピーカー全体の表示ON/OFF。
     */
    showSpeakers: true,

    /**
     * 種別ごとの表示ON/OFF。
     */
    typeVisibility: createInitialTypeVisibility(),

    /**
     * スピーカー個別設定一覧。
     */
    speakers: createInitialSpeakerSettings(),
  }),

  actions: {
    /**
     * スピーカー全体の表示を切り替える。
     *
     * @param visible 表示するかどうか
     */
    setShowSpeakers(visible: boolean): void {
      this.showSpeakers = visible
    },

    /**
     * 種別ごとの表示を切り替える。
     *
     * @param type スピーカー種別
     * @param visible 表示するかどうか
     */
    setTypeVisibility(type: SpeakerType, visible: boolean): void {
      this.typeVisibility[type] = visible
    },

    /**
     * 個別スピーカーの表示を切り替える。
     *
     * @param speakerId 対象スピーカーID
     * @param visible 表示するかどうか
     */
    setSpeakerVisible(speakerId: string, visible: boolean): void {
      const speaker = this.speakers.find((item) => item.id === speakerId)
      if (!speaker) return

      speaker.isVisible = visible
    },

    /**
     * 個別スピーカーの gain を更新する。
     *
     * @param speakerId 対象スピーカーID
     * @param gain 新しい gain 値
     */
    updateSpeakerGain(speakerId: string, gain: number): void {
      const speaker = this.speakers.find((item) => item.id === speakerId)
      if (!speaker) return

      speaker.gain = gain
    },

    /**
     * 個別スピーカーの delay を更新する。
     *
     * @param speakerId 対象スピーカーID
     * @param delayMs 新しい遅延値
     */
    updateSpeakerDelay(speakerId: string, delayMs: number): void {
      const speaker = this.speakers.find((item) => item.id === speakerId)
      if (!speaker) return

      speaker.delayMs = delayMs
    },

    /**
     * phase snapshot の speaker 情報を適用する。
     *
     * @param snapshot 適用対象 snapshot
     */
    applyPhaseSpeakerSnapshot(snapshot: PhaseSpeakerSnapshot): void {
      this.showSpeakers = snapshot.showSpeakers
      this.typeVisibility = {
        ...snapshot.typeVisibility,
      }
      this.speakers = cloneSpeakers(snapshot.speakers)
    },

    /**
     * speaker 状態を初期値へ戻す。
     */
    resetSpeakerState(): void {
      this.showSpeakers = true
      this.typeVisibility = createInitialTypeVisibility()
      this.speakers = createInitialSpeakerSettings()
    },
  },
})
