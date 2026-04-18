/**
 * ファイル概要:
 * - three.js の Scene / Camera / Renderer / Controls を管理するクラス
 * - Vue コンポーネントから three.js の詳細責務を分離するために存在する
 *
 * 主な責務:
 * 1. three.js の初期化
 * 2. OrbitControls の設定
 * 3. レンダーループの実行
 * 4. リサイズ処理
 * 5. カメラプリセットの適用
 * 6. 自由視点との共存制御
 * 7. スピーカー表示状態の反映
 * 8. 後片付け
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createBaseSceneObjects, type BaseSceneObjects } from '@/core/scene/createBaseSceneObjects'
import { VenueBuilder } from '@/core/scene/VenueBuilder'
import { StageBuilder } from '@/core/scene/StageBuilder'
import { SeatBlockBuilder } from '@/core/scene/SeatBlockBuilder'
import { SpeakerBuilder } from '@/core/scene/SpeakerBuilder'
import { findCameraPresetById } from '@/core/scene/cameraPresets'
import type { CameraPresetId } from '@/types/view'
import type { SpeakerSettings, SpeakerTypeVisibility } from '@/types/speaker'

export class SceneManager {
  /**
   * three.js を描画する親コンテナ。
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
   */
  private baseObjects!: BaseSceneObjects

  /**
   * SpeakerBuilder を保持する。
   * 後から表示ON/OFFを反映するために必要。
   */
  private speakerBuilder!: SpeakerBuilder

  /**
   * 現在適用中のカメラプリセットID。
   */
  private currentPresetId: CameraPresetId = 'foh'

  /**
   * カメラプリセット適用中かどうかを管理するフラグ。
   */
  private isApplyingCameraPreset = false

  /**
   * ユーザーが手でカメラを動かしたことを外側へ通知するためのコールバック。
   */
  private onManualCameraControl?: () => void

  constructor(container: HTMLElement) {
    this.container = container
  }

  /**
   * Scene 全体を初期化する。
   */
  public init(): void {
    this.createScene()
    this.createCamera()
    this.createRenderer()
    this.createControls()
    this.createObjects()
    this.registerEvents()

    /**
     * 初期視点として FOH を適用する。
     */
    this.setCameraPreset(this.currentPresetId)
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
   * 外側から、手動カメラ操作時の通知コールバックを登録する。
   *
   * @param callback ユーザー手動操作時に呼ぶ関数
   */
  public setOnManualCameraControl(callback: () => void): void {
    this.onManualCameraControl = callback
  }

  /**
   * スピーカー表示状態を Scene に反映する。
   *
   * @param showSpeakers 全体表示ON/OFF
   * @param typeVisibility 種別ごとの表示ON/OFF
   * @param speakerSettings 個別スピーカー設定一覧
   */
  public applySpeakerState(
    showSpeakers: boolean,
    typeVisibility: SpeakerTypeVisibility,
    speakerSettings: SpeakerSettings[],
  ): void {
    if (!this.speakerBuilder) return

    this.speakerBuilder.applySpeakerVisibility(showSpeakers, typeVisibility, speakerSettings)
  }

  /**
   * カメラプリセットを適用する。
   *
   * @param presetId 適用したいカメラプリセットID
   */
  public setCameraPreset(presetId: CameraPresetId): void {
    const preset = findCameraPresetById(presetId)

    if (!preset) {
      return
    }

    this.isApplyingCameraPreset = true

    this.camera.position.set(preset.position.x, preset.position.y, preset.position.z)

    this.controls.target.set(preset.target.x, preset.target.y, preset.target.z)

    this.controls.update()

    this.currentPresetId = presetId
    this.isApplyingCameraPreset = false
  }

  /**
   * 現在のカメラプリセットIDを返す。
   */
  public getCurrentPresetId(): CameraPresetId {
    return this.currentPresetId
  }

  /**
   * three.js 関連の後片付けを行う。
   */
  public dispose(): void {
    window.removeEventListener('resize', this.handleResize)
    cancelAnimationFrame(this.animationFrameId)

    if (this.controls) {
      this.controls.removeEventListener('start', this.handleControlsStart)
      this.controls.dispose()
    }

    if (this.baseObjects) {
      this.baseObjects.cubeGeometry.dispose()
      this.baseObjects.cubeMaterial.dispose()
    }

    if (this.renderer) {
      this.renderer.dispose()

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
   */
  private createControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.minDistance = 2
    this.controls.maxDistance = 30
    this.controls.maxPolarAngle = Math.PI / 2

    /**
     * ユーザーがマウス操作を開始した時のイベント。
     * ここで「今は自由視点に切り替わった」と見なす。
     */
    this.controls.addEventListener('start', this.handleControlsStart)
  }

  /**
   * Scene に表示用オブジェクトを追加する。
   */
  private createObjects(): void {
    this.baseObjects = createBaseSceneObjects(this.scene)

    const venueBuilder = new VenueBuilder(this.scene)
    venueBuilder.build()

    const stageBuilder = new StageBuilder(this.scene)
    stageBuilder.build()

    const seatBlockBuilder = new SeatBlockBuilder(this.scene)
    seatBlockBuilder.build()

    this.speakerBuilder = new SpeakerBuilder(this.scene)
    this.speakerBuilder.build()
  }

  /**
   * イベント登録を行う。
   */
  private registerEvents(): void {
    window.addEventListener('resize', this.handleResize)
  }

  /**
   * リサイズイベント時の処理。
   */
  private readonly handleResize = (): void => {
    this.resize()
  }

  /**
   * OrbitControls による手動操作開始時の処理。
   */
  private readonly handleControlsStart = (): void => {
    if (this.isApplyingCameraPreset) {
      return
    }

    if (this.currentPresetId === 'free') {
      return
    }

    this.currentPresetId = 'free'
    this.onManualCameraControl?.()
  }

  /**
   * 毎フレームの描画処理。
   */
  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate)

    this.baseObjects.cube.rotation.x += 0.01
    this.baseObjects.cube.rotation.y += 0.01

    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }
}
