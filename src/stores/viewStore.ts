/**
 * ファイル概要:
 * - カメラ視点に関する状態を管理する Pinia ストア
 *
 * このファイルの目的:
 * - 現在選択中の視点IDを保持する
 * - Toolbar の select と SceneCanvas の three.js カメラをつなぐ
 * - 今後、視点切替UIや視点保存機能を追加しやすくする
 *
 * 現時点では:
 * - currentView: 現在の視点ID
 * - availableViews: 利用可能な視点一覧
 * - setCurrentView(): 視点変更用の action
 */

import { defineStore } from 'pinia'
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
    setCurrentView(presetId: CameraPresetId) {
      this.currentView = presetId
    },
  },
})
