
import React, { useState, useEffect } from 'react';
import { processImageToPattern } from './services/imageProcessor';
import { analyzeBeadPattern } from './services/gemini';
import { drawPatternToCanvas, drawMaterialListToCanvas } from './services/exportUtils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { PatternData, AIAnalysis, BeadColor } from './types';
import { translations, Language } from './translations';
import { usePalette } from './context/PaletteContext';
import { parsePaletteCSV } from './services/csvUtils';

// New Components
import { Header } from './components/Features/Header';
import { ControlPanel } from './components/Features/ControlPanel';
import { CanvasArea } from './components/Features/CanvasArea';
import { MaterialList } from './components/Features/MaterialList';
import { ActionPanel } from './components/Features/ActionPanel';
import { Modal, Input, Button } from './components/ModernComponents';

const App = () => {
  const [language, setLanguage] = useState<Language>('zh');
  const t = translations[language];
  
  // Context
  const { allPalettes, selectedPaletteId, activePalette, setSelectedPaletteId, addCustomPalette, removeCustomPalette } = usePalette();

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  // Grid Dimensions State
  const [gridWidth, setGridWidth] = useState<number>(29);
  const [gridHeight, setGridHeight] = useState<number>(29);
  const [lockRatio, setLockRatio] = useState<boolean>(true);
  const [imgAspectRatio, setImgAspectRatio] = useState<number>(1);

  const [patternData, setPatternData] = useState<PatternData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGridLines, setShowGridLines] = useState(true);

  // CSV Import State
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvName, setCsvName] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Material State
  const [hiddenBeadIds, setHiddenBeadIds] = useState<Set<string>>(new Set());

  // Edit Mode State
  const [pickingColorFor, setPickingColorFor] = useState<{ 
    type: 'global' | 'single', 
    targetId?: string, // for global replace
    x?: number, // for single replace
    y?: number,
    currentBead?: BeadColor
  } | null>(null);
  const [colorSearch, setColorSearch] = useState('');

  // Split Export State
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitConfig, setSplitConfig] = useState({ width: 29, height: 29 });
  const [isExporting, setIsExporting] = useState(false);
  
  // Material Export State
  const [showMaterialExportModal, setShowMaterialExportModal] = useState(false);
  const [excludeHiddenMaterials, setExcludeHiddenMaterials] = useState(true);

  // File Upload Handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageSrc(result);
        setPatternData(null); 
        setAiAnalysis(null);
        setHiddenBeadIds(new Set()); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setCsvFile(file);
        if (!csvName) {
            setCsvName(file.name.replace(/\.[^/.]+$/, ""));
        }
    }
  };

  const handleImportCsv = () => {
      if (!csvFile || !csvName) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          const content = e.target?.result as string;
          const colors = parsePaletteCSV(content);
          if (colors.length > 0) {
              addCustomPalette(csvName, colors);
              setShowCsvModal(false);
              setCsvFile(null);
              setCsvName('');
              alert(`Imported ${colors.length} colors successfully!`);
          } else {
              alert('Failed to parse CSV. Please check the format.');
          }
      };
      reader.readAsText(csvFile);
  };

  // When image loads, calculate aspect ratio and reset height
  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        setImgAspectRatio(ratio);
        
        // Auto-size logic: Scale down to max 50 beads on longest side
        const MAX_DIMENSION = 50;
        let newW = img.width;
        let newH = img.height;

        if (newW > MAX_DIMENSION || newH > MAX_DIMENSION) {
            if (ratio > 1) {
                newW = MAX_DIMENSION;
                newH = Math.round(newW / ratio);
            } else {
                newH = MAX_DIMENSION;
                newW = Math.round(newH * ratio);
            }
        }
        
        setGridWidth(Math.max(1, newW));
        setGridHeight(Math.max(1, newH));
      };
      img.src = imageSrc;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  // Handle Dimension Changes
  const handleWidthChange = (val: string) => {
    const w = parseInt(val) || 0;
    setGridWidth(w);
    if (lockRatio && imgAspectRatio > 0 && w > 0) {
        setGridHeight(Math.max(1, Math.round(w / imgAspectRatio)));
    }
  };

  const handleHeightChange = (val: string) => {
    const h = parseInt(val) || 0;
    setGridHeight(h);
    if (lockRatio && imgAspectRatio > 0 && h > 0) {
        setGridWidth(Math.max(1, Math.round(h * imgAspectRatio)));
    }
  };

  // Toggle Bead Visibility
  const toggleBeadVisibility = (id: string) => {
    setHiddenBeadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Generate Pattern Effect
  useEffect(() => {
    if (imageSrc && gridWidth > 0 && gridHeight > 0) {
      setIsProcessing(true);
      const timer = setTimeout(() => {
        processImageToPattern(imageSrc, gridWidth, gridHeight, activePalette.colors)
          .then((data) => {
            setPatternData(data);
            setIsProcessing(false);
          })
          .catch((err) => {
            console.error(err);
            setIsProcessing(false);
          });
      }, 500); // Debounce
      return () => clearTimeout(timer);
    }
  }, [imageSrc, gridWidth, gridHeight, activePalette]);

  const handleMaterialExport = () => {
    if (!patternData) return;
    
    const canvas = drawMaterialListToCanvas(
        patternData,
        activePalette.colors,
        hiddenBeadIds,
        excludeHiddenMaterials,
        `${t.appTitle} - ${t.materials}`
    );

    if (canvas) {
        canvas.toBlob((blob) => {
            if (blob) {
                saveAs(blob, `perler-materials-${patternData.width}x${patternData.height}.png`);
                setShowMaterialExportModal(false);
            }
        });
    }
  };

  // Helper to recalculate counts after edits
  const recalculateCounts = (grid: BeadColor[][]): Record<string, number> => {
    const newCounts: Record<string, number> = {};
    grid.forEach(row => {
      row.forEach(bead => {
        newCounts[bead.id] = (newCounts[bead.id] || 0) + 1;
      });
    });
    return newCounts;
  };

  // Replace Logic
  const handleColorReplace = (newBead: BeadColor) => {
    if (!patternData || !pickingColorFor) return;

    const newGrid = patternData.grid.map(row => [...row]); // Deep copy grid structure

    if (pickingColorFor.type === 'global' && pickingColorFor.targetId) {
      // Replace all instances
      for (let y = 0; y < newGrid.length; y++) {
        for (let x = 0; x < newGrid[y].length; x++) {
          if (newGrid[y][x].id === pickingColorFor.targetId) {
            newGrid[y][x] = newBead;
          }
        }
      }
    } else if (pickingColorFor.type === 'single' && pickingColorFor.x !== undefined && pickingColorFor.y !== undefined) {
      // Replace single pixel
      newGrid[pickingColorFor.y][pickingColorFor.x] = newBead;
    }

    const newCounts = recalculateCounts(newGrid);
    setPatternData({
      ...patternData,
      grid: newGrid,
      counts: newCounts
    });
    
    setPickingColorFor(null);
    setColorSearch('');
  };

  // AI Analysis Handler
  const handleAnalyze = async () => {
    if (!imageSrc) return;
    setIsAnalyzing(true);
    const analysis = await analyzeBeadPattern(imageSrc, language);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  // Export with coordinates
  const handleDownload = () => {
    if (!patternData) return;

    const canvas = drawPatternToCanvas(patternData, {
      startX: 0,
      startY: 0,
      width: patternData.width,
      height: patternData.height,
      showGridLines,
      hiddenBeadIds,
      title: `${t.appTitle} - ${patternData.width}x${patternData.height}`
    });

    if (!canvas) return;

    // Trigger Download
    const link = document.createElement('a');
    link.download = `perler-pattern-w${patternData.width}-h${patternData.height}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleSplitDownload = async () => {
    if (!patternData) return;
    setIsExporting(true);

    try {
      const zip = new JSZip();
      const { width: chunkW, height: chunkH } = splitConfig;
      
      const rows = Math.ceil(patternData.height / chunkH);
      const cols = Math.ceil(patternData.width / chunkW);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
           const startX = c * chunkW;
           const startY = r * chunkH;
           const currentWidth = Math.min(chunkW, patternData.width - startX);
           const currentHeight = Math.min(chunkH, patternData.height - startY);

           const canvas = drawPatternToCanvas(patternData, {
             startX,
             startY,
             width: currentWidth,
             height: currentHeight,
             showGridLines,
             hiddenBeadIds,
             title: `Part ${r + 1}-${c + 1} (Row ${r+1}, Col ${c+1})`
           });

           if (canvas) {
             const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
             if (blob) {
               zip.file(`pattern_row${r+1}_col${c+1}.png`, blob);
             }
           }
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "perler-pattern-split.zip");
      setShowSplitModal(false);
    } catch (error) {
      console.error("Export failed", error);
      alert("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header 
        title={t.appTitle} 
        subtitle={t.subtitle} 
        language={language} 
        setLanguage={setLanguage} 
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Sidebar: Controls & Materials */}
            <div className="lg:col-span-3 flex flex-col gap-6 sticky top-24">
                <ControlPanel 
                    t={t}
                    imageSrc={imageSrc}
                    onFileUpload={handleFileUpload}
                    allPalettes={allPalettes}
                    selectedPaletteId={selectedPaletteId}
                    onPaletteChange={(id) => {
                        if (id === 'import_new') {
                            setShowCsvModal(true);
                        } else {
                            setSelectedPaletteId(id);
                        }
                    }}
                    onDeletePalette={(id) => {
                        if (window.confirm('Are you sure you want to delete this palette?')) {
                            removeCustomPalette(id);
                        }
                    }}
                    gridWidth={gridWidth}
                    gridHeight={gridHeight}
                    lockRatio={lockRatio}
                    onWidthChange={handleWidthChange}
                    onHeightChange={handleHeightChange}
                    onToggleLockRatio={() => setLockRatio(!lockRatio)}
                    onAnalyze={handleAnalyze}
                    isAnalyzing={isAnalyzing}
                    showGridLines={showGridLines}
                    setShowGridLines={setShowGridLines}
                />

                {patternData && (
                    <MaterialList 
                        t={t}
                        patternData={patternData}
                        activePalette={activePalette}
                        hiddenBeadIds={hiddenBeadIds}
                        onToggleVisibility={toggleBeadVisibility}
                        onSelectForReplace={(bead) => setPickingColorFor({
                            type: 'global',
                            targetId: bead.id,
                            currentBead: bead
                        })}
                    />
                )}
            </div>

            {/* Main Content: Canvas & Actions */}
            <div className="lg:col-span-9 flex flex-col gap-6 min-h-[calc(100vh-8rem)]">
                <CanvasArea 
                    t={t}
                    imageSrc={imageSrc}
                    patternData={patternData}
                    hiddenBeadIds={hiddenBeadIds}
                    showGridLines={showGridLines}
                    onPixelClick={(x, y, bead) => {
                        setPickingColorFor({
                            type: 'single',
                            x,
                            y,
                            currentBead: bead
                        });
                    }}
                />

                {patternData && (
                    <ActionPanel 
                        t={t}
                        aiAnalysis={aiAnalysis}
                        onDownload={handleDownload}
                        onDownloadSplit={() => setShowSplitModal(true)}
                        onExportMaterials={() => setShowMaterialExportModal(true)}
                    />
                )}
            </div>
        </div>
      </main>

      {/* --- Modals --- */}

      {/* Color Picker Modal */}
      <Modal
        isOpen={!!pickingColorFor}
        onClose={() => { setPickingColorFor(null); setColorSearch(''); }}
        title={pickingColorFor?.type === 'global' ? t.replaceGlobalTitle : t.editBeadTitle}
      >
        <div className="flex flex-col gap-4">
            
            {/* Mode Switcher */}
            {pickingColorFor?.type === 'single' && (
                <div className="flex p-1 bg-slate-100 rounded-lg">
                    <button 
                        className="flex-1 py-2 text-xs font-bold rounded bg-white shadow-sm text-slate-700 transition-all"
                    >
                        {t.changeThisBtn}
                    </button>
                    <button 
                        className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-all"
                        onClick={() => setPickingColorFor(prev => prev ? { ...prev, type: 'global', targetId: prev.currentBead?.id } : null)}
                    >
                        {t.changeAllBtn} '{pickingColorFor.currentBead?.name}'
                    </button>
                </div>
            )}

            {/* Current Color Display */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-10 h-10 rounded-full border border-slate-300 shadow-sm" style={{ backgroundColor: pickingColorFor?.currentBead?.hex }}></div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase">{t.currentColor}</span>
                    <span className="font-bold text-slate-700">{pickingColorFor?.currentBead?.name} ({pickingColorFor?.currentBead?.id})</span>
                </div>
            </div>

            {/* Search */}
            <Input 
                placeholder={t.searchPlaceholder}
                value={colorSearch}
                onChange={(e) => setColorSearch(e.target.value)}
                autoFocus
                className="text-sm"
            />

            {/* Color Grid */}
            <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                {activePalette.colors
                    .filter(c => 
                        c.name.toLowerCase().includes(colorSearch.toLowerCase()) || 
                        c.id.toLowerCase().includes(colorSearch.toLowerCase())
                    )
                    .map(color => (
                    <button
                        key={color.id}
                        onClick={() => handleColorReplace(color)}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all group"
                    >
                        <div className="w-8 h-8 rounded-full border border-slate-200 shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: color.hex }}></div>
                        <span className="text-[10px] font-bold text-slate-500 truncate w-full text-center">{color.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{color.id}</span>
                    </button>
                ))}
            </div>
        </div>
      </Modal>

      {/* Split Download Modal */}
      <Modal
        isOpen={showSplitModal}
        onClose={() => setShowSplitModal(false)}
        title={t.splitTitle}
      >
        <div className="flex flex-col gap-6">
          <p className="text-sm text-slate-600">
            {patternData ? t.splitInfo
                .replace('{rows}', Math.ceil(patternData.height / splitConfig.height).toString())
                .replace('{cols}', Math.ceil(patternData.width / splitConfig.width).toString())
                .replace('{total}', (Math.ceil(patternData.height / splitConfig.height) * Math.ceil(patternData.width / splitConfig.width)).toString())
              : ''}
          </p>
          
          <div className="flex items-center gap-4">
             <div className="flex-1 min-w-0">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block truncate">{t.splitWidth}</label>
                <Input 
                    type="number"
                    value={splitConfig.width}
                    onChange={(e) => setSplitConfig(prev => ({...prev, width: Number(e.target.value)}))}
                    min="10"
                    className="text-center w-full"
                />
             </div>
             <span className="text-slate-400 font-bold pt-6">×</span>
             <div className="flex-1 min-w-0">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block truncate">{t.splitHeight}</label>
                <Input 
                    type="number"
                    value={splitConfig.height}
                    onChange={(e) => setSplitConfig(prev => ({...prev, height: Number(e.target.value)}))}
                    min="10"
                    className="text-center w-full"
                />
             </div>
          </div>

          <div className="flex justify-end pt-2">
             <Button 
                onClick={handleSplitDownload}
                disabled={isExporting}
                className="w-full flex justify-center items-center gap-2"
             >
                {isExporting ? (
                   <span className="animate-pulse">{t.processing}...</span>
                ) : (
                   <>
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                     {t.exportZip}
                   </>
                )}
             </Button>
          </div>
        </div>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        isOpen={showCsvModal}
        onClose={() => setShowCsvModal(false)}
        title={t.importPalette}
      >
        <div className="flex flex-col gap-4">
          <Input 
            value={csvName} 
            onChange={(e) => setCsvName(e.target.value)} 
            placeholder={t.paletteName} 
          />
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative">
             <input 
                type="file" 
                accept=".csv"
                onChange={handleCsvUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
             <div className="flex flex-col items-center gap-2 text-slate-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <span className="text-sm font-medium">{csvFile ? csvFile.name : t.uploadCSV}</span>
             </div>
          </div>
          <p className="text-xs text-slate-400">
            Format: Name,ID,Hex (e.g., "Black,H01,#000000")
          </p>
          <div className="flex justify-end">
            <Button onClick={handleImportCsv} disabled={!csvFile || !csvName}>
                {t.import}
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Material Export Modal */}
      <Modal
        isOpen={showMaterialExportModal}
        onClose={() => setShowMaterialExportModal(false)}
        title={t.exportMaterials}
      >
         <div className="flex flex-col gap-4">
            <p className="text-slate-600 text-sm">
                Generate a high-quality image of the material list for shopping or inventory checking.
            </p>
            
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                <input 
                    type="checkbox"
                    checked={excludeHiddenMaterials}
                    onChange={(e) => setExcludeHiddenMaterials(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm font-medium text-slate-700">{t.excludeHidden}</span>
            </label>
            
            <div className="flex justify-end pt-2">
                <Button onClick={handleMaterialExport}>
                    {t.download} Image
                </Button>
            </div>
         </div>
      </Modal>

    </div>
  );
};

export default App;
