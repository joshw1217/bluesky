'use client';

import { useCart } from '@/context/CartContext';

type Props = {
  id: string;
  name: string;
  price: number;
  /** Defaults to 1. */
  quantity?: number;
  className?: string;
};

export default function AddToCartButton({
  id,
  name,
  price,
  quantity = 1,
  className,
}: Props) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() =>
        addItem({
          id,
          name,
          quantity,
          price,
        })
      }
      className={`px-4 py-2 bg-pink-600 text-white text-sm rounded hover:bg-pink-700 transition-colors ${className ?? ''}`}
    >
      Add to Cart
    </button>
  );
}
