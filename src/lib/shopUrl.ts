/**
 * Builds `/shop` URLs with optional manufacturer prefix and page.
 * Omits default page (1) from the query string.
 */
export function buildShopUrl(opts: {
  prefix?: string | null;
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (opts.prefix) {
    params.set('prefix', opts.prefix);
  }
  if (opts.page !== undefined && opts.page > 1) {
    params.set('page', String(opts.page));
  }
  const q = params.toString();
  return q ? `/shop?${q}` : '/shop';
}
