'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type SearchBarProduct = { id: string; name: string };

/** Full row returned by `/api/search` (`select('*')` on products). */
export type SearchBarProductRecord = SearchBarProduct & {
  description: string | null;
  price: number | string;
  manufacturer_id: string | null;
  upc: number | string | null;
  image_url: string | null;
  updated_at?: string;
  tags?: string | null;
};

type SearchBarBase = {
  className?: string;
};

/** Storefront: choosing a result navigates to the product page. */
export type SearchBarShopProps = SearchBarBase & {
  variant?: 'shop';
  getProductHref?: (item: SearchBarProduct) => string;
};

/** Admin: choosing a result only runs `onProductSelect` (no navigation). */
export type SearchBarAdminProps = SearchBarBase & {
  variant: 'admin';
  onProductSelect: (item: SearchBarProductRecord) => void;
};

export type SearchBarProps = SearchBarShopProps | SearchBarAdminProps;

function cn(...parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

export default function SearchBar(props: SearchBarProps = {}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchBarProductRecord[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const isAdmin = props.variant === 'admin';

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const products = data.products as SearchBarProductRecord[] | undefined;
      setResults(products ?? []);
      setShowDropdown(true);
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  function handleSelect(item: SearchBarProductRecord) {
    if (isAdmin) {
      props.onProductSelect(item);
    } else {
      const shop = props as SearchBarShopProps;
      const href = shop.getProductHref
        ? shop.getProductHref(item)
        : `/products/${item.id}`;
      router.push(href);
    }
    setQuery('');
    setShowDropdown(false);
  }

  return (
    <div className={cn('relative w-full', props.className ?? 'max-w-md')}>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {showDropdown && (
        <ul
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white text-black shadow-lg"
          role="listbox"
        >
          {results.length > 0 ? (
            results.map((item) => (
              <li
                key={item.id}
                role="option"
                tabIndex={-1}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              >
                <div className="text-sm text-gray-500">{item.id}</div>
                <div className="font-medium">{item.name}</div>
              </li>
            ))
          ) : (
            <li
              className="px-4 py-2 italic text-gray-500"
              onMouseDown={(e) => e.preventDefault()}
            >
              No results found
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
