<template>
  <header class="toolbar">
    <div class="toolbar__left">
      <span class="toolbar__title">Live Stage 3D Simulator</span>
      <span class="toolbar__phase-label">
        Selected Phase:
        <strong>{{ selectedPhaseName }}</strong>
      </span>
      <span class="toolbar__status" :class="toolbarStatusClass">
        {{ playbackStatusLabel }}
      </span>
    </div>

    <div class="toolbar__center">
      <button type="button" @click="handleLoadPhase" :disabled="!hasSelectedPhase || isPlaying">
        Load
      </button>
      <button type="button" @click="handleSavePhase" :disabled="isPlaying">Save</button>
      <button type="button" @click="handlePlay" :disabled="phases.length === 0 || isPlaying">
        Play
      </button>
      <button type="button" @click="handlePause" :disabled="!isPlaying">Pause</button>
      <button type="button" @click="handleStop" :disabled="!isPlaying && !isPaused">Stop</button>
    </div>

    <div class="toolbar__right">
      <label for="view-select">View</label>

      <select id="view-select" v-model="selectedView" class="toolbar__select" :disabled="isPlaying">
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
 * - phaseStore と playbackStore を接続して phase 再生を行う
 */

import { computed, onBeforeUnmount, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import { cameraPresets } from '@/core/scene/cameraPresets'
import { usePhaseStore } from '@/stores/phaseStore'
import { usePlaybackStore } from '@/stores/playbackStore'
import { useViewStore } from '@/stores/viewStore'

import type { CameraPresetId } from '@/types/view'

const viewStore = useViewStore()
const phaseStore = usePhaseStore()
const playbackStore = usePlaybackStore()

const { currentView } = storeToRefs(viewStore)
const { phases } = storeToRefs(phaseStore)
const { isPlaying, isPaused, activePhaseId } = storeToRefs(playbackStore)

/**
 * select 用の双方向バインディング。
 */
const selectedView = computed({
  get: (): CameraPresetId => currentView.value,
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

/**
 * 再生状態の表示ラベル。
 */
const playbackStatusLabel = computed<string>(() => {
  if (isPlaying.value) {
    const activeName =
      phaseStore.phases.find((phase) => phase.id === activePhaseId.value)?.name ?? 'Playing'
    return `Playing: ${activeName}`
  }

  if (isPaused.value) {
    const activeName =
      phaseStore.phases.find((phase) => phase.id === activePhaseId.value)?.name ?? 'Paused'
    return `Paused: ${activeName}`
  }

  return 'Stopped'
})

/**
 * 再生状態に応じたクラス。
 */
const toolbarStatusClass = computed<string>(() => {
  if (isPlaying.value) {
    return 'toolbar__status--playing'
  }

  if (isPaused.value) {
    return 'toolbar__status--paused'
  }

  return 'toolbar__status--stopped'
})

onMounted(() => {
  phaseStore.initialize()
})

onBeforeUnmount(() => {
  playbackStore.dispose()
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

/**
 * 再生を開始する。
 */
function handlePlay(): void {
  playbackStore.play()
}

/**
 * 一時停止する。
 */
function handlePause(): void {
  playbackStore.pause()
}

/**
 * 停止して先頭へ戻す。
 */
function handleStop(): void {
  playbackStore.stop()
}
</script>

<style scoped>
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

.toolbar__status {
  font-size: 12px;
  border-radius: 999px;
  padding: 4px 10px;
  white-space: nowrap;
}

.toolbar__status--playing {
  background: #dcfce7;
  color: #166534;
}

.toolbar__status--paused {
  background: #fef3c7;
  color: #92400e;
}

.toolbar__status--stopped {
  background: #e5e7eb;
  color: #374151;
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
