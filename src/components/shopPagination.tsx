import Link from 'next/link';
import { buildShopUrl } from '@/lib/shopUrl';

type ShopPaginationProps = {
  page: number;
  totalPages: number;
  /** When set, included on every shop link (manufacturer filter). */
  prefix?: string | null;
};

function hrefForPage(p: number, prefix?: string | null) {
  return buildShopUrl({ prefix: prefix ?? undefined, page: p <= 1 ? undefined : p });
}

export default function ShopPagination({
  page,
  totalPages,
  prefix,
}: ShopPaginationProps) {
  if (totalPages < 1) return null;

  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  const btn =
    'inline-flex min-h-[2.25rem] min-w-[2.25rem] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors';
  const active = 'border-white/40 bg-white/15 text-white hover:bg-white/25';
  const disabled = 'cursor-not-allowed border-white/20 bg-white/5 text-white/40';

  return (
    <nav
      className="mt-10 flex w-full max-w-2xl flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4"
      aria-label="Shop pagination"
    >
      <p className="text-center text-sm text-white/90">
        Page <span className="font-semibold text-white">{page}</span> of{' '}
        <span className="font-semibold text-white">{totalPages}</span>
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {isFirst ? (
          <span className={`${btn} ${disabled}`} aria-disabled>
            First
          </span>
        ) : (
          <Link href={hrefForPage(1, prefix)} className={`${btn} ${active}`}>
            First
          </Link>
        )}

        {isFirst ? (
          <span className={`${btn} ${disabled}`} aria-disabled>
            Previous
          </span>
        ) : (
          <Link href={hrefForPage(page - 1, prefix)} className={`${btn} ${active}`}>
            Previous
          </Link>
        )}

        {isLast ? (
          <span className={`${btn} ${disabled}`} aria-disabled>
            Next
          </span>
        ) : (
          <Link href={hrefForPage(page + 1, prefix)} className={`${btn} ${active}`}>
            Next
          </Link>
        )}

        {isLast ? (
          <span className={`${btn} ${disabled}`} aria-disabled>
            Last
          </span>
        ) : (
          <Link href={hrefForPage(totalPages, prefix)} className={`${btn} ${active}`}>
            Last
          </Link>
        )}
      </div>
    </nav>
  );
}
