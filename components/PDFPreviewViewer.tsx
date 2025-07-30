'use client';

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Download, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFPreviewViewerProps {
  contractId: string;
  className?: string;
  showDownloadPrompt?: boolean;
  maxPages?: number;
}

export function PDFPreviewViewer({ 
  contractId, 
  className = '',
  showDownloadPrompt = true,
  maxPages = 3
}: PDFPreviewViewerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  const handleLoadPreview = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/contracts/${contractId}/pdf-preview`);
      
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        setPdfData(arrayBuffer);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load PDF preview');
      }
    } catch (error) {
      console.error('Error loading PDF preview:', error);
      setError('Failed to load PDF preview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(Math.min(numPages, maxPages));
    setCurrentPage(1);
  }, [maxPages]);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF document');
  }, []);

  const handlePurchase = () => {
    window.location.href = `/dashboard/contracts/${contractId}/preview#purchase`;
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(2.0, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  if (error) {
    return (
      <div className={`border border-red-200 rounded-lg p-6 bg-red-50 ${className}`}>
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Preview Unavailable</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button 
            onClick={handleLoadPreview}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!pdfData) {
    return (
      <div className={`border border-gray-200 rounded-lg p-6 bg-gray-50 ${className}`}>
        <div className="text-center">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Contract Preview</h3>
          <p className="text-gray-600 mb-6">
            See how your professional cohabitation agreement will look before purchasing.
            Preview includes the first {maxPages} pages with watermarks.
          </p>
          <Button 
            onClick={handleLoadPreview}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Preview...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Load PDF Preview
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${className}`}>
      {/* Preview Header */}
      <div className="bg-orange-50 border-b border-orange-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-orange-800">Contract Preview</h3>
            <p className="text-xs text-orange-600">
              First {maxPages} pages • Watermarked preview • Page {currentPage} of {numPages}
            </p>
          </div>
          {showDownloadPrompt && (
            <Button 
              onClick={handlePurchase}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Download className="mr-1 h-3 w-3" />
              Get Full PDF
            </Button>
          )}
        </div>
      </div>

      {/* PDF Controls */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              size="sm"
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              {currentPage} / {numPages}
            </span>
            <Button
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
              size="sm"
              variant="outline"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button onClick={zoomOut} size="sm" variant="outline">-</Button>
            <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
            <Button onClick={zoomIn} size="sm" variant="outline">+</Button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex justify-center bg-gray-100 p-4" style={{ minHeight: '600px' }}>
        <Document
          file={pdfData}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="ml-2 text-gray-600">Loading PDF...</span>
            </div>
          }
          error={
            <div className="flex items-center justify-center py-12 text-red-600">
              <AlertCircle className="h-8 w-8 mr-2" />
              <span>Failed to load PDF</span>
            </div>
          }
        >
          <div className="shadow-lg">
            <Page
              pageNumber={currentPage}
              scale={scale}
              loading={
                <div className="flex items-center justify-center py-12 bg-white border">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                </div>
              }
              error={
                <div className="flex items-center justify-center py-12 bg-white border text-red-600">
                  <AlertCircle className="h-6 w-6 mr-2" />
                  <span>Failed to load page</span>
                </div>
              }
            />
          </div>
        </Document>
      </div>

      {/* Watermark Notice */}
      <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-3">
        <div className="flex items-center justify-center">
          <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
          <p className="text-sm text-yellow-800">
            This is a watermarked preview. Purchase the complete agreement to get the full document without watermarks.
          </p>
        </div>
      </div>

      {/* Call to Action Footer */}
      {showDownloadPrompt && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Ready to get your complete professional cohabitation agreement?
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={handlePurchase}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Download className="mr-2 h-4 w-4" />
                Purchase Complete Agreement - $700 CAD
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = `/dashboard/contracts/${contractId}`}
              >
                Edit Contract
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PDFPreviewViewer;