/**
 * ファイル概要:
 * - ライブ会場内のスピーカーを生成するビルダー
 *
 * このファイルの目的:
 * - SceneManager からスピーカー生成責務を分離する
 * - スピーカーの描画ロジックだけに集中させる
 * - 種別定義や配置定義は speakerCatalog.ts 側に集約する
 *
 * 現時点の方針:
 * - 見た目のリアルさより、位置関係と種別の違いが分かることを優先する
 * - 箱形オブジェクトで簡易的に表現する
 */

import * as THREE from 'three'
import { getSpeakerTypeDefinition, speakerPlacements } from '@/core/scene/speakerCatalog'
import type { SpeakerPlacement, SpeakerSize } from '@/types/speaker'

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
   * 定義済みの配置一覧を順に Scene へ追加する。
   */
  public build(): void {
    speakerPlacements.forEach((speakerPlacement) => {
      this.createSpeakerMesh(speakerPlacement)
    })
  }

  /**
   * スピーカー1台分のメッシュを生成して Scene に追加する。
   *
   * @param placement スピーカー配置定義
   */
  private createSpeakerMesh(placement: SpeakerPlacement): void {
    const typeDefinition = getSpeakerTypeDefinition(placement.type)
    const resolvedSize = this.resolveSpeakerSize(typeDefinition.defaultSize, placement.sizeOverride)

    const geometry = new THREE.BoxGeometry(
      resolvedSize.width,
      resolvedSize.height,
      resolvedSize.depth,
    )

    const material = new THREE.MeshStandardMaterial({
      color: placement.colorHexOverride ?? typeDefinition.defaultColorHex,
    })

    const mesh = new THREE.Mesh(geometry, material)

    /**
     * 将来の選択機能やプロパティ表示に備えて、
     * name と userData に情報を持たせておく。
     */
    mesh.name = placement.id
    mesh.userData = {
      type: 'speaker',
      speakerId: placement.id,
      speakerLabel: placement.label,
      speakerType: placement.type,
      speakerTypeLabel: typeDefinition.label,
      speakerDescription: typeDefinition.description,
    }

    mesh.position.set(placement.position.x, placement.position.y, placement.position.z)

    /**
     * rotation は度数法で定義しているため、
     * three.js 用にラジアンへ変換する。
     */
    mesh.rotation.y = THREE.MathUtils.degToRad(placement.rotation?.yDeg ?? 0)

    this.scene.add(mesh)
  }

  /**
   * 種別の標準サイズと、個別上書き設定をマージして最終サイズを作る。
   *
   * @param defaultSize 種別の標準サイズ
   * @param sizeOverride 個別上書きサイズ
   * @returns 実際に使うサイズ
   */
  private resolveSpeakerSize(
    defaultSize: SpeakerSize,
    sizeOverride?: Partial<SpeakerSize>,
  ): SpeakerSize {
    return {
      width: sizeOverride?.width ?? defaultSize.width,
      height: sizeOverride?.height ?? defaultSize.height,
      depth: sizeOverride?.depth ?? defaultSize.depth,
    }
  }
}
