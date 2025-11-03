import sharp from "sharp";
import fs from "fs";
import path from "path";

const dir = "./assets/images";
for (const file of fs.readdirSync(dir)) {
  const ext = path.extname(file);
  if ([".jpg", ".jpeg", ".png"].includes(ext)) {
    sharp(`${dir}/${file}`)
      .webp({ quality: 80 })
      .toFile(`${dir}/${file}.webp`);
  }
}
