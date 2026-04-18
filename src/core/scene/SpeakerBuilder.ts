/**
 * ファイル概要:
 * - ライブ会場内のスピーカーを生成するビルダー
 * - 現段階では、以下の簡易オブジェクトを配置する
 *   1. メインスピーカー 左
 *   2. メインスピーカー 右
 *   3. サブウーファー 左
 *   4. サブウーファー 右
 *
 * このファイルの目的:
 * - SceneManager からスピーカー生成責務を分離する
 * - 今後、delay speaker や line array 風表現、JSON読み込みへ拡張しやすくする
 *
 * 現時点の方針:
 * - 見た目のリアルさより、位置関係が分かることを優先する
 * - 箱形オブジェクトで簡易的に表現する
 */

import * as THREE from 'three'
import type { SpeakerDefinition } from '@/types/speaker'

/**
 * SpeakerBuilder:
 * - Scene にスピーカーオブジェクトを追加する
 */
export class SpeakerBuilder {
  private readonly scene: THREE.Scene

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /**
   * スピーカーをまとめて生成する。
   */
  public build(): void {
    const speakers: SpeakerDefinition[] = [
      {
        id: 'sp-main-l',
        label: 'Main Speaker Left',
        type: 'main',
        width: 0.8,
        height: 2.6,
        depth: 0.8,
        position: {
          x: -4.8,
          y: 2.3,
          z: -11.2,
        },
        rotationYDeg: 12,
        colorHex: 0x2563eb,
      },
      {
        id: 'sp-main-r',
        label: 'Main Speaker Right',
        type: 'main',
        width: 0.8,
        height: 2.6,
        depth: 0.8,
        position: {
          x: 4.8,
          y: 2.3,
          z: -11.2,
        },
        rotationYDeg: -12,
        colorHex: 0x2563eb,
      },
      {
        id: 'sp-sub-l',
        label: 'Subwoofer Left',
        type: 'sub',
        width: 1.4,
        height: 1,
        depth: 1.2,
        position: {
          x: -2.4,
          y: 0.5,
          z: -9.8,
        },
        rotationYDeg: 0,
        colorHex: 0xf59e0b,
      },
      {
        id: 'sp-sub-r',
        label: 'Subwoofer Right',
        type: 'sub',
        width: 1.4,
        height: 1,
        depth: 1.2,
        position: {
          x: 2.4,
          y: 0.5,
          z: -9.8,
        },
        rotationYDeg: 0,
        colorHex: 0xf59e0b,
      },
    ]

    speakers.forEach((speaker) => {
      this.createSpeakerMesh(speaker)
    })
  }

  /**
   * スピーカー1台分のメッシュを生成して Scene に追加する。
   *
   * @param speaker スピーカー定義
   */
  private createSpeakerMesh(speaker: SpeakerDefinition): void {
    const geometry = new THREE.BoxGeometry(speaker.width, speaker.height, speaker.depth)

    const material = new THREE.MeshStandardMaterial({
      color: speaker.colorHex ?? 0x6b7280,
    })

    const mesh = new THREE.Mesh(geometry, material)

    /**
     * 将来の選択機能やプロパティ表示に備えて、
     * name と userData に情報を持たせておく。
     */
    mesh.name = speaker.id
    mesh.userData = {
      type: 'speaker',
      speakerId: speaker.id,
      speakerLabel: speaker.label,
      speakerType: speaker.type,
    }

    mesh.position.set(speaker.position.x, speaker.position.y, speaker.position.z)

    /**
     * rotationYDeg は度数法で定義しているため、three.js 用にラジアンへ変換する。
     */
    mesh.rotation.y = THREE.MathUtils.degToRad(speaker.rotationYDeg ?? 0)

    this.scene.add(mesh)
  }
}
