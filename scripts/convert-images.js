#!/usr/bin/env node
import sharp from 'sharp';
import globby from 'globby';
import path from 'path';
import fs from 'fs';

const GLOB = ['assets/images/**/*.{jpg,jpeg,png}'];
const QUALITY = 80;

(async () => {
  try {
    const files = await globby(GLOB);
    if (!files.length) { console.log('No images found for conversion'); return; }
    await Promise.all(files.map(async (file) => {
      const out = `${file}.webp`;
      await sharp(file).webp({quality: QUALITY}).toFile(out);
      console.log('Converted', file, '→', out);
    }));
  } catch (e) {
    console.error('Error in convert-images:', e);
    process.exit(1);
  }
})();
