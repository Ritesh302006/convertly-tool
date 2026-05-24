import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Download, File, X, Trash2, Files } from 'lucide-react';
import { FileUploadArea } from '@/components/FileUploadArea';
import { formatBytes } from '@/lib/utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

interface ZipFileItem {
  id: string;
  file: File;
}

export function ZipCreator() {
  const [files, setFiles] = useState<ZipFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zipName, setZipName] = useState('archive');
  const [progress, setProgress] = useState(0);

  const handleFilesDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    setProgress(0);
  };

  const createZip = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const zip = new JSZip();
      
      files.forEach(f => {
        zip.file(f.file.name, f.file);
      });
      
      const content = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6
        }
      }, (metadata) => {
        setProgress(Math.round(metadata.percent));
      });
      
      const finalName = zipName.trim() ? (zipName.endsWith('.zip') ? zipName : `${zipName}.zip`) : 'archive.zip';
      saveAs(content, finalName);
      toast.success('ZIP file created successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create ZIP file. Some files might be corrupted.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 dark:text-slate-400 dark:hover:text-slate-50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">ZIP Creator</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Compress multiple files into a single ZIP archive instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <FileUploadArea 
            onDrop={handleFilesDrop} 
            accept={{}} 
            label="Drop files, images or documents here"
            multiple={true}
          />

          {files.length > 0 && (
            <div className="space-y-4">
               <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 dark:border-slate-800 pb-2">
                 <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 dark:text-slate-200">Selected Files ({files.length})</h3>
                 <button onClick={clearAll} className="text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700">Clear All</button>
               </div>
               
               <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                 {files.map((item) => (
                   <div key={item.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all">
                     <div className="w-10 h-10 flex shrink-0 items-center justify-center bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl shadow-inner">
                       <File className="w-5 h-5" />
                     </div>
                     <div className="flex-1 truncate">
                       <p className="font-bold text-sm truncate text-slate-800 dark:text-slate-200">{item.file.name}</p>
                       <p className="text-xs text-slate-500 font-medium">{formatBytes(item.file.size)}</p>
                     </div>
                     <button onClick={() => removeFile(item.id)} className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-500 transition-colors shrink-0">
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">ZIP Settings</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300">ZIP File Name</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text"
                    value={zipName}
                    onChange={(e) => setZipName(e.target.value)}
                    placeholder="archive"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-shadow dark:text-slate-100 text-slate-900 font-medium"
                  />
                  <span className="text-slate-500 font-mono text-sm font-bold">.zip</span>
                </div>
              </div>
              
              <div className="pt-4 space-y-3 font-medium">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Total Files:</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">{files.length}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Total Size (Uncompressed):</span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold">{formatBytes(files.reduce((acc, curr) => acc + curr.file.size, 0))}</span>
                </div>
              </div>
            </div>

            {isProcessing && progress > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                  <span>Compressing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                   <div 
                     className="bg-teal-500 h-full transition-all duration-300 ease-out"
                     style={{ width: `${progress}%` }}
                   />
                </div>
              </div>
            )}

            <button
               onClick={createZip}
               disabled={files.length === 0 || isProcessing}
               className="mt-6 w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-slate-950 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:hover:shadow-none hover:-translate-y-0.5 disabled:hover:translate-y-0"
             >
               {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Files className="w-5 h-5" />}
               {isProcessing ? 'Creating ZIP...' : 'Create ZIP File'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
