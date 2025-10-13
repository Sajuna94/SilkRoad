import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.resolve(__dirname, '../../../silkroad-frontend-react/public/images');
const outputDir = path.join(inputDir, 'compressed');

// 先清空 compress 資料夾
fs.rmSync(outputDir, { recursive: true, force: true });

// 壓縮設定
const size = 200;
const quality = 40;

// 遞迴處理資料夾
function compressFolder(srcDir, destDir) {
    fs.readdirSync(srcDir, { withFileTypes: true }).forEach(dirent => {
        console.log(`處理資料夾: ${srcDir}`);
        const srcPath = path.join(srcDir, dirent.name);

        // 排除 compress 資料夾
        if (dirent.isDirectory() && dirent.name.toLowerCase() === 'compress') return;

        const destPath = path.join(destDir, dirent.name);

        if (dirent.isDirectory()) {
            compressFolder(srcPath, destPath);
        } else if (dirent.isFile() && dirent.name.match(/\.(jpg|jpeg|png)$/i)) {
            const outputFile = destPath.replace(/\.(jpg|jpeg|png)$/i, `-${size}-${quality}.webp`);
            sharp(srcPath)
                .resize({ width: size })
                .webp({ quality })
                .toFile(outputFile)
                .then(() => console.log(`✅ ${srcPath} → ${outputFile}`))
                .catch(err => console.error(`❌ ${srcPath} 壓縮失敗`, err));
        }
    });
}

// 執行
compressFolder(inputDir, outputDir);
