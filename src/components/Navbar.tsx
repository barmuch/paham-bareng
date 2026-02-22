'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';
import {
  FiMenu, FiX, FiMap, FiUser,
  FiLogOut, FiSettings, FiStar, FiChevronDown
} from 'react-icons/fi';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { href: '/roadmaps', label: 'Roadmaps', icon: FiMap },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-dark-900 hover:text-primary-500 transition-colors">
            <Image src="/logo.png" alt="Paham Bareng" width={32} height={32} className="object-contain" />
            <span className="font-heading">paham-<span className="text-primary-500">bareng</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  pathname === link.href || pathname?.startsWith(link.href + '/')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-warm-600 hover:text-dark-900 hover:bg-warm-50'
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-warm-50 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-dark-700">{user.name}</span>
                  {user.isPremium && <FiStar className="text-accent-mustard-500" size={14} />}
                  <FiChevronDown size={14} className="text-warm-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-warm-200 py-2 animate-fade-in">
                    <div className="px-4 py-2 border-b border-warm-100">
                      <p className="text-sm font-medium text-dark-900">{user.name}</p>
                      <p className="text-xs text-warm-500">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-block mt-1 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">Admin</span>
                      )}
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-warm-700 hover:bg-warm-50 rounded-xl mx-1" onClick={() => setUserMenuOpen(false)}>
                      <FiUser size={14} /> Dashboard
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-warm-700 hover:bg-warm-50 rounded-xl mx-1" onClick={() => setUserMenuOpen(false)}>
                        <FiSettings size={14} /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-warm-100" />
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl mx-1 w-[calc(100%-8px)]"
                    >
                      <FiLogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-ghost text-sm">Login</Link>
                <Link href="/auth/register" className="btn-primary text-sm !py-2">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile burger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-warm-50">
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                  pathname === link.href ? 'bg-primary-50 text-primary-700' : 'text-warm-600'
                }`}
              >
                <link.icon size={16} /> {link.label}
              </Link>
            ))}
            <hr className="my-2 border-warm-100" />
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-warm-700">
                  <FiUser size={16} /> Dashboard
                </Link>
                {user?.role === 'admin' && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-warm-700">
                    <FiSettings size={16} /> Admin Panel
                  </Link>
                )}
                <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-2 px-4 py-3 text-sm text-red-600 w-full">
                  <FiLogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-4 pt-2">
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm flex-1 text-center">Login</Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm flex-1 text-center">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
