'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/signals', label: 'Signals', icon: '📈' },
  { href: '/strategies', label: 'Strategies', icon: '⚙️' },
  { href: '/orders', label: 'Orders', icon: '📋' },
  { href: '/backtest', label: 'Backtest', icon: '📉' },
  { href: '/portfolio', label: 'Portfolio', icon: '💼' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-sidebar border-r border-border p-6 flex flex-col">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
          💹
        </div>
        <span className="text-xl font-bold">TradeEngine</span>
      </Link>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border pt-4 space-y-2 text-xs text-sidebar-foreground/70">
        <p>Trading Strategy Engine</p>
        <p>Real-time market monitoring & backtesting</p>
      </div>
    </aside>
  );
}
