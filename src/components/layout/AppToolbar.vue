<template>
  <header class="toolbar">
    <div class="toolbar__left">
      <span class="toolbar__title">Live Stage 3D Simulator</span>
    </div>

    <div class="toolbar__center">
      <button>Load</button>
      <button>Save</button>
      <button>Play</button>
      <button>Pause</button>
      <button>Stop</button>
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
 * - 各種操作ボタン（将来拡張用）を表示する
 * - 視点切替UIを提供する
 * - viewStore と接続して、選択中の視点を変更できるようにする
 *
 * 現時点では:
 * - View セレクトのみ、three.js のカメラと実際に連動する
 * - Load / Save / Play / Pause / Stop は見た目だけ
 */

import { computed } from 'vue'
import { useViewStore } from '@/stores/viewStore'
import { cameraPresets } from '@/core/scene/cameraPresets'
import type { CameraPresetId } from '@/types/view'

/**
 * 視点ストア。
 * 現在の視点IDを保持している。
 */
const viewStore = useViewStore()

/**
 * select 用の双方向バインディング。
 *
 * get:
 * - 現在の視点IDを返す
 *
 * set:
 * - select の変更を受けて store の currentView を更新する
 *
 * computed を使う理由:
 * - Pinia の state をそのまま v-model で扱うより、
 *   get / set を明示した方が読みやすく、責務も分かりやすい
 */
const selectedView = computed({
  get: (): CameraPresetId => viewStore.currentView,
  set: (value: CameraPresetId) => {
    viewStore.setCurrentView(value)
  },
})
</script>

<style scoped>
/**
 * ツールバー全体。
 * 左: タイトル
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

.toolbar__title {
  font-weight: 700;
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
