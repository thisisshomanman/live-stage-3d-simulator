/**
 * ファイル概要:
 * - フェーズ保存に関する型定義を管理する
 *
 * このファイルの目的:
 * - 現在の画面状態を phase snapshot として統一フォーマットで扱う
 * - Store / UI / 永続化処理の間で同じ型を共有する
 */

import type { SpeakerSettings, SpeakerTypeVisibility } from '@/types/speaker'
import type { CameraPresetId } from '@/types/view'

/**
 * フェーズ保存時の view 情報。
 */
export interface PhaseViewSnapshot {
  currentView: CameraPresetId
}

/**
 * フェーズ保存時の speaker 情報。
 */
export interface PhaseSpeakerSnapshot {
  showSpeakers: boolean
  typeVisibility: SpeakerTypeVisibility
  speakers: SpeakerSettings[]
}

/**
 * フェーズ1件分の保存対象スナップショット。
 */
export interface PhaseSnapshot {
  view: PhaseViewSnapshot
  speaker: PhaseSpeakerSnapshot
}

/**
 * タイムライン上に保持するフェーズ情報。
 */
export interface PhaseItem {
  id: string
  name: string
  createdAt: string
  snapshot: PhaseSnapshot
}
