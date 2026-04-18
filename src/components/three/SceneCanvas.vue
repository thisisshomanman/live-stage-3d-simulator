<template>
  <div ref="sceneContainerRef" class="scene-canvas"></div>
</template>

<script setup lang="ts">
/**
 * ファイル概要:
 * - SceneManager を Vue コンポーネントとして画面にマウントする
 *
 * このファイルの目的:
 * - Vue のライフサイクルと three.js の初期化 / 破棄をつなぐ
 * - Pinia Store の状態変化を SceneManager へ反映する
 * - Raycast の選択結果を selectionStore へ橋渡しする
 */

import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { SceneManager, type SceneSelectionPayload } from '@/core/scene/SceneManager'
import { useSpeakerStore } from '@/stores/speakerStore'
import { useViewStore } from '@/stores/viewStore'
import { useSelectionStore } from '@/stores/selectionStore'

const sceneContainerRef = ref<HTMLElement | null>(null)

let sceneManager: SceneManager | null = null

const speakerStore = useSpeakerStore()
const viewStore = useViewStore()
const selectionStore = useSelectionStore()

const { showSpeakers, typeVisibility, speakers } = storeToRefs(speakerStore)
const { currentView } = storeToRefs(viewStore)

/**
 * 現在の speakerStore 状態を SceneManager に反映する。
 */
const syncSpeakerStateToScene = (): void => {
  if (!sceneManager) {
    return
  }

  sceneManager.applySpeakerState(showSpeakers.value, typeVisibility.value, speakers.value)
}

/**
 * Raycast の選択結果を selectionStore に反映する。
 *
 * @param selection three.js 側から受け取った選択結果
 */
const syncSelectionToStore = (selection: SceneSelectionPayload | null): void => {
  if (!selection) {
    selectionStore.clearSelection()
    return
  }

  selectionStore.selectObject({
    objectId: selection.objectId,
    objectType: selection.objectType,
    objectLabel: selection.objectLabel,
  })
}

onMounted((): void => {
  if (!sceneContainerRef.value) {
    return
  }

  sceneManager = new SceneManager(sceneContainerRef.value)
  sceneManager.init()

  sceneManager.setOnManualCameraControl((): void => {
    viewStore.setCurrentView('free')
  })

  sceneManager.setOnSelectionChange(syncSelectionToStore)

  syncSpeakerStateToScene()
  sceneManager.setCameraPreset(currentView.value)
  sceneManager.start()
})

watch(currentView, (nextView): void => {
  sceneManager?.setCameraPreset(nextView)
})

watch(
  [showSpeakers, typeVisibility, speakers],
  (): void => {
    syncSpeakerStateToScene()
  },
  { deep: true },
)

onBeforeUnmount((): void => {
  sceneManager?.dispose()
  sceneManager = null
})
</script>

<style scoped>
.scene-canvas {
  width: 100%;
  height: 100%;
}
</style>
