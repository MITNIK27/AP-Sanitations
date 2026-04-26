// Sanity CMS is the source of truth for product category data.
// See sanity/schemas/product.ts for the schema, sanity/lib/queries.ts for the GROQ query.

export interface Product {
  id: string
  number: string       // Display number: "01"–"05"
  category: string     // Short category label shown above title
  title: string
  description: string
  // Tailwind class names — controls bento grid appearance
  bg: string           // Background color class
  text: string         // Text color class
  border: string       // Border color class (on hover)
  // Bento grid placement (desktop). Mobile always stacks.
  gridCols: string     // e.g. "md:col-span-2"
  gridRows: string     // e.g. "md:row-span-2"
}
