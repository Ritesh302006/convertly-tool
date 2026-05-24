import React, { useState } from 'react';
import { FileUploadArea } from '@/components/FileUploadArea';
import { formatBytes } from '@/lib/utils';
import { ArrowLeft, Download, RefreshCw, X, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
import { saveAs } from 'file-saver';

export function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [previewOriginal, setPreviewOriginal] = useState<string>('');
  const [previewCompressed, setPreviewCompressed] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Settings
  const [quality, setQuality] = useState(0.7);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const incoming = acceptedFiles[0];
    setFile(incoming);
    setPreviewOriginal(URL.createObjectURL(incoming));
    setCompressedFile(null); // reset
    setPreviewCompressed('');
  };

  const clear = () => {
    setFile(null);
    setCompressedFile(null);
    setPreviewOriginal('');
    setPreviewCompressed('');
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    const toastId = toast.loading('Compressing image...');
    
    try {
      const options = {
        maxSizeMB: file.size / (1024*1024), // Dont enforce size strictly based on quality, just rely on initialQuality
        useWebWorker: true,
        initialQuality: quality,
        alwaysKeepResolution: true // Just change quality
      };
      
      const output = await imageCompression(file, options);
      setCompressedFile(output);
      setPreviewCompressed(URL.createObjectURL(output));
      toast.success('Image compressed successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to compress image.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const download = () => {
    if (compressedFile) {
      saveAs(compressedFile, `compressed_${file?.name || 'image.jpg'}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Image Compressor</h1>
          <p className="text-slate-500 mt-1">Reduce image size locally without losing noticeable quality.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!file ? (
             <FileUploadArea 
              onDrop={onDrop} 
              accept={{ 'image/*': [] }} 
              maxFiles={1}
              label="Drop an image here to compress"
            />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden relative shadow-md">
                <button onClick={clear} className="absolute top-4 right-4 p-2 bg-white/70 hover:bg-white text-slate-600 rounded-full transition-colors z-10 backdrop-blur-md shadow-sm">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50 dark:bg-slate-800/50/50">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Original</h3>
                  <div className="h-48 md:h-64 flex items-center justify-center bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                    <img src={previewOriginal} className="max-h-full object-contain" alt="original" />
                  </div>
                  <div className="mt-6 text-center">
                    <p className="font-bold text-2xl text-slate-800 dark:text-slate-200">{formatBytes(file.size)}</p>
                  </div>
                </div>
                
                <div className="flex-1 p-6 bg-indigo-50/30">
                  <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">Compressed</h3>
                  {compressedFile ? (
                    <>
                      <div className="h-48 md:h-64 flex items-center justify-center bg-white rounded-2xl overflow-hidden border border-indigo-100 shadow-[inset_0_2px_10px_rgba(99,102,241,0.05)]">
                        <img src={previewCompressed} className="max-h-full object-contain" alt="compressed" />
                      </div>
                      <div className="mt-6 text-center">
                        <p className="font-bold text-2xl text-indigo-600">{formatBytes(compressedFile.size)}</p>
                        <p className="text-sm text-emerald-600 inline-flex px-3 py-1 bg-emerald-50 rounded-full font-semibold mt-2">
                          Saved {((1 - compressedFile.size / file.size) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="h-48 md:h-64 flex items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-white/50 text-indigo-400 font-medium">
                      <p className="text-sm">Click compress to see result</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-600"/> Compression Settings
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <label>Quality Retention</label>
                  <span className="text-indigo-600">{Math.round(quality * 100)}%</span>
                </div>
                <input 
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <p className="text-xs text-slate-500">Lower percentage = smaller size but lower visual quality.</p>
              </div>
            </div>

            {!compressedFile ? (
               <button
                  onClick={handleCompress}
                  disabled={!file || isProcessing}
                  className="mt-6 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-slate-950 font-semibold rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg disabled:hover:shadow-none hover:-translate-y-0.5 disabled:hover:translate-y-0"
                >
                  {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                  {isProcessing ? 'Compressing...' : 'Compress Image'}
                </button>
            ) : (
               <button
                  onClick={download}
                  className="mt-6 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Download className="w-5 h-5" />
                  Download Saved Image
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
