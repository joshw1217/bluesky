import ProductAddToCartRow from '@/components/productAddToCartRow';
import Navbar from '@/components/navbar';
import SearchBar from '@/components/searchBar';
import ShopPagination from '@/components/shopPagination';
import { resolveProductImageSrc } from '@/lib/productImageUrl';
import { buildShopUrl } from '@/lib/shopUrl';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const PAGE_SIZE = 20;
const MANUFACTURER_TABS_PER_ROW = 10;

/** PostgREST returns at most 1000 rows per request; paginate to load all ids. */
const PRODUCT_ID_BATCH = 1000;

async function fetchAllProductIds(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<{ data: { id: string }[] | null; error: { message: string } | null }> {
  const ids: { id: string }[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .order('id', { ascending: true })
      .range(from, from + PRODUCT_ID_BATCH - 1);
    if (error) {
      return { data: null, error };
    }
    const batch = data ?? [];
    ids.push(...batch);
    if (batch.length < PRODUCT_ID_BATCH) {
      break;
    }
    from += PRODUCT_ID_BATCH;
  }
  return { data: ids, error: null };
}

/** Prefix segment before the first hyphen in product ids (e.g. "BE-0000" → "BE"). */
function manufacturerPrefixFromProductId(id: string): string | null {
  const segment = id.split('-')[0]?.trim();
  return segment ? segment : null;
}

function distinctSortedPrefixes(rows: { id: string }[]): string[] {
  const seen = new Set<string>();
  for (const row of rows) {
    const p = manufacturerPrefixFromProductId(row.id);
    if (p) seen.add(p);
  }
  return Array.from(seen).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}



function chunkIntoRows<T>(items: T[], perRow: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += perRow) {
    rows.push(items.slice(i, i + perRow));
  }
  return rows;
}

type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  updated_at?: string;
};

type PageProps = {
  searchParams: Promise<{ page?: string; prefix?: string }>;
};

function productDetailHref(
  productId: string,
  shopPage: number,
  shopPrefix: string | null,
) {
  const params = new URLSearchParams();
  if (shopPage > 1) {
    params.set('shopPage', String(shopPage));
  }
  if (shopPrefix) {
    params.set('prefix', shopPrefix);
  }
  const q = params.toString();
  return q ? `/products/${productId}?${q}` : `/products/${productId}`;
}

export default async function ShopPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const raw = parseInt(sp.page ?? '1', 10);
  const requestedPage = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
  const rawPrefix = typeof sp.prefix === 'string' ? sp.prefix : undefined;

  const supabase = await createSupabaseServerClient();

  const { data: idRows, error: idError } = await fetchAllProductIds(supabase);

  if (idError) {
    console.error('Error loading product ids for manufacturers:', idError.message);
    return <p>Failed to load products.</p>;
  }

  const manufacturerPrefixes = distinctSortedPrefixes(idRows ?? []);
  const manufacturerRows = chunkIntoRows(manufacturerPrefixes, MANUFACTURER_TABS_PER_ROW);

  const selectedPrefix =
    manufacturerPrefixes.length === 0
      ? null
      : rawPrefix !== undefined && manufacturerPrefixes.includes(rawPrefix)
        ? rawPrefix
        : manufacturerPrefixes[0];

  if (
    manufacturerPrefixes.length > 0 &&
    (rawPrefix === undefined || rawPrefix !== selectedPrefix)
  ) {
    redirect(
      buildShopUrl({ prefix: selectedPrefix, page: requestedPage > 1 ? requestedPage : undefined }),
    );
  }

  let countQuery = supabase.from('products').select('*', { count: 'exact', head: true });
  if (selectedPrefix) {
    countQuery = countQuery.like('id', `${selectedPrefix}-%`);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error('Error counting products:', countError.message);
    return <p>Failed to load products.</p>;
  }

  const total = count ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / PAGE_SIZE);

  if (totalPages > 0 && requestedPage > totalPages) {
    redirect(
      buildShopUrl({
        prefix: selectedPrefix ?? undefined,
        page: totalPages > 1 ? totalPages : undefined,
      }),
    );
  }

  const page = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let productsQuery = supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });
  if (selectedPrefix) {
    productsQuery = productsQuery.like('id', `${selectedPrefix}-%`);
  }

  const { data: products, error } = await productsQuery.range(from, to);

  if (error) {
    console.error('Error loading products:', error.message);
    return <p>Failed to load products.</p>;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />

      <div className="font-sans flex min-h-0 w-full flex-1 flex-col items-center justify-items-center bg-[url('/shop-background.jpg')] bg-cover bg-center px-4 pb-20 pt-8 sm:px-6 sm:pt-12 sm:pb-20 lg:px-10 xl:px-14">
        <SearchBar />
        <h1 className="text-3xl font-bold mb-6 text-white">Shop</h1>

        {manufacturerPrefixes.length > 0 && (
          <div
            className="mb-6 flex w-full max-w-screen-2xl flex-col items-center gap-2"
            role="list"
            aria-label="Manufacturers"
          >
            {manufacturerRows.map((rowPrefixes, rowIndex) => (
              <div
                key={rowIndex}
                className="flex w-full justify-center overflow-x-auto"
              >
                <div
                  className="inline-grid shrink-0 divide-x divide-gray-200 rounded-lg border border-white/25 bg-white/95 shadow-md"
                  style={{
                    gridTemplateColumns: `repeat(${rowPrefixes.length}, minmax(4rem, max-content))`,
                  }}
                >
                {rowPrefixes.map((prefix) => {
                  const isSelected = prefix === selectedPrefix;
                  return (
                    <Link
                      key={prefix}
                      href={buildShopUrl({ prefix, page: 1 })}
                      role="listitem"
                      scroll={false}
                      className={`flex min-w-0 items-center justify-center px-1 py-3 text-center transition-colors sm:px-2 ${
                        isSelected
                          ? 'bg-pink-100 text-pink-900'
                          : 'bg-transparent text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate text-xs font-semibold tracking-wide sm:text-sm md:text-base">
                        {prefix}
                      </span>
                    </Link>
                  );
                })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid w-full max-w-screen-2xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {products.map((product: Product) => {
            const imageSrc = resolveProductImageSrc(product.image_url, product.updated_at);
            return (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={product.name}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover"
                />
              ) : null}
              <div className="p-4">
                <div className="flex min-w-0 flex-row items-baseline justify-between gap-x-2 gap-y-1">
                  <p className="shrink-0 whitespace-nowrap text-sm text-gray-500">
                    {product.id}
                  </p>
                  <h2 className="min-w-0 flex-1 break-words pl-2 text-right text-lg font-semibold text-gray-900">
                    {product.name}
                  </h2>
                </div>
                <div className="mt-1 flex flex-row flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="text-lg font-bold text-pink-600">
                    ${product.price.toFixed(2)}
                  </p>
                  <Link
                    href={productDetailHref(product.id, page, selectedPrefix)}
                    className="shrink-0 text-sm text-pink-600 hover:underline"
                  >
                    View Details
                  </Link>
                </div>
                <ProductAddToCartRow
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  variant="light"
                  className="mt-2"
                />
              </div>
            </div>
            );
          })}
        </div>

        <ShopPagination page={page} totalPages={totalPages} prefix={selectedPrefix} />
      </div>
    </div>
  );
}
