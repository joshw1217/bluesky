import Navbar from '@/components/navbar';
import ProductHeroImage from '@/components/productHeroImage';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ id: string }>;
};

type ProductRow = {
  id: string;
  name: string;
  price: number | string;
  manufacturer_id: string | null;
  upc: number | string | null;
  image_url: string | null;
};

function formatPrice(price: number | string) {
  const n = typeof price === 'string' ? Number(price) : price;
  return Number.isFinite(n) ? n.toFixed(2) : String(price);
}

function formatUpc(upc: number | string | null) {
  if (upc === null || upc === undefined) return '—';
  return String(upc);
}

export default async function ProductPage({ params }: PageProps) {
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

  const p = product as ProductRow;

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />

      <div className="font-sans flex min-h-0 flex-1 flex-col bg-[url('/shop-background.jpg')] bg-cover bg-center">
        <section className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:py-14">
          <ProductHeroImage
            imageUrl={p.image_url}
            productId={p.id}
            alt={p.name}
          />
        </section>

        <section className="flex flex-1 flex-col justify-center border-t border-white/15 bg-black/35 px-6 py-10 backdrop-blur-sm sm:px-10 sm:py-14">
          <div className="mx-auto w-full max-w-2xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {p.name}
              </h1>
              <p className="shrink-0 text-xl font-bold text-pink-400 sm:text-2xl">
                ${formatPrice(p.price)}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-1 text-sm text-white/70 sm:flex-row sm:gap-8 sm:text-base">
              <p>
                <span className="text-white/50">Manufacturer ID</span>{' '}
                <span className="font-mono text-white/85">
                  {p.manufacturer_id ?? '—'}
                </span>
              </p>
              <p>
                <span className="text-white/50">UPC</span>{' '}
                <span className="font-mono text-white/85">
                  {formatUpc(p.upc)}
                </span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

