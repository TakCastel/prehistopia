import { findDistanceToTerrain } from "@/utils/distance";

function generateEmptyMap(cols, rows) {
  const map = [];
  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      row.push({
        id: `${x}-${y}`,
        terrainType: "grass", // ou "empty" si tu veux un vrai vide
        building: null,
      });
    }
    map.push(row);
  }
  return map;
}

function generateClassicMap(cols, rows) {
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

function generateDesertMap(cols, rows) {
  const map = generateEmptyMap(cols, rows);

  const centerX = Math.floor(cols / 2);
  const centerY = Math.floor(rows / 2);

  // 1. Générer un lac irrégulier autour du centre
  const possibleRadii = [3, 4, 4, 4, 5]; // majorité de 4
  const lakeRadius =
    possibleRadii[Math.floor(Math.random() * possibleRadii.length)];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const dist = Math.hypot(x - centerX, y - centerY);

      // Fluctuation aléatoire par case
      const jitter = Math.random() * 0.8; // rend les bords irréguliers

      if (dist + jitter < lakeRadius) {
        map[y][x].terrainType = "water";
      }
    }
  }

  // 2. Placer les montagnes loin du centre, très peu nombreuses
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = map[y][x];
      const dist = Math.hypot(x - centerX, y - centerY);

      // Seulement à distance >= 10 cases du centre
      if (dist >= lakeRadius + 7 && Math.random() < 0.025) {
        cell.terrainType = "mountain";
      }
    }
  }

  // 3. Palmiers : densité forte près de l'oasis, décroissante avec la distance
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = map[y][x];
      const dist = Math.hypot(x - centerX, y - centerY);

      if (
        cell.terrainType === "grass" &&
        !cell.building &&
        dist > lakeRadius &&
        dist < lakeRadius + 6
      ) {
        const chance = 0.5 - (dist - lakeRadius) * 0.1; // de 0.5 à 0

        if (Math.random() < chance) {
          cell.building = "palmtree";
        }
      }
    }
  }

  // 4. Ajouter des collines autour des montagnes (rares et dispersées)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = map[y][x];
      if (cell.terrainType !== "grass") continue;

      const distToMountain = findDistanceToTerrain(map, x, y, "mountain");
      if (distToMountain >= 1 && distToMountain <= 2 && Math.random() < 0.15) {
        cell.terrainType = "hills";
      }
    }
  }
  // 5. Ajouter des collines autour de l’oasis avec densité très faible
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = map[y][x];
      if (cell.terrainType !== "grass") continue;

      const distToWater = findDistanceToTerrain(map, x, y, "water");

      if (distToWater >= 2 && distToWater <= 6) {
        // Probabilité très faible, surtout proche de l’oasis
        const chance = 0.015 - (distToWater - 2) * 0.002; // 0.015 → 0.007
        if (Math.random() < Math.max(0, chance)) {
          cell.terrainType = "hills";
        }
      }
    }
  }

  // 5. Ajouter des collines autour de l’oasis avec densité décroissante
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = map[y][x];
      if (cell.terrainType !== "grass") continue;

      const distToWater = findDistanceToTerrain(map, x, y, "water");

      if (distToWater >= 1 && distToWater <= 5) {
        // plus on est loin, moins on a de chance
        const chance = 0.1 - (distToWater - 1) * 0.01; // 0.4 → 0.08
        if (Math.random() < chance) {
          cell.terrainType = "hills";
        }
      }
    }
  }

  return map;
}

function generateSnowMap(cols, rows) {
  const map = generateEmptyMap(cols, rows);

  // 1. Lacs aléatoires avec bord fractal
  const lakeCount = 3;
  const lakes = Array.from({ length: lakeCount }, () => ({
    x: Math.floor(Math.random() * cols),
    y: Math.floor(Math.random() * rows),
  }));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      for (const lake of lakes) {
        const dist = Math.hypot(x - lake.x, y - lake.y);
        const jitter = Math.random() * 0.8;
        const radius = 2.5 + Math.floor(Math.random() * 5); // 3 à 4

        if (dist + jitter < radius) {
          map[y][x].terrainType = "water";
        }
      }
    }
  }

  // 2. Montagnes partout, mais pas proches des lacs
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = map[y][x];

      // Pas dans ou proche des lacs
      const nearLake = lakes.some(
        (lake) => Math.hypot(x - lake.x, y - lake.y) < 5
      );

      if (
        cell.terrainType === "grass" &&
        !nearLake &&
        Math.random() < 0.1 // densité ajustable
      ) {
        cell.terrainType = "mountain";
      }
    }
  }

  // 3. Collines autour des montagnes (rares)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = map[y][x];
      if (cell.terrainType !== "grass") continue;

      const distToMountain = findDistanceToTerrain(map, x, y, "mountain");
      if (distToMountain >= 1 && distToMountain <= 2 && Math.random() < 0.3) {
        cell.terrainType = "hills";
      }
    }
  }

  // 4. Sapins fréquents
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = map[y][x];
      if (
        ["grass", "hills"].includes(cell.terrainType) &&
        Math.random() < 0.33
      ) {
        cell.building = "pinetree";
      }
    }
  }

  return map;
}

export {
  generateEmptyMap,
  generateClassicMap,
  generateDesertMap,
  generateSnowMap,
};
