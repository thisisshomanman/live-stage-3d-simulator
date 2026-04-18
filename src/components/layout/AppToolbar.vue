<template>
  <header class="toolbar">
    <div class="toolbar__left">
      <span class="toolbar__title">Live Stage 3D Simulator</span>
      <span class="toolbar__phase-label">
        Selected Phase:
        <strong>{{ selectedPhaseName }}</strong>
      </span>
    </div>

    <div class="toolbar__center">
      <button type="button" @click="handleLoadPhase" :disabled="!hasSelectedPhase">Load</button>
      <button type="button" @click="handleSavePhase">Save</button>
      <button type="button">Play</button>
      <button type="button">Pause</button>
      <button type="button">Stop</button>
    </div>

    <div class="toolbar__right">
      <label for="view-select">View</label>

      <!--
        現在の視点IDを v-model で select にバインドしている。
        ユーザーが選択を変えると、viewStore.currentView が更新される。
      -->
      <select id="view-select" v-model="selectedView" class="toolbar__select">
        <option v-for="preset in cameraPresets" :key="preset.id" :value="preset.id">
          {{ preset.label }}
        </option>
      </select>
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * ファイル概要:
 * - アプリ上部のツールバーを表示するコンポーネント
 *
 * このファイルの目的:
 * - 保存 / 読込などの主要操作ボタンを提供する
 * - 視点切替UIを提供する
 * - phaseStore と接続して phase の保存 / 読込を行えるようにする
 */

import { computed, onMounted } from 'vue'

import { cameraPresets } from '@/core/scene/cameraPresets'
import { usePhaseStore } from '@/stores/phaseStore'
import { useViewStore } from '@/stores/viewStore'

import type { CameraPresetId } from '@/types/view'

/**
 * 視点ストア。
 */
const viewStore = useViewStore()

/**
 * phase ストア。
 */
const phaseStore = usePhaseStore()

/**
 * select 用の双方向バインディング。
 */
const selectedView = computed({
  get: (): CameraPresetId => viewStore.currentView,
  set: (value: CameraPresetId): void => {
    viewStore.setCurrentView(value)
  },
})

/**
 * 現在選択中 phase 名を表示用に整形する。
 */
const selectedPhaseName = computed<string>(() => {
  return phaseStore.selectedPhase?.name ?? 'None'
})

/**
 * phase が選択されているかどうか。
 */
const hasSelectedPhase = computed<boolean>(() => phaseStore.hasSelectedPhase)

onMounted(() => {
  phaseStore.initialize()
})

/**
 * 現在状態を phase として保存する。
 */
function handleSavePhase(): void {
  const defaultName = `Phase ${phaseStore.phases.length + 1}`
  const inputValue = window.prompt('保存する phase 名を入力してください。', defaultName)

  if (inputValue === null) {
    return
  }

  phaseStore.saveCurrentPhase(inputValue)
}

/**
 * 選択中 phase を読み込む。
 */
function handleLoadPhase(): void {
  phaseStore.loadSelectedPhase()
}
</script>

<style scoped>
/**
 * ツールバー全体。
 * 左: タイトル / 選択中 phase
 * 中央: 操作ボタン
 * 右: 視点切替
 */
.toolbar {
  height: 56px;
  border-bottom: 1px solid #ccc;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
  background: #fff;
}

.toolbar__left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.toolbar__title {
  font-weight: 700;
  white-space: nowrap;
}

.toolbar__phase-label {
  font-size: 13px;
  color: #555;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar__center {
  display: flex;
  gap: 8px;
}

.toolbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar__select {
  min-width: 140px;
}
</style>
