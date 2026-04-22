/** Supabase Storage bucket for catalog images (object key is usually the product id). */
export const PRODUCT_IMAGES_BUCKET = 'product_images';

/** Appends a version query param so browsers (and `next/image`) refetch after the same storage key is overwritten. */
export function withImageCacheBust(
  url: string,
  version: string | number | null | undefined,
): string {
  if (version === undefined || version === null || version === '') {
    return url;
  }
  const v = encodeURIComponent(String(version));
  return url.includes('?') ? `${url}&v=${v}` : `${url}?v=${v}`;
}

/**
 * Resolves `products.image_url` for `<img>` / `next/image` `src`.
 * Supports absolute URLs (legacy) and storage object keys (e.g. product id).
 * Pass `products.updated_at` (or similar) as `imageVersion` to bust cache when the file at a fixed key changes.
 */
export function resolveProductImageSrc(
  imageUrl: string | null | undefined,
  imageVersion?: string | number | null,
): string | null {
  const raw = imageUrl?.trim() ?? '';
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) {
    return withImageCacheBust(raw, imageVersion);
  }
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return null;
  const base = baseUrl.replace(/\/$/, '');
  const encodedPath = raw
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  const publicUrl = `${base}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${encodedPath}`;
  return withImageCacheBust(publicUrl, imageVersion);
}
