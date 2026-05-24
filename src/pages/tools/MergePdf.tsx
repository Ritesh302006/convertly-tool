import React, { useState } from 'react';
import { FileUploadArea } from '@/components/FileUploadArea';
import { formatBytes } from '@/lib/utils';
import { ArrowLeft, Download, RefreshCw, X, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

interface PdfFile {
  id: string;
  file: File;
}

export function MergePdf() {
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
    }));
    setPdfs(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setPdfs(prev => prev.filter(pdf => pdf.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const items = [...pdfs];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    setPdfs(items);
  };

  const moveDown = (index: number) => {
    if (index === pdfs.length - 1) return;
    const items = [...pdfs];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
    setPdfs(items);
  };

  const mergeDocuments = async () => {
    if (pdfs.length < 2) {
      toast.error('Please add at least 2 PDFs to merge.');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Merging documents...');

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of pdfs) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      saveAs(blob, 'Merged_Document.pdf');
      toast.success('PDFs merged successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to merge PDFs. Ensure files are valid and not encrypted.', { id: toastId });
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Merge PDF</h1>
          <p className="text-slate-500 mt-1">Combine multiple PDF documents into a single file.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <FileUploadArea 
            onDrop={onDrop} 
            accept={{ 'application/pdf': ['.pdf'] }} 
            label="Drag & drop multiple PDFs here"
          />

          {pdfs.length > 0 && (
            <div className="space-y-4">
               <h3 className="font-semibold text-lg flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                 <span>Order Files ({pdfs.length})</span>
                 {pdfs.length < 2 && <span className="text-sm text-yellow-600 font-normal bg-yellow-50 px-3 py-1 rounded-full">Add at least one more to merge</span>}
               </h3>
               <div className="space-y-3">
                 {pdfs.map((pdf, idx) => (
                   <div key={pdf.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                     <GripVertical className="w-5 h-5 text-slate-400" />
                     <div className="w-10 h-10 flex shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs shadow-inner">
                       PDF
                     </div>
                     <div className="flex-1 truncate">
                       <p className="font-bold text-sm truncate text-slate-800 dark:text-slate-200">{pdf.file.name}</p>
                       <p className="text-xs text-slate-500 font-medium">{formatBytes(pdf.file.size)}</p>
                     </div>
                     <div className="flex items-center gap-1 shrink-0">
                       <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 transition-colors">
                         <ArrowUp className="w-4 h-4" />
                       </button>
                       <button onClick={() => moveDown(idx)} disabled={idx === pdfs.length - 1} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 transition-colors">
                         <ArrowDown className="w-4 h-4" />
                       </button>
                       <button onClick={() => removeFile(pdf.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors ml-2">
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold border-b border-slate-100 pb-3 mb-4">Summary</h3>
            
            <div className="py-4 space-y-3 font-medium">
               <div className="flex justify-between">
                 <span className="text-slate-500">Total Files:</span>
                 <span className="text-slate-900 font-bold">{pdfs.length}</span>
               </div>
               <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                 <span className="text-slate-500">Estimated Total Size:</span>
                 <span className="text-indigo-600 font-bold text-lg">{formatBytes(pdfs.reduce((acc, curr) => acc + curr.file.size, 0))}</span>
               </div>
            </div>

            <button
               onClick={mergeDocuments}
               disabled={pdfs.length < 2 || isProcessing}
               className="mt-6 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-slate-950 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:hover:shadow-none hover:-translate-y-0.5 disabled:hover:translate-y-0"
             >
               {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
               {isProcessing ? 'Merging...' : 'Merge PDFs'}
             </button>
            {pdfs.length > 0 && (
              <button
                onClick={() => setPdfs([])}
                className="mt-3 w-full py-2 px-4 bg-transparent hover:bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium rounded-xl transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
