---
--- Row Level Security
---

--- Functions
create function is_admin()
returns boolean as $$
  select (auth.jwt() -> 'app_metadata' ->> 'admin')::boolean;
$$ language sql stable;

--- Products Table
alter table products enable row level security;

create policy "Public read access"
on products
for select
using (true);

create policy "Admins can insert products"
on products
for insert
with check (
  is_admin() = true
);

create policy "Admins can update products"
on products
for update
with check (
  is_admin() = true
);

create policy "Admins can delete products"
on products
for delete
using (
  is_admin() = true
);

--- Orders Table
alter table orders enable row level security;

create policy "users can access their own orders"
on orders
for select
using (
  auth.uid() = user_id
);

create policy "Users can create their own orders"
on orders
for insert
with check (
  auth.uid() = user_id
);

create policy "Admins can update orders"
on orders
for update
with check (
  is_admin() = true
);

create policy "Admins can delete orders"
on orders
for delete
using (
  is_admin() = true
);

--- Order Items Table
alter table order_items enable row level security;

create policy "Users can view their order items"
on order_items
for select
using (
  exists (
    select 1
    from orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Users can create their own order items"
on order_items
for insert
with check (
  exists (
    select 1
    from orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Admins can update order items"
on order_items
for update
with check (
  is_admin() = true
);

create policy "Admins can delete order items"
on order_items
for delete
using (
  is_admin() = true
);