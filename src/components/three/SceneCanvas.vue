<template>
  <section class="scene-canvas">
    <!--
      three.js の canvas を描画するためのコンテナ。
      SceneManager が mounted 後にこの中へ canvas を追加する。
    -->
    <div ref="canvasContainer" class="scene-canvas__container"></div>
  </section>
</template>

<script setup lang="ts">
/**
 * ファイル概要:
 * - three.js 描画の Vue 側入口となるコンポーネント
 * - three.js の詳細処理は SceneManager に委譲する
 *
 * このファイルの責務:
 * 1. 描画コンテナを持つ
 * 2. mounted 時に SceneManager を初期化する
 * 3. unmounted 時に SceneManager を破棄する
 */

import { onMounted, onUnmounted, ref } from 'vue'
import { SceneManager } from '@/core/scene/SceneManager'

/**
 * three.js 描画先の DOM 要素。
 */
const canvasContainer = ref<HTMLElement | null>(null)

/**
 * three.js 全体を管理するクラス。
 * mounted 時に生成し、unmounted 時に破棄する。
 */
let sceneManager: SceneManager | null = null

onMounted(() => {
  if (!canvasContainer.value) return

  sceneManager = new SceneManager(canvasContainer.value)
  sceneManager.init()
  sceneManager.start()
})

onUnmounted(() => {
  sceneManager?.dispose()
  sceneManager = null
})
</script>

<style scoped>
/**
 * SceneCanvas 全体の見た目。
 * App レイアウトの中央領域いっぱいに広がる想定。
 */
.scene-canvas {
  min-width: 0;
  min-height: 0;
  background: #111;
}

/**
 * three.js の canvas を挿入するコンテナ。
 */
.scene-canvas__container {
  width: 100%;
  height: 100%;
}
</style>
