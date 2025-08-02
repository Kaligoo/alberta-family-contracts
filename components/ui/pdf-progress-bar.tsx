'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, FileText, CheckCircle } from 'lucide-react';

interface PdfProgressBarProps {
  contractId: string;
  isGenerating: boolean;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function PdfProgressBar({ 
  contractId, 
  isGenerating, 
  onComplete, 
  onError 
}: PdfProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Initializing...');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      setStage('Ready');
      setCompleted(false);
      return;
    }

    let pollInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const pollProgress = async () => {
      try {
        const response = await fetch(`/api/contracts/${contractId}/pdf-progress`);
        if (response.ok) {
          const data = await response.json();
          setProgress(data.progress);
          setStage(data.stage);
          
          if (data.completed) {
            setCompleted(true);
            clearInterval(pollInterval);
            clearTimeout(timeoutId);
            if (onComplete) {
              setTimeout(onComplete, 500); // Small delay to show completion
            }
          }
        }
      } catch (error) {
        console.error('Error polling PDF progress:', error);
      }
    };

    // Start polling every 500ms
    pollInterval = setInterval(pollProgress, 500);

    // Timeout after 30 seconds
    timeoutId = setTimeout(() => {
      clearInterval(pollInterval);
      if (onError) {
        onError('PDF generation timed out. Please try again.');
      }
    }, 30000);

    // Initial poll
    pollProgress();

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeoutId);
    };
  }, [contractId, isGenerating, onComplete, onError]);

  if (!isGenerating && !completed) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {completed ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        )}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              {completed ? 'PDF Generated Successfully!' : 'Generating PDF...'}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
      
      <div className="text-xs text-gray-500 flex items-center gap-2">
        <FileText className="h-3 w-3" />
        {stage}
      </div>
      
      {completed && (
        <div className="text-xs text-green-600">
          Your PDF is ready!
        </div>
      )}
    </div>
  );
}