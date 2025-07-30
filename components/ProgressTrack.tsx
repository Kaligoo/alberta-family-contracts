'use client';

import { usePathname } from 'next/navigation';
import { Check, Circle, Eye, Edit, ShoppingCart, Download, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressTrackProps {
  contractId?: string | null;
  contract?: any;
  className?: string;
}

const steps = [
  {
    id: 'get-started',
    title: 'Choose Agreement',
    description: 'Select agreement type',
    icon: Circle,
    paths: ['/dashboard/get-started']
  },
  {
    id: 'edit',
    title: 'Fill Details',
    description: 'Complete your information',
    icon: Edit,
    paths: ['/dashboard', '/dashboard/contracts/'],
    requiresContract: true
  },
  {
    id: 'preview',
    title: 'Preview & Review',
    description: 'Check your agreement',
    icon: Eye,
    paths: ['/dashboard/contracts/*/preview'],
    requiresContract: true,
    requiresData: true
  },
  {
    id: 'purchase',
    title: 'Purchase',
    description: 'Complete payment',
    icon: ShoppingCart,
    paths: [],
    requiresContract: true,
    requiresData: true
  },
  {
    id: 'download',
    title: 'Download',
    description: 'Get your PDF',
    icon: Download,
    paths: ['/dashboard/contracts/*/download'],
    requiresContract: true,
    requiresPurchase: true
  },
  {
    id: 'send-lawyer',
    title: 'Send to Lawyer',
    description: 'Professional review',
    icon: Send,
    paths: ['/dashboard/send-to-lawyer'],
    requiresContract: true,
    requiresPurchase: true
  }
];

export function ProgressTrack({ contractId, contract, className }: ProgressTrackProps) {
  const pathname = usePathname();

  const getCurrentStep = () => {
    // Check which step matches current path
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const isMatch = step.paths.some(path => {
        if (path.includes('*')) {
          const regex = new RegExp(path.replace('*', '\\d+'));
          return regex.test(pathname);
        }
        return pathname === path || pathname.startsWith(path);
      });
      
      if (isMatch) {
        return i;
      }
    }
    
    // Default logic based on what exists
    if (!contractId) return 0; // Get Started
    if (!contract?.userFullName || !contract?.partnerFullName) return 1; // Edit
    if (pathname.includes('/preview')) return 2; // Preview
    return 1; // Default to edit
  };

  const currentStepIndex = getCurrentStep();
  
  const getStepStatus = (index: number) => {
    const step = steps[index];
    
    // Check if step requirements are met
    if (step.requiresContract && !contractId) return 'disabled';
    if (step.requiresData && (!contract?.userFullName || !contract?.partnerFullName)) return 'disabled';
    if (step.requiresPurchase && !contract?.isPaid) return 'disabled';
    
    // Determine status based on current position
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    if (index === currentStepIndex + 1) return 'next';
    return 'upcoming';
  };

  return (
    <div className={cn("px-3 py-4", className)}>
      <div className="mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Your Progress
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Step {currentStepIndex + 1} of {steps.length}
        </p>
      </div>
      
      <div className="space-y-3">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const IconComponent = step.icon;
          
          return (
            <div key={step.id} className="flex items-start space-x-3">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                    {
                      'bg-green-500 border-green-500 text-white': status === 'completed',
                      'bg-orange-500 border-orange-500 text-white': status === 'current',
                      'bg-orange-100 border-orange-300 text-orange-600': status === 'next',
                      'bg-gray-100 border-gray-300 text-gray-400': status === 'upcoming' || status === 'disabled'
                    }
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <IconComponent className="w-4 h-4" />
                  )}
                </div>
                
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-6 mt-2 transition-colors",
                      {
                        'bg-green-300': index < currentStepIndex,
                        'bg-orange-300': index === currentStepIndex,
                        'bg-gray-200': index > currentStepIndex
                      }
                    )}
                  />
                )}
              </div>
              
              {/* Step content */}
              <div className="flex-1 min-w-0 pb-4">
                <div
                  className={cn(
                    "text-sm font-medium transition-colors",
                    {
                      'text-green-600': status === 'completed',
                      'text-orange-600': status === 'current',
                      'text-gray-900': status === 'next',
                      'text-gray-400': status === 'upcoming' || status === 'disabled'
                    }
                  )}
                >
                  {step.title}
                </div>
                <div
                  className={cn(
                    "text-xs transition-colors",
                    {
                      'text-green-500': status === 'completed',
                      'text-orange-500': status === 'current',
                      'text-gray-600': status === 'next',
                      'text-gray-400': status === 'upcoming' || status === 'disabled'
                    }
                  )}
                >
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Progress bar */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}