import { ref } from "vue";

const characters = ref([]);
const speed = 0.05; // Vitesse de déplacement (0.05 = fluide)

export function initSimPopulation(count, cols, rows, map) {
  while (characters.value.length < count) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    characters.value.push({ x, y, targetX: x, targetY: y, progress: 1 });
  }
}

export function updateCharacters(map, cols, rows) {
  for (const char of characters.value) {
    if (char.progress < 1) {
      char.progress = Math.min(1, char.progress + speed);
    } else if (Math.random() < 0.01) {
      const directions = [
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
      ];
      const validMoves = directions.filter(({ dx, dy }) => {
        const newX = char.targetX + dx;
        const newY = char.targetY + dy;
        if (newX < 0 || newY < 0 || newX >= cols || newY >= rows) return false;
        const cell = map[newY][newX];
        return (
          cell &&
          cell.terrainType !== "water" &&
          cell.terrainType !== "mountain" &&
          !cell.building
        );
      });

      if (validMoves.length) {
        const move = validMoves[Math.floor(Math.random() * validMoves.length)];
        char.x = char.targetX;
        char.y = char.targetY;
        char.targetX += move.dx;
        char.targetY += move.dy;
        char.progress = 0;
      }
    }
  }
}

export function drawCharacters(ctx, getImage, TILE_WIDTH, TILE_HEIGHT) {
  const simImg = getImage("sim");
  if (!simImg || !simImg.complete) return;

  for (const char of characters.value) {
    const interpX = char.x + (char.targetX - char.x) * char.progress;
    const interpY = char.y + (char.targetY - char.y) * char.progress;

    const screenX = (interpX - interpY) * (TILE_WIDTH / 2);
    const screenY = (interpX + interpY) * (TILE_HEIGHT / 2);

    ctx.drawImage(simImg, screenX - 16, screenY - 32, 32, 32);
  }
}

export function getCharacters() {
  return characters;
}
