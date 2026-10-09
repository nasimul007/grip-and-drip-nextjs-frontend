"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import CustomSelect from "./CustomSelect";
import SearchSuggestions from "./SearchSuggestions";
import Dropdown from "./Dropdown";
import { menuData } from "./menuData";
import type { Menu } from "@/types/Menu";
import { useAppSelector } from "@/redux/store";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useLogout } from "@/lib/useLogout";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { PaginatedResponse } from "@/lib/types";
import { CONTACT, SITE_NAME, telHref, whatsappHref } from "@/lib/site";
import {
  CartIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  PhoneIcon,
  SearchIcon,
  UserIcon,
  WhatsAppIcon,
} from "@/components/Common/icons";

type CategoryOption = {
  label: string;
  value: string;
  slug?: string;
  children?: CategoryOption[];
};

type ApiCategory = { id: number; name: string; slug: string; children: ApiCategory[] };

function mapToTree(items: ApiCategory[]): CategoryOption[] {
  return items.map((item) => ({
    label: item.name,
    value: String(item.id),
    slug: item.slug,
    children: item.children?.length ? mapToTree(item.children) : undefined,
  }));
}

const LOGO = "/images/logo/g_w_dark_side_by_side01-removebg-preview.png";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([
    { label: "All Categories", value: "0" },
  ]);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const { openCartModal } = useCartModalContext();

  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = useSelector(selectTotalPrice);
  const { user, isAuthenticated } = useAppSelector((state) => state.authReducer);
  const handleLogout = useLogout();
  const whatsapp = whatsappHref();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    api
      .get<PaginatedResponse<ApiCategory>>("/api/categories/")
      .then((data) =>
        setCategoryOptions([{ label: "All Categories", value: "0" }, ...mapToTree(data.results)])
      )
      .catch(() => {});
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation.
  useEffect(() => {
    setNavigationOpen(false);
    setMobileSearchOpen(false);
    setShowSuggestions(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = navigationOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navigationOpen]);

  useEffect(() => {
    if (mobileSearchOpen) mobileSearchRef.current?.focus();
  }, [mobileSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  };

  const navItems: Menu[] = [
    ...menuData.slice(0, 2),
    ...(categoryOptions.length > 1
      ? [
          {
            id: 99,
            title: "Categories",
            newTab: false,
            submenu: categoryOptions.slice(1).map((c) => ({
              id: Number(c.value),
              title: c.label,
              newTab: false,
              path: `/category/${c.slug}`,
            })),
          },
        ]
      : []),
    ...menuData.slice(2),
  ];

  const searchInput = (id: string, ref?: React.Ref<HTMLInputElement>) => (
    <div className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        ref={ref}
        id={id}
        type="search"
        name="q"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Search earbuds, chargers, cables…"
        autoComplete="off"
        className="custom-search w-full rounded-md lg:rounded-l-none bg-brand-card border border-brand-border py-2.5 pl-4 pr-10 outline-none text-white placeholder:text-brand-muted focus:border-brand-accent"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-accent"
      >
        <SearchIcon size={18} />
      </button>
      <SearchSuggestions
        query={searchQuery}
        isOpen={showSuggestions}
        onClose={() => setShowSuggestions(false)}
      />
    </div>
  );

  return (
    <header
      className={`sticky top-0 w-full z-9999 bg-brand-surface transition-shadow ${
        scrolled ? "shadow-lg shadow-[#00000066]" : ""
      }`}
    >
      {/* Contact strip (desktop) */}
      {(CONTACT.phone || whatsapp) && (
        <div className="hidden lg:block bg-brand-dark border-b border-brand-border text-custom-xs">
          <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0 flex items-center justify-between py-1.5">
            <p className="text-brand-muted">100% original products · Cash on delivery all over Bangladesh</p>
            <div className="flex items-center gap-5">
              {CONTACT.phone && (
                <a href={telHref(CONTACT.phone)} className="flex items-center gap-1.5 text-white hover:text-brand-accent">
                  <PhoneIcon size={14} /> Hotline: {CONTACT.phone}
                </a>
              )}
              {whatsapp && (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white hover:text-brand-accent">
                  <WhatsAppIcon size={14} /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main row */}
      <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
        <div className="flex items-center gap-3 lg:gap-8 h-15 lg:h-18">
          <button
            type="button"
            className="lg:hidden -ml-1 p-1 text-white"
            aria-label={navigationOpen ? "Close menu" : "Open menu"}
            aria-expanded={navigationOpen}
            aria-controls="mobile-menu"
            onClick={() => setNavigationOpen((v) => !v)}
          >
            {navigationOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          <Link className="flex-shrink-0" href="/" aria-label={`${SITE_NAME} home`}>
            <Image
              src={LOGO}
              alt={SITE_NAME}
              width={250}
              height={48}
              priority
              className="h-8 w-auto lg:h-11"
            />
          </Link>

          {/* Desktop search */}
          <div className="hidden lg:block flex-1 max-w-[520px]" ref={searchRef}>
            <form onSubmit={handleSearch} role="search" className="flex items-center">
              <CustomSelect options={categoryOptions} />
              {searchInput("search-desktop")}
            </form>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-3 lg:gap-6">
            <button
              type="button"
              className="lg:hidden p-2 text-white"
              aria-label={mobileSearchOpen ? "Close search" : "Open search"}
              aria-expanded={mobileSearchOpen}
              onClick={() => setMobileSearchOpen((v) => !v)}
            >
              <SearchIcon />
            </button>

            <Link
              href={isAuthenticated ? "/my-account" : "/signin"}
              className="hidden lg:flex items-center gap-2.5 text-white hover:text-brand-accent"
            >
              <UserIcon />
              <span>
                <span className="block text-2xs text-brand-muted uppercase">Account</span>
                <span className="block font-medium text-custom-sm max-w-[110px] truncate">
                  {isAuthenticated && user ? user.full_name || user.username : "Sign in"}
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={openCartModal}
              aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
              className="flex items-center gap-2.5 p-2 lg:p-0 text-white hover:text-brand-accent"
            >
              <span className="relative inline-block">
                <CartIcon />
                <span className="absolute -right-2 -top-2 flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-full bg-brand-accent text-brand-dark text-2xs font-semibold">
                  {cartCount}
                </span>
              </span>
              <span className="hidden lg:block text-left">
                <span className="block text-2xs text-brand-muted uppercase">Cart</span>
                <span className="block font-medium text-custom-sm">{formatPrice(totalPrice)}</span>
              </span>
            </button>
          </div>
        </div>

        {/* Mobile search row */}
        {mobileSearchOpen && (
          <div className="lg:hidden pb-3" ref={searchRef}>
            <form onSubmit={handleSearch} role="search">
              {searchInput("search-mobile", mobileSearchRef)}
            </form>
          </div>
        )}
      </div>

      {/* Desktop nav */}
      <div className="hidden lg:block border-t border-brand-border">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0 flex items-center justify-between">
          <nav aria-label="Main">
            <ul className="flex items-center gap-6">
              {navItems.map((item) =>
                item.submenu ? (
                  <Dropdown key={item.id} menuItem={item} stickyMenu={scrolled} />
                ) : (
                  <li key={item.id}>
                    <Link
                      href={item.path || "/"}
                      aria-current={pathname === item.path ? "page" : undefined}
                      className={`flex py-2.5 text-custom-sm font-medium hover:text-brand-accent ${
                        pathname === item.path ? "text-brand-accent" : "text-white"
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>
          <ul className="flex items-center gap-5.5 text-custom-sm font-medium">
            <li>
              <Link href="/wishlist" className="flex items-center gap-1.5 text-white hover:text-brand-accent">
                <HeartIcon size={16} /> Wishlist
              </Link>
            </li>
            {isAuthenticated && (
              <li>
                <button type="button" onClick={handleLogout} className="text-white hover:text-brand-accent">
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Mobile drawer */}
      {navigationOpen && (
        <div id="mobile-menu" className="lg:hidden fixed inset-x-0 top-15 bottom-0 z-9999 bg-brand-dark overflow-y-auto">
          <nav aria-label="Mobile" className="px-4 py-5">
            <ul className="flex flex-col divide-y divide-brand-border border-y border-brand-border">
              {menuData.map((item) => (
                <li key={item.id}>
                  <Link href={item.path || "/"} className="block py-3.5 text-white font-medium">
                    {item.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={isAuthenticated ? "/my-account" : "/signin"} className="block py-3.5 text-white font-medium">
                  {isAuthenticated ? "My account" : "Sign in / Register"}
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="block py-3.5 text-white font-medium">
                  Wishlist
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <button type="button" onClick={handleLogout} className="block w-full text-left py-3.5 text-white font-medium">
                    Logout
                  </button>
                </li>
              )}
            </ul>

            {categoryOptions.length > 1 && (
              <>
                <p className="mt-6 mb-3 text-custom-sm uppercase tracking-wide text-brand-muted">Categories</p>
                <ul className="grid grid-cols-2 gap-2">
                  {categoryOptions.slice(1).map((c) => (
                    <li key={c.value}>
                      <Link
                        href={`/category/${c.slug}`}
                        className="block rounded-md border border-brand-border bg-brand-card px-3 py-2.5 text-custom-sm text-white"
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {(CONTACT.phone || whatsapp) && (
              <div className="mt-6 flex flex-col gap-2">
                {CONTACT.phone && (
                  <a href={telHref(CONTACT.phone)} className="flex items-center gap-2 text-white">
                    <PhoneIcon size={18} /> {CONTACT.phone}
                  </a>
                )}
                {whatsapp && (
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white">
                    <WhatsAppIcon size={18} /> Chat on WhatsApp
                  </a>
                )}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
