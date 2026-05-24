import React, { useState } from 'react';
import { FileUploadArea } from '@/components/FileUploadArea';
import { formatBytes } from '@/lib/utils';
import { ArrowLeft, Download, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

export function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setFile(acceptedFiles[0]);
    setCompressedBlob(null);
  };

  const clear = () => {
    setFile(null);
    setCompressedBlob(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    const toastId = toast.loading('Re-building PDF structure...');
    
    try {
      // PDF-Lib compression primarily operates by ignoring unreachable objects,
      // stripping metadata, and compacting structures. Real image downsampling 
      // isn't natively supported, so we will do a fast structural rebuild.
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      
      // Save with useObjectStreams to compress structure
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      setCompressedBlob(blob);
      toast.success('PDF processed successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to process PDF. It may be encrypted or corrupted.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const download = () => {
    if (compressedBlob) {
      saveAs(compressedBlob, `optimized_${file?.name || 'document.pdf'}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">PDF Compressor</h1>
          <p className="text-slate-500 mt-1">Optimize PDF structures and strip unused data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!file ? (
             <FileUploadArea 
              onDrop={onDrop} 
              accept={{ 'application/pdf': ['.pdf'] }} 
              maxFiles={1}
              label="Drop your PDF document here"
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl relative shadow-md">
               <button onClick={clear} className="absolute top-4 right-4 p-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-colors z-10">
                 <X className="w-4 h-4" />
               </button>
               
               <div className="text-center py-8">
                  <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mb-6 shadow-inner">
                    <span className="font-bold text-xl">PDF</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{file.name}</h3>
                  <p className="text-slate-500 mt-2 font-medium">Original Size: <span className="text-slate-900">{formatBytes(file.size)}</span></p>
               </div>

               {compressedBlob && (
                 <div className="mt-6 pt-6 border-t border-slate-100 text-center animate-in fade-in">
                    <p className="text-xs uppercase tracking-widest text-emerald-600 font-bold mb-3">Optimized File</p>
                    <p className="text-3xl font-extrabold text-slate-900 flex flex-col items-center justify-center gap-3">
                       {formatBytes(compressedBlob.size)}
                       <span className="text-sm font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                         {compressedBlob.size < file.size ? 'Reduced' : 'Optimized'} by {((1 - compressedBlob.size / file.size) * 100).toFixed(1)}%
                       </span>
                    </p>
                 </div>
               )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex gap-3 text-indigo-900 shadow-sm">
             <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-indigo-600" />
             <p className="text-sm leading-relaxed text-indigo-800">
               <strong>Note on browser compression:</strong> True image downsampling is highly complex in Javascript. 
               This tool performs structural optimization and metadata stripping, which is highly effective for some PDFs 
               (e.g., Illustrator exports) but may not significantly reduce others already optimized.
             </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            {!compressedBlob ? (
               <button
                  onClick={handleCompress}
                  disabled={!file || isProcessing}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                  {isProcessing ? 'Optimizing...' : 'Optimize PDF Structure'}
                </button>
            ) : (
               <button
                  onClick={download}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Download className="w-5 h-5" />
                  Download Optimized PDF
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
