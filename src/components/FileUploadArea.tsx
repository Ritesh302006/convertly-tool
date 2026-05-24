import React from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FileUploadAreaProps = Partial<DropzoneOptions> & {
  label?: string;
  className?: string;
};

export function FileUploadArea({ label = 'Drag & drop files here, or click to select', className, ...dropzoneOptions }: FileUploadAreaProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions as DropzoneOptions);

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ease-in-out group",
        "bg-white dark:bg-slate-900/50 backdrop-blur-sm",
        isDragActive 
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] scale-[1.02]" 
          : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
        <div className={cn(
            "p-5 mb-4 rounded-full transition-all duration-300",
            isDragActive ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 scale-110" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:scale-110"
        )}>
          <UploadCloud className="w-10 h-10" />
        </div>
        <p className="text-base md:text-lg font-semibold text-slate-700 dark:text-slate-300">
          {isDragActive ? "Drop the files here..." : label}
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Browser-based processing • No server upload
        </p>
      </div>
    </div>
  );
}

