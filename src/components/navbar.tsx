'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  const { getItemCount } = useCart();
  const cartItemCount = getItemCount();

  useEffect(() => { // This currently doesn't add the admin link unless the page is refreshed, TODO
    const fetchUser = async () => {
      const res = await fetch('/api/user-session')
      if(res.ok){
        const data = await res.json();
        if(data.user === null){
          setIsAdmin(false)
        }
        else {
          setIsAdmin(data.user.user.user_metadata.admin)
        }
      } 
      else { 
        setIsAdmin(false)
      }
    }
    fetchUser();
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/account', label: 'Account' },
  ];

  if (isAdmin) {
    navLinks.push({ href: '/admin', label: 'Admin' });
  }

  return (
    <header className="bg-slate-700 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-12">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-white">
            Blue Sky Pet Supply
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map(({ href, label }) => (
                <Link
                key={href}
                href={href}
                className={`hover:text-pink-300 ${
                    pathname === href ? 'text-pink-300 font-semibold' : 'text-white'
                }`}
                >
                {label}
                </Link>
            ))}

            {/* Cart Icon */}
            <Link href="/cart" className="relative">
                <ShoppingCart className="text-white hover:text-pink-300" />
                {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItemCount}
                </span>
                )}
            </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white hover:text-pink-300"
            >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
            <nav className="md:hidden px-4 pb-4 space-y-2 bg-slate-700 shadow">
            {navLinks.map(({ href, label }) => (
                <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block py-2 hover:text-pink-300 ${
                    pathname === href ? 'font-semibold text-pink-300' : 'text-white'
                }`}
                >
                {label}
                </Link>
            ))}
            <Link
                href="/cart"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-white hover:text-pink-300"
            >
                Cart ({cartItemCount})
            </Link>
            </nav>
        )}
    </header>

  );
};

export default Navbar;
