<template>
  <div class="app">
    <Toolbar />

    <div class="main">
      <ProjectPanel />
      <SceneCanvas />
      <PropertyPanel />
    </div>

    <TimelinePanel />
  </div>
</template>

<script setup lang="ts">
import Toolbar from '@/components/layout/AppToolbar.vue'
import ProjectPanel from '@/components/layout/ProjectPanel.vue'
import PropertyPanel from '@/components/layout/PropertyPanel.vue'
import TimelinePanel from '@/components/layout/TimelinePanel.vue'
import SceneCanvas from '@/components/three/SceneCanvas.vue'

import '@/styles/app-layout.css'
</script>
