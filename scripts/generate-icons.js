const {createCanvas, loadImage} = require('canvas');
const fs = require('fs');
const path = require('path');

// Make sure the icons directory exists
const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, {recursive: true});
}

// Create icons in different sizes
const sizes = [16, 48, 128];

// Path to SVG icon
const svgPath = path.join(__dirname, 'assets', 'icon.svg');

// First, convert SVG to a data URL
const svgContent = fs.readFileSync(svgPath, 'utf8');
const svgBase64 = Buffer.from(svgContent).toString('base64');
const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;

// Process all icon sizes
(async function generateIcons() {
    for (const size of sizes) {
        // Create canvas
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        try {
            // Draw icon using SVG
            await drawNewIcon(ctx, size, svgDataUrl);

            // Save the image
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), buffer);

            console.log(`Created icon${size}.png`);
        } catch (error) {
            console.error(`Error generating icon size ${size}:`, error);
            // Fallback to old icon if SVG rendering fails
            drawOldIcon(ctx, size);

            // Save the fallback image
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), buffer);

            console.log(`Created icon${size}.png (using fallback method)`);
        }
    }

    console.log('All icons have been generated successfully in the icons/ directory');
})();

function drawOldIcon(ctx, size) {
    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Background with rounded corners (more circular)
    ctx.fillStyle = '#4285f4'; // Google blue

    // Create a circular background
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw a pin shape
    const centerX = size / 2;
    const centerY = size / 2;
    const pinSize = size * 0.7;

    // Define consistent proportions
    const circleRadius = pinSize * 0.3;
    const triangleHalfWidth = circleRadius * 0.85;

    // Use pure white for the pin
    ctx.fillStyle = 'white';

    // Pin head (circle)
    ctx.beginPath();
    ctx.arc(centerX, centerY - pinSize * 0.17, circleRadius, 0, Math.PI * 2);
    ctx.fill();

    // Pin body (simple triangle)
    ctx.beginPath();
    ctx.moveTo(centerX - triangleHalfWidth, centerY - pinSize * 0.02);
    ctx.lineTo(centerX + triangleHalfWidth, centerY - pinSize * 0.02);
    ctx.lineTo(centerX, centerY + pinSize * 0.38);
    ctx.closePath();
    ctx.fill();
}

// Function to draw new icon from SVG
async function drawNewIcon(ctx, size, svgDataUrl) {
    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Load SVG as an image
    const img = await loadImage(svgDataUrl);

    // Draw the SVG onto the canvas, scaling it to fit
    ctx.drawImage(img, 0, 0, size, size);
} 