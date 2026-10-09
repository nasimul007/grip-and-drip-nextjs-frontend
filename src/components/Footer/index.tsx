import Link from "next/link";
import { getCategoryTree } from "@/lib/server-api";
import { CONTACT, PAYMENT_METHODS, SITE_NAME } from "@/lib/site";

const linkClass = "ease-out duration-200 text-white hover:text-brand-accent";

const Footer = async () => {
  const year = new Date().getFullYear();
  const categories = (await getCategoryTree()).slice(0, 6);

  return (
    <footer className="overflow-hidden border-t border-brand-border">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap xl:flex-nowrap gap-10 xl:gap-19 xl:justify-between pt-17.5 xl:pt-22.5 pb-10 xl:pb-15">
          <div className="max-w-[330px] w-full">
            <p className="mb-5 text-custom-1 font-medium text-white">{SITE_NAME}</p>
            <p className="text-custom-sm text-brand-muted mb-6">
              Original gadgets and mobile accessories with cash on delivery
              across Bangladesh.
            </p>
            <address className="not-italic flex flex-col gap-3 text-white">
              <span>{CONTACT.address}</span>
              {CONTACT.phone && (
                <a href={`tel:${CONTACT.phone.replace(/[^+\d]/g, "")}`} className={linkClass}>
                  {CONTACT.phone}
                </a>
              )}
              {CONTACT.email && (
                <a href={`mailto:${CONTACT.email}`} className={linkClass}>
                  {CONTACT.email}
                </a>
              )}
            </address>
          </div>

          {categories.length > 0 && (
            <nav aria-label="Shop categories" className="w-full sm:w-auto">
              <p className="mb-7.5 text-custom-1 font-medium text-white">Shop</p>
              <ul className="flex flex-col gap-3">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link className={linkClass} href={`/category/${cat.slug}`}>
                      {cat.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link className={linkClass} href="/shop">
                    All products
                  </Link>
                </li>
              </ul>
            </nav>
          )}

          <nav aria-label="Account" className="w-full sm:w-auto">
            <p className="mb-7.5 text-custom-1 font-medium text-white">Account</p>
            <ul className="flex flex-col gap-3">
              <li><Link className={linkClass} href="/my-account">My Account</Link></li>
              <li><Link className={linkClass} href="/signin">Sign in / Register</Link></li>
              <li><Link className={linkClass} href="/cart">Cart</Link></li>
              <li><Link className={linkClass} href="/wishlist">Wishlist</Link></li>
            </ul>
          </nav>

          <nav aria-label="Help" className="w-full sm:w-auto">
            <p className="mb-7.5 text-custom-1 font-medium text-white">Help</p>
            <ul className="flex flex-col gap-3">
              <li><Link className={linkClass} href="/contact">Contact us</Link></li>
              <li><Link className={linkClass} href="/my-account">Track your order</Link></li>
              <li><Link className={linkClass} href="/shop">Browse all products</Link></li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="py-5 xl:py-7.5 bg-brand-dark">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-5 flex-wrap items-center justify-between">
            <p className="text-brand-muted font-medium">
              &copy; {year} {SITE_NAME}. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-medium">We accept:</p>
              <ul className="flex flex-wrap items-center gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <li
                    key={method}
                    className="text-custom-xs text-white border border-brand-border rounded-md px-2.5 py-1"
                  >
                    {method}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
