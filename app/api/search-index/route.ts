import { NextResponse } from 'next/server'
import { getAllProductModelsForSearch } from '@/sanity/lib/queries'

export async function GET() {
  try {
    const models = await getAllProductModelsForSearch()
    return NextResponse.json(models, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
