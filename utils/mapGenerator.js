import { findDistanceToTerrain } from "@/utils/distance";

// === Générateurs principaux ===

function generateEmptyMap(cols, rows) {
  return Array.from({ length: rows }, (_, y) =>
    Array.from({ length: cols }, (_, x) => ({
      id: `${x}-${y}`,
      terrainType: "grass",
      building: null,
    }))
  );
}

function generateClassicMap(cols, rows) {
  const map = generateEmptyMap(cols, rows);
  const centerX = Math.floor(cols / 2.5);

  generateRiver(map, cols, rows, centerX);
  generateMountainsAndHills(map, cols, rows);
  generateTrees(map);
  placeWildlife(map, 3);
  placeIndestructibleBoulder(map);

  return map;
}

function generateDesertMap(cols, rows) {
  const map = generateEmptyMap(cols, rows);
  const centerX = Math.floor(cols / 2);
  const centerY = Math.floor(rows / 2);
  const lakeRadius = [3, 4, 4, 4, 5][Math.floor(Math.random() * 5)];

  forEachCell(map, (cell, x, y) => {
    const dist = Math.hypot(x - centerX, y - centerY) + Math.random() * 0.8;
    if (dist < lakeRadius) cell.terrainType = "water";
  });

  forEachCell(map, (cell, x, y) => {
    const dist = Math.hypot(x - centerX, y - centerY);
    if (dist >= lakeRadius + 7 && Math.random() < 0.025) {
      cell.terrainType = "mountain";
    }
  });

  forEachCell(map, (cell, x, y) => {
    const dist = Math.hypot(x - centerX, y - centerY);
    if (
      cell.terrainType === "grass" &&
      !cell.building &&
      dist > lakeRadius &&
      dist < lakeRadius + 6 &&
      Math.random() < 0.5 - (dist - lakeRadius) * 0.1
    ) {
      cell.building = "palmtree";
    }
  });

  addHills(map, "mountain", 0.15, 1, 2);
  addHills(map, "water", 0.015, 2, 6);
  addHills(map, "water", 0.1, 1, 5);

  placeWildlife(map, 2);
  placeIndestructibleBoulder(map);

  return map;
}

function generateSnowMap(cols, rows) {
  const map = generateEmptyMap(cols, rows);
  const lakes = Array.from({ length: 3 }, () => ({
    x: Math.floor(Math.random() * cols),
    y: Math.floor(Math.random() * rows),
  }));

  forEachCell(map, (cell, x, y) => {
    for (const lake of lakes) {
      const dist = Math.hypot(x - lake.x, y - lake.y) + Math.random() * 0.8;
      if (dist < 2.5 + Math.floor(Math.random() * 5)) {
        cell.terrainType = "water";
      }
    }
  });

  forEachCell(map, (cell, x, y) => {
    const nearLake = lakes.some(
      (lake) => Math.hypot(x - lake.x, y - lake.y) < 5
    );
    if (cell.terrainType === "grass" && !nearLake && Math.random() < 0.1) {
      cell.terrainType = "mountain";
    }
  });

  addHills(map, "mountain", 0.3, 1, 2);

  forEachCell(map, (cell) => {
    if (["grass", "hills"].includes(cell.terrainType) && Math.random() < 0.33) {
      cell.building = "pinetree";
    }
  });

  placeWildlife(map, 5);
  placeIndestructibleBoulder(map);

  return map;
}

// === Générateurs secondaires ===

function generateRiver(map, cols, rows, startX) {
  let riverX = startX;
  for (let y = 0; y < rows; y++) {
    const width = 3 + Math.floor(Math.random() * 3);
    for (let dx = -Math.floor(width / 2); dx <= Math.floor(width / 2); dx++) {
      const x = riverX + dx;
      if (x >= 0 && x < cols) map[y][x].terrainType = "water";
    }
    riverX = Math.max(
      2,
      Math.min(cols - 3, riverX + Math.floor(Math.random() * 3) - 1)
    );
  }
}

function generateMountainsAndHills(map) {
  addMountainsFarFrom(map, "water", 0.1, 8);
  addHills(map, "mountain", 0.8, 1, 2);
}

function generateTrees(map) {
  forEachCell(map, (cell) => {
    if (["grass", "hills"].includes(cell.terrainType) && Math.random() < 0.25) {
      cell.building = "tree";
    }
  });
}

function placeWildlife(map, count = 5) {
  const grassCells = [];
  forEachCell(map, (cell, x, y) => {
    if (cell.terrainType === "grass" && !cell.building)
      grassCells.push({ x, y });
  });
  grassCells
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .forEach(({ x, y }) => {
      map[y][x].building = "wildlife";
    });
}

function placeIndestructibleBoulder(map) {
  const rows = map.length;
  const cols = map[0].length;
  let placed = false;

  while (!placed) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const cell = map[y][x];
    if (cell.terrainType === "grass" && !cell.building) {
      cell.building = "unremovable";
      placed = true;
    }
  }
}

// === Utilitaires internes ===

function forEachCell(map, callback) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      callback(map[y][x], x, y);
    }
  }
}

function addMountainsFarFrom(map, avoidType, chance, minDist) {
  forEachCell(map, (cell, x, y) => {
    if (cell.terrainType !== "grass") return;
    const dist = findDistanceToTerrain(map, x, y, avoidType);
    if (dist > minDist && Math.random() < chance) {
      cell.terrainType = "mountain";
    }
  });
}

function addHills(map, target, chance, minDist, maxDist) {
  forEachCell(map, (cell, x, y) => {
    if (cell.terrainType !== "grass") return;
    const dist = findDistanceToTerrain(map, x, y, target);
    if (dist >= minDist && dist <= maxDist && Math.random() < chance) {
      cell.terrainType = "hills";
    }
  });
}

// === Exports ===

export {
  generateEmptyMap,
  generateClassicMap,
  generateDesertMap,
  generateSnowMap,
};
