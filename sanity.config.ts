import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { brandSchema } from './sanity/schemas/brand'
import { productSchema } from './sanity/schemas/product'
import { leadSchema } from './sanity/schemas/lead'
import { productModelSchema } from './sanity/schemas/productModel'

export default defineConfig({
  name: 'ap-sanitations',
  title: 'AP Sanitations',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  basePath: '/studio',
  plugins: [structureTool()],
  schema: {
    types: [brandSchema, productSchema, productModelSchema, leadSchema],
  },
})
