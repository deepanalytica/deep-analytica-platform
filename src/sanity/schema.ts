import type { Rule } from 'sanity';

export const post = {
  name: 'post',
  title: 'Artículo de Blog',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (rule: Rule) => rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule: Rule) => rule.required(),
    },
    {
      name: 'author',
      title: 'Autor',
      type: 'string',
    },
    {
      name: 'mainImage',
      title: 'Imagen Principal',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'publishedAt',
      title: 'Fecha de Publicación',
      type: 'datetime',
    },
    {
      name: 'body',
      title: 'Cuerpo del Artículo',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
};

export const schemaTypes = [post];
