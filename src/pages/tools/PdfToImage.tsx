import React, { useState } from 'react';
import { FileUploadArea } from '@/components/FileUploadArea';
import { ArrowLeft, Download, RefreshCw, X, Images } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface ConvertedImage {
  url: string;
  blob: Blob;
  pageNumber: number;
}

export function PdfToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scale, setScale] = useState<number>(2); // 2x for good quality

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setFile(acceptedFiles[0]);
    setImages([]);
  };

  const convertPages = async () => {
    if (!file) return;
    setIsProcessing(true);
    const toastId = toast.loading('Extracting pages to images...');
    
    try {
      const url = URL.createObjectURL(file);
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const extracted: ConvertedImage[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext: any = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;
        
        // Extract as Blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error('Canvas to Blob failed'));
          }, 'image/png');
        });

        extracted.push({
          url: URL.createObjectURL(blob),
          blob,
          pageNumber: i
        });
      }

      setImages(extracted);
      toast.success(`Successfully extracted ${numPages} images!`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to convert PDF. The file might be corrupted.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async () => {
    if (images.length === 0) return;
    const toastId = toast.loading('Zipping images...');
    
    try {
      const zip = new JSZip();
      images.forEach(img => {
        zip.file(`page_${img.pageNumber}.png`, img.blob);
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${file?.name.replace('.pdf', '')}_images.zip`);
      toast.success('Download started', { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error('Failed to zip images', { id: toastId });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center gap-4">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">PDF to Image</h1>
          <p className="text-slate-500 mt-1">Extract high-quality PNGs from every page of your PDF.</p>
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
             <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center gap-4 font-medium truncate shrink">
                     <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 justify-center rounded-lg">
                       <span className="font-bold">PDF</span>
                     </div>
                     <span className="truncate">{file.name}</span>
                  </div>
                  <button onClick={() => { setFile(null); setImages([]); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in">
                     {images.map((img) => (
                       <div key={img.pageNumber} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                          <img src={img.url} className="w-full aspect-[1/1.4] object-contain bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-950 p-2" alt={`Page ${img.pageNumber}`} />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                             <button 
                               onClick={() => saveAs(img.blob, `page_${img.pageNumber}.png`)}
                               className="p-2 bg-white text-black rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm font-semibold"
                             >
                               <Download className="w-4 h-4" /> Save
                             </button>
                          </div>
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-slate-950 text-xs rounded font-medium">
                            Pg {img.pageNumber}
                          </div>
                       </div>
                     ))}
                  </div>
                )}
             </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
             <h3 className="text-lg font-bold border-b border-slate-100 pb-3 mb-4">Export Options</h3>
             
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Image Quality Scale</label>
                  <select 
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    disabled={isProcessing || images.length > 0}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:opacity-50 transition-shadow"
                  >
                    <option value={1}>1x (Standard)</option>
                    <option value={1.5}>1.5x (Good)</option>
                    <option value={2}>2x (High Quality)</option>
                    <option value={3}>3x (Ultra - Slower)</option>
                  </select>
                </div>
             </div>

             {images.length === 0 ? (
               <button
                  onClick={convertPages}
                  disabled={!file || isProcessing}
                  className="mt-6 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:hover:shadow-none disabled:hover:translate-y-0"
                >
                  {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Images className="w-5 h-5" />}
                  {isProcessing ? 'Converting...' : 'Convert to Images'}
                </button>
             ) : (
                <button
                  onClick={downloadAll}
                  className="mt-6 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Download className="w-5 h-5" />
                  Download ZIP (All)
                </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
