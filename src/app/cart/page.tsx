'use client';

import Navbar from '@/components/navbar';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items } = useCart();

  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <div> 
      <Navbar />
      <div className="w-screen h-screen mx-auto p-6 text-white bg-[url('/cart-background.jpg')] bg-cover bg-center">
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
          </div>
        )}
      </div>
    </div>
  );
}
