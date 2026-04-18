<template>
  <section class="scene-canvas">
    <div class="scene-canvas__inner">
      <p class="scene-canvas__title">3D Scene Area</p>
      <p>ここに three.js の SceneCanvas を載せる</p>
    </div>
  </section>
</template>

<style scoped>
.scene-canvas {
  background: #111;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
}

.scene-canvas__inner {
  text-align: center;
}

.scene-canvas__title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}
</style>
