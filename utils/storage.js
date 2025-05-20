import localforage from "localforage";

export async function saveMap(map, key) {
  const plainMap = JSON.parse(JSON.stringify(map.value));
  await localforage.setItem(key, plainMap);
}

export async function loadMap(map, key, generateMap) {
  const storedMap = await localforage.getItem(key);
  if (storedMap && Array.isArray(storedMap)) {
    map.value.splice(0, map.value.length, ...storedMap);
  } else {
    generateMap();
    await saveMap(map, key);
  }
}
