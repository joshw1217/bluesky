import AddToCartButton from '@/components/addToCartButton';
import { createServerSupabase } from '@/lib/supabaseServer';
import Image from 'next/image';
import Link from 'next/link';

type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
};

export default async function ShopPage() {
  const supabase = createServerSupabase();
  const { data: products, error } = await supabase.from('products').select('*');

  if (error) {
    console.error('Error loading products:', error.message);
    return <p>Failed to load products.</p>;
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-[url('/shop-background.jpg')] bg-cover bg-center">
      <h1 className="text-3xl font-bold mb-6 text-white">Shop</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product: Product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            {product.image_url && (
              <Image
                src={product.image_url}
                alt={product.name}
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {product.name}
              </h2>
              <p className="text-lg font-bold text-pink-600">
                ${product.price.toFixed(2)}
              </p>
              <AddToCartButton
                    id={product.id}
                    name={product.name}
                    price={product.price}
                />
              <Link
                href={`/product/${product.id}`}
                className="inline-block mt-3 ml-2 text-sm text-pink-600 hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
