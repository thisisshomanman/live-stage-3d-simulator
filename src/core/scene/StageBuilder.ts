/**
 * ファイル概要:
 * - ライブ会場内のステージを生成するビルダー
 * - 現段階では、メインステージを簡易的な箱で表現する
 *
 * このファイルの目的:
 * - VenueBuilder からステージ生成責務を分離する
 * - 今後、花道・センターステージ・階段・スクリーン土台などを
 *   段階的に追加しやすくする
 *
 * 現時点の方針:
 * - まずは位置関係が分かることを優先する
 * - 見た目の精密さより、会場奥にステージがあることを分かりやすく表現する
 */

import * as THREE from 'three'

/**
 * ステージ生成時のレイアウト設定。
 * 将来的には JSON 読み込みへ置き換える想定。
 */
export interface StageLayoutConfig {
  stageWidth: number
  stageDepth: number
  stageHeight: number
  venueDepth: number
  offsetFromBackWall: number
}

/**
 * StageBuilder:
 * - Scene にステージ関連オブジェクトを追加する
 */
export class StageBuilder {
  private readonly scene: THREE.Scene

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /**
   * ステージを生成する。
   * 今はメインステージのみを作成する。
   */
  public build(): void {
    const layout: StageLayoutConfig = {
      stageWidth: 8,
      stageDepth: 3,
      stageHeight: 1,
      venueDepth: 28,
      offsetFromBackWall: 1,
    }

    this.createMainStage(layout)
  }

  /**
   * メインステージを作成する。
   *
   * @param layout ステージ配置用の設定値
   */
  private createMainStage(layout: StageLayoutConfig): void {
    const stageGeometry = new THREE.BoxGeometry(
      layout.stageWidth,
      layout.stageHeight,
      layout.stageDepth,
    )

    const stageMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c5c5c,
    })

    const stage = new THREE.Mesh(stageGeometry, stageMaterial)

    /**
     * z のマイナス方向を会場奥として扱う。
     * 背面壁から少し手前にステージを配置する。
     */
    stage.position.set(
      0,
      layout.stageHeight / 2,
      -layout.venueDepth / 2 + layout.stageDepth / 2 + layout.offsetFromBackWall,
    )

    this.scene.add(stage)
  }
}
