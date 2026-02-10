
const fs = require('fs');

function generateSpiralPath(turns = 2.5, pointsPerTurn = 50, a = 1, b = 0.3063) {
    const points = [];
    const maxTheta = turns * 2 * Math.PI;
    const startTheta = 0;
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

    return d;
}

const pathD = generateSpiralPath(2.2, 50, 1, 0.2);
console.log(`<path d="${pathD}" stroke="#3e2723" stroke-width="4" fill="none" stroke-linecap="round" />`);
