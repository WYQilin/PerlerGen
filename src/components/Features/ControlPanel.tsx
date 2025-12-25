import React from 'react';
import { Card, CardHeader, CardBody, FileUpload, Select, Input, Button, Badge } from '../ModernComponents';
import { Palette } from '../../types';

interface ControlPanelProps {
    t: any;
    imageSrc: string | null;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    
    // Palette
    allPalettes: Palette[];
    selectedPaletteId: string;
    onPaletteChange: (id: string) => void;
    onDeletePalette: (id: string) => void;
    
    // Grid
    gridWidth: number;
    gridHeight: number;
    lockRatio: boolean;
    onWidthChange: (val: string) => void;
    onHeightChange: (val: string) => void;
    onToggleLockRatio: () => void;
    
    // Analysis
    onAnalyze: () => void;
    isAnalyzing: boolean;
    
    showGridLines: boolean;
    setShowGridLines: (show: boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    t,
    imageSrc,
    onFileUpload,
    allPalettes,
    selectedPaletteId,
    onPaletteChange,
    onDeletePalette,
    gridWidth,
    gridHeight,
    lockRatio,
    onWidthChange,
    onHeightChange,
    onToggleLockRatio,
    onAnalyze,
    isAnalyzing,
    showGridLines,
    setShowGridLines
}) => {
    return (
        <Card className="h-fit">
            <CardHeader>
                <h2 className="text-lg font-bold text-slate-800">{t.config}</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-6">
                {/* Image Upload */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t.uploadImage}</label>
                    <FileUpload accept="image/*" onChange={onFileUpload}>
                        {t.uploadImage}
                    </FileUpload>
                </div>

                {imageSrc && (
                    <>
                        {/* Palette Selection */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t.palette}</label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Select 
                                        value={selectedPaletteId} 
                                        onChange={(e) => onPaletteChange(e.target.value)}
                                        className="w-full"
                                    >
                                        {allPalettes.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} {p.id.startsWith('custom_') ? `(${t.custom})` : ''}
                                            </option>
                                        ))}
                                        <option value="import_new">
                                            + {t.importPalette}
                                        </option>
                                    </Select>
                                </div>
                                {selectedPaletteId.startsWith('custom_') && (
                                    <Button 
                                        variant="icon"
                                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                        onClick={() => onDeletePalette(selectedPaletteId)}
                                        title={t.deletePalette}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Grid Size */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase">{t.gridSize}</label>
                                <button 
                                    onClick={onToggleLockRatio}
                                    className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${lockRatio ? 'bg-blue-100 text-blue-700' : 'text-slate-400 hover:text-slate-600'}`}
                                    title={lockRatio ? t.ratioLocked : t.ratioUnlocked}
                                >
                                    {lockRatio ? (
                                        <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> {t.ratioLocked}</>
                                    ) : (
                                        <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg> {t.ratioUnlocked}</>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <Input 
                                        type="number" 
                                        value={gridWidth} 
                                        onChange={(e) => onWidthChange(e.target.value)}
                                        min="1"
                                        className="text-center font-mono pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">{t.width}</span>
                                </div>
                                <span className="text-slate-400 font-bold">×</span>
                                <div className="flex-1 relative">
                                    <Input 
                                        type="number" 
                                        value={gridHeight} 
                                        onChange={(e) => onHeightChange(e.target.value)}
                                        min="1"
                                        className="text-center font-mono pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">{t.height}</span>
                                </div>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700">{t.circularBeads}</label>
                            <div 
                                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${showGridLines ? 'bg-blue-600' : 'bg-slate-300'}`}
                                onClick={() => setShowGridLines(!showGridLines)}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${showGridLines ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                        {/* Analyze Button */}
                        <Button 
                            onClick={onAnalyze} 
                            disabled={isAnalyzing} 
                            className="w-full gap-2"
                        >
                            {isAnalyzing ? (
                                <span className="animate-pulse">{t.analyzing}</span>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    {t.analyzeBtn}
                                </>
                            )}
                        </Button>
                    </>
                )}
            </CardBody>
        </Card>
    );
};
