import { PatternData } from '../types';

interface DrawOptions {
    startX: number;
    startY: number;
    width: number;
    height: number;
    cellSize?: number;
    margin?: number;
    title?: string;
    showGridLines: boolean; // This actually means "show circular beads" in the app context
    hiddenBeadIds: Set<string>;
}

export const drawPatternToCanvas = (
    data: PatternData, 
    options: DrawOptions
): HTMLCanvasElement | null => {
    const { 
        startX, 
        startY, 
        width, 
        height, 
        cellSize = 20, 
        margin = 35, 
        title,
        showGridLines, // effectively "circular beads" toggle
        hiddenBeadIds
    } = options;

    const canvasWidth = width * cellSize + margin;
    const canvasHeight = height * cellSize + margin + (title ? 30 : 0); // Extra space for title
    
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Title
    let titleOffset = 0;
    if (title) {
        titleOffset = 30;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#334155'; // Slate-700
        ctx.fillText(title, canvasWidth / 2, 20);
    }

    // Setup Text for coords
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#64748b'; // Slate-500

    // Draw Top Numbers (Columns) - Absolute coords
    for (let x = 0; x < width; x++) {
        const absX = startX + x + 1;
        // Show 1st, last, and every 5th
        if (absX === 1 || absX % 5 === 0 || x === width - 1) {
            ctx.fillText(`${absX}`, margin + x * cellSize + cellSize / 2, titleOffset + margin / 2);
        }
    }

    // Draw Left Numbers (Rows) - Absolute coords
    for (let y = 0; y < height; y++) {
        const absY = startY + y + 1;
        if (absY === 1 || absY % 5 === 0 || y === height - 1) {
            ctx.fillText(`${absY}`, margin / 2, titleOffset + margin + y * cellSize + cellSize / 2);
        }
    }

    // Move to grid area
    ctx.translate(margin, titleOffset + margin);

    // Draw Grid
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const gridY = startY + y;
            const gridX = startX + x;
            
            // Boundary check (should not happen if loops are correct, but safety first)
            if (gridY >= data.height || gridX >= data.width) continue;

            const bead = data.grid[gridY][gridX];
            
            // Background grid cell border
            ctx.strokeStyle = '#e2e8f0'; // Light grey
            ctx.lineWidth = 1;
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);

            if (!hiddenBeadIds.has(bead.id)) {
                ctx.fillStyle = bead.hex;
                if (showGridLines) {
                    // Draw Circular Bead
                    ctx.beginPath();
                    ctx.arc(
                        x * cellSize + cellSize / 2, 
                        y * cellSize + cellSize / 2, 
                        (cellSize / 2) - 1.5, 
                        0, 2 * Math.PI
                    );
                    ctx.fill();
                } else {
                    // Draw Square
                    ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
                }
            }
        }
    }

    // Thick lines for 10x10 blocks (aligned to absolute grid)
    ctx.strokeStyle = '#94a3b8'; // Slate-400
    ctx.lineWidth = 2;
    
    // Verticals
    for (let i = 0; i <= width; i++) {
        const absX = startX + i;
        // Draw line if it's a 10-multiple boundary OR edge of the chunk
        if (absX % 10 === 0 || i === 0 || i === width) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, height * cellSize);
            ctx.stroke();
        }
    }
    // Horizontals
    for (let i = 0; i <= height; i++) {
        const absY = startY + i;
        if (absY % 10 === 0 || i === 0 || i === height) {
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(width * cellSize, i * cellSize);
            ctx.stroke();
        }
    }
    
    // Outer Border of the chunk
    ctx.strokeRect(0, 0, width * cellSize, height * cellSize);

    return canvas;
};
