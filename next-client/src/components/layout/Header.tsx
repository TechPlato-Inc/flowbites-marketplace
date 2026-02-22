"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button, Logo, Badge } from "@/design-system";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { SearchOverlay } from "./SearchOverlay";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { NotificationBell } from "@/modules/notifications/components/NotificationBell";

const NAV_LINKS = [
  { href: "/templates", label: "Templates" },
  { href: "/services", label: "Services" },
  { href: "/ui-shorts", label: "UI Shorts" },
];

export function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Close user menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    router.push("/");
  };

  const getDashboardPath = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "creator") return "/dashboard/creator";
    return "/dashboard/buyer";
  };

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <>
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-30">
        <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Nav */}
            <div className="flex items-center gap-8">
              <Logo size="md" />

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "text-primary-600 bg-primary-50"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchOpen(true)}
                className="hidden sm:!inline-flex !text-neutral-400 !border !border-neutral-200 hover:!border-neutral-300 hover:!text-neutral-500"
                leftIcon={<Search size={16} />}
              >
                <span>Search...</span>
                <kbd className="hidden lg:inline-block text-xs bg-neutral-100 px-1.5 py-0.5 rounded font-mono ml-2">
                  &#8984;K
                </kbd>
              </Button>

              {/* Mobile search icon */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchOpen(true)}
                className="sm:hidden !p-2 !text-neutral-600"
              >
                <Search size={20} />
              </Button>

              {/* Cart */}
              <CartDrawer />

              {/* Notifications */}
              {isAuthenticated && <NotificationBell />}

              {isAuthenticated && user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-neutral-700 max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`hidden md:block text-neutral-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* User Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <p className="text-sm font-medium text-neutral-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                        <Badge
                          variant="info"
                          size="sm"
                          className="mt-1 capitalize"
                        >
                          {user.role}
                        </Badge>
                      </div>

                      <Link
                        href={getDashboardPath()}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <Settings size={16} />
                        Settings
                      </Link>

                      <div className="border-t border-neutral-100 mt-1 pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<LogOut size={16} />}
                          onClick={handleLogout}
                          className="w-full !justify-start !px-4 !py-2.5 !text-error hover:!bg-red-50 !rounded-none"
                        >
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button size="sm" variant="ghost">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" className="hidden sm:block">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden !p-2 !text-neutral-600"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white">
            <nav className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-primary-600 bg-primary-50"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  href="/register"
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 sm:hidden"
                >
                  Sign Up
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
