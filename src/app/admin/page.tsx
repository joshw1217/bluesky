'use client'

import { useState } from 'react'

export default function CreateUserForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [admin, setAdmin] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, admin }),
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await res.json()
    if (res.ok) {
      setMessage(`User created: ${data.user.email}`)
    } else {
      setMessage(`Error: ${data.error}`)
    }
  }

  return (
    <div className="w-screen h-screen mx-auto p-6 text-white bg-[url('/background.jpg')] bg-cover bg-center">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <h2 className="text-xl font-bold">Create New User</h2>
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="User email"
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Temporary password"
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="User's Name"
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="flex flex-col gap-2 items-start">
          <label htmlFor="admin">Admin?</label>
          <input
            type="checkbox"
            checked={admin}
            onChange={(e) => setAdmin(e.target.checked)}
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Create User
        </button>
        {message && <p>{message}</p>}
      </form>
    </div>
  )
}
