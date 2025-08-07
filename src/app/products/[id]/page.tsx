import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product || error) {
    notFound();
  }

  console.log(product)
  return (
    // TODO: Add more product details
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="mt-4 text-sm text-white">Tags: {product.tags}</p>
    </div>
  );
}
