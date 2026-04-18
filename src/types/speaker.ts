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
 * スピーカーのサイズ情報。
 */
export interface SpeakerSize {
  width: number
  height: number
  depth: number
}

/**
 * スピーカーの向き情報。
 * 現時点では Y 軸回転のみ使う。
 */
export interface SpeakerRotation {
  yDeg: number
}

/**
 * スピーカー種別そのものの定義。
 *
 * 例:
 * - main: メインスピーカー
 * - sub: サブウーファー
 * - delay: ディレイスピーカー
 *
 * defaultSize / defaultColorHex を持たせることで、
 * 種別ごとの共通設定をまとめて管理できる。
 */
export interface SpeakerTypeDefinition {
  type: SpeakerType
  label: string
  description: string
  defaultSize: SpeakerSize
  defaultColorHex: number
}

/**
 * 会場内に配置されるスピーカー1台分の定義。
 *
 * ポイント:
 * - 種別は type で参照する
 * - サイズや色は必要なら override できる
 */
export interface SpeakerPlacement {
  id: string
  label: string
  type: SpeakerType
  position: SpeakerPosition
  rotation?: SpeakerRotation
  sizeOverride?: Partial<SpeakerSize>
  colorHexOverride?: number
}
