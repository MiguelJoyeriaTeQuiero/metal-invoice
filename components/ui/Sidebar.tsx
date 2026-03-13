'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  FileText,
  Users,
  Truck,
  ShoppingCart,
  Package,
  TrendingUp,
  BarChart2,
  Upload,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'VENTAS',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/facturas', label: 'Facturas de venta', icon: FileText },
      { href: '/clientes', label: 'Clientes', icon: Users },
    ],
  },
  {
    label: 'COMPRAS',
    items: [
      { href: '/proveedores', label: 'Proveedores', icon: Truck },
      { href: '/compras', label: 'Facturas de compra', icon: ShoppingCart },
    ],
  },
  {
    label: 'STOCK',
    items: [
      { href: '/inventario', label: 'Inventario', icon: Package },
    ],
  },
  {
    label: 'INFORMES',
    items: [
      { href: '/informes/beneficios', label: 'Beneficios', icon: TrendingUp },
      { href: '/informes/stock-mensual', label: 'Stock mensual', icon: BarChart2 },
    ],
  },
  {
    label: 'HERRAMIENTAS',
    items: [
      { href: '/clientes/importar', label: 'Importar Excel', icon: Upload },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-[#0f2747] text-white rounded-lg md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setOpen(false)} />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-[#0f2747] text-white z-40 flex flex-col transition-transform duration-200',
          'md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <span className="text-2xl">⚜️</span>
          <div>
            <p className="font-bold text-sm leading-tight">MetalFactura</p>
            <p className="text-blue-300 text-xs">Panel de gestión</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-4 text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-1">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      pathname.startsWith(href)
                        ? 'bg-white/15 text-white'
                        : 'text-blue-200 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
