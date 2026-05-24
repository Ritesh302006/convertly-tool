import React, { useState } from 'react';
import { FileUploadArea } from '@/components/FileUploadArea';
import { formatBytes } from '@/lib/utils';
import { ArrowLeft, Download, RefreshCw, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

const convertWEBPtoPNG = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Failed to get canvas context'));
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Conversion to blob failed'));
      }, 'image/png');
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export function ImageToPdf() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Fit'>('Fit');
  const [orientation, setOrientation] = useState<'Portrait' | 'Landscape'>('Portrait');
  const [margin, setMargin] = useState<number>(0);

  const onDrop = (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index - 1];
    newImages[index - 1] = temp;
    setImages(newImages);
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index + 1];
    newImages[index + 1] = temp;
    setImages(newImages);
  };

  const createPDF = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    const toastId = toast.loading('Generating PDF...');

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of images) {
        let fileObj: File | Blob = item.file;
        let fileType = item.file.type;

        // Convert webp to downscaled png automatically since pdf-lib does not support webp
        if (fileType === 'image/webp') {
          fileObj = await convertWEBPtoPNG(item.file);
          fileType = 'image/png';
        }

        const imageBytes = await fileObj.arrayBuffer();
        let pdfImage;
        
        if (fileType === 'image/png') {
          pdfImage = await pdfDoc.embedPng(imageBytes);
        } else if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
          pdfImage = await pdfDoc.embedJpg(imageBytes);
        } else {
          // Attempt as PNG fallback
          pdfImage = await pdfDoc.embedPng(imageBytes);
        }

        let pageDims = { width: pdfImage.width, height: pdfImage.height };
        
        if (pageSize === 'A4') {
          pageDims = { width: 595.28, height: 841.89 }; // A4 dimensions at 72 PPI
        } else if (pageSize === 'Letter') {
          pageDims = { width: 612, height: 792 };
        }

        if (pageSize !== 'Fit' && orientation === 'Landscape') {
          pageDims = { width: pageDims.height, height: pageDims.width };
        }

        const page = pdfDoc.addPage([pageDims.width, pageDims.height]);
        
        // Calculate dimensions to fit/fill
        const imgRatio = pdfImage.width / pdfImage.height;
        const pageRatio = (pageDims.width - margin*2) / (pageDims.height - margin*2);
        
        let drawWidth = pageDims.width - margin*2;
        let drawHeight = pageDims.height - margin*2;

        if (pageSize !== 'Fit') {
           if (imgRatio > pageRatio) {
             drawHeight = drawWidth / imgRatio;
           } else {
             drawWidth = drawHeight * imgRatio;
           }
        }

        page.drawImage(pdfImage, {
          x: (pageDims.width - drawWidth) / 2,
          y: (pageDims.height - drawHeight) / 2,
          width: drawWidth,
          height: drawHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, 'Converted_Images.pdf');
      toast.success('PDF Generated successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create PDF. Ensure images are valid JPG/PNG/WEBP.', { id: toastId });
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Image to PDF</h1>
          <p className="text-slate-500 mt-1">Convert and arrange multiple images into a single PDF document.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <FileUploadArea 
            onDrop={onDrop} 
            accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }} 
            label="Drag & drop JPG, PNG, WEBP images here"
          />

          {images.length > 0 && (
            <div className="space-y-4">
               <h3 className="font-semibold text-lg">Rearrange Images ({images.length})</h3>
               <div className="space-y-3">
                 {images.map((img, idx) => (
                   <div key={img.id} className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                     <img src={img.preview} alt="preview" className="w-16 h-16 object-cover rounded-xl border border-slate-100" />
                     <div className="flex-1 truncate">
                       <p className="font-semibold text-sm truncate text-slate-800 dark:text-slate-200">{img.file.name}</p>
                       <p className="text-xs text-slate-500 font-medium">{formatBytes(img.file.size)}</p>
                     </div>
                     <div className="flex items-center gap-1">
                       <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 transition-colors">
                         <ArrowUp className="w-4 h-4" />
                       </button>
                       <button onClick={() => moveDown(idx)} disabled={idx === images.length - 1} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 transition-colors">
                         <ArrowDown className="w-4 h-4" />
                       </button>
                       <button onClick={() => removeImage(img.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors ml-2">
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
            <h3 className="text-lg font-bold border-b border-slate-100 pb-3 mb-4">Settings</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Page Size</label>
                <select 
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow"
                >
                  <option value="Fit">Fit to Image</option>
                  <option value="A4">A4 Document</option>
                  <option value="Letter">US Letter</option>
                </select>
              </div>

              {pageSize !== 'Fit' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Orientation</label>
                  <select 
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow"
                  >
                    <option value="Portrait">Portrait</option>
                    <option value="Landscape">Landscape</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Margin (px)</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow"
                />
              </div>
            </div>

            <button
               onClick={createPDF}
               disabled={images.length === 0 || isProcessing}
               className="mt-6 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-slate-950 font-semibold rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:hover:shadow-none hover:-translate-y-0.5 disabled:hover:translate-y-0"
             >
               {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
               {isProcessing ? 'Processing...' : 'Download PDF'}
             </button>
            {images.length > 0 && (
              <button
                onClick={() => setImages([])}
                className="mt-3 w-full py-2 px-4 bg-transparent hover:bg-slate-50 text-slate-500 font-medium rounded-xl transition-colors"
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
