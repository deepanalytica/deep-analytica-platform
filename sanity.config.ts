import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { schemaTypes } from './src/sanity/schema';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "tu_project_id_aqui";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  basePath: '/studio', // La ruta donde vivirá el CMS dentro de Next.js
  projectId,
  dataset,
  title: 'Deep Analytica CMS',
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
});
