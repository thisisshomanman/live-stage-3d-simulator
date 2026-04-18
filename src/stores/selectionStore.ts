/**
 * ファイル概要:
 * - 3D Scene 上で選択中オブジェクトの状態を管理する Pinia ストア
 *
 * このファイルの目的:
 * - Raycast で選択した結果を UI 側へ共有する
 * - PropertyPanel などの表示元を three.js 実装から分離する
 * - 今後、speaker 以外の選択対象にも拡張しやすくする
 */

import { defineStore } from 'pinia'

/**
 * 現時点で選択可能なオブジェクト種別。
 * 今は speaker のみを扱う。
 */
export type SelectedObjectType = 'speaker'

/**
 * 選択情報の受け渡し用 payload。
 */
export interface SelectionPayload {
  objectId: string
  objectType: SelectedObjectType
  objectLabel: string
}

export const useSelectionStore = defineStore('selection', {
  state: () => ({
    /**
     * 選択中オブジェクトID。
     * 未選択時は空文字にする。
     */
    selectedObjectId: '',

    /**
     * 選択中オブジェクト種別。
     * 未選択時は空文字にする。
     */
    selectedObjectType: '' as SelectedObjectType | '',

    /**
     * 選択中オブジェクトの表示用ラベル。
     */
    selectedObjectLabel: '',
  }),

  getters: {
    /**
     * 何かが選択されているかどうか。
     *
     * @param state 現在の state
     * @returns 選択中なら true
     */
    hasSelection: (state): boolean => state.selectedObjectId !== '',

    /**
     * speaker が選択されているかどうか。
     *
     * @param state 現在の state
     * @returns speaker 選択中なら true
     */
    isSpeakerSelected: (state): boolean => state.selectedObjectType === 'speaker',
  },

  actions: {
    /**
     * 選択中オブジェクトを更新する。
     *
     * @param payload 新しい選択情報
     */
    selectObject(payload: SelectionPayload): void {
      this.selectedObjectId = payload.objectId
      this.selectedObjectType = payload.objectType
      this.selectedObjectLabel = payload.objectLabel
    },

    /**
     * 選択状態を解除する。
     */
    clearSelection(): void {
      this.selectedObjectId = ''
      this.selectedObjectType = ''
      this.selectedObjectLabel = ''
    },
  },
})
