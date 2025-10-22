const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const source = 'public/icons/GameIcon_Large.png';
const sizes = [
  { size: 192, output: 'public/icons/icon-192.png' },
  { size: 512, output: 'public/icons/icon-512.png' }
];

// Try using node canvas if available
async function resizeWithCanvas() {
  try {
    const { createCanvas, loadImage } = require('canvas');
    
    for (const { size, output } of sizes) {
      const image = await loadImage(source);
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(image, 0, 0, size, size);
      
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(output, buffer);
      console.log(`✓ Created ${output}`);
    }
    return true;
  } catch (error) {
    return false;
  }
}

// Fallback: use ffmpeg if available
async function resizeWithFFmpeg() {
  for (const { size, output } of sizes) {
    await new Promise((resolve, reject) => {
      exec(`ffmpeg -i "${source}" -vf scale=${size}:${size} "${output}" -y`, (error) => {
        if (error) reject(error);
        else {
          console.log(`✓ Created ${output}`);
          resolve();
        }
      });
    });
  }
}

// Simple copy as backup (not resized, but functional)
function copyAsBackup() {
  for (const { output } of sizes) {
    fs.copyFileSync(source, output);
    console.log(`⚠ Copied (not resized) to ${output} - original size will be used`);
  }
}

// Try methods in order
(async () => {
  console.log('Resizing icons...');
  
  if (await resizeWithCanvas()) {
    console.log('\n✅ Icons resized successfully using canvas!');
    return;
  }
  
  try {
    await resizeWithFFmpeg();
    console.log('\n✅ Icons resized successfully using ffmpeg!');
  } catch (error) {
    console.log('\n⚠ FFmpeg not available, copying original...');
    copyAsBackup();
    console.log('\n⚠ Please manually resize or install ImageMagick/FFmpeg for proper sizing');
  }
})();
