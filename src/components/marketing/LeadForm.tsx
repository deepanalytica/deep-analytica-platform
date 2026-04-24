'use client';

import { useState } from 'react';
import { submitLead } from '@/app/actions/lead';

export function LeadForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function action(formData: FormData) {
    setStatus('loading');
    setErrors({});
    
    const result = await submitLead(formData);
    
    if (!result.success && result.errors) {
      setErrors(result.errors);
      setStatus('idle');
    } else {
      setStatus('success');
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-success-100 border border-success-500 rounded-md p-4 text-success-500 font-sans text-sm">
        <strong className="block mb-1">¡Solicitud recibida!</strong>
        En menos de 48h te enviaremos una propuesta.
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1">
        <input 
          type="email" 
          name="email" 
          placeholder="tu@empresa.com" 
          className="bg-bg text-fg-1 border border-border-2 focus:border-accent outline-none rounded-md px-3 py-2 text-sm font-sans placeholder:text-fg-4 transition-colors"
          required
        />
        {errors.email && <span className="text-danger-500 text-xs">{errors.email[0]}</span>}
      </div>
      
      <div className="flex flex-col gap-1">
        <textarea 
          name="problem" 
          placeholder="Cuéntanos el problema en 3 líneas..." 
          rows={3}
          className="bg-bg text-fg-1 border border-border-2 focus:border-accent outline-none rounded-md px-3 py-2 text-sm font-sans placeholder:text-fg-4 transition-colors resize-none"
          required
        />
        {errors.problem && <span className="text-danger-500 text-xs">{errors.problem[0]}</span>}
      </div>

      <button 
        type="submit" 
        disabled={status === 'loading'}
        className="font-sans text-[14px] font-semibold rounded-md px-4 py-2.5 cursor-pointer border border-transparent bg-brand-cyan text-brand-cyan-ink transition-all duration-180 ease-out flex justify-center items-center gap-2 hover:bg-c-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Enviando...' : 'Solicita una demo'}
      </button>
    </form>
  );
}
