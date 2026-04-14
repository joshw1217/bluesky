'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import AddToCartButton from '@/components/addToCartButton';

type ProductAddToCartRowProps = {
  id: string;
  name: string;
  price: number;
  /** `light` for white/light card backgrounds (e.g. shop grid). */
  variant?: 'dark' | 'light';
  className?: string;
};

export default function ProductAddToCartRow({
  id,
  name,
  price,
  variant = 'dark',
  className,
}: ProductAddToCartRowProps) {
  const [quantity, setQuantity] = useState(1);

  const isLight = variant === 'light';

  const stepperShell = isLight
    ? 'border border-slate-200 bg-slate-50'
    : 'border border-white/35 bg-white/10';

  const stepBtn = isLight
    ? 'flex h-9 w-9 shrink-0 items-center justify-center text-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-200/80'
    : 'flex h-9 w-9 shrink-0 items-center justify-center text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white/15';

  const qtyText = isLight
    ? 'text-slate-900'
    : 'text-white';

  const rowAlign = isLight ? 'justify-start' : 'justify-end';

  return (
    <div
      className={`flex flex-wrap items-center gap-3 ${rowAlign} ${className ?? ''}`}
    >
      <div
        className={`flex items-center overflow-hidden rounded-lg ${stepperShell}`}
        role="group"
        aria-label="Quantity"
      >
        <button
          type="button"
          className={stepBtn}
          aria-label="Decrease quantity"
          disabled={quantity <= 1}
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <span
          className={`min-w-[2.75rem] select-none text-center text-sm font-semibold tabular-nums ${qtyText}`}
        >
          {quantity}
        </span>
        <button
          type="button"
          className={stepBtn}
          aria-label="Increase quantity"
          onClick={() => setQuantity((q) => q + 1)}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <AddToCartButton
        id={id}
        name={name}
        price={price}
        quantity={quantity}
        className="mt-0"
      />
    </div>
  );
}
