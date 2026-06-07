import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
}

const STEPS = [
  'Trip Details',
  'Select Vehicle',
  'Passenger Details',
  'Review Fare',
  'Confirmation'
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Small mobile indicator */}
      <div className="md:hidden flex items-center justify-between px-2 py-1">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
          Step {currentStep + 1} of 5
        </span>
        <span className="text-xs font-bold text-slate-800">
          {STEPS[currentStep]}
        </span>
      </div>

      {/* Desktop Indicator timeline */}
      <ol className="hidden md:flex items-center w-full text-center text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          
          return (
            <li 
              key={idx} 
              className={`flex items-center ${
                idx !== STEPS.length - 1 ? 'w-full' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border transition-all ${
                  isActive
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : isCompleted
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {idx + 1}
                </span>
                <span className={`text-[10px] whitespace-nowrap ${
                  isActive ? 'text-slate-900 font-bold' : isCompleted ? 'text-blue-600' : 'text-slate-400'
                }`}>
                  {step}
                </span>
              </div>
              
              {idx !== STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 transition-all ${
                  isCompleted ? 'bg-blue-500' : 'bg-slate-200/80'
                }`} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
