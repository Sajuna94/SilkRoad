import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.resolve(__dirname, '../../../silkroad-frontend-react/public/images');
const outputDir = path.join(inputDir, 'compressed');
fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

const size = 250;
const quality = 60;

const srcsetMap = {}; // 用來記錄 srcset 對應表

async function compressFolder(srcDir, destDir) {
  const tasks = [];

  for (const dirent of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, dirent.name);
    const destPath = path.join(destDir, dirent.name);

    if (dirent.isDirectory()) {
      if (dirent.name.toLowerCase() === 'compressed') continue;
      fs.mkdirSync(destPath, { recursive: true });
      await compressFolder(srcPath, destPath);
    } else if (dirent.isFile() && dirent.name.match(/\.(jpg|jpeg|png)$/i)) {
      const outputFile = destPath.replace(/\.(jpg|jpeg|png)$/i, `-${size}-${quality}.webp`);
      const relativeKey = path.relative(inputDir, srcPath).replace(/\\/g, '/');

      tasks.push(
        sharp(srcPath)
          .resize({ width: size, height: size, fit: 'inside' })
          .webp({ quality })
          .toFile(outputFile)
          .then(() => {
            console.log(`✅ ${srcPath} → ${outputFile}`);
            if (!srcsetMap[relativeKey]) srcsetMap[relativeKey] = [];
            srcsetMap[relativeKey].push(path.relative(inputDir, outputFile).replace(/\\/g, '/'));
          })
          .catch(err => console.error(`❌ ${srcPath} 壓縮失敗`, err))
      );
    }
  }

  await Promise.all(tasks);
}

await compressFolder(inputDir, outputDir);

// 寫入 srcset.json
const jsonPath = path.join(outputDir, 'srcset.json');
fs.writeFileSync(jsonPath, JSON.stringify(srcsetMap, null, 2));
console.log(`📦 srcset 對應表已產生 → ${jsonPath}`);
