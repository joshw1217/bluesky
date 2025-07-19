---
--- Functions
---

create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

---
--- Tables
---

--- Products
create table products (
  id text primary key default uuid_generate_v4(),
  name text not null,
  price numeric(10,2) not null,
  manufacturer_id text,
  upc numeric,
  image_url text,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

--- Orders
create table orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  status text,
  total numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

--- Order Items
create table order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id),
  product_id text REFERENCES products(id),
  quantity integer,
  unit_price numeric
);

---
--- Triggers
---

create trigger set_updated_at_products
before update on products
for each row
execute procedure set_updated_at();

create trigger set_updated_at_orders
before update on orders
for each row
execute procedure set_updated_at();
