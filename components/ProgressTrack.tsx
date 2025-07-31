'use client';

import { usePathname, useRouter } from 'next/navigation';
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
    paths: ['/dashboard/get-started'],
    linkTo: '/dashboard/get-started'
  },
  {
    id: 'edit',
    title: 'Fill out Details',
    description: 'Complete your information',
    icon: Edit,
    paths: ['/dashboard/edit-contract', '/dashboard/contracts/'],
    requiresContract: true,
    linkTo: '/dashboard/edit-contract'
  },
  {
    id: 'preview',
    title: 'Preview & Review',
    description: 'Check your agreement',
    icon: Eye,
    paths: ['/dashboard/contracts/*/preview'],
    requiresContract: true,
    linkTo: null // Will be dynamic based on contract ID
  },
  {
    id: 'purchase',
    title: 'Purchase',
    description: 'Complete payment',
    icon: ShoppingCart,
    paths: ['/dashboard/contracts/*/purchase'],
    requiresContract: true,
    linkTo: null // Will be dynamic based on contract ID
  },
  {
    id: 'download',
    title: 'Download',
    description: 'Get your PDF',
    icon: Download,
    paths: ['/dashboard/contracts/*/download'],
    requiresContract: true,
    requiresPurchase: true,
    linkTo: null // Will be dynamic based on contract ID
  },
  {
    id: 'send-lawyer',
    title: 'Send to Lawyer',
    description: 'Professional review',
    icon: Send,
    paths: ['/dashboard/send-to-lawyer'],
    requiresContract: true,
    requiresPurchase: true,
    linkTo: null // Will be dynamic based on contract ID
  }
];

export function ProgressTrack({ contractId, contract, className }: ProgressTrackProps) {
  const pathname = usePathname();
  const router = useRouter();

  const getCurrentStep = () => {
    // Specific path-based detection (more reliable)
    if (pathname === '/dashboard/get-started') return 0;
    if (pathname === '/dashboard/edit-contract') return 1;
    if (pathname.includes('/preview')) return 2;
    if (pathname.includes('/purchase')) return 3;
    if (pathname.includes('/download')) return 4;
    if (pathname === '/dashboard/send-to-lawyer') return 5;
    
    // Check contract-specific routes with wildcard patterns
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const isMatch = step.paths.some(path => {
        if (path.includes('*')) {
          const regex = new RegExp(path.replace('*', '\\d+'));
          return regex.test(pathname);
        }
        return pathname === path;
      });
      
      if (isMatch) {
        return i;
      }
    }
    
    // Default logic based on contract state
    if (!contractId && !contract) return 0; // Get Started
    if (contractId || contract) return 1; // Edit - has contract
    return 0;
  };

  const currentStepIndex = getCurrentStep();
  
  const getStepStatus = (index: number) => {
    const step = steps[index];
    
    // Check if step requirements are met
    if (step.requiresContract && !contractId && !contract) return 'disabled';
    // Removed requiresData check - users can now preview even with incomplete data
    if (step.requiresPurchase && !contract?.isPaid) return 'disabled';
    
    // Determine status based on current position
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    if (index === currentStepIndex + 1) return 'next';
    return 'upcoming';
  };

  const handleStepClick = (step: typeof steps[0], index: number, status: string) => {
    if (status === 'disabled') return;
    
    let targetUrl = step.linkTo;
    
    // Handle dynamic URLs that depend on contract ID
    if (!targetUrl && contractId) {
      switch (step.id) {
        case 'preview':
          targetUrl = `/dashboard/contracts/${contractId}/preview`;
          break;
        case 'purchase':
          targetUrl = `/dashboard/contracts/${contractId}/purchase`;
          break;
        case 'download':
          targetUrl = `/dashboard/contracts/${contractId}/download`;
          break;
        case 'send-lawyer':
          targetUrl = `/dashboard/send-to-lawyer?contractId=${contractId}`;
          break;
      }
    }
    
    // If we don't have a contractId but have contract data, 
    // try to use the contract's ID if available, otherwise allow navigation anyway
    if (!targetUrl && !contractId && contract) {
      // Try to use contract.id if it exists
      const useContractId = contract.id;
      if (useContractId) {
        switch (step.id) {
          case 'preview':
            targetUrl = `/dashboard/contracts/${useContractId}/preview`;
            break;
          case 'purchase':
            targetUrl = `/dashboard/contracts/${useContractId}/purchase`;
            break;
          case 'download':
            targetUrl = `/dashboard/contracts/${useContractId}/download`;
            break;
          case 'send-lawyer':
            targetUrl = `/dashboard/send-to-lawyer?contractId=${useContractId}`;
            break;
        }
      }
      // If still no targetUrl, allow navigation to edit-contract without forcing save
      if (!targetUrl && step.id === 'preview') {
        // For preview, we can still show preview even without saving
        targetUrl = '/dashboard/edit-contract'; // Will show preview inline
      }
    }
    
    if (targetUrl) {
      router.push(targetUrl);
    }
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
                      'bg-blue-600 border-blue-600 text-white': status === 'current',
                      'bg-blue-100 border-blue-300 text-blue-600': status === 'next',
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
                        'bg-blue-300': index === currentStepIndex,
                        'bg-gray-200': index > currentStepIndex
                      }
                    )}
                  />
                )}
              </div>
              
              {/* Step content */}
              <div 
                className={cn(
                  "flex-1 min-w-0 pb-4 transition-colors",
                  {
                    'cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2': status !== 'disabled',
                    'cursor-not-allowed': status === 'disabled'
                  }
                )}
                onClick={() => handleStepClick(step, index, status)}
              >
                <div
                  className={cn(
                    "text-sm font-medium transition-colors",
                    {
                      'text-green-600': status === 'completed',
                      'text-blue-600': status === 'current',
                      'text-gray-900': status === 'next',
                      'text-gray-400': status === 'upcoming' || status === 'disabled'
                    }
                  )}
                >
                  {step.id === 'purchase' && (contract?.isPaid === 'true' || contract?.isPaid === true) ? (
                    <span className="flex items-center">
                      {step.title} <span className="ml-2 text-xs font-bold text-green-600">(PAID)</span>
                    </span>
                  ) : (
                    step.title
                  )}
                </div>
                <div
                  className={cn(
                    "text-xs transition-colors",
                    {
                      'text-green-500': status === 'completed',
                      'text-blue-500': status === 'current',
                      'text-gray-600': status === 'next',
                      'text-gray-400': status === 'upcoming' || status === 'disabled'
                    }
                  )}
                >
                  {step.id === 'purchase' && (contract?.isPaid === 'true' || contract?.isPaid === true) ? 'Already paid' : step.description}
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
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}