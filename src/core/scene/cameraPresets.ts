/**
 * ファイル概要:
 * - カメラプリセットの定義を管理する
 * - SceneManager から参照して、視点を切り替えるために使う
 *
 * このファイルの目的:
 * - 視点データを 1 箇所に集約する
 * - UI と three.js の両方から使える形にする
 * - 今後、JSON 読み込みへ移行しやすくする
 */

import type { CameraPreset, CameraPresetId } from '@/types/view'

/**
 * 現時点で利用するカメラプリセット一覧。
 *
 * free:
 * - 開発確認しやすい自由視点の初期位置
 *
 * foh:
 * - FOH（Front of House）をイメージした正面後方寄りの視点
 * - 会場全体を俯瞰しやすい
 *
 * user-seat:
 * - 自席視点の仮置き
 * - 今後、実際の座席位置に合わせて調整していく
 */
export const cameraPresets: CameraPreset[] = [
  {
    id: 'free',
    label: 'Free',
    description: '開発用の自由視点の初期位置',
    position: {
      x: 8,
      y: 6,
      z: 10,
    },
    target: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  {
    id: 'foh',
    label: 'FOH',
    description: '会場後方中央からステージを見る視点',
    position: {
      x: 0,
      y: 7,
      z: 14,
    },
    target: {
      x: 0,
      y: 1,
      z: -11.5,
    },
  },
  {
    id: 'user-seat',
    label: 'User Seat',
    description: '自席を想定した仮の視点',
    position: {
      x: 4,
      y: 4,
      z: 9,
    },
    target: {
      x: 0,
      y: 1,
      z: -11.5,
    },
  },
]

/**
 * ID からカメラプリセットを取得する。
 *
 * @param presetId カメラプリセットID
 * @returns 該当プリセット。見つからなければ undefined
 */
export const findCameraPresetById = (presetId: CameraPresetId): CameraPreset | undefined => {
  return cameraPresets.find((preset) => preset.id === presetId)
}
