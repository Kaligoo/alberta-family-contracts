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
    <div className="mb-8 py-6 px-4 bg-gray-50 border border-gray-200 rounded-lg">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-center space-x-2 md:space-x-6">
          {steps.map((step, stepIdx) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            
            return (
              <li key={step.name} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      isCompleted
                        ? 'border-orange-500 bg-orange-500 text-white shadow-lg'
                        : isCurrent
                        ? 'border-orange-500 bg-white text-orange-600 shadow-md'
                        : 'border-gray-300 bg-white text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-bold">{stepIdx + 1}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-xs md:text-sm font-medium ${
                        isCurrent
                          ? 'text-orange-600 font-bold'
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
                    className={`mx-2 md:mx-4 h-0.5 w-8 md:w-16 ${
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
    </div>
  );
}