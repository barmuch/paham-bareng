'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import {
  FiHome, FiMap, FiUsers, FiUser,
  FiArrowLeft, FiMenu
} from 'react-icons/fi';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: FiHome, exact: true },
  { href: '/admin/roadmaps', label: 'Roadmaps', icon: FiMap },
  { href: '/admin/users', label: 'Users', icon: FiUser },
  { href: '/admin/teams', label: 'Teams', icon: FiUsers },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('adminSidebarCollapsed');
      if (raw != null) setSidebarCollapsed(raw === '1');
    } catch {
      // ignore
    }
  }, []);

  const activeLabel = useMemo(() => {
    return (
      sidebarLinks.find((l) =>
        l.exact ? pathname === l.href : pathname?.startsWith(l.href) && pathname !== '/admin'
      )?.label || 'Admin'
    );
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-dark-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-dark-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarCollapsed ? 'w-[72px]' : 'w-64'} bg-dark-950 text-white flex flex-col fixed h-full z-40 transition-[width] duration-200`}
      >
        <div className={`border-b border-dark-800 ${sidebarCollapsed ? 'p-3' : 'p-5'} flex items-center justify-between`}>
          <Link href="/" className={`flex items-center gap-2 font-bold ${sidebarCollapsed ? 'text-base justify-center' : 'text-lg'} overflow-hidden`}>
            <span className="text-xl"></span>
            {!sidebarCollapsed && <span className="whitespace-nowrap">paham-bareng</span>}
          </Link>
          {!sidebarCollapsed && <span className="text-xs text-dark-500">Admin</span>}
        </div>

        <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-3'} space-y-1`}>
          {sidebarLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname?.startsWith(link.href) && pathname !== '/admin';

            return (
              <Link
                key={link.href}
                href={link.href}
                title={sidebarCollapsed ? link.label : undefined}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'gap-3 px-4'} py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                <link.icon size={18} />
                {!sidebarCollapsed && link.label}
              </Link>
            );
          })}
        </nav>

        <div className={`border-t border-dark-800 ${sidebarCollapsed ? 'p-2' : 'p-3'} space-y-1`}>
          <button
            onClick={() => {
              setSidebarCollapsed((v) => {
                const next = !v;
                try {
                  localStorage.setItem('adminSidebarCollapsed', next ? '1' : '0');
                } catch {
                  // ignore
                }
                return next;
              });
            }}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'gap-2 px-4'} py-2.5 rounded-lg text-sm text-dark-300 hover:text-white hover:bg-dark-800 transition-all`}
          >
            <FiMenu size={16} />
            {!sidebarCollapsed && 'Collapse'}
          </button>
          <Link
            href="/"
            title={sidebarCollapsed ? 'Back to Site' : undefined}
            className={`flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'gap-2 px-4'} py-2.5 rounded-lg text-sm text-dark-400 hover:text-white hover:bg-dark-800 transition-all`}
          >
            <FiArrowLeft size={16} /> Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-64'} transition-[margin] duration-200`}>
        {/* Top bar */}
        <div className="bg-white border-b border-dark-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <h2 className="text-lg font-semibold text-dark-800">{activeLabel}</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-dark-700">{user.name}</span>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
