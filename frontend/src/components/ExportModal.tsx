import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  Printer
} from 'lucide-react';
import type { TripPlan } from '../types/trip';
import { exportTripToDocx, exportTripToPdf } from '../utils/exportTrip';

interface ExportModalProps {
  isOpen: boolean;
  plan: TripPlan | null;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  plan,
  onClose,
}) => {
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [docxSuccess, setDocxSuccess] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !plan) return null;

  const handleExportDocx = async () => {
    try {
      setIsExportingDocx(true);
      await exportTripToDocx(plan);
      setDocxSuccess(true);
      setTimeout(() => setDocxSuccess(false), 2500);
    } catch (err) {
      console.error('Word export error:', err);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportTripToPdf(plan);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 2500);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 p-6 shadow-2xl text-stone-100 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-100">
                  Export Travel Blueprint
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-800 text-stone-300 border border-stone-700">
                  {plan.destination}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Download a clean, structured document of your complete itinerary & logistics.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Option 1: PDF Document */}
          <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 hover:border-stone-700 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Printer className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-800 text-rose-300 border border-rose-900/40">
                  .PDF
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-100">
                  PDF Document
                </h4>
                <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                  Executive multi-page format formatted for printing, offline travel, and mobile sharing.
                </p>
              </div>
            </div>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-white text-stone-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow disabled:opacity-60"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Building PDF...</span>
                </>
              ) : pdfSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export as PDF</span>
                </>
              )}
            </button>
          </div>

          {/* Option 2: Word Document (.docx) */}
          <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 hover:border-stone-700 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-800 text-blue-300 border border-blue-900/40">
                  .DOCX
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-100">
                  Word Document
                </h4>
                <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                  Fully editable Microsoft Word document with styled tables, itinerary cards, and budget grids.
                </p>
              </div>
            </div>

            <button
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-white text-stone-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow disabled:opacity-60"
            >
              {isExportingDocx ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Building Word Doc...</span>
                </>
              ) : docxSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Word Doc Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export as Word (.docx)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
          <span className="flex items-center gap-1.5 text-amber-400/90">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Includes full budget, flights, stays, & day-by-day itinerary</span>
          </span>
          <button
            onClick={onClose}
            className="hover:text-stone-200 transition-colors cursor-pointer text-stone-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
