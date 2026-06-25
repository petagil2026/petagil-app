const { withFinalizedMod } = require('@expo/config-plugins');
const {
  generateImageBackgroundAsync,
  generateImageAsync,
  compositeImagesAsync,
} = require('@expo/image-utils');
const fs = require('fs');
const path = require('path');

const FILENAME = 'splashscreen_logo.png';
const CANVAS_BASE = 288;
const DEFAULT_IMAGE_WIDTH = 200;

const DENSITIES = [
  { dir: 'mdpi', mult: 1 },
  { dir: 'hdpi', mult: 1.5 },
  { dir: 'xhdpi', mult: 2 },
  { dir: 'xxhdpi', mult: 3 },
  { dir: 'xxxhdpi', mult: 4 },
];

async function writeTransparentDrawables(projectRoot, srcAbsolute, imageWidth) {
  const resRoot = path.join(projectRoot, 'android/app/src/main/res');

  for (const { dir, mult } of DENSITIES) {
    const size = Math.round(imageWidth * mult);
    const canvasSize = Math.round(CANVAS_BASE * mult);

    const background = await generateImageBackgroundAsync({
      width: canvasSize,
      height: canvasSize,
      backgroundColor: 'transparent',
      resizeMode: 'cover',
    });

    const { source: foreground } = await generateImageAsync(
      { projectRoot, cacheType: 'splash-android-transparent' },
      {
        src: srcAbsolute,
        resizeMode: 'contain',
        width: size,
        height: size,
      }
    );

    const composed = await compositeImagesAsync({
      background,
      foreground,
      x: Math.round((canvasSize - size) / 2),
      y: Math.round((canvasSize - size) / 2),
    });

    for (const variant of ['', 'night-']) {
      const outDir = path.join(resRoot, `drawable-${variant}${dir}`);
      await fs.promises.mkdir(outDir, { recursive: true });
      await fs.promises.writeFile(path.join(outDir, FILENAME), composed);
    }
  }
}

module.exports = function withTransparentSplashLogo(config, props = {}) {
  return withFinalizedMod(config, [
    'android',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const image = props.image;
      const imageWidth = props.imageWidth ?? DEFAULT_IMAGE_WIDTH;

      if (!image) {
        throw new Error(
          '[withTransparentSplashLogo] required prop "image" is missing'
        );
      }

      const srcAbsolute = path.isAbsolute(image)
        ? image
        : path.resolve(projectRoot, image);

      if (!fs.existsSync(srcAbsolute)) {
        throw new Error(
          `[withTransparentSplashLogo] image not found at ${srcAbsolute}`
        );
      }

      await writeTransparentDrawables(projectRoot, srcAbsolute, imageWidth);
      return cfg;
    },
  ]);
};
