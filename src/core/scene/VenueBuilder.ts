/**
 * ファイル概要:
 * - ライブ会場の基本オブジェクトを three.js の Scene に追加するビルダー
 * - 現段階では、以下の簡易オブジェクトを生成する
 *   1. 会場の床
 *   2. 会場の壁（背面 / 左 / 右）
 *   3. 客席ブロック（左 / 中央 / 右）
 *
 * このファイルの目的:
 * - SceneManager から「会場をどう作るか」の責務を分離する
 * - ステージ生成責務は StageBuilder へ分離済み
 * - 今後、会場テンプレートや JSON 読み込みへ拡張しやすくする
 *
 * 方針:
 * - まずは正確な会場モデリングではなく、位置関係が分かる簡易表現を優先する
 * - 箱や板で構成し、あとから詳細モデルへ置き換えやすい形にする
 */

import * as THREE from 'three'

/**
 * 会場生成時の大まかなサイズ設定。
 * 将来的には JSON から読み込む形へ拡張予定。
 */
export interface VenueLayoutConfig {
  venueWidth: number
  venueDepth: number
  wallHeight: number
}

/**
 * VenueBuilder:
 * - Scene に会場関連オブジェクトを追加する
 */
export class VenueBuilder {
  private readonly scene: THREE.Scene

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /**
   * 会場オブジェクトをまとめて生成する。
   * 今は固定値ベースで簡易的に構築する。
   */
  public build(): void {
    const layout: VenueLayoutConfig = {
      venueWidth: 20,
      venueDepth: 28,
      wallHeight: 8,
    }

    this.createFloor(layout)
    this.createWalls(layout)
    this.createSeatBlocks()
  }

  /**
   * 会場床を作成する。
   * グリッドの上に、薄い床板として配置する。
   */
  private createFloor(layout: VenueLayoutConfig): void {
    const floorGeometry = new THREE.BoxGeometry(layout.venueWidth, 0.2, layout.venueDepth)

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
    })

    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.position.set(0, -0.1, 0)

    this.scene.add(floor)
  }

  /**
   * 背面・左右の壁を作成する。
   * まだ天井や前面壁は作らず、空間の把握を優先する。
   */
  private createWalls(layout: VenueLayoutConfig): void {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      side: THREE.DoubleSide,
    })

    // 背面壁
    const backWallGeometry = new THREE.BoxGeometry(layout.venueWidth, layout.wallHeight, 0.2)
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial)
    backWall.position.set(0, layout.wallHeight / 2, -layout.venueDepth / 2)
    this.scene.add(backWall)

    // 左壁
    const sideWallGeometry = new THREE.BoxGeometry(0.2, layout.wallHeight, layout.venueDepth)
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial)
    leftWall.position.set(-layout.venueWidth / 2, layout.wallHeight / 2, 0)
    this.scene.add(leftWall)

    // 右壁
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial)
    rightWall.position.set(layout.venueWidth / 2, layout.wallHeight / 2, 0)
    this.scene.add(rightWall)
  }

  /**
   * 客席ブロックを簡易的に配置する。
   * 左 / 中央 / 右の3ブロックに分けて、会場らしい見た目を作る。
   */
  private createSeatBlocks(): void {
    const seatMaterial = new THREE.MeshStandardMaterial({
      color: 0x4b5563,
      transparent: true,
      opacity: 0.9,
    })

    const blocks = [
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
      const geometry = new THREE.BoxGeometry(block.width, block.height, block.depth)
      const seatBlock = new THREE.Mesh(geometry, seatMaterial)

      seatBlock.position.set(block.x, block.y, block.z)
      this.scene.add(seatBlock)
    })
  }
}
