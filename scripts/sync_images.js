const fs = require('fs');
const path = require('path');

// Configuration
const ARTIFACT_DIR = String.raw`C:\Users\kfish\.gemini\antigravity\brain\4c4bf12a-badf-48ec-abb6-090988f6b33f`;
const PROJECT_DIR = path.resolve(__dirname, '..');
const PUBLIC_IMAGES_DIR = path.join(PROJECT_DIR, 'public', 'images');

// Ensure destination exists
if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
    console.log(`Created directory: ${PUBLIC_IMAGES_DIR}`);
}

// Function to copy images
function syncImages() {
    console.log(`Scanning artifact directory: ${ARTIFACT_DIR}...`);

    try {
        const files = fs.readdirSync(ARTIFACT_DIR);
        const imageFiles = files.filter(file => file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.webp'));

        if (imageFiles.length === 0) {
            console.log("No new images found in artifact directory.");
            return;
        }

        let movedCount = 0;
        imageFiles.forEach(file => {
            const sourcePath = path.join(ARTIFACT_DIR, file);
            const destPath = path.join(PUBLIC_IMAGES_DIR, file);

            // Only copy if it doesn't exist in destination (or overwrite if needed - using copy for safety)
            // Using copyFileSync to overwrite so latest version is always present
            try {
                fs.copyFileSync(sourcePath, destPath);
                console.log(`[SYNCED] ${file}`);
                movedCount++;
            } catch (err) {
                console.error(`[ERROR] Failed to copy ${file}: ${err.message}`);
            }
        });

        console.log(`\nSync complete. ${movedCount} image(s) processed.`);
        console.log(`Images are available in: ${PUBLIC_IMAGES_DIR}`);

    } catch (err) {
        console.error(`Error reading artifact directory: ${err.message}`);
    }
}

// Execute
syncImages();
