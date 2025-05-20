import { findDistanceToTerrain } from "@/utils/distance";

export function generateMapData(cols, rows) {
  const newMap = [];
  const centerX = Math.floor(cols / 2.5);

  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      row.push({
        id: `${x}-${y}`,
        terrainType: "grass",
        building: null,
      });
    }
    newMap.push(row);
  }

  generateRiver(newMap, cols, rows, centerX);
  generateMountainsAndHills(newMap, cols, rows);
  generateTrees(newMap, cols, rows);

  return newMap;
}

function generateRiver(map, cols, rows, startX) {
  let riverX = startX;
  for (let y = 0; y < rows; y++) {
    const riverWidth = 3 + Math.floor(Math.random() * 3);
    for (
      let dx = -Math.floor(riverWidth / 2);
      dx <= Math.floor(riverWidth / 2);
      dx++
    ) {
      const nx = riverX + dx;
      if (nx >= 0 && nx < cols) map[y][nx].terrainType = "water";
    }
    riverX += Math.floor(Math.random() * 3) - 1;
    riverX = Math.max(2, Math.min(cols - 3, riverX));
  }
}

function generateMountainsAndHills(map, cols, rows) {
  const hillMaxDist = 8;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (map[y][x].terrainType !== "grass") continue;
      const distToRiver = findDistanceToTerrain(map, x, y, "water");
      if (distToRiver > hillMaxDist && Math.random() < 0.1) {
        map[y][x].terrainType = "mountain";
      }
    }
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (map[y][x].terrainType !== "grass") continue;
      const distToMountain = findDistanceToTerrain(map, x, y, "mountain");
      if (distToMountain >= 1 && distToMountain <= 2 && Math.random() < 0.8) {
        map[y][x].terrainType = "hills";
      }
    }
  }
}

function generateTrees(map, cols, rows) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = map[y][x];
      if (
        ["grass", "hills"].includes(cell.terrainType) &&
        Math.random() < 0.25
      ) {
        cell.building = "tree";
      }
    }
  }
}
