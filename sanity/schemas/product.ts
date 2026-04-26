import { defineType, defineField } from 'sanity'

export const productSchema = defineType({
  name: 'product',
  title: 'Product Category',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      type: 'slug',
      title: 'ID (slug)',
      description: 'Unique identifier, e.g. "wellness-spa"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Display Order',
      description: '1 = first card in bento grid',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'number',
      type: 'string',
      title: 'Display Number',
      description: 'e.g. "01", "02"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Category Label',
      description: 'Short label shown above the title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bg',
      type: 'string',
      title: 'Background Tailwind Class',
      description: 'e.g. "bg-teal", "bg-charcoal", "bg-pool"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'text',
      type: 'string',
      title: 'Text Tailwind Class',
      description: 'e.g. "text-cream", "text-charcoal"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'border',
      type: 'string',
      title: 'Border Tailwind Class',
      description: 'e.g. "border-gold", "border-teal"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'gridCols',
      type: 'string',
      title: 'Grid Column Span',
      description: 'e.g. "md:col-span-2", "md:col-span-1"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'gridRows',
      type: 'string',
      title: 'Grid Row Span',
      description: 'e.g. "md:row-span-2", "md:row-span-1"',
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      name: 'orderAsc',
      title: 'Display Order',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'category' },
  },
})
