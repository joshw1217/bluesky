'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const products = data.products;
      setResults(products);
      setShowDropdown(true);
    }, 200); 

    return () => clearTimeout(delayDebounce);
  }, [query]);

  function handleSelect(item: any) {
    router.push(`/products/${item.id}`);
    setQuery('');
    setShowDropdown(false);
  }

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {showDropdown && (
        <ul className="absolute z-50 mt-1 w-full bg-white text-black border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.length > 0 ? (
            results.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelect(item)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">{item.tags}</div>
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500 italic">No results found</li>
          )}
        </ul>
      )}

    </div>
  );
}
