/**
 * ファイル概要:
 * - カメラ視点（ビュー）に関する型定義を管理する
 * - 画面上の視点切替や、SceneManager 内のカメラプリセット適用処理で利用する
 *
 * このファイルの目的:
 * - 視点IDのタイポを防ぐ
 * - カメラ位置と注視点の構造を統一する
 * - 今後、JSON 読み込みや UI 連携をしやすくする
 */

/**
 * 利用可能なカメラプリセットID。
 * 現時点では最小限として 3 つを定義する。
 */
export type CameraPresetId = 'free' | 'foh' | 'user-seat'

/**
 * 3D空間上の位置情報。
 */
export interface Vector3Like {
  x: number
  y: number
  z: number
}

/**
 * カメラプリセット定義。
 * - position: カメラの位置
 * - target: カメラが向く先
 */
export interface CameraPreset {
  id: CameraPresetId
  label: string
  description: string
  position: Vector3Like
  target: Vector3Like
}
