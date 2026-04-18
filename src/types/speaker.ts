/**
 * ファイル概要:
 * - スピーカー関連の型定義を管理する
 * - 今後、スピーカー配置・種類・向き・音量・遅延などを扱うための土台にする
 *
 * このファイルの目的:
 * - スピーカーの種類や位置情報の構造を統一する
 * - Builder / JSON / UI の間で同じ型を使えるようにする
 */

export type SpeakerType = 'main' | 'sub' | 'delay'

/**
 * 3D空間上の位置情報。
 */
export interface SpeakerPosition {
  x: number
  y: number
  z: number
}

/**
 * スピーカー1台分の定義。
 */
export interface SpeakerDefinition {
  id: string
  label: string
  type: SpeakerType
  width: number
  height: number
  depth: number
  position: SpeakerPosition
  rotationYDeg?: number
  colorHex?: number
}
