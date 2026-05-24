import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';

// Placeholder imports pending creation
import { ImageToPdf } from './pages/tools/ImageToPdf';
import { ImageCompressor } from './pages/tools/ImageCompressor';
import { PdfCompressor } from './pages/tools/PdfCompressor';
import { PdfToImage } from './pages/tools/PdfToImage';
import { MergePdf } from './pages/tools/MergePdf';
import { SplitPdf } from './pages/tools/SplitPdf';
import { ImageResize } from './pages/tools/ImageResize';
import { ZipCreator } from './pages/tools/ZipCreator';
import { ImageConverter } from './pages/tools/ImageConverter';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/image-to-pdf" element={<ImageToPdf />} />
        <Route path="/compress-image" element={<ImageCompressor />} />
        <Route path="/compress-pdf" element={<PdfCompressor />} />
        <Route path="/pdf-to-image" element={<PdfToImage />} />
        <Route path="/merge-pdf" element={<MergePdf />} />
        <Route path="/split-pdf" element={<SplitPdf />} />
        <Route path="/resize-image" element={<ImageResize />} />
        <Route path="/zip-creator" element={<ZipCreator />} />
        <Route path="/image-converter" element={<ImageConverter />} />
      </Routes>
    </Layout>
  );
}
