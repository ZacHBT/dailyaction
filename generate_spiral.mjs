
import fs from 'fs';

function generateSpiralPath(turns = 2.4, pointsPerTurn = 100, a = 1, b = 0.22) {
    const points = [];
    // Start from outside (larger theta) to inside (smaller theta)
    // Adjust maxTheta to get the right look
    const maxTheta = turns * 2 * Math.PI;
    const startTheta = 0; // Center
    const endTheta = maxTheta;
    const step = (endTheta - startTheta) / (turns * pointsPerTurn);

    // Generate points
    for (let theta = endTheta; theta >= startTheta; theta -= step) {
        const r = a * Math.exp(b * theta);
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        points.push({ x, y });
    }

    // Normalize
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;
    // Scale to fit in 90x90 box inside 100x100
    const scale = 90 / Math.max(width, height);

    // Center in 100x100
    const dx = (100 - width * scale) / 2 - minX * scale;
    const dy = (100 - height * scale) / 2 - minY * scale;

    const svgPoints = points.map(p => ({
        x: p.x * scale + dx,
        y: p.y * scale + dy
    }));

    if (svgPoints.length === 0) return "";

    const start = svgPoints[0];
    let d = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`;

    for (let i = 1; i < svgPoints.length; i++) {
        d += ` L ${svgPoints[i].x.toFixed(2)} ${svgPoints[i].y.toFixed(2)}`;
    }

    // Add a center eye circle
    // The last point is the center (approx)
    const end = svgPoints[svgPoints.length - 1];
    const eye = `<circle cx="${end.x.toFixed(2)}" cy="${end.y.toFixed(2)}" r="4" fill="#3e2723" />`;

    // Make stroke variable width? No, standard stroke is fine for "existing material" look.
    return `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="${d}" stroke="#3e2723" stroke-width="4" fill="none" stroke-linecap="round" />${eye}</svg>`;
}

const svgContent = generateSpiralPath();
fs.writeFileSync('spiral.svg', svgContent);
console.log("SVG written to spiral.svg");
