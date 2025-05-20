export const houseTypes = ["leather_shelter", "family_house", "branch_hut"];

export function canPlaceHouseNearCampfire(map, x, y, radius = 5) {
  return map.some((row, j) =>
    row.some(
      (cell, i) =>
        cell.building === "campfire" && Math.hypot(i - x, j - y) <= radius
    )
  );
}
