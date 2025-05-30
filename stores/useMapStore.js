import { defineStore } from "pinia";
import { ref } from "vue";
import { loadImages, getImage } from "@/utils/imageLoader";
import {
  generateClassicMap,
  generateDesertMap,
  generateSnowMap,
  generateEmptyMap,
} from "@/utils/mapGenerator";
import localforage from "localforage";
import buildingsData from "@/assets/data/buildings.json";
import { useAlertStore } from "@/stores/useAlertStore";
import { useMeepleStore } from "@/stores/useMeepleStore";

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;

export const useMapStore = defineStore(
  "map",
  () => {
    const MAP_STORAGE_KEY = "map-data";

    const camera = reactive({
      x: 0,
      y: 0,
      zoom: 1,
      isDragging: false,
      lastX: 0,
      lastY: 0,
      startX: 0,
      startY: 0,
    });

    const cols = ref(25);
    const rows = ref(25);
    const mapType = ref("classic");
    const map = ref([]);
    const selectedBuilding = ref(null);
    const terrainTypes = ["water", "grass", "hills", "mountain"];

    function generateMap(type = "classic") {
      let newMap;
      switch (type) {
        case "desert":
          newMap = generateDesertMap(cols.value, rows.value);
          break;
        case "snow":
          newMap = generateSnowMap(cols.value, rows.value);
          break;
        default:
          newMap = generateClassicMap(cols.value, rows.value);
      }

      map.value.splice(0, map.value.length, ...newMap);
    }

    function generateBlankMap() {
      const newMap = generateEmptyMap(cols.value, rows.value);
      map.value.splice(0, map.value.length, ...newMap);
    }

    function setMapType(type) {
      mapType.value = type;
      console.log("setMapType dans le useMapStore:", mapType.value);
    }

    async function initCanvas(canvas, type = "classic") {
      await loadImages([
        { name: "tree", src: "/images/tree.png" },
        { name: "palmtree", src: "/images/palmtree.png" },
        { name: "pinetree", src: "/images/pinetree.png" },
        { name: "mountain", src: "/images/mountain.png" },
        { name: "sanddune", src: "/images/sanddune.png" },
        { name: "campfire", src: "/images/campfire.png" },
        { name: "leather_shelter", src: "/images/leather_shelter.png" },
        { name: "storage_shelter", src: "/images/storage_shelter.png" },
        { name: "family_house", src: "/images/family_house.png" },
        { name: "primitive_well", src: "/images/primitive_well.png" },
        { name: "hunting_traps", src: "/images/hunting_traps.png" },
        { name: "branch_hut", src: "/images/branch_hut.png" },
        { name: "stone_quarry", src: "/images/stone_quarry.png" },
        { name: "pottery_workshop", src: "/images/pottery_workshop.png" },
        { name: "basic_sawmill", src: "/images/basic_sawmill.png" },
        { name: "stonecutter", src: "/images/stonecutter.png" },
        { name: "stone_circle", src: "/images/stone_circle.png" },
        { name: "primitive_farm", src: "/images/primitive_farm.png" },
        { name: "gathering_area", src: "/images/gathering_area.png" },
        { name: "root_field", src: "/images/root_field.png" },
        { name: "wood_totem", src: "/images/wood_totem.png" },
        { name: "ritual_altar", src: "/images/ritual_altar.png" },
        { name: "tanning_pit", src: "/images/tanning_pit.png" },
        { name: "wooden_wall", src: "/images/wooden_wall.png" },
        { name: "watchtower", src: "/images/watchtower.png" },
        { name: "barracks", src: "/images/barracks.png" },
        { name: "knowledge_stone", src: "/images/knowledge_stone.png" },
        { name: "experimental_lab", src: "/images/experimental_lab.png" },
        { name: "ruin", src: "/images/ruin.png" },
        { name: "meeple", src: "/images/meeple.png" },
        { name: "meeple_h", src: "/images/meeple_h.png" },
        { name: "meeple_f", src: "/images/meeple_f.png" },
        { name: "wildlife", src: "/images/wildlife.png" },
        { name: "unremovable_classic", src: "/images/unremovable_classic.png" },
        {
          name: "unremovable_desert",
          src: "/images/unremovable_desert.png",
        },
        {
          name: "unremovable_snow",
          src: "/images/unremovable_snow.png",
        },
      ]);

      await loadMap(type);
      draw(canvas);
    }

    function draw(canvas, hoveredTile = null) {
      const ctx = canvas.getContext("2d");
      const width = (canvas.width = window.innerWidth);
      const height = (canvas.height = window.innerHeight);

      ctx.clearRect(0, 0, width, height);
      ctx.save();

      ctx.translate(width / 2, height / 2);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(camera.x, camera.y);

      const { meeples, moveMeeples, syncMeeplesWithPopulation } =
        useMeepleStore();
      const drawQueue = [];

      // Toutes les cases : tuiles + bâtiments
      for (let y = 0; y < rows.value; y++) {
        for (let x = 0; x < cols.value; x++) {
          const { x: screenX, y: screenY } = getScreenCoords(x, y);
          const depth = x + y;

          drawQueue.push({
            type: "tile",
            depth,
            screenX,
            screenY,
            x,
            y,
          });

          drawQueue.push({
            type: "building",
            depth: depth + 0.5, // au-dessus du sol et meeple
            screenX,
            screenY,
            x,
            y,
          });
        }
      }

      // Meeples (coordonnées visuelles réelles)
      const offsetMap = new Map();

      for (const meeple of meeples) {
        const key = `${meeple.x},${meeple.y}`;
        const count = offsetMap.get(key) || 0;
        offsetMap.set(key, count + 1);

        const drawX = (meeple.drawX - meeple.drawY) * (TILE_WIDTH / 2);
        const drawY = (meeple.drawX + meeple.drawY) * (TILE_HEIGHT / 2);

        const offset = (count - 1) * 6; // 6px de décalage par meeple

        const time = performance.now();
        const hop = Math.sin(time / 60 + meeple.hopPhase) * 0.4;

        drawQueue.push({
          type: "meeple",
          depth: meeple.drawX + meeple.drawY + 0.8,
          screenX: drawX + offset,
          screenY: drawY + hop,
          flip: meeple.facing === "left",
          sprite: meeple.type === "f" ? "meeple_f" : "meeple_h",
        });
      }

      // Tri de la pile par profondeur
      drawQueue.sort((a, b) => a.depth - b.depth);

      // Rendu
      for (const item of drawQueue) {
        if (item.type === "tile") {
          drawTileBase(
            ctx,
            item.screenX,
            item.screenY,
            item.x,
            item.y,
            hoveredTile,
            canvas
          );
        } else if (item.type === "building") {
          drawBuildingAt(ctx, item.screenX, item.screenY, item.x, item.y);
        } else if (item.type === "meeple") {
          if (item.type === "meeple") {
            drawImageAt(
              ctx,
              item.sprite,
              item.screenX,
              item.screenY,
              "small",
              1,
              item.flip
            );
          }
        }
      }

      ctx.restore();

      const resourceStore = useResourceStore();
      resourceStore.updatePopulation(map.value);
      resourceStore.monitorFoodCrisis(map);
      syncMeeplesWithPopulation();
      moveMeeples();
    }

    function getScreenCoords(x, y) {
      return {
        x: (x - y) * (TILE_WIDTH / 2),
        y: (x + y) * (TILE_HEIGHT / 2),
      };
    }

    function drawTileBase(ctx, x, y, gridX, gridY, hoveredTile, canvas) {
      const cell = map.value[gridY]?.[gridX];

      const biomePalettes = {
        classic: {
          water: "#4A90E2",
          grass: "#7EC850",
          hills: "#449130",
          mountain: "#8B8B8B",
        },
        desert: {
          water: "#40C4FF", // oasis bien visible
          grass: "#FFD97D", // sable lumineux
          hills: "#E8B243", // ocre chaud
          mountain: "rgb(217 157 67)", // beige rocheux
        },
        snow: {
          water: "#7BBCE5", // ❄️ bleu glacier plus visible
          grass: "#F0F8FF", // 🌨️ neige claire (inchangé)
          hills: "#BFCEDD", // ☁️ gris-bleu doux (entre neige et roche)
          mountain: "#D6D6D6", // 🏔 neige tassée, plus gris que les collines
        },
      };

      // Fond de tuile
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
      ctx.lineTo(x, y + TILE_HEIGHT);
      ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
      ctx.closePath();

      const biome = mapType.value || "classic";
      const palette = biomePalettes[biome] || biomePalettes.classic;
      ctx.fillStyle = palette[cell?.terrainType] || "#3b3b3b";
      ctx.fill();

      // Overlay rouge si placement invalide
      if (
        selectedBuilding.value &&
        selectedBuilding.value !== "bulldozer" &&
        !isPlacementValid(gridX, gridY)
      ) {
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
        ctx.fill();
      }

      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.stroke();

      // Gestion du survol
      if (hoveredTile?.x === gridX && hoveredTile?.y === gridY) {
        if (selectedBuilding.value === "bulldozer" && cell?.building) {
          ctx.fillStyle = "rgba(139, 62, 47, 0.3)";
          canvas.style.cursor = "crosshair";
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
          canvas.style.cursor = "pointer";
        }
        ctx.fill();

        if (selectedBuilding.value && selectedBuilding.value !== "bulldozer") {
          drawImageAt(ctx, selectedBuilding.value, x, y, "normal", 0.5);
        }
      } else {
        canvas.style.cursor = "default";
      }
    }

    function drawBuildingAt(ctx, x, y, gridX, gridY) {
      if (!map.value[gridY] || !map.value[gridY][gridX]) return;

      const cell = map.value[gridY][gridX];

      // 🪨 Bloc inconstructible spécial
      if (cell?.building === "unremovable") {
        const spriteName =
          {
            classic: "unremovable_classic",
            desert: "unremovable_desert",
            snow: "unremovable_snow",
          }[mapType.value] || "unremovable";

        drawImageAt(ctx, spriteName, x, y + 4, "normal");
        return;
      }

      // 🏔️ Affichage montagne (terrain)
      if (cell?.terrainType === "mountain") {
        const sprite =
          mapType.value === "desert"
            ? "sanddune"
            : mapType.value === "snow"
            ? "mountain"
            : "mountain";

        const yOffset = sprite === "sanddune" ? 6 : 0;
        drawImageAt(ctx, sprite, x, y + yOffset, "large");
      }

      if (cell?.building === "tree") {
        drawImageAt(ctx, "tree", x, y, "normal");
      } else if (cell?.building === "palmtree") {
        drawImageAt(ctx, "palmtree", x, y, "normal");
      } else if (cell?.building === "pinetree") {
        drawImageAt(ctx, "pinetree", x, y, "normal");
      } else if (cell?.building) {
        drawImageAt(ctx, cell.building, x, y);
      }

      if (cell.building && cell.inactive) {
        ctx.beginPath();
        ctx.arc(x, y - TILE_HEIGHT / 8, 10, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();

        ctx.fillStyle = "#FF3B3B";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⚠", x, y - TILE_HEIGHT / 8);
      }
    }

    function drawImageAt(
      ctx,
      name,
      x,
      y,
      size = "normal",
      alpha = 1,
      flip = false
    ) {
      const img = getImage(name);
      if (!img || !img.complete) return;

      let drawWidth, drawHeight, offsetYFactor;

      switch (size) {
        case "small":
          drawWidth = TILE_WIDTH * 0.25;
          drawHeight = TILE_HEIGHT * 0.5;
          offsetYFactor = 1.4;
          break;
        case "large":
          drawWidth = TILE_WIDTH * 1.1;
          drawHeight = TILE_HEIGHT * 1.8;
          offsetYFactor = 1; // Ne change pas
          break;
        default: // "normal"
          drawWidth = TILE_WIDTH * 0.7;
          drawHeight = TILE_HEIGHT * 1.35;
          offsetYFactor = 1.1; // Remonte légèrement
          break;
      }

      const offsetX = drawWidth / 2;
      const offsetY = drawHeight - TILE_HEIGHT / offsetYFactor;

      ctx.save();
      ctx.globalAlpha = alpha;

      if (flip) {
        ctx.scale(-1, 1);
        ctx.drawImage(
          img,
          -(x + drawWidth - offsetX),
          y - offsetY,
          drawWidth,
          drawHeight
        );
      } else {
        ctx.drawImage(img, x - offsetX, y - offsetY, drawWidth, drawHeight);
      }

      ctx.restore();
    }

    function screenToIso(mouseX, mouseY, canvas) {
      const rect = canvas.getBoundingClientRect();

      // Coordonnées relatives au canvas
      const cx = mouseX - rect.left;
      const cy = mouseY - rect.top;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const zoom = camera.zoom;

      // 1) Enlever la dernière translation (camera.x, camera.y)
      const adjustedX = (cx - centerX) / zoom - camera.x;
      const adjustedY = (cy - centerY) / zoom - camera.y;

      // 2) Conversion iso avec tes tile sizes
      const isoX =
        (adjustedX / (TILE_WIDTH / 2) + adjustedY / (TILE_HEIGHT / 2)) / 2;
      const isoY =
        (adjustedY / (TILE_HEIGHT / 2) - adjustedX / (TILE_WIDTH / 2)) / 2;

      return {
        x: Math.floor(isoX),
        y: Math.floor(isoY),
      };
    }

    function selectBuildingForPlacement(buildingCode) {
      selectedBuilding.value = buildingCode;
    }

    function getBuildingData(code) {
      for (const category of buildingsData.categories) {
        const building = category.buildings.find((b) => b.code === code);
        if (building) return building;
      }
      return null;
    }

    async function placeBuildingAt(x, y, canvasEl) {
      const cell = map.value[y]?.[x];
      const resourceStore = useResourceStore(); // ✅ déplacement ici

      // 🛠️ Mode Bulldozer
      if (selectedBuilding.value === "bulldozer") {
        if (cell.building) {
          const bulldozerCost = 5;
          if (!resourceStore.spendResources(bulldozerCost)) {
            console.log(
              `💰 Not enough gold for bulldozer action. Required: ${bulldozerCost}`
            );
            return false;
          }

          if (cell.building === "unremovable") {
            useAlertStore().push("error", "Impossible de détruire ça.");
            return false;
          }

          console.log(
            `🛠️ Removed building at [${x}, ${y}] for ${bulldozerCost} gold.`
          );

          const treeTypes = ["tree", "palmtree", "pinetree"];
          if (treeTypes.includes(cell.building)) {
            const rewardGold = 25;
            resourceStore.addGold(rewardGold);
          }

          // 🦌 Si on supprime une cabane de chasse, on remet les animaux
          if (cell.building === "hunting_traps") {
            cell.building = "wildlife";
          } else {
            cell.building = null;
          }

          await saveMap();
          resourceStore.updatePopulation(map.value);
          draw(canvasEl);
          return true;
        } else {
          console.log(`🛠️ No building to remove at [${x}, ${y}].`);
          return false;
        }
      }

      if (!selectedBuilding.value || !cell) {
        console.log("❌ Invalid placement or no building selected.");
        return false;
      }

      if (!isPlacementValid(x, y)) {
        useAlertStore().push("error", "Placement non valide");

        return false;
      }

      // 🚧 Placement normal
      const b = selectedBuilding.value;

      if (
        (cell.building &&
          !(cell.building === "wildlife" && b === "hunting_traps")) ||
        ["water", "mountain"].includes(cell.terrainType)
      ) {
        console.log("❌ Cannot place building here.");
        return false;
      }

      const building = getBuildingData(selectedBuilding.value);
      const goldCost = building?.cost?.gold || 0;
      const resourceCosts = building?.requires?.resources || {};

      const totalCost = { ...resourceCosts, gold: goldCost };

      if (!resourceStore.canAfford(totalCost)) {
        useAlertStore().push("error", "Pas assez de ressource");
        return false;
      }

      if (!resourceStore.spendResources(totalCost)) {
        console.warn("❌ Erreur lors de la dépense des ressources !");
        return false;
      }

      if (cell.building === "wildlife" && b === "hunting_traps") {
        // On remplace le gibier par la cabane
        console.log("🦌 Gibier remplacé par une cabane de chasse");
      }

      cell.building = selectedBuilding.value;
      map.value[y][x] = { ...cell }; // ✅ force la réactivité

      if (selectedBuilding.value === "campfire") {
        const treeTypes = ["tree", "palmtree", "pinetree"];
        let rewardCount = 0;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const cellAround = map.value[y + dy]?.[x + dx];
            if (!cellAround) continue;

            if (treeTypes.includes(cellAround.building)) {
              cellAround.building = null;
              rewardCount++;
            }
          }
        }

        const rewardPerTree = 25;
        if (rewardCount > 0) {
          resourceStore.addGold(rewardCount * rewardPerTree);
          console.log(
            `🔥 Arbres brûlés autour du feu : ${rewardCount} → +${
              rewardCount * rewardPerTree
            } or`
          );
        }
      }

      // Libère la sélection uniquement pour les bâtiments non-logement
      const housingBuildings = [
        "campfire",
        "storage_shelter",
        "primitive_well",
        "hunting_traps",
        "wood_totem",
        "stone_circle",
        "ritual_altar",
        "knowledge_stone",
        "experimental_lab",
      ];
      if (housingBuildings.includes(selectedBuilding.value)) {
        selectedBuilding.value = null;
      }

      await saveMap();
      resourceStore.updatePopulation(map.value); // ✅ met à jour la pop immédiatement
      draw(canvasEl);
      return true;
    }

    function isPlacementValid(x, y) {
      const cell = map.value[y]?.[x];
      const b = selectedBuilding.value;

      if (
        !cell ||
        (cell.building &&
          !(b === "hunting_traps" && cell.building === "wildlife")) ||
        ["water", "mountain"].includes(cell.terrainType)
      ) {
        return false;
      }

      if (cell.building === "unremovable") return false;

      const uniqueBuildings = ["knowledge_stone", "experimental_lab"];
      if (uniqueBuildings.includes(b)) {
        const alreadyPlaced = map.value.some((row) =>
          row.some((cell) => cell.building === b)
        );
        if (alreadyPlaced) return false;
      }

      // 🔥 Interdiction stricte : aucun bâtiment ne peut être construit à 1 case autour d’un feu de camp
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const neighbor = map.value[y + dy]?.[x + dx];
          if (neighbor?.building === "campfire") {
            return false;
          }
        }
      }

      if (selectedBuilding.value === "campfire") {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const neighbor = map.value[y + dy]?.[x + dx];
            if (
              neighbor?.building &&
              !["tree", "palmtree", "pinetree"].includes(neighbor.building)
            ) {
              return false;
            }
          }
        }
      }

      if (["branch_hut", "leather_shelter", "family_house"].includes(b)) {
        const radius = 3;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            if (Math.abs(dx) === radius && Math.abs(dy) === radius) continue;
            const neighbor = map.value[y + dy]?.[x + dx];
            if (neighbor?.building === "campfire") return true;
          }
        }
        return false;
      }

      const restrictedToHills = ["gathering_area", "root_field"];
      if (restrictedToHills.includes(b)) {
        return cell.terrainType === "hills";
      }

      if (b === "primitive_well") {
        const range = 1;
        for (let dy = -range; dy <= range; dy++) {
          for (let dx = -range; dx <= range; dx++) {
            const neighbor = map.value[y + dy]?.[x + dx];
            if (neighbor?.building === "family_house") return true;
          }
        }
        return false;
      }

      if (b === "primitive_farm") {
        const range = 1;
        for (let dy = -range; dy <= range; dy++) {
          for (let dx = -range; dx <= range; dx++) {
            const neighbor = map.value[y + dy]?.[x + dx];
            if (neighbor?.building === "primitive_well") return true;
          }
        }
        return false;
      }

      const industrialBuildings = [
        "stonecutter",
        "basic_sawmill",
        "tanning_pit",
        "pottery_workshop",
      ];
      if (industrialBuildings.includes(b)) {
        const range = 1;
        for (let dy = -range; dy <= range; dy++) {
          for (let dx = -range; dx <= range; dx++) {
            const neighbor = map.value[y + dy]?.[x + dx];
            if (neighbor?.building === "storage_shelter") return true;
          }
        }
        return false;
      }

      if (b === "stone_quarry") {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const neighbor = map.value[y + dy]?.[x + dx];
            if (neighbor?.terrainType === "mountain") return true;
          }
        }
        return false;
      }

      if (b === "hunting_traps") {
        return cell.building === "wildlife";
      }

      return true;
    }

    function getPlacedBuildings() {
      const placed = new Set();
      for (const row of map.value) {
        for (const cell of row) {
          if (cell.building) placed.add(cell.building);
        }
      }
      return Array.from(placed);
    }

    async function saveMap() {
      try {
        // On transforme map en un simple tableau d'objets sérialisables
        const plainMap = JSON.parse(JSON.stringify(map.value));
        await localforage.setItem(MAP_STORAGE_KEY, plainMap);
      } catch (err) {
        console.error("❌ Failed to save map:", err);
      }
    }

    async function loadMap(type = "classic") {
      try {
        const storedMap = await localforage.getItem(MAP_STORAGE_KEY);
        if (storedMap && Array.isArray(storedMap)) {
          map.value.splice(0, map.value.length, ...storedMap);
          console.log("📥 Map loaded from storage.");
        } else {
          console.log("📦 No saved map found, generating a new one.");
          generateMap(type);
          await saveMap();
        }
      } catch (err) {
        console.error("❌ Failed to load map:", err);
        generateMap(type);
        await saveMap();
      }
    }

    async function resetMap() {
      await localforage.removeItem(MAP_STORAGE_KEY);
      generateMap();
      await saveMap();
    }

    return {
      camera,
      cols,
      rows,
      mapType,
      setMapType,
      map,
      selectedBuilding,
      terrainTypes,
      generateMap,
      initCanvas,
      draw,
      screenToIso,
      selectBuildingForPlacement,
      placeBuildingAt,
      getPlacedBuildings,
      resetMap,
      saveMap,
      generateBlankMap,
    };
  },
  {
    persist: true,
  }
);
