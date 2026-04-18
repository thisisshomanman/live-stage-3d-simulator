/**
 * ファイル概要:
 * - three.js の Scene / Camera / Renderer / Controls を管理するクラス
 * - このクラスは、Vue コンポーネントから three.js の詳細責務を分離するために存在する
 *
 * 主な責務:
 * 1. three.js の初期化
 * 2. OrbitControls の設定
 * 3. レンダーループの実行
 * 4. リサイズ処理
 * 5. 後片付け
 *
 * 今後の拡張想定:
 * - VenueBuilder の呼び出し
 * - SpeakerBuilder の呼び出し
 * - Scene 内オブジェクト選択連携
 * - カメラプリセット切替
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createBaseSceneObjects, type BaseSceneObjects } from '@/core/scene/createBaseSceneObjects'
import { VenueBuilder } from '@/core/scene/VenueBuilder'
import { StageBuilder } from '@/core/scene/StageBuilder'

export class SceneManager {
  /**
   * three.js を描画する親コンテナ。
   * Vue 側から渡される DOM 要素。
   */
  private readonly container: HTMLElement

  /**
   * three.js の主要オブジェクト群。
   */
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private controls!: OrbitControls

  /**
   * 毎フレーム描画用の requestAnimationFrame ID。
   */
  private animationFrameId = 0

  /**
   * Scene に追加した基本オブジェクト群。
   * dispose や簡易アニメーションで使う。
   */
  private baseObjects!: BaseSceneObjects

  constructor(container: HTMLElement) {
    this.container = container
  }

  /**
   * Scene 全体を初期化する。
   * Vue 側からはまずこのメソッドだけ呼べばよい。
   */
  public init(): void {
    this.createScene()
    this.createCamera()
    this.createRenderer()
    this.createControls()
    this.createObjects()
    this.registerEvents()
  }

  /**
   * 描画ループを開始する。
   */
  public start(): void {
    this.animate()
  }

  /**
   * 画面リサイズ時の再計算を行う。
   */
  public resize(): void {
    if (!this.camera || !this.renderer) return

    const width = this.container.clientWidth
    const height = this.container.clientHeight

    if (width === 0 || height === 0) return

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  /**
   * three.js 関連の後片付けを行う。
   * コンポーネント破棄時に呼ぶ。
   */
  public dispose(): void {
    window.removeEventListener('resize', this.handleResize)
    cancelAnimationFrame(this.animationFrameId)

    if (this.controls) {
      this.controls.dispose()
    }

    if (this.baseObjects) {
      this.baseObjects.cubeGeometry.dispose()
      this.baseObjects.cubeMaterial.dispose()
    }

    if (this.renderer) {
      this.renderer.dispose()

      /**
       * container 内に追加した canvas を取り外す。
       */
      if (this.renderer.domElement.parentElement === this.container) {
        this.container.removeChild(this.renderer.domElement)
      }
    }
  }

  /**
   * Scene を生成する。
   */
  private createScene(): void {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x111111)
  }

  /**
   * Camera を生成する。
   * PerspectiveCamera を使い、遠近感のある表示にする。
   */
  private createCamera(): void {
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    this.camera.position.set(3, 3, 6)
    this.camera.lookAt(0, 0, 0)
  }

  /**
   * Renderer を生成し、container に canvas を追加する。
   */
  private createRenderer(): void {
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    this.container.appendChild(this.renderer.domElement)
  }

  /**
   * OrbitControls を生成する。
   * マウス操作でカメラを回転・ズーム・平行移動できるようにする。
   */
  private createControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    /**
     * カメラ操作を少し滑らかにする設定。
     */
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05

    /**
     * カメラの注視点。
     * 今後はステージ中央などへ寄せていく予定。
     */
    this.controls.target.set(0, 0, 0)

    /**
     * ズーム距離の制限。
     */
    this.controls.minDistance = 2
    this.controls.maxDistance = 30

    /**
     * 上下回転の制限。
     * 真上・真下まで回り込まないようにして操作性を保つ。
     */
    this.controls.maxPolarAngle = Math.PI / 2
  }

  /**
   * Scene に表示用オブジェクトを追加する。
   * - 基本補助オブジェクト
   * - 会場オブジェクト
   * - ステージオブジェクト
   */
  private createObjects(): void {
    this.baseObjects = createBaseSceneObjects(this.scene)

    const venueBuilder = new VenueBuilder(this.scene)
    venueBuilder.build()

    const stageBuilder = new StageBuilder(this.scene)
    stageBuilder.build()
  }

  /**
   * イベント登録を行う。
   */
  private registerEvents(): void {
    window.addEventListener('resize', this.handleResize)
  }

  /**
   * リサイズイベント時に呼ばれる関数。
   * removeEventListener のためにアロー関数で保持している。
   */
  private readonly handleResize = (): void => {
    this.resize()
  }

  /**
   * 毎フレームの描画処理。
   */
  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate)

    /**
     * 今は動作確認用のキューブを回転させる。
     */
    this.baseObjects.cube.rotation.x += 0.01
    this.baseObjects.cube.rotation.y += 0.01

    /**
     * enableDamping を有効にしているため、
     * 毎フレーム update() を呼ぶ必要がある。
     */
    this.controls.update()

    this.renderer.render(this.scene, this.camera)
  }
}
