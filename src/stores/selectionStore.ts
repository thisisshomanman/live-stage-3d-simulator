/**
 * ファイル概要:
 * - 3D Scene 上で選択中オブジェクトの状態を管理する Pinia ストア
 *
 * このファイルの目的:
 * - Raycast で選択した speaker 情報を UI へ共有する
 * - PropertyPanel などから現在選択中の対象を参照できるようにする
 * - 将来、light / seat などの選択にも拡張しやすい形にする
 */

import { defineStore } from 'pinia'

/**
 * 現時点で選択対象として扱うオブジェクト種別。
 */
export type SelectedObjectType = 'speaker'

export const useSelectionStore = defineStore('selection', {
  state: () => ({
    /**
     * 選択中オブジェクトID。
     * 未選択時は空文字。
     */
    selectedObjectId: '',

    /**
     * 選択中オブジェクト種別。
     * 未選択時は空文字。
     */
    selectedObjectType: '' as SelectedObjectType | '',
  }),

  getters: {
    /**
     * 何かが選択されているかどうか。
     *
     * @param state 現在の state
     * @returns 選択中なら true
     */
    hasSelection: (state): boolean => state.selectedObjectId !== '',
  },

  actions: {
    /**
     * speaker を選択状態にする。
     *
     * @param objectId 選択対象 speaker の ID
     */
    selectSpeaker(objectId: string): void {
      this.selectedObjectId = objectId
      this.selectedObjectType = 'speaker'
    },

    /**
     * 選択状態を解除する。
     */
    clearSelection(): void {
      this.selectedObjectId = ''
      this.selectedObjectType = ''
    },
  },
})
