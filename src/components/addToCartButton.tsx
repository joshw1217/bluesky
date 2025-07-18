'use client';

import { useCart } from '@/context/CartContext';

type Props = {
  id: string;
  name: string;
  price: number;
};

export default function AddToCartButton({ id, name, price }: Props) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() =>
        addItem({
          id,
          name,
          quantity: 1,
          price,
        })
      }
      className="mt-4 px-4 py-2 bg-pink-600 text-white text-sm rounded hover:bg-pink-700 transition-colors"
    >
      Add to Cart
    </button>
  );
}
