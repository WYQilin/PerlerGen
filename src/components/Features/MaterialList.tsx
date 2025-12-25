import React from 'react';
import { PatternData, BeadColor, Palette } from '../../types';
import { Card, CardHeader, CardBody } from '../ModernComponents';

interface MaterialListProps {
    t: any;
    patternData: PatternData;
    activePalette: Palette;
    hiddenBeadIds: Set<string>;
    onToggleVisibility: (id: string) => void;
    onSelectForReplace: (bead: BeadColor) => void;
}

export const MaterialList: React.FC<MaterialListProps> = ({
    t,
    patternData,
    activePalette,
    hiddenBeadIds,
    onToggleVisibility,
    onSelectForReplace
}) => {
    return (
        <Card className="flex flex-col max-h-[500px]">
            <CardHeader className="flex justify-between items-center py-3">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{t.materials}</h2>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                    {t.visible}: {Object.entries(patternData.counts)
                        .filter(([id]) => !hiddenBeadIds.has(id))
                        .reduce((sum, [, count]) => sum + (count as number), 0)}
                </span>
            </CardHeader>
            <div className="overflow-y-auto custom-scrollbar p-2 flex-1">
                <div className="flex flex-col gap-1">
                    {activePalette.colors
                        .filter(b => patternData.counts[b.id])
                        .sort((a,b) => (patternData.counts[b.id] || 0) - (patternData.counts[a.id] || 0))
                        .map((bead) => {
                            const isHidden = hiddenBeadIds.has(bead.id);
                            return (
                                <div 
                                    key={bead.id} 
                                    className={`flex items-center justify-between p-2 rounded-lg transition-all border border-transparent cursor-pointer group ${isHidden ? 'opacity-50 grayscale' : 'hover:bg-slate-50 hover:border-slate-200'}`}
                                    onClick={() => onSelectForReplace(bead)}
                                    title={t.clickToReplace}
                                >
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onToggleVisibility(bead.id); }}
                                            className="text-slate-300 hover:text-slate-500 p-1"
                                            title={isHidden ? t.showBeads : t.hideBeads}
                                        >
                                            {isHidden ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                        
                                        <div className="w-8 h-8 rounded-full border border-slate-200 shadow-sm relative group-hover:scale-105 transition-transform" style={{ backgroundColor: bead.hex }}>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 rounded-full transition-opacity">
                                                <svg className="w-3 h-3 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-700 leading-tight">{bead.name}</span>
                                            <span className="text-[10px] text-slate-400 font-mono leading-tight">{bead.id}</span>
                                        </div>
                                    </div>
                                    <span className="font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs min-w-[2rem] text-center">
                                        {patternData.counts[bead.id]}
                                    </span>
                                </div>
                            );
                        })}
                </div>
            </div>
        </Card>
    );
};
