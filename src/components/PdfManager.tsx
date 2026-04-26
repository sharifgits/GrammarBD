import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Eye, Trash2, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjsLib from 'pdfjs-dist';
import localforage from 'localforage';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfResource {
  id: string;
  name: string;
  url: string; // The local Blob url might expire, so we also need to store text, or we can restore the URL from base64/ArrayBuffer if needed. Actually it's complex to store the blob URL, let's store the text. To keep the view working, we ideally should store the ArrayBuffer of the PDF as well, but for now we'll fetch saved ones.
  text: string;
  buffer?: ArrayBuffer; // Add buffer field to recreate blob URLs
}

interface PdfManagerProps {
  onExtractText: (text: string) => void;
}

export function PdfManager({ onExtractText }: PdfManagerProps) {
  const [pdfs, setPdfs] = useState<PdfResource[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<PdfResource | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load PDFs from IndexedDB on startup
    const loadSaved = async () => {
      const saved = await localforage.getItem<PdfResource[]>('grammarbd_pdfs');
      if (saved && saved.length > 0) {
        // Recreate Blob URLs for stored buffers to prevent them from breaking across sessions
        const restored = saved.map(p => {
          if (p.buffer) {
            const blob = new Blob([p.buffer], { type: 'application/pdf' });
            return { ...p, url: URL.createObjectURL(blob) };
          }
          return p;
        });
        setPdfs(restored);
      }
    };
    loadSaved();
  }, []);

  const saveToStorage = async (newPdfs: PdfResource[]) => {
    setPdfs(newPdfs);
    await localforage.setItem('grammarbd_pdfs', newPdfs);
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += `[Page ${i}]\n${pageText}\n\n`;
    }
    
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    setIsExtracting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Re-read file to get the ArrayBuffer again for saving, or just clone it
      const text = await extractTextFromPdf(file);
      const url = URL.createObjectURL(file);
      
      const newPdf: PdfResource = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url,
        text,
        buffer: arrayBuffer
      };
      
      const newPdfs = [...pdfs, newPdf];
      await saveToStorage(newPdfs);
    } catch (error) {
      console.error("PDF processing failed:", error);
      alert("PDF processing failed. Please try a different file.");
    } finally {
      setIsExtracting(false);
    }
  };

  const removePdf = async (id: string) => {
    const newPdfs = pdfs.filter(p => p.id !== id);
    await saveToStorage(newPdfs);
    if (selectedPdf?.id === id) setSelectedPdf(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">PDF Study Center</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Library Management</p>
        </div>
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isExtracting}
          className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
        >
          {isExtracting ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
          Upload PDF
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf" 
          onChange={handleFileUpload} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
        {/* PDF List */}
        <div className="space-y-3">
          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 text-left">Library ({pdfs.length})</h4>
          {pdfs.length === 0 ? (
            <div className="p-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center">
              <FileText className="text-slate-100 dark:text-slate-800 mb-2" size={24} />
              <p className="text-[9px] font-bold text-slate-400">পিডিএফ আপলোড করুন</p>
            </div>
          ) : (
            pdfs.map(pdf => (
              <motion.div 
                key={pdf.id}
                layoutId={pdf.id}
                className={`p-2 bg-white dark:bg-slate-800/50 border-2 rounded-xl flex items-center justify-between group transition-all cursor-pointer ${
                  selectedPdf?.id === pdf.id ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-50 dark:border-slate-800'
                }`}
                onClick={() => setSelectedPdf(pdf)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={14} />
                  </div>
                  <div className="truncate text-left">
                    <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate">{pdf.name}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{Math.round(pdf.text.length / 1000)} KB</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onExtractText(pdf.text); }}
                    title="Send to AI Generator"
                    className="p-1 text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all"
                  >
                    <Sparkles size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removePdf(pdf.id); }}
                    title="Remove"
                    className="p-1 text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Preview / Viewer */}
        <div className="space-y-3">
           <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 text-left">Reading Pane</h4>
           {selectedPdf ? (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }}
               className="h-full min-h-[250px] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-sm"
             >
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/50">
                  <p className="text-[9px] font-black text-slate-800 dark:text-slate-100 truncate pr-4">{selectedPdf.name}</p>
                  <button 
                    onClick={() => window.open(selectedPdf.url, '_blank')}
                    className="p-1 bg-white dark:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-all shadow-sm"
                  >
                    <Eye size={12} />
                  </button>
                </div>
                <iframe 
                   src={selectedPdf.url} 
                   className="w-full h-full min-h-[250px]" 
                   title="PDF Viewer"
                />
             </motion.div>
           ) : (
             <div className="h-full min-h-[250px] flex items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
               <div>
                  <BookOpen className="text-slate-100 dark:text-slate-800 mb-2 mx-auto" size={24} />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">বই সিলেক্ট করুন</p>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
