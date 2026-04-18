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
      <select id="view-select">
        <option>User Seat</option>
        <option>Free</option>
        <option>FOH</option>
      </select>
    </div>
  </header>
</template>

<style scoped>
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
</style>
