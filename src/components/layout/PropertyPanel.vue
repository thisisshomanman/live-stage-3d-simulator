<template>
  <aside class="project-panel">
    <h2 class="panel-title">Project</h2>

    <div class="panel-section">
      <p>Venue</p>
      <p>Stage</p>
      <p>Speakers</p>
      <p>Lights</p>
      <p>Cues</p>
    </div>

    <div class="panel-section">
      <h3>Speaker Visibility</h3>

      <!--
        スピーカー全体の表示ON/OFF。
        false にすると、全スピーカーを非表示にする。
      -->
      <label>
        <input v-model="showSpeakers" type="checkbox" />
        Show Speakers
      </label>

      <!--
        種別ごとの表示切替。
        全体表示がOFFの時は操作できないようにする。
      -->
      <div class="panel-subsection">
        <label>
          <input v-model="showMainSpeakers" type="checkbox" :disabled="!showSpeakers" />
          Main
        </label>

        <label>
          <input v-model="showSubSpeakers" type="checkbox" :disabled="!showSpeakers" />
          Sub
        </label>

        <label>
          <input v-model="showDelaySpeakers" type="checkbox" :disabled="!showSpeakers" />
          Delay
        </label>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
/**
 * ファイル概要:
 * - 画面左側のプロジェクトパネルを表示するコンポーネント
 *
 * このファイルの目的:
 * - プロジェクト構成の見出しを表示する
 * - スピーカー表示ON/OFFを操作する
 * - speakerStore と連動して 3D 表示を制御できるようにする
 */

import { computed } from 'vue'
import { useSpeakerStore } from '@/stores/speakerStore'

const speakerStore = useSpeakerStore()

/**
 * スピーカー全体表示の双方向バインディング。
 */
const showSpeakers = computed({
  get: (): boolean => speakerStore.showSpeakers,
  set: (value: boolean) => {
    speakerStore.setShowSpeakers(value)
  },
})

/**
 * メインスピーカー表示の双方向バインディング。
 */
const showMainSpeakers = computed({
  get: (): boolean => speakerStore.typeVisibility.main,
  set: (value: boolean) => {
    speakerStore.setTypeVisibility('main', value)
  },
})

/**
 * サブウーファー表示の双方向バインディング。
 */
const showSubSpeakers = computed({
  get: (): boolean => speakerStore.typeVisibility.sub,
  set: (value: boolean) => {
    speakerStore.setTypeVisibility('sub', value)
  },
})

/**
 * ディレイスピーカー表示の双方向バインディング。
 */
const showDelaySpeakers = computed({
  get: (): boolean => speakerStore.typeVisibility.delay,
  set: (value: boolean) => {
    speakerStore.setTypeVisibility('delay', value)
  },
})
</script>

<style scoped>
.project-panel {
  border-right: 1px solid #ccc;
  padding: 16px;
  background: #fafafa;
}

.panel-title {
  margin: 0 0 16px;
  font-size: 18px;
}

.panel-section {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-subsection {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 8px;
}
</style>
