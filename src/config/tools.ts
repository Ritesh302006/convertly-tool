import { 
  FileImage, 
  FileText, 
  Image as ImageIcon, 
  Files, 
  Split, 
  Minimize2, 
  Crop
} from 'lucide-react';

export const tools = [
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert between popular image formats safely in your app.',
    icon: ImageIcon,
    path: '/image-converter',
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-100 dark:bg-pink-900/30'
  },
  {
    id: 'zip-creator',
    name: 'ZIP Creator',
    description: 'Upload multiple files and compress them into a ZIP archive easily.',
    icon: Files,
    path: '/zip-creator',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-100 dark:bg-teal-900/30'
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'Convert JPG, PNG, WEBP images to PDF. Rearrange and adjust page settings.',
    icon: FileImage,
    path: '/image-to-pdf',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/30'
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Reduce image file size with adjustable quality slider while keeping resolution.',
    icon: Minimize2,
    path: '/compress-image',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30'
  },
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor',
    description: 'Optimize structural data of PDF files to reduce file size without quality loss.',
    icon: FileText,
    path: '/compress-pdf',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30'
  },
  {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    description: 'Extract pages from your PDF file and convert them into high-quality images.',
    icon: ImageIcon,
    path: '/pdf-to-image',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDFs into one unified document easily and quickly.',
    icon: Files,
    path: '/merge-pdf',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-100 dark:bg-indigo-900/30'
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Extract specific page ranges from a large PDF document into separate files.',
    icon: Split,
    path: '/split-pdf',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-100 dark:bg-violet-900/30'
  },
  {
    id: 'image-resize',
    name: 'Image Resize',
    description: 'Exact control over dimension width, height or percentage based scaling.',
    icon: Crop,
    path: '/resize-image',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-100 dark:bg-cyan-900/30'
  }
];
