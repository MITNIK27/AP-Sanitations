// Sanity CMS is the source of truth for brand data.
// See sanity/schemas/brand.ts for the schema, sanity/lib/queries.ts for the GROQ query.

export interface Brand {
  id: string
  name: string
  tagline: string
  description: string
  /** CSS gradient value shown when no image/video is uploaded in Studio */
  placeholderGradient: string
  imageAlt: string
  layout: "image-left" | "image-right" | "full-image"
  imageSrc?: string
  videoSrc?: string
  videoPoster?: string
  objectFit?: "cover" | "contain"
  catalogueUrl?: string
  gallery?: string[]
  catalogues?: { label: string; url: string }[]
  categories?: string[]
}
