<template>
  <footer class="timeline-panel">
    <div class="timeline-panel__header">
      <div class="timeline-panel__heading">
        <h2>Phases</h2>
        <p class="timeline-panel__description">
          phase 保存・読込・再生時間編集・再生中 phase の確認ができます。
        </p>
      </div>

      <div class="timeline-panel__actions">
        <button type="button" @click="handleSavePhase" :disabled="isPlaying">Add Phase</button>
        <button
          type="button"
          @click="handleLoadSelectedPhase"
          :disabled="!hasSelectedPhase || isPlaying"
        >
          Load Selected
        </button>
        <button
          type="button"
          @click="handleRenameSelectedPhase"
          :disabled="!hasSelectedPhase || isPlaying"
        >
          Edit Phase
        </button>
        <button
          type="button"
          @click="handleDeleteSelectedPhase"
          :disabled="!hasSelectedPhase || isPlaying"
        >
          Delete Phase
        </button>
      </div>
    </div>

    <p v-if="phases.length === 0" class="timeline-panel__empty">
      まだ phase はありません。右上またはここから保存してください。
    </p>

    <div v-else class="timeline-panel__track">
      <button
        v-for="phase in phases"
        :key="phase.id"
        type="button"
        class="timeline-panel__phase"
        :class="{
          'timeline-panel__phase--selected': phase.id === selectedPhaseId,
          'timeline-panel__phase--playing': phase.id === activePhaseId && isPlaying,
          'timeline-panel__phase--paused': phase.id === activePhaseId && isPaused,
        }"
        @click="handleSelectPhase(phase.id)"
        @dblclick="handleLoadPhaseById(phase.id)"
      >
        <div class="timeline-panel__phase-top">
          <span class="timeline-panel__phase-name">{{ phase.name }}</span>
          <span v-if="phase.id === activePhaseId && isPlaying" class="timeline-panel__badge">
            ▶
          </span>
          <span v-else-if="phase.id === activePhaseId && isPaused" class="timeline-panel__badge">
            ❚❚
          </span>
        </div>

        <span class="timeline-panel__phase-time">{{ formatCreatedAt(phase.createdAt) }}</span>

        <label class="timeline-panel__duration" @click.stop>
          <span>Duration</span>
          <input
            :value="phase.durationMs"
            type="number"
            min="100"
            step="100"
            @click.stop
            @dblclick.stop
            @change="handleDurationChange(phase.id, $event)"
          />
          <span>ms</span>
        </label>
      </button>
    </div>
  </footer>
</template>

<script setup lang="ts">
/**
 * ファイル概要:
 * - 画面下部のフェーズ一覧パネルを表示するコンポーネント
 *
 * このファイルの目的:
 * - 保存済み phase を一覧表示する
 * - phase の選択 / 読込 / 編集 / 削除を行う
 * - phase ごとの durationMs を編集する
 * - 再生中 / 一時停止中の active phase を視覚表示する
 */

import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import { usePhaseStore } from '@/stores/phaseStore'
import { usePlaybackStore } from '@/stores/playbackStore'

const phaseStore = usePhaseStore()
const playbackStore = usePlaybackStore()

const { phases, selectedPhaseId } = storeToRefs(phaseStore)
const { activePhaseId, isPlaying, isPaused } = storeToRefs(playbackStore)

const hasSelectedPhase = computed<boolean>(() => phaseStore.hasSelectedPhase)

onMounted(() => {
  phaseStore.initialize()
})

/**
 * phase を選択状態にする。
 *
 * @param phaseId 選択対象 phase ID
 */
function handleSelectPhase(phaseId: string): void {
  phaseStore.selectPhase(phaseId)
}

/**
 * 現在状態を新しい phase として保存する。
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
function handleLoadSelectedPhase(): void {
  phaseStore.loadSelectedPhase()
}

/**
 * 指定 phase を読み込む。
 *
 * @param phaseId 読込対象 phase ID
 */
function handleLoadPhaseById(phaseId: string): void {
  phaseStore.selectPhase(phaseId)
  phaseStore.loadPhaseById(phaseId)
}

/**
 * 選択中 phase の名前を変更する。
 */
function handleRenameSelectedPhase(): void {
  const currentPhase = phaseStore.selectedPhase
  if (!currentPhase) {
    return
  }

  const inputValue = window.prompt('新しい phase 名を入力してください。', currentPhase.name)

  if (inputValue === null) {
    return
  }

  phaseStore.renameSelectedPhase(inputValue)
}

/**
 * 選択中 phase を削除する。
 */
function handleDeleteSelectedPhase(): void {
  const currentPhase = phaseStore.selectedPhase
  if (!currentPhase) {
    return
  }

  const shouldDelete = window.confirm(`「${currentPhase.name}」を削除しますか？`)

  if (!shouldDelete) {
    return
  }

  phaseStore.deleteSelectedPhase()
}

/**
 * duration 入力変更を反映する。
 *
 * 再生中の active phase を編集した場合は、
 * 現在 phase の timer を張り直す。
 *
 * @param phaseId 対象 phase ID
 * @param event input change event
 */
function handleDurationChange(phaseId: string, event: Event): void {
  const target = event.target as HTMLInputElement
  const nextValue = Number(target.value)

  const updated = phaseStore.updatePhaseDurationById(phaseId, nextValue)

  if (!updated) {
    return
  }

  const updatedPhase = phaseStore.phases.find((phase) => phase.id === phaseId)
  if (updatedPhase) {
    target.value = String(updatedPhase.durationMs)
  }

  if (playbackStore.isPlaying && playbackStore.activePhaseId === phaseId) {
    playbackStore.restartCurrentPhaseTimer()
  }
}

/**
 * 作成日時を画面表示用に整形する。
 *
 * @param createdAt ISO 文字列
 * @returns 表示用日時
 */
function formatCreatedAt(createdAt: string): string {
  return new Date(createdAt).toLocaleString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.timeline-panel {
  border-top: 1px solid #ccc;
  padding: 10px 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}

.timeline-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}

.timeline-panel__heading h2 {
  margin: 0;
  font-size: 16px;
}

.timeline-panel__description {
  margin: 4px 0 0;
  font-size: 12px;
  color: #666;
}

.timeline-panel__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.timeline-panel__empty {
  margin: 0;
  color: #666;
  font-size: 13px;
}

.timeline-panel__track {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 2px;
}

.timeline-panel__phase {
  min-width: 180px;
  max-width: 220px;
  border: 1px solid #ccc;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
  cursor: pointer;
  flex-shrink: 0;
}

.timeline-panel__phase--selected {
  border-color: #2563eb;
  background: #dbeafe;
}

.timeline-panel__phase--playing {
  border-color: #16a34a;
  background: #dcfce7;
}

.timeline-panel__phase--paused {
  border-color: #d97706;
  background: #fef3c7;
}

.timeline-panel__phase-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.timeline-panel__phase-name {
  font-size: 13px;
  font-weight: 700;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline-panel__badge {
  font-size: 12px;
  font-weight: 700;
}

.timeline-panel__phase-time {
  font-size: 11px;
  color: #666;
}

.timeline-panel__duration {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #555;
}

.timeline-panel__duration input {
  width: 72px;
  padding: 4px 6px;
  font-size: 12px;
}
</style>
