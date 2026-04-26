import ClientPage from "@/components/ClientPage";
import { getBrands, getProducts } from "@/sanity/lib/queries";

export default async function Home() {
  const [brands, products] = await Promise.all([getBrands(), getProducts()]);
  return <ClientPage brands={brands} products={products} />;
}
