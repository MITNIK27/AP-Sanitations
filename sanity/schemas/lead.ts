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
  ],
  orderings: [
    {
      name: 'newestFirst',
      title: 'Newest First',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'phone', subtitle: 'source' },
  },
})
