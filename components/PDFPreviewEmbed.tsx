'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Download, AlertCircle } from 'lucide-react';

interface PDFPreviewEmbedProps {
  contractId: string;
  className?: string;
  showDownloadPrompt?: boolean;
}

export function PDFPreviewEmbed({ 
  contractId, 
  className = '',
  showDownloadPrompt = true 
}: PDFPreviewEmbedProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleLoadPreview = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/contracts/${contractId}/pdf-preview`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
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

  const handlePurchase = () => {
    // Navigate to purchase flow
    window.location.href = `/dashboard/contracts/${contractId}/preview#purchase`;
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

  if (!previewUrl) {
    return (
      <div className={`border border-gray-200 rounded-lg p-6 bg-gray-50 ${className}`}>
        <div className="text-center">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Contract Preview</h3>
          <p className="text-gray-600 mb-6">
            See how your professional cohabitation agreement will look before purchasing.
            Preview includes the first 3 pages with watermarks.
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
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Preview Header */}
      <div className="bg-orange-50 border-b border-orange-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-orange-800">Contract Preview</h3>
            <p className="text-xs text-orange-600">First 3 pages • Watermarked preview</p>
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

      {/* PDF Embed */}
      <div className="relative">
        <iframe
          src={previewUrl}
          className="w-full h-96 border-0"
          title="Contract Preview"
          loading="lazy"
        />
        
        {/* Overlay for mobile/unsupported browsers */}
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center md:hidden">
          <div className="text-center p-4">
            <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-4">PDF preview not supported on mobile</p>
            <a 
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Preview
            </a>
          </div>
        </div>
      </div>

      {/* Call to Action Footer */}
      {showDownloadPrompt && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              This is a watermarked preview showing the first 3 pages of your professional agreement.
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

export default PDFPreviewEmbed;