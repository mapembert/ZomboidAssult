// Simple Node.js script to create placeholder PNG icons
const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Dark background
  ctx.fillStyle = '#121212';
  ctx.fillRect(0, 0, size, size);
  
  // Teal border
  ctx.strokeStyle = '#03DAC6';
  ctx.lineWidth = size * 0.05;
  ctx.strokeRect(size * 0.1, size * 0.1, size * 0.8, size * 0.8);
  
  // Draw a zombie circle (red)
  ctx.fillStyle = '#FF5252';
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.35, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FF8A80';
  ctx.lineWidth = size * 0.02;
  ctx.stroke();
  
  // Draw hero triangle (teal)
  ctx.fillStyle = '#03DAC6';
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.75);
  ctx.lineTo(size * 0.35, size * 0.55);
  ctx.lineTo(size * 0.65, size * 0.55);
  ctx.closePath();
  ctx.fill();
  
  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename}`);
}

createIcon(192, 'public/icons/icon-192.png');
createIcon(512, 'public/icons/icon-512.png');
