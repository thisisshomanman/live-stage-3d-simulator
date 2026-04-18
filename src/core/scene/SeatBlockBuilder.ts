/**
 * ファイル概要:
 * - ライブ会場内の客席ブロックを生成するビルダー
 * - 現段階では、左 / 中央 / 右 の3ブロックを簡易的な箱で表現する
 *
 * このファイルの目的:
 * - VenueBuilder から客席生成責務を分離する
 * - 今後、アリーナ席 / スタンド席 / ブロック単位の詳細化をしやすくする
 *
 * 現時点の方針:
 * - まずは会場内の位置関係が分かることを優先する
 * - 実際の座席1つ1つではなく、ブロック単位で表現する
 */

import * as THREE from 'three'

/**
 * 客席ブロック1つ分の定義。
 */
export interface SeatBlockDefinition {
  width: number
  height: number
  depth: number
  x: number
  y: number
  z: number
}

/**
 * SeatBlockBuilder:
 * - Scene に客席ブロックを追加する
 */
export class SeatBlockBuilder {
  private readonly scene: THREE.Scene

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /**
   * 客席ブロックをまとめて生成する。
   */
  public build(): void {
    const seatMaterial = new THREE.MeshStandardMaterial({
      color: 0x4b5563,
      transparent: true,
      opacity: 0.9,
    })

    /**
     * 今は簡易的に 3 ブロック構成。
     * 将来的には JSON 読み込みや、より細かいブロック管理へ拡張する。
     */
    const blocks: SeatBlockDefinition[] = [
      {
        width: 4,
        height: 1.2,
        depth: 10,
        x: -5,
        y: 0.6,
        z: 4,
      },
      {
        width: 4.5,
        height: 1.2,
        depth: 12,
        x: 0,
        y: 0.6,
        z: 3,
      },
      {
        width: 4,
        height: 1.2,
        depth: 10,
        x: 5,
        y: 0.6,
        z: 4,
      },
    ]

    blocks.forEach((block) => {
      this.createSeatBlock(block, seatMaterial)
    })
  }

  /**
   * 客席ブロック1つを生成して Scene に追加する。
   *
   * @param block 客席ブロック定義
   * @param material 共通マテリアル
   */
  private createSeatBlock(block: SeatBlockDefinition, material: THREE.MeshStandardMaterial): void {
    const geometry = new THREE.BoxGeometry(block.width, block.height, block.depth)

    const seatBlock = new THREE.Mesh(geometry, material)
    seatBlock.position.set(block.x, block.y, block.z)

    this.scene.add(seatBlock)
  }
}
