import React from 'react';
import { Card, CardBody, Button } from '../ModernComponents';
import { AIAnalysis } from '../../types';

interface ActionPanelProps {
    t: any;
    aiAnalysis: AIAnalysis | null;
    onDownload: () => void;
    onDownloadSplit: () => void;
    onExportMaterials: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
    t,
    aiAnalysis,
    onDownload,
    onDownloadSplit,
    onExportMaterials
}) => {
    return (
        <div className="flex flex-col gap-4">
            {/* AI Analysis Result */}
            {aiAnalysis && (
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                    <CardBody>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-base font-bold text-indigo-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
                                {aiAnalysis.title}
                            </h3>
                            <p className="text-sm text-indigo-800/80 italic">"{aiAnalysis.description}"</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
                                    aiAnalysis.difficulty.toLowerCase().includes('hard') ? 'bg-red-50 text-red-700 border-red-200' :
                                    aiAnalysis.difficulty.toLowerCase().includes('medium') ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    'bg-green-50 text-green-700 border-green-200'
                                }`}>{aiAnalysis.difficulty}</span>
                                <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-white text-indigo-600 border border-indigo-200 shadow-sm">
                                    {aiAnalysis.suggestedUsage}
                                </span>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-end">
                <Button 
                    variant="secondary"
                    onClick={onExportMaterials}
                    className="flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    {t.exportMaterials}
                </Button>

                <Button 
                    variant="secondary"
                    onClick={onDownloadSplit}
                    className="flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    {t.downloadSplit}
                </Button>

                <Button 
                    variant="primary"
                    onClick={onDownload}
                    className="flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    {t.download}
                </Button>
            </div>
        </div>
    );
};
