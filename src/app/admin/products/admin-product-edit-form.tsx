'use client';

import ProductHeroImage from '@/components/productHeroImage';
import { type SearchBarProductRecord } from '@/components/searchBar';
import { useEffect, useRef, useState } from 'react';

type AdminProductEditFormProps = {
  product: SearchBarProductRecord | null;
  onSaved?: (product: SearchBarProductRecord) => void;
};

function formatPriceForInput(price: number | string) {
  const n = typeof price === 'string' ? Number(price) : price;
  return Number.isFinite(n) ? String(n) : String(price);
}

function formatUpcForInput(upc: number | string | null | undefined) {
  if (upc === null || upc === undefined) return '';
  return String(upc);
}

export default function AdminProductEditForm({ product, onSaved }: AdminProductEditFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [manufacturerId, setManufacturerId] = useState('');
  const [upc, setUpc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const lastLoadedId = useRef<string | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !product) return;

    setUploadingImage(true);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}/image`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? 'Image upload failed');
        return;
      }
      setImageUrl(typeof data.image_url === 'string' ? data.image_url : product.id);
      setMessage('Image uploaded.');
      const row = data.product as SearchBarProductRecord | undefined;
      if (row) {
        onSaved?.(row);
      }
    } finally {
      setUploadingImage(false);
    }
  }

  useEffect(() => {
    if (!product) {
      setName('');
      setPrice('');
      setManufacturerId('');
      setUpc('');
      setImageUrl('');
      setDescription('');
      setMessage('');
      lastLoadedId.current = null;
      return;
    }
    const idChanged = lastLoadedId.current !== product.id;
    if (idChanged) {
      setMessage('');
      lastLoadedId.current = product.id;
    }
    setName(product.name);
    setPrice(formatPriceForInput(product.price));
    setManufacturerId(product.manufacturer_id ?? '');
    setUpc(formatUpcForInput(product.upc));
    setImageUrl(product.image_url?.trim() ?? '');
    setDescription(product.description ?? '');
  }, [product]);

  if (!product) {
    return (
      <p className="rounded-lg border border-white/20 bg-black/35 p-4 text-sm text-white/75 backdrop-blur-sm">
        Select a product from the search results to load its details here.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price,
          manufacturer_id: manufacturerId,
          upc: upc.trim() === '' ? null : upc,
          image_url: imageUrl,
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? 'Save failed');
        return;
      }
      setMessage('Saved.');
      const row = data.product as SearchBarProductRecord;
      if (row) {
        onSaved?.(row);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-white/15 bg-black/45 p-5 text-white/90 backdrop-blur-sm sm:p-6"
    >
      <p className="font-mono text-sm text-white/60">{product.id}</p>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="flex min-h-0 flex-col items-center justify-center gap-3 rounded-xl bg-black/25 p-3">
          <ProductHeroImage
            imageUrl={imageUrl}
            imageVersion={product.updated_at}
            productId={product.id}
            alt={name || product.name}
          />
          <input
            ref={imageFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFileChosen}
          />
          <button
            type="button"
            disabled={uploadingImage || saving}
            onClick={() => imageFileInputRef.current?.click()}
            className="rounded border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-60"
            aria-label="Upload new product image"
          >
            {uploadingImage ? 'Uploading…' : 'Upload new image'}
          </button>
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="admin-product-name" className="text-sm text-white/70">
              Name
            </label>
            <input
              id="admin-product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border border-white/20 bg-white px-3 py-2 text-black"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="admin-product-price" className="text-sm text-white/70">
              Price
            </label>
            <input
              id="admin-product-price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="border border-white/20 bg-white px-3 py-2 text-black"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="admin-product-mfg" className="text-sm text-white/70">
              Manufacturer ID
            </label>
            <input
              id="admin-product-mfg"
              value={manufacturerId}
              onChange={(e) => setManufacturerId(e.target.value)}
              className="border border-white/20 bg-white px-3 py-2 text-black"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="admin-product-upc" className="text-sm text-white/70">
              UPC
            </label>
            <input
              id="admin-product-upc"
              value={upc}
              onChange={(e) => setUpc(e.target.value)}
              className="border border-white/20 bg-white px-3 py-2 text-black"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="admin-product-desc" className="text-sm text-white/70">
          Description <span className="text-white/45">(Markdown)</span>
        </label>
        <textarea
          id="admin-product-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={12}
          className="min-h-[200px] resize-y border border-white/20 bg-white px-3 py-2 font-sans text-sm text-black"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {message ? <p className="text-sm text-white/85">{message}</p> : null}
      </div>
    </form>
  );
}
