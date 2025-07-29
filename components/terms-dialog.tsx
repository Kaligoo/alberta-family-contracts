'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, FileText, Check } from 'lucide-react';
import Link from 'next/link';

interface TermsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  contractId?: number;
  isLoading?: boolean;
}

export function TermsDialog({ isOpen, onClose, onAccept, contractId, isLoading = false }: TermsDialogProps) {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (hasReadTerms && agreedToTerms) {
      onAccept();
    }
  };

  const canProceed = hasReadTerms && agreedToTerms;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-orange-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Terms and Conditions</h2>
              <p className="text-sm text-gray-600">Please review and accept before proceeding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Important Legal Notice
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    This service provides document templates only and does not constitute legal advice. 
                    Independent legal advice is strongly recommended before executing any agreement.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Terms Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Key Terms Summary</h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <strong className="text-gray-900">Service:</strong> We provide cohabitation agreement templates and form completion tools only.
                </div>
                
                <div>
                  <strong className="text-gray-900">Legal Advice:</strong> We do not provide legal advice. You should consult with qualified Alberta family law lawyers.
                </div>
                
                <div>
                  <strong className="text-gray-900">Document Review:</strong> All generated documents should be reviewed by legal professionals before execution.
                </div>
                
                <div>
                  <strong className="text-gray-900">Privacy:</strong> Your personal information is protected and stored securely in accordance with Canadian privacy laws.
                </div>
                
                <div>
                  <strong className="text-gray-900">Payment:</strong> All fees are in Canadian dollars. Refunds may be available within 30 days if documents haven't been used.
                </div>
                
                <div>
                  <strong className="text-gray-900">Limitation:</strong> Our liability is limited to the extent permitted by law. Documents are provided "as is" without warranty.
                </div>
              </div>
            </div>

            {/* Full Terms Link */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">
                <strong>Complete Terms:</strong> Please read our full Terms and Conditions for complete details.
              </p>
              <Link 
                href="/terms" 
                target="_blank"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <FileText className="h-4 w-4 mr-1" />
                View Full Terms and Conditions
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 space-y-4">
          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasReadTerms}
                onChange={(e) => setHasReadTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">
                I have read and understand the Terms and Conditions, including the disclaimer that this service 
                provides templates only and not legal advice.
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">
                I agree to be bound by the Terms and Conditions and acknowledge the importance of 
                obtaining independent legal advice before executing any legal document.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!canProceed || isLoading}
              className={`${canProceed 
                ? 'bg-orange-500 hover:bg-orange-600' 
                : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Accept and Continue
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}