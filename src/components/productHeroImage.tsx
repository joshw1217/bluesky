'use client';

import { useState } from 'react';

type ProductHeroImageProps = {
  imageUrl: string | null | undefined;
  productId: string;
  alt: string;
};

export default function ProductHeroImage({
  imageUrl,
  productId,
  alt,
}: ProductHeroImageProps) {
  const [failed, setFailed] = useState(false);
  const trimmed = imageUrl?.trim() ?? '';
  const resolvedUrl = trimmed.length > 0 ? trimmed : null;
  const showPlaceholder = !resolvedUrl || failed;

  return (
    <div className="relative flex aspect-square w-full max-w-md items-center justify-center rounded-xl border-2 border-dashed border-white/40 bg-white/5">
      {showPlaceholder ? (
        <span className="px-4 text-center font-mono text-sm text-white/60 sm:text-base">
          {productId}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- external URLs; onError for fallback
        <img
          src={resolvedUrl}
          alt={alt}
          className="h-full w-full rounded-[10px] object-contain p-2"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
