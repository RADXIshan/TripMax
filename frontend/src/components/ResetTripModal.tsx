import React, { useEffect } from 'react';
import { 
  RotateCcw, 
  BookmarkCheck, 
  Trash2, 
  X,
  AlertTriangle
} from 'lucide-react';

interface ResetTripModalProps {
  isOpen: boolean;
  destinationName?: string;
  onClose: () => void;
  onDeleteAndReset: () => void;
  onSaveAndReset: () => void;
}

export const ResetTripModal: React.FC<ResetTripModalProps> = ({
  isOpen,
  destinationName,
  onClose,
  onDeleteAndReset,
  onSaveAndReset,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-6 shadow-2xl text-stone-100 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/50 border border-amber-800/70 flex items-center justify-center text-amber-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">
                Reset Current Trip?
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                {destinationName ? `Ongoing journey for ${destinationName}` : 'Active trip discovery in progress'}
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

        {/* Modal Body / Explanation */}
        <div className="p-3 rounded-xl bg-stone-850/60 border border-stone-800 text-xs text-stone-300 leading-relaxed flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>
            You have active trip parameters and discovery data. Would you like to save this trip to your <strong>All Trips</strong> archive before resetting, or delete it completely?
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* Option 1: Save & Reset */}
          <button
            onClick={onSaveAndReset}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-100 text-stone-900 hover:bg-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <BookmarkCheck className="w-4 h-4 text-stone-900" />
            <span>Save to All Trips & Reset</span>
          </button>

          {/* Option 2: Delete & Reset */}
          <button
            onClick={onDeleteAndReset}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 hover:bg-rose-900/50 hover:text-rose-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Delete Current Trip & Reset</span>
          </button>

          {/* Option 3: Cancel */}
          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800/50 text-xs font-medium transition-colors cursor-pointer text-center"
          >
            Keep Working (Cancel)
          </button>
        </div>
      </div>
    </div>
  );
};
