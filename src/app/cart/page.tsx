'use client';

import Navbar from '@/components/navbar';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function CartPage() {
  const { items, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError(null);
    setCheckoutSuccess(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(({ id, quantity }) => ({ id, quantity })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? 'Unable to submit your order.');
      }

      clearCart();
      setCheckoutSuccess('Order submitted successfully.');
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Unable to submit your order.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <div className="mx-auto w-full min-h-0 flex-1 p-6 text-white bg-[url('/cart-background.jpg')] bg-cover bg-center">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        {items.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-slate-800 p-4 rounded-lg"
              >
                <div>
                  <p className="text-lg font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-300">Quantity: {item.quantity}</p>
                </div>
                <p className="text-lg font-bold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}

            <div className="mt-8 border-t border-slate-600 pt-4 flex justify-between items-center">
              <p className="text-xl font-semibold">Total:</p>
              <p className="text-xl font-bold">${total.toFixed(2)}</p>
            </div>

            <div className="flex flex-col items-end gap-3">
              {checkoutError ? (
                <p className="text-sm font-medium text-red-300" role="alert">
                  {checkoutError}
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="rounded-lg bg-pink-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCheckingOut ? 'Submitting...' : 'Checkout'}
              </button>
            </div>
          </div>
        )}

        {checkoutSuccess ? (
          <p className="mt-4 text-sm font-medium text-green-200" role="status">
            {checkoutSuccess}
          </p>
        ) : null}
      </div>
    </div>
  );
}
