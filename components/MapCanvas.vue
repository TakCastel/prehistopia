<template>
  <div class="w-full h-full flex items-center justify-center">
    <canvas
      ref="canvas"
      class="absolute inset-0 w-full h-full touch-none bg-zinc-900"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @wheel.prevent="handleWheel"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useResourceStore } from "@/stores/useResourceStore";
import { useMapStore } from "@/stores/useMapStore";
import { useMeepleStore } from "@/stores/useMeepleStore";

const mapStore = useMapStore();
const resourceStore = useResourceStore();

const canvas = ref(null);
let hoveredTile = null;
const minZoom = 0.5;
const maxZoom = 3;

function handleMouseDown(event) {
  mapStore.camera.isDragging = true;
  mapStore.camera.lastX = event.clientX;
  mapStore.camera.lastY = event.clientY;
  mapStore.camera.startX = event.clientX;
  mapStore.camera.startY = event.clientY;
  canvas.value.style.cursor = "grabbing";
}

function handleMouseMove(event) {
  const canvasEl = canvas.value;

  if (mapStore.camera.isDragging) {
    const dx = event.clientX - mapStore.camera.lastX;
    const dy = event.clientY - mapStore.camera.lastY;
    mapStore.camera.x += dx;
    mapStore.camera.y += dy;
    mapStore.camera.lastX = event.clientX;
    mapStore.camera.lastY = event.clientY;
    mapStore.draw(canvasEl, hoveredTile);
  } else {
    const { x, y } = mapStore.screenToIso(
      event.clientX,
      event.clientY,
      canvasEl
    );

    if (!hoveredTile || hoveredTile.x !== x || hoveredTile.y !== y) {
      hoveredTile = { x, y };
      mapStore.draw(canvasEl, hoveredTile);
    }
  }
}

function handleMouseUp(event) {
  const canvasEl = canvas.value;
  mapStore.camera.isDragging = false;
  canvasEl.style.cursor = "default";

  const clientX = event?.clientX ?? mapStore.camera.lastX;
  const clientY = event?.clientY ?? mapStore.camera.lastY;

  const moved =
    Math.abs(clientX - mapStore.camera.startX) > 5 ||
    Math.abs(clientY - mapStore.camera.startY) > 5;

  if (moved) return;

  const { x, y } = mapStore.screenToIso(clientX, clientY, canvasEl);
  const cell = mapStore.map[y]?.[x];

  if (x >= 0 && x < mapStore.cols && y >= 0 && y < mapStore.rows) {
    mapStore.placeBuildingAt(x, y, canvasEl);
  } else if (mapStore.selectedBuilding) {
    mapStore.selectedBuilding = null;
    mapStore.draw(canvasEl);
  }
}

function handleWheel(event) {
  event.preventDefault();

  const zoomIntensity = 0.1;
  const direction = event.deltaY > 0 ? -1 : 1;

  mapStore.camera.zoom += direction * zoomIntensity;
  mapStore.camera.zoom = Math.min(
    Math.max(mapStore.camera.zoom, minZoom),
    maxZoom
  );

  mapStore.draw(canvas.value);
}

function handleKeydown(e) {
  if (e.code === "Escape") {
    mapStore.selectedBuilding = null;
    mapStore.draw(canvas.value);
  }
}

function handleTouchStart(e) {
  const touch = e.touches[0];
  handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
}

function handleTouchMove(e) {
  const touch = e.touches[0];
  handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
}

function handleTouchEnd() {
  handleMouseUp({});
}

let animationFrameId;

function startAnimationLoop() {
  const render = () => {
    if (canvas.value) {
      mapStore.draw(canvas.value, hoveredTile);
    }
    animationFrameId = requestAnimationFrame(render);
  };
  animationFrameId = requestAnimationFrame(render);
}

function stopAnimationLoop() {
  cancelAnimationFrame(animationFrameId);
}

function handleResize() {
  mapStore.draw(canvas.value);
}

onMounted(async () => {
  await nextTick();
  await mapStore.initCanvas(canvas.value);

  startAnimationLoop();
  useMeepleStore().startContinuousMovement();
  resourceStore.startResourceIncome(mapStore.map);

  window.addEventListener("resize", handleResize);
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  stopAnimationLoop();

  window.removeEventListener("resize", handleResize);
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
canvas {
  display: block;
  cursor: default;
  touch-action: none;
}
</style>
