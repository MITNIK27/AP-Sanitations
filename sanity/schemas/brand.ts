import { defineType, defineField } from 'sanity'

export const brandSchema = defineType({
  name: 'brand',
  title: 'Brand',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      type: 'slug',
      title: 'ID (slug)',
      description: 'Unique identifier, e.g. "anupam", "woven-gold"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Display Order',
      description: '1 = first in the brand strip',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      type: 'string',
      title: 'Brand Name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      type: 'string',
      title: 'Tagline',
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
      name: 'layout',
      type: 'string',
      title: 'Strip Layout',
      options: {
        list: [
          { title: 'Image Left, Text Right', value: 'image-left' },
          { title: 'Image Right, Text Left', value: 'image-right' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Brand Image',
      description: 'Main product/brand photo',
      options: { hotspot: true },
    }),
    defineField({
      name: 'objectFit',
      type: 'string',
      title: 'Image Fit',
      description: 'cover = crop to fill; contain = show whole image',
      options: {
        list: [
          { title: 'Cover (crop to fill)', value: 'cover' },
          { title: 'Contain (show whole)', value: 'contain' },
        ],
        layout: 'radio',
      },
      initialValue: 'cover',
    }),
    defineField({
      name: 'video',
      type: 'file',
      title: 'Brand Video (mp4)',
      description: 'If provided, shown instead of image',
      options: { accept: 'video/mp4' },
    }),
    defineField({
      name: 'videoPoster',
      type: 'image',
      title: 'Video Poster Frame',
      description: 'Shown while video loads',
      options: { hotspot: true },
    }),
    defineField({
      name: 'imageAlt',
      type: 'string',
      title: 'Image Alt Text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'placeholderGradient',
      type: 'string',
      title: 'Placeholder Gradient CSS',
      description: 'Shown when no image or video is uploaded. E.g. linear-gradient(135deg, #3D6B65 0%, #2A4D49 100%)',
    }),
    defineField({
      name: 'categories',
      type: 'array',
      title: 'Product Categories',
      description: 'Which category pages should list this brand. Edit here — no code deploy needed.',
      of: [{ type: 'string' }],
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
      },
    }),
    defineField({
      name: 'catalogue',
      type: 'file',
      title: 'Catalogue PDF',
      description: 'Upload the brand product catalogue PDF here',
      options: { accept: 'application/pdf' },
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      title: 'Product Gallery',
      description: 'Additional product photos shown on the brand detail page',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'catalogues',
      type: 'array',
      title: 'Named Catalogues',
      description: 'Shower, bathtub, etc. — upload a PDF file OR paste an external URL',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', title: 'Label', description: 'e.g. "Shower System", "Bathtub Catalogue"' }),
            defineField({ name: 'file', type: 'file', title: 'PDF File (upload)', options: { accept: 'application/pdf' } }),
            defineField({ name: 'externalUrl', type: 'url', title: 'External PDF URL', description: 'Use if not uploading a file' }),
          ],
          preview: { select: { title: 'label' } },
        },
      ],
    }),
    defineField({
      name: 'hideFromBrands',
      title: 'Hide from brand partners listing',
      type: 'boolean',
      initialValue: false,
      description: 'Set true for supplier/utility brands that should not appear in the brands section on the homepage',
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
    select: { title: 'name', subtitle: 'tagline', media: 'image' },
  },
})
