'use server';

import { z } from 'zod';

const leadSchema = z.object({
  email: z.string().email('Email inválido').min(5).max(100),
  problem: z.string().min(10, 'El problema debe tener al menos 10 caracteres').max(500, 'Máximo 500 caracteres'),
});

export async function submitLead(formData: FormData) {
  const email = formData.get('email');
  const problem = formData.get('problem');

  // Validación y Sanitización (Zod)
  const result = leadSchema.safeParse({ email, problem });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email: safeEmail, problem: safeProblem } = result.data;

  // TODO: Guardar `safeEmail` y `safeProblem` en Supabase/BD
  console.log('Lead Validado y Sanitizado:', { safeEmail, safeProblem });

  // Simular retraso de red
  await new Promise(resolve => setTimeout(resolve, 1000));

  return { success: true };
}
