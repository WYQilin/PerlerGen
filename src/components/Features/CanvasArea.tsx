import React, { useState, useEffect, useRef } from 'react';
import { PatternData, BeadColor } from '../../types';
import { Card } from '../ModernComponents';

interface CanvasAreaProps {
    t: any;
    imageSrc: string | null;
    patternData: PatternData | null;
    hiddenBeadIds: Set<string>;
    showGridLines: boolean;
    onPixelClick: (x: number, y: number, bead: BeadColor) => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
    t,
    imageSrc,
    patternData,
    hiddenBeadIds,
    showGridLines,
    onPixelClick
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Internal State for Viewport
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const lastTouchDistance = useRef<number | null>(null);

    // Reset view when image changes
    useEffect(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, [imageSrc]);

    // Draw Canvas
    useEffect(() => {
        if (patternData && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const cellSize = 12; 
            
            canvas.width = patternData.width * cellSize;
            canvas.height = patternData.height * cellSize;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            patternData.grid.forEach((row, y) => {
                row.forEach((bead, x) => {
                    if (hiddenBeadIds.has(bead.id)) return;

                    ctx.fillStyle = bead.hex;
                    if (showGridLines) {
                        ctx.beginPath();
                        ctx.arc(
                            x * cellSize + cellSize / 2, 
                            y * cellSize + cellSize / 2, 
                            (cellSize / 2) - 0.5, 
                            0, 
                            2 * Math.PI
                        );
                        ctx.fill();
                    } else {
                        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                    }
                });
            });
        }
    }, [patternData, showGridLines, hiddenBeadIds]);

    // Event Handlers
    const handleWheel = (e: WheelEvent) => {
        if (!patternData) return;
        e.preventDefault();
        const zoomSensitivity = 0.001;
        setZoom(prev => Math.min(Math.max(0.1, prev - e.deltaY * zoomSensitivity), 5));
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [patternData]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!patternData) return;
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;
        setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!patternData) return;
        if (e.touches.length === 1) {
            setIsDragging(true);
            setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        } else if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            lastTouchDistance.current = dist;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!patternData) return;
        if (e.touches.length === 1 && isDragging) {
            const deltaX = e.touches[0].clientX - lastMousePos.x;
            const deltaY = e.touches[0].clientY - lastMousePos.y;
            setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
            setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        } else if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            if (lastTouchDistance.current !== null) {
                const delta = dist - lastTouchDistance.current;
                const zoomSensitivity = 0.005;
                setZoom(prev => Math.min(Math.max(0.1, prev + delta * zoomSensitivity), 5));
            }
            lastTouchDistance.current = dist;
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        lastTouchDistance.current = null;
    };

    const handleClick = (e: React.MouseEvent) => {
        if (isDragging) return;
        const dist = Math.sqrt(Math.pow(e.clientX - lastMousePos.x, 2) + Math.pow(e.clientY - lastMousePos.y, 2));
        if (dist > 5) return;

        if (!patternData || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const cellSize = 12;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Coordinate math
        const relX = mouseX - centerX;
        const relY = mouseY - centerY;
        const unpannedX = relX - pan.x;
        const unpannedY = relY - pan.y;
        const unzoomedX = unpannedX / zoom;
        const unzoomedY = unpannedY / zoom;

        const gridPixelWidth = patternData.width * cellSize;
        const gridPixelHeight = patternData.height * cellSize;

        const canvasX = unzoomedX + (gridPixelWidth / 2);
        const canvasY = unzoomedY + (gridPixelHeight / 2);

        const gridX = Math.floor(canvasX / cellSize);
        const gridY = Math.floor(canvasY / cellSize);

        if (gridX >= 0 && gridX < patternData.width && gridY >= 0 && gridY < patternData.height) {
            const bead = patternData.grid[gridY][gridX];
            onPixelClick(gridX, gridY, bead);
        }
    };

    return (
        <Card className="flex-1 min-h-[500px] flex items-center justify-center relative overflow-hidden bg-slate-100 border-slate-200">
            {!imageSrc ? (
                <div className="flex flex-col items-center gap-4 text-slate-400 p-8">
                    <svg className="w-24 h-24 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                    <p className="font-bold text-lg opacity-50">{t.noImage}</p>
                </div>
            ) : (
                <div 
                    ref={containerRef}
                    className="w-full h-full absolute inset-0 overflow-hidden cursor-crosshair touch-none select-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={handleClick}
                >
                    {/* Instructions */}
                    <div className="absolute top-4 left-4 z-10 pointer-events-none opacity-60 hover:opacity-100 transition-opacity">
                        <div className="bg-white/80 text-slate-600 text-[10px] px-2 py-1 rounded shadow backdrop-blur-sm">
                            {t.zoomInstruction}
                        </div>
                    </div>

                    <div 
                        className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
                        style={{ 
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transformOrigin: 'center'
                        }}
                    >
                        <div className="relative shadow-2xl">
                            {/* Checkerboard */}
                            <div className="absolute inset-0 z-0 opacity-20" style={{ 
                                backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                                backgroundSize: '20px 20px',
                                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                            }}></div>
                            <canvas ref={canvasRef} className="relative z-10 rounded-sm" />
                        </div>
                    </div>

                    {/* Original Image Thumbnail */}
                    <div className="absolute bottom-4 right-4 w-24 h-24 p-1 bg-white rounded-lg shadow-xl transform hover:scale-150 transition-all duration-300 z-20 pointer-events-none origin-bottom-right border border-slate-200">
                        <img src={imageSrc} className="w-full h-full object-cover rounded" alt="Original" />
                    </div>

                    {/* Reset Button */}
                    {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setZoom(1); setPan({x:0, y:0}); }}
                            className="absolute bottom-4 left-4 p-2 bg-white rounded-full shadow-lg text-slate-600 hover:text-blue-600 z-20 border border-slate-200"
                            title={t.resetView}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                        </button>
                    )}
                </div>
            )}
        </Card>
    );
};
