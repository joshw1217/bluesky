import ProductAddToCartRow from '@/components/productAddToCartRow';
import Navbar from '@/components/navbar';
import ProductHeroImage from '@/components/productHeroImage';
import { buildShopUrl } from '@/lib/shopUrl';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ shopPage?: string; prefix?: string }>;
};

function hrefForShopReturn(shopPage: string | undefined, shopPrefix: string | undefined) {
  const raw = shopPage === undefined || shopPage === '' ? undefined : parseInt(shopPage, 10);
  const page =
    raw !== undefined && Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : undefined;
  return buildShopUrl({
    prefix: shopPrefix || undefined,
    page: page !== undefined && page > 1 ? page : undefined,
  });
}

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  manufacturer_id: string | null;
  upc: number | string | null;
  image_url: string | null;
  updated_at?: string;
};

function formatPrice(price: number | string) {
  const n = typeof price === 'string' ? Number(price) : price;
  return Number.isFinite(n) ? n.toFixed(2) : String(price);
}

function formatUpc(upc: number | string | null) {
  if (upc === null || upc === undefined) return '—';
  return String(upc);
}

function toCartPrice(price: number | string): number {
  const n = typeof price === 'string' ? Number(price) : price;
  return Number.isFinite(n) ? n : 0;
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const shopPrefix = typeof sp.prefix === 'string' ? sp.prefix : undefined;
  const backToShopHref = hrefForShopReturn(sp.shopPage, shopPrefix);
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
  const cartPrice = toCartPrice(p.price);

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />

      <div className="font-sans flex min-h-0 flex-1 flex-col bg-[url('/shop-background.jpg')] bg-cover bg-center">
        <div className="flex w-full shrink-0 justify-start px-4 pt-4 sm:px-6 sm:pt-5">
          <Link
            href={backToShopHref}
            className="text-sm font-medium text-white/90 underline-offset-4 transition-colors hover:text-pink-300 hover:underline"
          >
            ← Back to shop
          </Link>
        </div>

        <section className="flex flex-1 px-6 pb-10 pt-4 sm:px-10 sm:pb-14 sm:pt-6">
          <div className="mx-auto grid w-full max-w-6xl min-h-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
            <div className="flex min-h-0 items-center justify-center rounded-2xl bg-black/25 p-4 backdrop-blur-sm">
              <ProductHeroImage
                imageUrl={p.image_url}
                imageVersion={p.updated_at}
                productId={p.id}
                alt={p.name}
              />
            </div>

            <div className="flex min-h-0 flex-col rounded-2xl border border-white/15 bg-black/45 p-5 text-white/90 backdrop-blur-sm sm:p-6 lg:max-h-[60vh]">
              <h2 className="mb-4 shrink-0 text-lg font-semibold text-white sm:text-xl">
                Description
              </h2>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pr-1">
                <div className="space-y-3 break-words text-sm leading-6 text-white/85 sm:text-base">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                    h1: ({ children }) => <h3 className="text-xl font-bold text-white">{children}</h3>,
                    h2: ({ children }) => <h4 className="text-lg font-semibold text-white">{children}</h4>,
                    h3: ({ children }) => <h5 className="text-base font-semibold text-white">{children}</h5>,
                    p: ({ children }) => <p>{children}</p>,
                    ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className="text-pink-300 underline underline-offset-2 transition-colors hover:text-pink-200"
                      >
                        {children}
                      </a>
                    ),
                    code: ({ children }) => (
                      <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[0.9em] text-white">
                        {children}
                      </code>
                    ),
                    }}
                  >
                    {p.description?.trim() || 'No description available.'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-1 flex-col justify-center border-t border-white/15 bg-black/35 px-6 py-10 backdrop-blur-sm sm:px-10 sm:py-14">
          
          <div className="mx-auto w-full max-w-2xl">
            <p className="flex flex-row gap-4 items-center justify-start text-white/70 text-lg">{p.id}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {p.name}
              </h1>
              <p className="shrink-0 text-xl font-bold text-pink-400 sm:text-2xl">
                ${formatPrice(p.price)}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <div className="flex flex-col gap-1 text-sm text-white/70 sm:flex-row sm:gap-8 sm:text-base">
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
              <div className="flex shrink-0 justify-end">
                <ProductAddToCartRow
                  id={p.id}
                  name={p.name}
                  price={cartPrice}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

