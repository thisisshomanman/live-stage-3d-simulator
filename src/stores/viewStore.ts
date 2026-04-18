/**
 * ファイル概要:
 * - カメラ視点に関する状態を管理する Pinia ストア
 *
 * このファイルの目的:
 * - 現在選択中の視点IDを保持する
 * - Toolbar の select と SceneCanvas の three.js カメラをつなぐ
 * - phase 読込時に視点状態を復元できるようにする
 */

import { defineStore } from 'pinia'

import type { PhaseViewSnapshot } from '@/types/phase'
import type { CameraPresetId } from '@/types/view'

export const useViewStore = defineStore('view', {
  state: () => ({
    /**
     * 現在選択中の視点ID。
     * 初期値は FOH にしておく。
     */
    currentView: 'foh' as CameraPresetId,

    /**
     * 利用可能な視点一覧。
     * Toolbar の select に使う。
     */
    availableViews: ['free', 'foh', 'user-seat'] as CameraPresetId[],
  }),

  actions: {
    /**
     * 現在の視点を変更する。
     *
     * @param presetId 切り替えたい視点ID
     */
    setCurrentView(presetId: CameraPresetId): void {
      this.currentView = presetId
    },

    /**
     * phase snapshot の view 情報を適用する。
     *
     * @param snapshot 適用対象 snapshot
     */
    applyPhaseViewSnapshot(snapshot: PhaseViewSnapshot): void {
      this.currentView = snapshot.currentView
    },
  },
})
