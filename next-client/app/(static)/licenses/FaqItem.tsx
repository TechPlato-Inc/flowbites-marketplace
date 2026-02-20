'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-5 text-left group"
      >
        <span className="font-semibold text-neutral-900 text-[15px] group-hover:text-primary-600 transition-colors pr-4">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="pb-5 -mt-1">
          <p className="text-neutral-600 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
