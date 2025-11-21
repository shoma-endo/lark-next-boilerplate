import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const sourceLogo = join(projectRoot, 'public', 'lark-logo.png');
const appDir = join(projectRoot, 'src', 'app');

async function generateIcons() {
  console.log('Generating icons from lark-logo.png...');

  // Generate icon.png (512x512 for optimal quality)
  await sharp(sourceLogo)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(join(appDir, 'icon.png'));
  console.log('✓ Generated icon.png');

  // Generate apple-icon.png (180x180 for Apple devices)
  await sharp(sourceLogo)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(join(appDir, 'apple-icon.png'));
  console.log('✓ Generated apple-icon.png');

  // Generate favicon.ico (32x32 and 16x16 sizes)
  // ICO format requires multiple sizes, but we'll generate a 32x32 PNG and convert it
  const favicon32 = await sharp(sourceLogo)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  const favicon16 = await sharp(sourceLogo)
    .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  // For simplicity, we'll use the 32x32 version as favicon.ico
  // A proper ICO file would contain multiple sizes, but browsers accept PNG data in ICO files
  await sharp(favicon32)
    .resize(32, 32)
    .toFile(join(appDir, 'favicon.ico'));
  console.log('✓ Generated favicon.ico');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
