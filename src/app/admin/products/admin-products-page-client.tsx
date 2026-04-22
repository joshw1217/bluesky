'use client';

import AdminProductEditForm from '@/app/admin/products/admin-product-edit-form';
import Navbar from '@/components/navbar';
import SearchBar, { type SearchBarProductRecord } from '@/components/searchBar';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminProductsPageClient() {
  const [selected, setSelected] = useState<SearchBarProductRecord | null>(null);

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <div className="mx-auto w-full min-h-0 flex-1 bg-[url('/background.jpg')] bg-cover bg-center p-6 text-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold">Edit products</h1>
            <Link
              href="/admin"
              className="text-sm font-medium text-white/90 underline-offset-4 transition-colors hover:text-pink-300 hover:underline"
            >
              ← Admin home
            </Link>
          </div>
          <p className="text-sm text-white/75">
            Search by product name or id, then choose a row to load it into the form below.
          </p>
          <SearchBar variant="admin" className="max-w-xl" onProductSelect={setSelected} />
          <AdminProductEditForm product={selected} onSaved={setSelected} />
        </div>
      </div>
    </div>
  );
}
