import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Download, Image as ImageIcon, X } from 'lucide-react';
import { FileUploadArea } from '@/components/FileUploadArea';
import { formatBytes } from '@/lib/utils';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

type ImageFormat = 'JPG' | 'JPEG' | 'PNG' | 'WEBP' | 'BMP' | 'ICO' | 'GIF' | 'TIFF' | 'AVIF' | 'JFIF';

const FORMATS: { label: ImageFormat; mime: string }[] = [
  { label: 'JPG', mime: 'image/jpeg' },
  { label: 'JPEG', mime: 'image/jpeg' },
  { label: 'PNG', mime: 'image/png' },
  { label: 'WEBP', mime: 'image/webp' },
  { label: 'BMP', mime: 'image/bmp' },
  { label: 'ICO', mime: 'image/x-icon' },
  { label: 'GIF', mime: 'image/gif' },
  { label: 'JFIF', mime: 'image/jpeg' },
  { label: 'AVIF', mime: 'image/avif' },
  { label: 'TIFF', mime: 'image/tiff' }
];

export function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('PNG');
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState(0.9);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (preview) URL.revokeObjectURL(preview);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      setFile(selectedFile);
    }
  };

  const clear = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview('');
  };

  const convertImage = async () => {
    if (!file || !preview) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = preview;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not available');

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D context');

      // Fill with white for PNG to JPG conversion transparency issues
      if (targetFormat === 'JPG' || targetFormat === 'JPEG' || targetFormat === 'JFIF') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const mimeFormat = FORMATS.find(f => f.label === targetFormat)?.mime || 'image/png';
      
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error(`Format ${targetFormat} may not be supported by your browser for exporting.`);
          setIsProcessing(false);
          return;
        }
        
        let ext = targetFormat.toLowerCase();
        let filename = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        
        saveAs(blob, `${filename}_converted.${ext}`);
        toast.success(`Converted to ${targetFormat} successfully!`);
        setIsProcessing(false);
      }, mimeFormat, quality);

    } catch (error) {
      console.error(error);
      toast.error('Error converting image.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 dark:text-slate-400 dark:hover:text-slate-50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Image Converter</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Convert your images quickly to various formats directly in your browser.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!file ? (
            <FileUploadArea 
              onDrop={handleFileDrop} 
              accept={{
                'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif', '.tiff', '.avif', '.svg', '.ico', '.heic']
              }} 
              label="Drop image to convert"
            />
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 dark:border-slate-800 rounded-3xl overflow-hidden relative shadow-inner p-6 min-h-[400px] flex items-center justify-center group text-center">
              <button onClick={clear} className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-900/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full transition-colors z-10 backdrop-blur-md shadow-sm">
                  <X className="w-4 h-4" />
              </button>
              <div className="space-y-4">
                <img src={preview} className="max-w-full max-h-[500px] object-contain shadow-md rounded-xl bg-white dark:bg-slate-800 p-2 border border-slate-100 dark:border-slate-700 mx-auto" alt="preview" />
                <p className="font-bold text-slate-800 dark:text-slate-200 dark:text-slate-200">{file.name}</p>
                <p className="text-sm font-medium text-slate-500">{formatBytes(file.size)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center gap-2">
               <ImageIcon className="w-5 h-5 text-pink-600 dark:text-pink-400"/> Settings
            </h3>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300">Target Format</label>
                <select 
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-shadow dark:text-slate-100 text-slate-900 shadow-inner"
                >
                  {FORMATS.map(f => (
                    <option key={f.label} value={f.label}>{f.label}</option>
                  ))}
                </select>
              </div>
              
              {(targetFormat === 'JPG' || targetFormat === 'JPEG' || targetFormat === 'WEBP' || targetFormat === 'JFIF') && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Quality</span>
                    <span className="text-pink-600 dark:text-pink-400">{Math.round(quality * 100)}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-pink-600"
                  />
                </div>
              )}
            </div>

            <button
              onClick={convertImage}
              disabled={!file || isProcessing}
              className="mt-8 w-full py-3 px-4 bg-pink-600 hover:bg-pink-700 text-slate-950 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {isProcessing ? 'Converting...' : 'Convert & Download'}
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
              Note: Availability of certain formats (like HEIC/AVIF/TIFF) for output <br/> depends on your specific browser capabilities.
            </p>
          </div>
        </div>
      </div>
      
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
