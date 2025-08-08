'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface EmailProgressBarProps {
  isEmailSending: boolean;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function EmailProgressBar({ 
  isEmailSending, 
  onComplete, 
  onError 
}: EmailProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Preparing...');
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEmailSending) {
      setProgress(0);
      setStage('Ready');
      setCompleted(false);
      setError(null);
      return;
    }

    // Simulate the email sending process stages
    const stages = [
      { progress: 10, stage: 'Generating Word document...', delay: 300 },
      { progress: 30, stage: 'Creating PDF document...', delay: 800 },
      { progress: 50, stage: 'Preparing email templates...', delay: 500 },
      { progress: 70, stage: 'Sending email to user\'s lawyer...', delay: 1000 },
      { progress: 90, stage: 'Sending email to partner\'s lawyer...', delay: 800 },
      { progress: 100, stage: 'Emails sent successfully!', delay: 500 }
    ];

    let currentStageIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const runNextStage = () => {
      if (currentStageIndex < stages.length) {
        const currentStage = stages[currentStageIndex];
        setProgress(currentStage.progress);
        setStage(currentStage.stage);

        if (currentStage.progress === 100) {
          setCompleted(true);
          if (onComplete) {
            setTimeout(onComplete, 500);
          }
        } else {
          timeoutId = setTimeout(() => {
            currentStageIndex++;
            runNextStage();
          }, currentStage.delay);
        }
      }
    };

    // Start the simulation
    runNextStage();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isEmailSending, onComplete, onError]);

  if (!isEmailSending && !completed && !error) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {completed ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : error ? (
          <AlertCircle className="h-5 w-5 text-red-600" />
        ) : (
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        )}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              {completed ? 'Emails Sent Successfully!' : error ? 'Email Error' : 'Sending Emails to Lawyers...'}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
      
      <div className="text-xs text-gray-500 flex items-center gap-2">
        <Mail className="h-3 w-3" />
        {stage}
      </div>
      
      {completed && (
        <div className="text-xs text-green-600">
          Both lawyers will contact you to schedule consultations.
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}