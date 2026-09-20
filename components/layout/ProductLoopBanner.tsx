import React from 'react';
import { Ear, Brain, Wrench, FileText, BarChart2 } from 'lucide-react';

export const ProductLoopBanner: React.FC = () => {
  const steps = [
    { label: 'UNDERSTAND', icon: Ear, desc: 'Voice intent & entity extraction' },
    { label: 'DECIDE', icon: Brain, desc: 'Diagnostic logic & policy check' },
    { label: 'ACT', icon: Wrench, desc: 'Automated service ticket & action dispatch' },
    { label: 'RECORD', icon: FileText, desc: 'Full transcript, audit & CRM sync' },
    { label: 'MEASURE', icon: BarChart2, desc: 'Resolution rate & AI quality KPIs' },
  ];

  return (
    <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2.5 hidden md:block shadow-subtle">
      <div className="flex items-center justify-between text-xs max-w-7xl mx-auto">
        <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          Autonomous Service Loop
        </span>

        <div className="flex items-center gap-1 sm:gap-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.label}>
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200/60 text-slate-700"
                  title={step.desc}
                >
                  <Icon className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-semibold text-[11px] tracking-tight">{step.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <span className="text-slate-300 font-bold text-xs">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
