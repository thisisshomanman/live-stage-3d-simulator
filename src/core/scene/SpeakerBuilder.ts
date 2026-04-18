/**
 * ファイル概要:
 * - ライブ会場内のスピーカーを生成するビルダー
 *
 * このファイルの目的:
 * - SceneManager からスピーカー生成責務を分離する
 * - スピーカーの描画ロジックだけに集中させる
 * - 種別定義や配置定義は speakerCatalog.ts 側に集約する
 * - 生成済みスピーカーGroupを保持し、後から表示切替できるようにする
 *
 * 現時点の方針:
 * - 見た目のリアルさより、位置関係と向きが分かることを優先する
 * - 箱形オブジェクト + 補助表現で簡易的に表現する
 */

import * as THREE from 'three'
import { getSpeakerTypeDefinition, speakerPlacements } from '@/core/scene/speakerCatalog'
import type {
  SpeakerPlacement,
  SpeakerSettings,
  SpeakerSize,
  SpeakerTypeVisibility,
} from '@/types/speaker'

/**
 * SpeakerBuilder:
 * - Scene にスピーカーオブジェクトを追加する
 */
export class SpeakerBuilder {
  private readonly scene: THREE.Scene

  /**
   * 生成したスピーカーGroupを ID 単位で保持する。
   * 後から表示ON/OFFを切り替えるために使う。
   */
  private readonly speakerGroups = new Map<string, THREE.Group>()

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /**
   * スピーカーをまとめて生成する。
   * 定義済みの配置一覧を順に Scene へ追加する。
   */
  public build(): void {
    speakerPlacements.forEach((speakerPlacement) => {
      this.createSpeakerGroup(speakerPlacement)
    })
  }

  /**
   * スピーカー表示状態を適用する。
   *
   * 表示判定条件:
   * - 全体表示ON
   * - 種別表示ON
   * - 個別表示ON
   *
   * @param showSpeakers 全体表示ON/OFF
   * @param typeVisibility 種別ごとの表示ON/OFF
   * @param speakerSettings 個別スピーカー設定一覧
   */
  public applySpeakerVisibility(
    showSpeakers: boolean,
    typeVisibility: SpeakerTypeVisibility,
    speakerSettings: SpeakerSettings[],
  ): void {
    const settingsMap = new Map(speakerSettings.map((speaker) => [speaker.id, speaker]))

    this.speakerGroups.forEach((speakerGroup, speakerId) => {
      const speakerSetting = settingsMap.get(speakerId)

      if (!speakerSetting) {
        speakerGroup.visible = false
        return
      }

      speakerGroup.visible =
        showSpeakers && typeVisibility[speakerSetting.type] && speakerSetting.isVisible
    })
  }

  /**
   * Raycast の選択対象として扱うスピーカーGroup一覧を返す。
   *
   * @returns 選択可能なスピーカーGroup一覧
   */
  public getSpeakerGroups(): THREE.Group[] {
    return Array.from(this.speakerGroups.values())
  }

  /**
   * スピーカー1台分の Group を生成して Scene に追加する。
   *
   * Group にする理由:
   * - 本体
   * - 前面パネル
   * - 向きガイド
   * をまとめて回転・移動できるようにするため
   *
   * @param placement スピーカー配置定義
   */
  private createSpeakerGroup(placement: SpeakerPlacement): void {
    const typeDefinition = getSpeakerTypeDefinition(placement.type)
    const resolvedSize = this.resolveSpeakerSize(typeDefinition.defaultSize, placement.sizeOverride)

    /**
     * スピーカー1台分をまとめる親 Group。
     * rotation はこの Group に対して適用する。
     */
    const speakerGroup = new THREE.Group()

    /**
     * 将来の選択機能やプロパティ表示に備えて、
     * Group 側に name / userData を持たせる。
     */
    speakerGroup.name = placement.id
    speakerGroup.userData = {
      type: 'speaker',
      speakerId: placement.id,
      speakerLabel: placement.label,
      speakerType: placement.type,
      speakerTypeLabel: typeDefinition.label,
      speakerDescription: typeDefinition.description,
    }

    /**
     * スピーカー本体を追加。
     */
    const bodyMesh = this.createSpeakerBody(
      resolvedSize,
      placement.colorHexOverride ?? typeDefinition.defaultColorHex,
    )
    speakerGroup.add(bodyMesh)

    /**
     * 前面パネルを追加。
     * 箱だけだと向きが分かりにくいので、
     * 「どちらが正面か」が見える薄い板を前面に置く。
     */
    const frontPanelMesh = this.createFrontPanel(resolvedSize)
    speakerGroup.add(frontPanelMesh)

    /**
     * 向きガイドを追加。
     * スピーカー正面方向へ少し伸びる線を付けることで、
     * rotation の向きが視覚的に分かりやすくなる。
     */
    const directionGuide = this.createDirectionGuide(resolvedSize)
    speakerGroup.add(directionGuide)

    /**
     * Group 全体の位置を設定。
     */
    speakerGroup.position.set(placement.position.x, placement.position.y, placement.position.z)

    /**
     * rotation は度数法で定義しているため、
     * three.js 用にラジアンへ変換する。
     */
    speakerGroup.rotation.y = THREE.MathUtils.degToRad(placement.rotation?.yDeg ?? 0)

    this.scene.add(speakerGroup)
    this.speakerGroups.set(placement.id, speakerGroup)
  }

  /**
   * スピーカー本体メッシュを生成する。
   *
   * @param size 最終サイズ
   * @param colorHex 本体色
   * @returns スピーカー本体メッシュ
   */
  private createSpeakerBody(size: SpeakerSize, colorHex: number): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth)

    const material = new THREE.MeshStandardMaterial({
      color: colorHex,
    })

    return new THREE.Mesh(geometry, material)
  }

  /**
   * スピーカー前面パネルを生成する。
   *
   * 前面は +Z 側として扱う。
   * 本体前面に薄い板を置いて、向きを見やすくする。
   *
   * @param size スピーカーサイズ
   * @returns 前面パネルメッシュ
   */
  private createFrontPanel(size: SpeakerSize): THREE.Mesh {
    const panelGeometry = new THREE.BoxGeometry(size.width * 0.72, size.height * 0.72, 0.05)

    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      emissive: 0x111111,
    })

    const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial)

    /**
     * 本体前面に少しだけ浮かせて配置する。
     */
    panelMesh.position.set(0, 0, size.depth / 2 + 0.04)

    return panelMesh
  }

  /**
   * スピーカーの向きガイドを生成する。
   *
   * @param size スピーカーサイズ
   * @returns 向きガイドの Line
   */
  private createDirectionGuide(size: SpeakerSize): THREE.Line {
    const points = [
      new THREE.Vector3(0, 0, size.depth / 2 + 0.08),
      new THREE.Vector3(0, 0, size.depth / 2 + 0.9),
    ]

    const geometry = new THREE.BufferGeometry().setFromPoints(points)

    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
    })

    return new THREE.Line(geometry, material)
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
