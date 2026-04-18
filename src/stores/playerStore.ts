import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    isPlaying: false,
    currentTimeMs: 0,
    durationMs: 0,
  }),
})
