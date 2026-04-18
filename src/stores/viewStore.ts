/**
 * ファイル概要:
 * - カメラ視点に関する状態を管理する Pinia ストア
 *
 * このファイルの目的:
 * - 現在選択中の視点IDを保持する
 * - 今後、Toolbar の視点切替UIと SceneManager をつなぐための土台にする
 *
 * 現時点では:
 * - 初期視点を FOH にしている
 * - 利用可能な視点一覧も保持している
 */

import { defineStore } from 'pinia'
import type { CameraPresetId } from '@/types/view'

export const useViewStore = defineStore('view', {
  state: () => ({
    /**
     * 現在の視点ID。
     * 今後、UI から変更できるようにする。
     */
    currentView: 'foh' as CameraPresetId,

    /**
     * 利用可能な視点一覧。
     * UI の select 生成時などで利用する想定。
     */
    availableViews: ['free', 'foh', 'user-seat'] as CameraPresetId[],
  }),
})
