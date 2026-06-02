alter table order_items
add column name text;
alter table order_items
rename column unit_price to price;