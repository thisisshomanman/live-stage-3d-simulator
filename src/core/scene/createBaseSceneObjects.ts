/**
 * ファイル概要:
 * - three.js の Scene に対して、開発初期に必要な基本オブジェクトを追加する
 * - 現時点では以下を配置する
 *   1. AmbientLight
 *   2. DirectionalLight
 *   3. GridHelper
 *   4. AxesHelper
 *   5. 動作確認用の回転キューブ
 *
 * このファイルの目的:
 * - SceneManager から「何を置くか」の責務を切り離す
 * - 今後、会場・ステージ・スピーカー生成処理を追加しやすくする
 */

import * as THREE from 'three'

/**
 * 基本オブジェクト生成後に呼び出し側へ返す値。
 * dispose やアニメーション更新で必要になるものだけを返す。
 */
export interface BaseSceneObjects {
  cube: THREE.Mesh
  cubeGeometry: THREE.BoxGeometry
  cubeMaterial: THREE.MeshStandardMaterial
}

/**
 * Scene に対して初期表示用のオブジェクトを追加する。
 *
 * @param scene three.js の Scene
 * @returns 動作確認用キューブと、その関連リソース
 */
export const createBaseSceneObjects = (scene: THREE.Scene): BaseSceneObjects => {
  /**
   * AmbientLight:
   * 全体を均一に明るくするライト。
   */
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
  scene.add(ambientLight)

  /**
   * DirectionalLight:
   * 一方向から当たるライト。
   * 立体感を出すために追加する。
   */
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
  directionalLight.position.set(5, 10, 7)
  scene.add(directionalLight)

  /**
   * GridHelper:
   * 床面の位置感覚を確認するための補助線。
   */
  const gridHelper = new THREE.GridHelper(20, 20)
  scene.add(gridHelper)

  /**
   * AxesHelper:
   * X / Y / Z 軸を表示する補助オブジェクト。
   */
  const axesHelper = new THREE.AxesHelper(3)
  scene.add(axesHelper)

  /**
   * 開発確認用のキューブ。
   * 将来的には会場オブジェクト等へ置き換える想定。
   */
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
  const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x4fc3f7 })
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  scene.add(cube)

  return {
    cube,
    cubeGeometry,
    cubeMaterial,
  }
}
