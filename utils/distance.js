export function findDistanceToTerrain(map, x, y, targetType) {
  let minDist = Infinity;
  for (let ty = 0; ty < map.length; ty++) {
    for (let tx = 0; tx < map[0].length; tx++) {
      if (map[ty][tx].terrainType === targetType) {
        const dist = Math.abs(tx - x) + Math.abs(ty - y);
        if (dist < minDist) minDist = dist;
      }
    }
  }
  return minDist;
}
