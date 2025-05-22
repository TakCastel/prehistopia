<template>
  <div
    ref="menuRef"
    class="fixed top-[44px] right-0 h-[calc(100vh-44px)] w-16 bg-[#4E3B31] flex flex-col z-30 border-l border-[#3B2A21]"
  >
    <!-- Zone scrollable -->
    <div
      class="flex-1 overflow-y-auto flex flex-col items-center gap-2 p-2 touch-auto overscroll-contain"
    >
      <button
        v-for="category in categories"
        :key="category.name"
        class="p-2 w-full bg-[#6B4F3A] hover:bg-[#3B2A21] text-white rounded shadow-sm flex justify-center transition-colors"
        @click.stop="selectCategory(category)"
      >
        <Icon :name="category.icon" class="w-5 h-5" />
      </button>
    </div>

    <!-- Bouton bulldozer juste après la zone scrollable -->
    <div class="p-2">
      <button
        :class="[
          'p-2 w-full text-white rounded shadow-sm flex justify-center transition-colors',
          isBulldozerActive
            ? 'bg-[#E53935] hover:bg-[#C62828]'
            : 'bg-[#8B3E2F] hover:bg-[#732F24]',
        ]"
        @click.stop="activateBulldozer"
      >
        <Icon name="mdi:shovel" class="w-5 h-5" />
      </button>
    </div>
  </div>

  <SubMenu
    v-if="selectedCategory"
    :category="selectedCategory"
    @close="selectedCategory = null"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import buildingsData from "@/assets/data/buildings.json";
import SubMenu from "@/components/SubMenu.vue";
import { useMapStore } from "@/stores/useMapStore";

const mapStore = useMapStore();
const categories = buildingsData.categories;
const selectedCategory = ref(null);

function selectCategory(category) {
  selectedCategory.value = category;
}

const isBulldozerActive = computed(
  () => mapStore.selectedBuilding === "bulldozer"
);

function activateBulldozer() {
  mapStore.selectBuildingForPlacement("bulldozer");
  selectedCategory.value = null;
}

const menuRef = ref(null);

function handleClickOutside(event) {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    selectedCategory.value = null;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
