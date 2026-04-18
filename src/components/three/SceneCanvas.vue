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
 * 6. speakerStore の変更を監視して、スピーカー表示状態を反映する
 * 7. Raycast の選択結果を selectionStore に反映する
 */

import { onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { SceneManager, type SceneSelectionPayload } from '@/core/scene/SceneManager'
import { useViewStore } from '@/stores/viewStore'
import { useSpeakerStore } from '@/stores/speakerStore'
import { useSelectionStore } from '@/stores/selectionStore'

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

/**
 * スピーカーストア。
 */
const speakerStore = useSpeakerStore()
const { showSpeakers, typeVisibility, speakers } = storeToRefs(speakerStore)

/**
 * 選択状態ストア。
 */
const selectionStore = useSelectionStore()

/**
 * Raycast の選択結果を selectionStore に反映する。
 *
 * @param selection SceneManager から受け取った選択結果
 */
const syncSelectionToStore = (selection: SceneSelectionPayload | null): void => {
  if (!selection) {
    selectionStore.clearSelection()
    return
  }

  if (selection.objectType === 'speaker') {
    selectionStore.selectSpeaker(selection.objectId)
  }
}

onMounted(() => {
  if (!canvasContainer.value) return

  sceneManager = new SceneManager(canvasContainer.value)

  /**
   * ユーザーが手動でカメラを動かした時は、
   * Toolbar 側の表示も free に揃える。
   */
  sceneManager.setOnManualCameraControl(() => {
    if (viewStore.currentView !== 'free') {
      viewStore.setCurrentView('free')
    }
  })

  /**
   * Raycast の選択結果を UI 側ストアへ反映する。
   */
  sceneManager.setOnSelectionChange(syncSelectionToStore)

  sceneManager.init()

  /**
   * 初回マウント時にスピーカー表示状態を反映する。
   */
  sceneManager.applySpeakerState(showSpeakers.value, typeVisibility.value, speakers.value)

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

/**
 * スピーカー表示状態を監視して、SceneManager へ反映する。
 *
 * deep: true にする理由:
 * - typeVisibility オブジェクトの中身
 * - speakers 配列の中の各要素
 * の変更も検知したいため
 */
watch(
  () => ({
    showSpeakers: showSpeakers.value,
    typeVisibility: typeVisibility.value,
    speakers: speakers.value,
  }),
  (state) => {
    if (!sceneManager) return

    sceneManager.applySpeakerState(state.showSpeakers, state.typeVisibility, state.speakers)
  },
  {
    deep: true,
  },
)

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
