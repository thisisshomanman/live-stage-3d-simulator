import { defineStore } from 'pinia'

export const useViewStore = defineStore('view', {
  state: () => ({
    currentView: 'user-seat',
  }),
})
