'use client'

import { useState } from 'react'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setResults(data.products)
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-black rounded-md">
      <form onSubmit={handleSearch} className="flex">
        <input
          type="text"
          placeholder="Search products..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {results &&results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map((product: any) => (
            <li key={product.id} className="p-2 border rounded-md">
              {product.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
