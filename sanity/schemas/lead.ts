import { defineType, defineField } from 'sanity'

export const leadSchema = defineType({
  name: 'lead',
  title: 'Leads',
  type: 'document',
  fields: [
    defineField({
      name: 'phone',
      type: 'string',
      title: 'Phone Number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'source',
      type: 'string',
      title: 'Source',
      description: 'Where the lead came from e.g. contact-form, brand-anupam, product-wellness-spa',
    }),
    defineField({
      name: 'whatsappOptIn',
      type: 'boolean',
      title: 'WhatsApp Opt-in',
      description: 'Customer agreed to receive WhatsApp updates',
      initialValue: false,
    }),
    defineField({
      name: 'submittedAt',
      type: 'datetime',
      title: 'Submitted At',
    }),
    defineField({
      name: 'name',
      type: 'string',
      title: 'Name',
      description: 'Provided via optional enrichment form after phone submission',
    }),
    defineField({
      name: 'email',
      type: 'string',
      title: 'Email',
      description: 'Provided via optional enrichment form after phone submission',
    }),
    defineField({
      name: 'productInterest',
      type: 'string',
      title: 'Product Interest',
      description: 'Category the customer is interested in',
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
  ],
  orderings: [
    {
      name: 'newestFirst',
      title: 'Newest First',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'phone', subtitle: 'name' },
  },
})
