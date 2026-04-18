import { defineStore } from 'pinia'

export const useProjectStore = defineStore('project', {
  state: () => ({
    projectName: 'Live Stage 3D Simulator',
    loaded: false,
  }),
})
