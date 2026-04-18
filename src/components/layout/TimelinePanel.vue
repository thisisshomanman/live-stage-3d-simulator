<template>
  <footer class="timeline-panel">
    <div class="timeline-panel__header">
      <h2>Timeline</h2>
      <div class="timeline-panel__actions">
        <button>Add Cue</button>
        <button>Edit Cue</button>
        <button>Delete Cue</button>
      </div>
    </div>

    <div class="timeline-panel__track">
      <span>00:00</span>
      <div class="timeline-panel__bar">
        <span class="timeline-panel__cue">cue-1</span>
        <span class="timeline-panel__cue">cue-2</span>
        <span class="timeline-panel__cue">cue-3</span>
      </div>
      <span>03:45</span>
    </div>
  </footer>
</template>

<style scoped>
.timeline-panel {
  border-top: 1px solid #ccc;
  padding: 12px 16px;
  background: #fff;
}

.timeline-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.timeline-panel__actions {
  display: flex;
  gap: 8px;
}

.timeline-panel__track {
  display: grid;
  grid-template-columns: 48px 1fr 48px;
  align-items: center;
  gap: 12px;
}

.timeline-panel__bar {
  position: relative;
  height: 28px;
  border: 1px solid #ccc;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
}

.timeline-panel__cue {
  padding: 2px 8px;
  border-radius: 12px;
  background: #ddd;
  font-size: 12px;
}
</style>
