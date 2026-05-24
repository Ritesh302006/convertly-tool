import React, { useState, useRef, useEffect } from 'react';
import { FileUploadArea } from '@/components/FileUploadArea';
import { formatBytes } from '@/lib/utils';
import { ArrowLeft, Download, X, Crop } from 'lucide-react';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';

export function ImageResize() {
  const [file, setFile] = useState<File | null>(null);
  const [previewOriginal, setPreviewOriginal] = useState<string>('');
  
  // Img specific details
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [percentage, setPercentage] = useState<number>(100);
  const [resizeMode, setResizeMode] = useState<'px' | 'pct'>('px');
  const [keepAspect, setKeepAspect] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const incoming = acceptedFiles[0];
    setFile(incoming);
    
    const url = URL.createObjectURL(incoming);
    setPreviewOriginal(url);

    // Read initial dims
    const img = new Image();
    img.onload = () => {
      setOriginalDims({ w: img.width, h: img.height });
      setWidth(img.width.toString());
      setHeight(img.height.toString());
    };
    img.src = url;
  };

  const handleWidthChange = (val: string) => {
    setWidth(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && keepAspect && originalDims.w > 0) {
      const ratio = originalDims.h / originalDims.w;
      setHeight(Math.round(num * ratio).toString());
    }
  };

  const handleHeightChange = (val: string) => {
    setHeight(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && keepAspect && originalDims.h > 0) {
      const ratio = originalDims.w / originalDims.h;
      setWidth(Math.round(num * ratio).toString());
    }
  };

  const handleResize = () => {
    if (!file || !previewOriginal) return;

    let w = parseInt(width, 10);
    let h = parseInt(height, 10);

    if (resizeMode === 'pct') {
      w = Math.round(originalDims.w * (percentage / 100));
      h = Math.round(originalDims.h * (percentage / 100));
    }

    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      
      canvas.toBlob((blob) => {
        if (blob) {
           saveAs(blob, `resized_${w}x${h}_${file.name}`);
        }
      }, file.type);
    };
    img.src = previewOriginal;
  };

  const clear = () => {
    setFile(null);
    setPreviewOriginal('');
    setOriginalDims({ w:0, h:0 });
    setWidth('');
    setHeight('');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Image Resize</h1>
          <p className="text-slate-500 mt-1">Scale images exactly to your requirements in width and height.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
         <div className="lg:col-span-2 space-y-6">
           {!file ? (
             <FileUploadArea 
              onDrop={onDrop} 
              accept={{ 'image/*': [] }} 
              maxFiles={1}
              label="Drop image here to resize"
            />
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden relative p-6 min-h-[400px] flex items-center justify-center shadow-inner">
              <button onClick={clear} className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-900/70 hover:bg-white text-slate-600 rounded-full transition-colors z-10 backdrop-blur-md shadow-sm">
                  <X className="w-4 h-4" />
              </button>
              <img src={previewOriginal} className="max-w-full max-h-[600px] object-contain shadow-md rounded-xl bg-white p-2 border border-slate-100" alt="preview" />
            </div>
          )}
         </div>

         <div className="space-y-6">
           <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
             <h3 className="text-lg font-bold border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
               <Crop className="w-5 h-5 text-indigo-600"/> Resize Dimensions
             </h3>

             <div className="space-y-5">
               {originalDims.w > 0 && (
                 <p className="text-sm font-semibold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2">
                   Original: <span className="text-slate-800 dark:text-slate-200">{originalDims.w} x {originalDims.h} px</span>
                 </p>
               )}

               <div className="flex bg-slate-50 p-1 rounded-xl shadow-inner border border-slate-100">
                 <button 
                   onClick={() => setResizeMode('px')}
                   disabled={!file}
                   className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${resizeMode === 'px' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
                 >
                   Pixels
                 </button>
                 <button 
                   onClick={() => setResizeMode('pct')}
                   disabled={!file}
                   className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${resizeMode === 'pct' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Percentage
                 </button>
               </div>

               {resizeMode === 'px' ? (
                 <>
                   <div className="flex gap-4 items-end">
                     <div className="flex-1 space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Width</label>
                       <input 
                         type="number"
                         value={width}
                         onChange={(e) => handleWidthChange(e.target.value)}
                         disabled={!file}
                         className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-center font-mono font-bold text-xl text-slate-900 shadow-sm"
                       />
                     </div>
                     
                     <div className="pb-4 text-slate-300 font-bold text-xl px-1">×</div>
                     
                     <div className="flex-1 space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Height</label>
                       <input 
                         type="number"
                         value={height}
                         onChange={(e) => handleHeightChange(e.target.value)}
                         disabled={!file}
                         className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-center font-mono font-bold text-xl text-slate-900 shadow-sm"
                       />
                     </div>
                   </div>

                   <div className="flex items-center gap-3 pt-2">
                     <input 
                       type="checkbox" 
                       id="aspect" 
                       checked={keepAspect} 
                       onChange={(e) => setKeepAspect(e.target.checked)}
                       disabled={!file}
                       className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/50 accent-indigo-600 transition-colors"
                     />
                     <label htmlFor="aspect" className="text-sm font-semibold text-slate-700 select-none">
                       Lock aspect ratio
                     </label>
                   </div>
                 </>
               ) : (
                 <div className="space-y-4">
                   <div className="flex justify-between text-sm font-semibold text-slate-700">
                     <span>Scale Factor</span>
                     <span className="text-indigo-600">{percentage}%</span>
                   </div>
                   <input 
                     type="range"
                     min="1"
                     max="400"
                     value={percentage}
                     onChange={(e) => setPercentage(Number(e.target.value))}
                     disabled={!file}
                     className="w-full accent-indigo-600"
                   />
                   <p className="text-sm text-center font-bold text-indigo-600 bg-indigo-50 py-2 rounded-lg">
                     New Size: {originalDims.w ? Math.round(originalDims.w * (percentage/100)) : 0} x {originalDims.h ? Math.round(originalDims.h * (percentage/100)) : 0} px
                   </p>
                 </div>
               )}
             </div>

              <button
                  onClick={handleResize}
                  disabled={!file || (resizeMode === 'px' && (!width || !height))}
                  className="mt-8 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-slate-950 font-semibold rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  <Download className="w-5 h-5" />
                  Resize & Download
               </button>
           </div>
         </div>
      </div>
    </div>
  );
}
