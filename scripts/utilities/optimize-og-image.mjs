import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimizeOGImage() {
  try {
    const inputPath = path.join(__dirname, '../public/images/melodia-logo.jpeg');
    const outputPath = path.join(__dirname, '../public/images/melodia-logo-og.jpeg');
    
    // OG image recommended dimensions: 1200x630
    await sharp(inputPath)
      .resize(1200, 630, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
      })
      .jpeg({
        quality: 85,
        progressive: true,
        mozjpeg: true
      })
      .toFile(outputPath);
    
    console.log('✅ OG image optimized successfully!');
    console.log('📁 Output: public/images/melodia-logo-og.jpeg');
    console.log('📏 Dimensions: 1200x630');
    console.log('🎯 Optimized for Open Graph sharing');
  } catch (error) {
    console.error('❌ Error optimizing OG image:', error);
  }
}

optimizeOGImage(); 