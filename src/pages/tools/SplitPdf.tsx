import React, { useState } from 'react';
import { FileUploadArea } from '@/components/FileUploadArea';
import { ArrowLeft, Download, RefreshCw, X, Split as SplitIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { formatBytes } from '@/lib/utils';

export function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [rangeInput, setRangeInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const incoming = acceptedFiles[0];
    
    // Auto-detect pages
    try {
      const arrayBuffer = await incoming.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      
      setFile(incoming);
      setPageCount(count);
      setRangeInput(`1-${count}`); // Default to all
    } catch(err) {
      toast.error('Failed to parse PDF. Ensure it is not encrypted.');
    }
  };

  // Helper to parse "1, 3, 5-7" into an array of 0-indexed pages
  const parseRange = (range: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const tokens = range.split(',').map(s => s.trim());
    
    for (const token of tokens) {
      if (!token) continue;
      
      if (token.includes('-')) {
        const [startStr, endStr] = token.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= maxPages) {
               pages.add(i - 1); // 0-indexed
            }
          }
        }
      } else {
        const num = parseInt(token, 10);
        if (!isNaN(num) && num >= 1 && num <= maxPages) {
          pages.add(num - 1);
        }
      }
    }
    
    return Array.from(pages).sort((a,b) => a-b);
  };

  const handleSplit = async () => {
    if (!file) return;
    
    const pageIndices = parseRange(rangeInput, pageCount);
    if (pageIndices.length === 0) {
      toast.error('Invalid page range format.');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Extracting pages...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfToExtract = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const copiedPages = await newPdf.copyPages(pdfToExtract, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));

      const newPdfBytes = await newPdf.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      saveAs(blob, `Extracted_${file.name}`);
      
      toast.success(`Successfully extracted ${pageIndices.length} pages!`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to split PDF.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Split PDF</h1>
          <p className="text-slate-500 mt-1">Extract exactly the pages you need into a new file.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!file ? (
             <FileUploadArea 
              onDrop={onDrop} 
              accept={{ 'application/pdf': ['.pdf'] }} 
              maxFiles={1}
              label="Drop your master PDF here"
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl relative shadow-md text-center">
               <button onClick={() => { setFile(null); setRangeInput(''); }} className="absolute top-4 right-4 p-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-colors z-10">
                 <X className="w-4 h-4" />
               </button>
               
               <div className="py-8">
                  <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-6 shadow-inner">
                    <SplitIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold break-words px-4 text-slate-800 dark:text-slate-200">{file.name}</h3>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <span className="text-slate-500 text-sm font-medium">{formatBytes(file.size)}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full text-sm">{pageCount} Pages detected</span>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold border-b border-slate-100 pb-3 mb-4">Extraction Range</h3>
            
            <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pages to extract</label>
                 <input 
                   type="text"
                   value={rangeInput}
                   onChange={e => setRangeInput(e.target.value)}
                   placeholder="e.g. 1-5, 8, 11-13"
                   disabled={!file}
                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-mono text-indigo-900 shadow-inner"
                 />
                 <p className="text-xs text-slate-500">Format: comma-separated list of ranges or single pages.</p>
               </div>
            </div>

            <button
               onClick={handleSplit}
               disabled={!file || isProcessing || !rangeInput.trim()}
               className="mt-6 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-slate-950 font-semibold rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:hover:shadow-none disabled:hover:translate-y-0"
             >
               {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
               {isProcessing ? 'Extracting...' : 'Extract & Download PDF'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
