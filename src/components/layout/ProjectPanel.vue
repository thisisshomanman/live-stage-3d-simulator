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
      <h3>Visibility</h3>
      <label><input type="checkbox" checked /> Seats</label>
      <label><input type="checkbox" checked /> Speakers</label>
      <label><input type="checkbox" checked /> Lights</label>
    </div>
  </aside>
</template>

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
</style>
