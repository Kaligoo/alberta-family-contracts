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
    requiresData: true,
    linkTo: null // Will be dynamic based on contract ID
  },
  {
    id: 'purchase',
    title: 'Purchase',
    description: 'Complete payment',
    icon: ShoppingCart,
    paths: [],
    requiresContract: true,
    requiresData: true,
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
    linkTo: '/dashboard/send-to-lawyer'
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
    if (step.requiresData && (!contract?.userFullName || !contract?.partnerFullName)) return 'disabled';
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
          targetUrl = `/dashboard/contracts/${contractId}/preview#purchase`;
          break;
        case 'download':
          targetUrl = `/dashboard/contracts/${contractId}/download`;
          break;
      }
    }
    
    // If we still don't have a target URL but need to go to a contract-specific page,
    // and we have contract data but no contractId (test data scenario),
    // redirect to edit-contract to save first
    if (!targetUrl && !contractId && contract && (step.id === 'preview' || step.id === 'purchase' || step.id === 'download')) {
      // Store the intended step in sessionStorage so we can redirect after save
      sessionStorage.setItem('pendingStepNavigation', step.id);
      // Show alert and redirect to edit contract to save first
      alert('Please save your contract first to access this step.');
      router.push('/dashboard/edit-contract');
      return;
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
                  {step.title}
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
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}