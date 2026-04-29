import { client } from './client'
import type { Brand } from '../../data/brands'
import type { Product } from '../../data/products'

export async function getBrands(): Promise<Brand[]> {
  return client.fetch(
    `*[_type == "brand" && hideFromBrands != true] | order(order asc) {
      "id": id.current,
      name,
      tagline,
      description,
      imageAlt,
      layout,
      placeholderGradient,
      objectFit,
      "imageSrc": image.asset->url,
      "videoSrc": video.asset->url,
      "videoPoster": videoPoster.asset->url,
      "catalogueUrl": catalogue.asset->url,
      categories,
      "gallery": gallery[].asset->url,
      "catalogues": catalogues[]{ label, "url": coalesce(file.asset->url, externalUrl) },
    }`
  )
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  return client.fetch(
    `*[_type == "brand" && id.current == $slug][0] {
      "id": id.current,
      name,
      tagline,
      description,
      imageAlt,
      layout,
      placeholderGradient,
      objectFit,
      "imageSrc": image.asset->url,
      "videoSrc": video.asset->url,
      "videoPoster": videoPoster.asset->url,
      "catalogueUrl": catalogue.asset->url,
      categories,
      "gallery": gallery[].asset->url,
      "catalogues": catalogues[]{ label, "url": coalesce(file.asset->url, externalUrl) },
    }`,
    { slug }
  )
}

export async function getProducts(): Promise<Product[]> {
  return client.fetch(
    `*[_type == "product"] | order(order asc) {
      "id": id.current,
      number,
      category,
      title,
      description,
      bg,
      text,
      border,
      gridCols,
      gridRows,
    }`
  )
}

export interface ProductModel {
  _id: string
  name: string
  brandName: string
  brandId: string
  category: string
  subCategory?: string
  imageSrc?: string
  gallery?: string[]
  documents?: { label: string; url: string }[]
  description?: string
  features?: string[]
  order?: number
  catalogueUrl?: string
}

export async function getProductModelById(id: string): Promise<ProductModel | null> {
  return client.fetch(
    `*[_type == "productModel" && _id == $id][0] {
      _id,
      name,
      "brandName": brand->name,
      "brandId": brand->id.current,
      "catalogueUrl": brand->catalogue.asset->url,
      category,
      subCategory,
      "imageSrc": image.asset->url,
      "gallery": gallery[].asset->url,
      "documents": documents[]{ label, "url": file.asset->url },
      description,
      features,
      order,
    }`,
    { id }
  )
}

export async function getAllProductModels(): Promise<{ _id: string; category: string }[]> {
  return client.fetch(`*[_type == "productModel"] { _id, category }`)
}

export async function getProductModelsByBrand(brandSlug: string): Promise<ProductModel[]> {
  return client.fetch(
    `*[_type == "productModel" && brand->id.current == $brandSlug] | order(order asc) {
      _id,
      name,
      "brandName": brand->name,
      "brandId": brand->id.current,
      category,
      subCategory,
      "imageSrc": image.asset->url,
      description,
      features,
      order,
    }`,
    { brandSlug }
  )
}

export async function getProductModelsByCategory(category: string): Promise<ProductModel[]> {
  return client.fetch(
    `*[_type == "productModel" && category == $category] | order(order asc) {
      _id,
      name,
      "brandName": brand->name,
      "brandId": brand->id.current,
      category,
      subCategory,
      "imageSrc": image.asset->url,
      description,
      features,
      order,
    }`,
    { category }
  )
}

export interface ProductModelSearchItem {
  _id: string
  name: string
  brandName: string
  category: string
  subCategory?: string
  description?: string
}

export async function getAllProductModelsForSearch(): Promise<ProductModelSearchItem[]> {
  return client.fetch(
    `*[_type == "productModel"] | order(order asc) {
      _id,
      name,
      "brandName": brand->name,
      category,
      subCategory,
      description,
    }`
  )
}

export async function getProductModelsByBrandAndCategory(
  brandSlug: string,
  category: string
): Promise<ProductModel[]> {
  return client.fetch(
    `*[_type == "productModel" && brand->id.current == $brandSlug && category == $category] | order(order asc) {
      _id,
      name,
      "brandName": brand->name,
      "brandId": brand->id.current,
      category,
      subCategory,
      "imageSrc": image.asset->url,
      description,
      features,
      order,
    }`,
    { brandSlug, category }
  )
}

export async function getAllBrandCategoryPairs(): Promise<{ brandId: string; category: string }[]> {
  const pairs: { brandId: string; category: string }[] = await client.fetch(
    `*[_type == "productModel"] {
      "brandId": brand->id.current,
      category,
    }`
  )
  const seen = new Set<string>()
  return pairs.filter(({ brandId, category }) => {
    const key = `${brandId}::${category}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
