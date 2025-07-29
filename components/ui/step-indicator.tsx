import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: {
    id: string;
    name: string;
    href?: string;
  }[];
  currentStep: string;
  completedSteps: string[];
}

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-center space-x-4 md:space-x-8">
        {steps.map((step, stepIdx) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          
          return (
            <li key={step.name} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : isCurrent
                      ? 'border-orange-500 bg-white text-orange-500'
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{stepIdx + 1}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent
                        ? 'text-orange-600'
                        : isCompleted
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </p>
                </div>
              </div>
              {stepIdx < steps.length - 1 && (
                <div
                  className={`ml-4 h-0.5 w-12 md:w-20 ${
                    isCompleted || completedSteps.includes(steps[stepIdx + 1].id)
                      ? 'bg-orange-500'
                      : 'bg-gray-300'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}