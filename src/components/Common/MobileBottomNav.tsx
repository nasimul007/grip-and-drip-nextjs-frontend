"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { CartIcon, GridIcon, HomeIcon, SearchIcon, UserIcon } from "./icons";

// Pages with their own sticky action bar.
const HIDDEN_ON = [/^\/shop\/[^/]+$/, /^\/checkout/];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { openCartModal } = useCartModalContext();
  const cartCount = useAppSelector((s) =>
    s.cartReducer.items.reduce((sum, i) => sum + (i.quantity || 0), 0)
  );
  const isAuthenticated = useAppSelector((s) => s.authReducer.isAuthenticated);

  if (HIDDEN_ON.some((re) => re.test(pathname))) return null;

  const item = "flex flex-1 flex-col items-center justify-center gap-0.5 text-2xs";
  const active = (match: boolean) => (match ? "text-brand-accent" : "text-brand-muted");

  return (
    <>
      <div className="lg:hidden h-16" aria-hidden="true" />
      <nav
        aria-label="Quick navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-999 h-16 bg-brand-surface border-t border-brand-border flex pb-[env(safe-area-inset-bottom)]"
      >
        <Link href="/" className={`${item} ${active(pathname === "/")}`} aria-current={pathname === "/" ? "page" : undefined}>
          <HomeIcon size={22} />
          Home
        </Link>
        <Link
          href="/categories"
          className={`${item} ${active(pathname.startsWith("/categor"))}`}
        >
          <GridIcon size={22} />
          Categories
        </Link>
        <Link href="/shop" className={`${item} ${active(pathname === "/shop")}`}>
          <SearchIcon size={22} />
          Shop
        </Link>
        <button type="button" onClick={openCartModal} className={`${item} text-brand-muted`} aria-label={`Cart, ${cartCount} items`}>
          <span className="relative">
            <CartIcon size={22} />
            {cartCount > 0 && (
              <span className="absolute -right-2.5 -top-1.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-accent text-brand-dark text-[10px] font-semibold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </span>
          Cart
        </button>
        <Link
          href={isAuthenticated ? "/my-account" : "/signin"}
          className={`${item} ${active(pathname.startsWith("/my-account") || pathname === "/signin")}`}
        >
          <UserIcon size={22} />
          Account
        </Link>
      </nav>
    </>
  );
}
