import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';
import sendEmail from '@/lib/resend';

type CheckoutItem = {
  id: string;
  quantity: number;
};

type ProductSnapshot = {
  id: string;
  name: string;
  price: number | string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseCheckoutItems(value: unknown): CheckoutItem[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const items = value.map((item) => {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.quantity !== 'number') {
      return null;
    }

    const quantity = Math.floor(item.quantity);

    if (item.id.trim() === '' || quantity < 1) {
      return null;
    }

    return {
      id: item.id,
      quantity,
    };
  });

  if (items.length === 0 || items.some((item) => item === null)) {
    return null;
  }

  return items as CheckoutItem[];
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'You must be signed in to checkout.' }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid checkout request.' }, { status: 400 });
  }

  const items = parseCheckoutItems(isRecord(body) ? body.items : undefined);

  if (!items) {
    return NextResponse.json({ error: 'Your cart is empty or invalid.' }, { status: 400 });
  }

  const quantitiesById = new Map<string, number>();

  for (const item of items) {
    quantitiesById.set(item.id, (quantitiesById.get(item.id) ?? 0) + item.quantity);
  }

  const productIds = Array.from(quantitiesById.keys());
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price')
    .in('id', productIds);

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 });
  }

  if (!products || products.length !== productIds.length) {
    return NextResponse.json({ error: 'One or more products in your cart are unavailable.' }, { status: 400 });
  }

  const orderItems = products.map((product: ProductSnapshot) => {
    const price = typeof product.price === 'number' ? product.price : Number(product.price);

    return {
      product_id: product.id,
      name: product.name,
      price,
      quantity: quantitiesById.get(product.id) ?? 0,
    };
  });

  const total = Math.round(
    orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100,
  ) / 100;

  if (!Number.isFinite(total) || total <= 0) {
    return NextResponse.json({ error: 'Unable to calculate order total.' }, { status: 400 });
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: null,
      total,
    })
    .select('id, total')
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  const { error: orderItemsError } = await supabase.from('order_items').insert(
    orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  );

  if (orderItemsError) {
    return NextResponse.json({ error: orderItemsError.message }, { status: 500 });
  }

  await sendEmail(user.email, 'Order Confirmation', `Thank you for your order! Your order has been placed and will be processed shortly. Your order number is ${order.id}.`);

  return NextResponse.json({ order });
}
