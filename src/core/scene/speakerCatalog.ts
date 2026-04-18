/**
 * ファイル概要:
 * - スピーカー種別定義と、現在の会場内スピーカー配置定義を管理する
 *
 * このファイルの目的:
 * - 「種別」と「配置」を分ける
 * - SpeakerBuilder から定義データを切り離す
 * - 今後、JSON 読み込みや UI 編集へ移行しやすくする
 *
 * 構成:
 * - speakerTypeDefinitions: 種別マスタ
 * - speakerPlacements: 現在の会場配置
 */

import type { SpeakerPlacement, SpeakerType, SpeakerTypeDefinition } from '@/types/speaker'

/**
 * スピーカー種別マスタ。
 * 種別ごとのラベル、説明、標準サイズ、標準色を管理する。
 */
export const speakerTypeDefinitions: Record<SpeakerType, SpeakerTypeDefinition> = {
  main: {
    type: 'main',
    label: 'Main Speaker',
    description: '会場のメイン出音を担うスピーカー',
    defaultSize: {
      width: 0.8,
      height: 2.6,
      depth: 0.8,
    },
    defaultColorHex: 0x2563eb,
  },
  sub: {
    type: 'sub',
    label: 'Subwoofer',
    description: '低音を担うスピーカー',
    defaultSize: {
      width: 1.4,
      height: 1,
      depth: 1.2,
    },
    defaultColorHex: 0xf59e0b,
  },
  delay: {
    type: 'delay',
    label: 'Delay Speaker',
    description: '会場後方などで遅延補正込みで鳴らすスピーカー',
    defaultSize: {
      width: 0.9,
      height: 1.8,
      depth: 0.9,
    },
    defaultColorHex: 0x10b981,
  },
}

/**
 * 現在の会場に配置しているスピーカー一覧。
 * 今は簡易的な配置だが、後で JSON / UI 編集に置き換えやすい形にしている。
 */
export const speakerPlacements: SpeakerPlacement[] = [
  {
    id: 'sp-main-l',
    label: 'Main Speaker Left',
    type: 'main',
    position: {
      x: -4.8,
      y: 2.3,
      z: -11.2,
    },
    rotation: {
      yDeg: 12,
    },
  },
  {
    id: 'sp-main-r',
    label: 'Main Speaker Right',
    type: 'main',
    position: {
      x: 4.8,
      y: 2.3,
      z: -11.2,
    },
    rotation: {
      yDeg: -12,
    },
  },
  {
    id: 'sp-sub-l',
    label: 'Subwoofer Left',
    type: 'sub',
    position: {
      x: -2.4,
      y: 0.5,
      z: -9.8,
    },
    rotation: {
      yDeg: 0,
    },
  },
  {
    id: 'sp-sub-r',
    label: 'Subwoofer Right',
    type: 'sub',
    position: {
      x: 2.4,
      y: 0.5,
      z: -9.8,
    },
    rotation: {
      yDeg: 0,
    },
  },
]

/**
 * 種別IDからスピーカー種別定義を返す。
 *
 * @param type スピーカー種別
 * @returns 種別定義
 */
export const getSpeakerTypeDefinition = (type: SpeakerType): SpeakerTypeDefinition => {
  return speakerTypeDefinitions[type]
}
