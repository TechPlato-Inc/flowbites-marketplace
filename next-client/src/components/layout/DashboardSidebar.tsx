'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { LucideIcon, Menu, X } from 'lucide-react';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  path?: string;
  onClick?: () => void;
  badge?: number;
  section?: string;
}

interface DashboardSidebarProps {
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  headerActions?: ReactNode;
  children: ReactNode;
}

export function DashboardSidebar({
  title,
  subtitle,
  navItems,
  headerActions,
  children,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const sections = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section || 'main';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const renderNavItems = (onItemClick?: () => void) =>
    Object.entries(sections).map(([section, items], sectionIdx) => (
      <div key={section}>
        {sectionIdx > 0 && <div className="my-3 border-t border-neutral-100" />}
        {section !== 'main' && (
          <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            {section}
          </p>
        )}
        {items.map((item) => {
          const isActive = item.path ? pathname === item.path : false;
          const Icon = item.icon;

          const content = (
            <span
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              )}
            >
              <Icon size={18} className={isActive ? 'text-primary-500' : 'text-neutral-400'} />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full bg-error text-white">
                  {item.badge}
                </span>
              )}
            </span>
          );

          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={() => {
                  item.onClick?.();
                  onItemClick?.();
                }}
                className="w-full text-left"
              >
                {content}
              </button>
            );
          }

          return item.path ? (
            <Link key={item.label} href={item.path} onClick={onItemClick}>
              {content}
            </Link>
          ) : (
            <div key={item.label}>{content}</div>
          );
        })}
      </div>
    ));

  return (
    <div className="min-h-[calc(100vh-64px)] bg-neutral-50">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-neutral-200 bg-white min-h-[calc(100vh-64px)] sticky top-16 shrink-0">
          <div className="p-6 border-b border-neutral-100">
            <h2 className="text-lg font-display font-bold text-neutral-900">{title}</h2>
            {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">{renderNavItems()}</nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile + Tablet header bar */}
          <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setMobileNavOpen(!mobileNavOpen)}
                  className="lg:hidden p-2 -ml-2 hover:bg-neutral-100 rounded-lg shrink-0"
                >
                  {mobileNavOpen ? (
                    <X size={20} className="text-neutral-600" />
                  ) : (
                    <Menu size={20} className="text-neutral-600" />
                  )}
                </button>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-display font-bold text-neutral-900 truncate">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-xs sm:text-sm text-neutral-500 truncate lg:hidden">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              {headerActions && (
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">{headerActions}</div>
              )}
            </div>
          </div>

          {/* Mobile navigation dropdown */}
          {mobileNavOpen && (
            <div className="lg:hidden bg-white border-b border-neutral-200 px-4 py-3 shadow-sm">
              <nav className="space-y-1">{renderNavItems(() => setMobileNavOpen(false))}</nav>
            </div>
          )}

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
