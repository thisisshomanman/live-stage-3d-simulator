<template>
  <aside class="property-panel">
    <h2 class="panel-title">Properties</h2>

    <div class="panel-section">
      <h3>Speaker Visibility</h3>

      <!--
        スピーカー全体の表示ON/OFF。
        false にすると、全スピーカーを非表示にする。
      -->
      <label class="checkbox-row">
        <input v-model="showSpeakers" type="checkbox" />
        <span>Show Speakers</span>
      </label>

      <!--
        種別ごとの表示切替。
        全体表示がOFFの時は操作できないようにする。
      -->
      <div class="panel-subsection">
        <label class="checkbox-row">
          <input v-model="showMainSpeakers" type="checkbox" :disabled="!showSpeakers" />
          <span>Main</span>
        </label>

        <label class="checkbox-row">
          <input v-model="showSubSpeakers" type="checkbox" :disabled="!showSpeakers" />
          <span>Sub</span>
        </label>

        <label class="checkbox-row">
          <input v-model="showDelaySpeakers" type="checkbox" :disabled="!showSpeakers" />
          <span>Delay</span>
        </label>
      </div>
    </div>

    <div class="panel-section">
      <h3>Selected Object</h3>

      <p v-if="!hasSelectedSpeaker" class="empty-message">
        Scene 上でスピーカーをクリックすると、ここに詳細を表示します。
      </p>

      <template v-else>
        <div class="property-list">
          <div class="property-row">
            <span class="property-label">Label</span>
            <span class="property-value">{{ selectedSpeaker?.label }}</span>
          </div>

          <div class="property-row">
            <span class="property-label">ID</span>
            <span class="property-value">{{ selectedSpeaker?.id }}</span>
          </div>

          <div class="property-row">
            <span class="property-label">Type</span>
            <span class="property-value">{{ selectedSpeakerTypeLabel }}</span>
          </div>
        </div>

        <div class="editor-section">
          <label class="field-group checkbox-row">
            <span class="field-label">Visible</span>
            <input v-model="selectedSpeakerVisible" type="checkbox" />
          </label>

          <label class="field-group">
            <span class="field-label">Gain</span>
            <input
              v-model.number="selectedSpeakerGain"
              class="number-input"
              type="number"
              min="0"
              step="0.1"
            />
          </label>

          <label class="field-group">
            <span class="field-label">Delay (ms)</span>
            <input
              v-model.number="selectedSpeakerDelayMs"
              class="number-input"
              type="number"
              min="0"
              step="1"
            />
          </label>
        </div>

        <p class="help-text">
          ※ gain / delay は現時点では Store 更新までです。将来的に音響シミュレーションへ接続します。
        </p>
      </template>
    </div>
  </aside>
</template>

<script setup lang="ts">
/**
 * ファイル概要:
 * - 画面右側のプロパティパネルを表示するコンポーネント
 *
 * このファイルの目的:
 * - スピーカー表示ON/OFFを操作する
 * - 選択中スピーカーの詳細情報を表示する
 * - speakerStore / selectionStore と連動して 3D Scene の編集起点になる
 */

import { computed } from 'vue'

import { useSpeakerStore } from '@/stores/speakerStore'
import { useSelectionStore } from '@/stores/selectionStore'

import type { SpeakerSettings, SpeakerType } from '@/types/speaker'

const speakerStore = useSpeakerStore()
const selectionStore = useSelectionStore()

/**
 * スピーカー全体表示の双方向バインディング。
 */
const showSpeakers = computed({
  get: (): boolean => speakerStore.showSpeakers,
  set: (value: boolean): void => {
    speakerStore.setShowSpeakers(value)
  },
})

/**
 * メインスピーカー表示の双方向バインディング。
 */
const showMainSpeakers = computed({
  get: (): boolean => speakerStore.typeVisibility.main,
  set: (value: boolean): void => {
    speakerStore.setTypeVisibility('main', value)
  },
})

/**
 * サブウーファー表示の双方向バインディング。
 */
const showSubSpeakers = computed({
  get: (): boolean => speakerStore.typeVisibility.sub,
  set: (value: boolean): void => {
    speakerStore.setTypeVisibility('sub', value)
  },
})

/**
 * ディレイスピーカー表示の双方向バインディング。
 */
const showDelaySpeakers = computed({
  get: (): boolean => speakerStore.typeVisibility.delay,
  set: (value: boolean): void => {
    speakerStore.setTypeVisibility('delay', value)
  },
})

/**
 * 現在選択中の speaker 設定を返す。
 *
 * selectionStore 側には現時点で objectId / objectType の最小情報だけあればよい。
 */
const selectedSpeaker = computed<SpeakerSettings | null>(() => {
  if (selectionStore.selectedObjectType !== 'speaker') {
    return null
  }

  return (
    speakerStore.speakers.find((speaker) => speaker.id === selectionStore.selectedObjectId) ?? null
  )
})

/**
 * speaker が選択されているかどうか。
 */
const hasSelectedSpeaker = computed<boolean>(() => selectedSpeaker.value !== null)

/**
 * 選択中スピーカーの種別表示ラベル。
 */
const selectedSpeakerTypeLabel = computed<string>(() => {
  if (!selectedSpeaker.value) {
    return ''
  }

  return getSpeakerTypeLabel(selectedSpeaker.value.type)
})

/**
 * 選択中スピーカーの表示ON/OFF。
 */
const selectedSpeakerVisible = computed({
  get: (): boolean => selectedSpeaker.value?.isVisible ?? false,
  set: (value: boolean): void => {
    if (!selectedSpeaker.value) {
      return
    }

    speakerStore.setSpeakerVisible(selectedSpeaker.value.id, value)
  },
})

/**
 * 選択中スピーカーの gain 値。
 */
const selectedSpeakerGain = computed({
  get: (): number => selectedSpeaker.value?.gain ?? 1,
  set: (value: number): void => {
    if (!selectedSpeaker.value) {
      return
    }

    speakerStore.updateSpeakerGain(selectedSpeaker.value.id, normalizeGain(value))
  },
})

/**
 * 選択中スピーカーの delay 値。
 */
const selectedSpeakerDelayMs = computed({
  get: (): number => selectedSpeaker.value?.delayMs ?? 0,
  set: (value: number): void => {
    if (!selectedSpeaker.value) {
      return
    }

    speakerStore.updateSpeakerDelay(selectedSpeaker.value.id, normalizeDelayMs(value))
  },
})

/**
 * SpeakerType を画面表示用ラベルへ変換する。
 *
 * @param type スピーカー種別
 * @returns 表示用ラベル
 */
function getSpeakerTypeLabel(type: SpeakerType): string {
  switch (type) {
    case 'main':
      return 'Main'
    case 'sub':
      return 'Sub'
    case 'delay':
      return 'Delay'
    default:
      return type
  }
}

/**
 * gain 入力値を画面用に正規化する。
 *
 * 現時点では 0 以上の値に丸める。
 *
 * @param value 入力値
 * @returns 正規化後の gain
 */
function normalizeGain(value: number): number {
  if (Number.isNaN(value)) {
    return 0
  }

  return Math.max(0, value)
}

/**
 * delayMs 入力値を画面用に正規化する。
 *
 * 現時点では 0 以上の整数に丸める。
 *
 * @param value 入力値
 * @returns 正規化後の delayMs
 */
function normalizeDelayMs(value: number): number {
  if (Number.isNaN(value)) {
    return 0
  }

  return Math.max(0, Math.round(value))
}
</script>

<style scoped>
.property-panel {
  border-left: 1px solid #ccc;
  padding: 16px;
  background: #fafafa;
  overflow-y: auto;
  min-height: 0;
}

.panel-title {
  margin: 0 0 16px;
  font-size: 18px;
}

.panel-section {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-subsection {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 8px;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-message {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.property-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.property-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.property-label {
  font-size: 12px;
  color: #666;
}

.property-value {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  word-break: break-word;
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.number-input {
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  font-size: 14px;
}

.help-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #666;
}
</style>
