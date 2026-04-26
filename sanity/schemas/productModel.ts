import { defineType, defineField } from 'sanity'

export const productModelSchema = defineType({
  name: 'productModel',
  title: 'Product Models',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Model Name',
      description: 'e.g. "Anupam Whirlpool Bathtub AW-2000"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'brand',
      type: 'reference',
      title: 'Brand',
      to: [{ type: 'brand' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Product Category',
      options: {
        list: [
          { title: 'Wellness & Spa', value: 'wellness-spa' },
          { title: 'Pure Life (Water Purifiers)', value: 'pure-life' },
          { title: 'Kitchen Harmony', value: 'kitchen-harmony' },
          { title: 'Swimming Pool Systems', value: 'swimming-pool' },
          { title: 'Invisible Infrastructure', value: 'invisible-infrastructure' },
          { title: 'Shower Systems', value: 'shower-systems' },
          { title: 'Bathroom Faucets', value: 'bathroom-faucets' },
          { title: 'Bathtubs', value: 'bathtubs' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subCategory',
      type: 'string',
      title: 'Sub-Category',
      description: 'e.g. "Multifunction Shower", "Body Jets", "Whirlpool Bath"',
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Product Image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      title: 'Product Gallery',
      description: 'Additional product images — shown in a carousel on the detail page',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'documents',
      type: 'array',
      title: 'Downloadable Documents',
      description: 'User manuals, installation guides, technical drawings, etc.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', title: 'Label', description: 'e.g. "User Manual", "Technical Drawing"' }),
            defineField({ name: 'file', type: 'file', title: 'PDF File', options: { accept: 'application/pdf' } }),
          ],
          preview: { select: { title: 'label' } },
        },
      ],
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Short Description',
      rows: 3,
    }),
    defineField({
      name: 'features',
      type: 'array',
      title: 'Key Features',
      of: [{ type: 'string' }],
      description: 'e.g. "Hydrotherapy jets", "Chromotherapy lighting"',
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Display Order',
      description: 'Lower number = shown first within the category',
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
    select: { title: 'name', subtitle: 'category', media: 'image' },
  },
})
