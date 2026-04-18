/**
 * ファイル概要:
 * - スピーカー関連の状態を管理する Pinia ストア
 *
 * このファイルの目的:
 * - スピーカーの表示ON/OFF状態を管理する
 * - 種別ごとの表示切替状態を管理する
 * - 各スピーカーの gain / delay / visibility を保持する
 *
 * 現時点では:
 * - UI と 3D 表示制御をつなぐ役割が中心
 * - gain / delayMs は保持だけ先に行う
 */

import { defineStore } from 'pinia'
import { speakerPlacements } from '@/core/scene/speakerCatalog'
import type { SpeakerSettings, SpeakerType, SpeakerTypeVisibility } from '@/types/speaker'

/**
 * 初期スピーカー設定を生成する。
 * speakerCatalog 側の配置定義をもとに、UI / Store 用の状態を作る。
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

export const useSpeakerStore = defineStore('speaker', {
  state: () => ({
    /**
     * スピーカー全体の表示ON/OFF。
     */
    showSpeakers: true,

    /**
     * 種別ごとの表示ON/OFF。
     */
    typeVisibility: {
      main: true,
      sub: true,
      delay: true,
    } as SpeakerTypeVisibility,

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
    setShowSpeakers(visible: boolean) {
      this.showSpeakers = visible
    },

    /**
     * 種別ごとの表示を切り替える。
     *
     * @param type スピーカー種別
     * @param visible 表示するかどうか
     */
    setTypeVisibility(type: SpeakerType, visible: boolean) {
      this.typeVisibility[type] = visible
    },

    /**
     * 個別スピーカーの表示を切り替える。
     *
     * @param speakerId 対象スピーカーID
     * @param visible 表示するかどうか
     */
    setSpeakerVisible(speakerId: string, visible: boolean) {
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
    updateSpeakerGain(speakerId: string, gain: number) {
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
    updateSpeakerDelay(speakerId: string, delayMs: number) {
      const speaker = this.speakers.find((item) => item.id === speakerId)
      if (!speaker) return

      speaker.delayMs = delayMs
    },
  },
})
