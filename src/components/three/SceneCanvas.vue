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
 * 4. viewStore の変更を監視して、SceneManager のカメラ視点へ反映する
 * 5. 手動カメラ操作を検知して、viewStore を free に切り替える
 */

import { onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { SceneManager } from '@/core/scene/SceneManager'
import { useViewStore } from '@/stores/viewStore'

/**
 * three.js 描画先の DOM 要素。
 */
const canvasContainer = ref<HTMLElement | null>(null)

/**
 * three.js 全体を管理するクラス。
 */
let sceneManager: SceneManager | null = null

/**
 * 視点ストア。
 */
const viewStore = useViewStore()
const { currentView } = storeToRefs(viewStore)

onMounted(() => {
  if (!canvasContainer.value) return

  sceneManager = new SceneManager(canvasContainer.value)

  /**
   * ユーザーが手動でカメラを動かした時は、
   * Toolbar 側の表示も free に揃える。
   *
   * ポイント:
   * - ここでは store だけを書き換える
   * - SceneManager 側では、すでに currentPresetId を free に更新済み
   * - そのため watch 側で二重にカメラリセットされない
   */
  sceneManager.setOnManualCameraControl(() => {
    if (viewStore.currentView !== 'free') {
      viewStore.setCurrentView('free')
    }
  })

  sceneManager.init()
  sceneManager.start()
})

/**
 * 視点変更を監視して、SceneManager のカメラへ反映する。
 */
watch(currentView, (newPresetId) => {
  if (!sceneManager) return

  /**
   * すでに同じ視点IDなら何もしない。
   * これにより、手動操作で free に切り替わった時に
   * カメラ位置が不必要にリセットされるのを防ぐ。
   */
  if (newPresetId === sceneManager.getCurrentPresetId()) {
    return
  }

  sceneManager.setCameraPreset(newPresetId)
})

onUnmounted(() => {
  sceneManager?.dispose()
  sceneManager = null
})
</script>

<style scoped>
.scene-canvas {
  min-width: 0;
  min-height: 0;
  background: #111;
}

.scene-canvas__container {
  width: 100%;
  height: 100%;
}
</style>
