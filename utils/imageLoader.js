const images = {};

export async function loadImages(imageList) {
  const promises = imageList.map(({ name, src }) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        images[name] = img;
        resolve();
      };
      img.onerror = () => {
        console.error(`❌ Failed to load image: ${src}`);
        reject(new Error(`Failed to load image: ${src}`));
      };
    });
  });

  await Promise.all(promises);
}

export function getImage(name) {
  const img = images[name];
  if (!img) {
    console.warn(`⚠️ Image "${name}" not found. Did you forget to load it?`);
  }
  return img;
}
