import { createClient } from "next-sanity";

// Obtener las credenciales desde las variables de entorno de forma segura
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "tu_project_id_aqui";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-04-24";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // False para que el blog se mantenga actualizado al instante (ISR / Webhooks revalidate)
});
