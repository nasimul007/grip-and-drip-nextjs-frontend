"use client";
import toast from "react-hot-toast";
import Link from "next/link";

const card =
  "flex items-start gap-3 rounded-lg border border-brand-border bg-brand-card px-3.5 py-2.5 text-sm text-white shadow-lg max-w-[340px]";

/** "Added to cart" toast with a shortcut to the cart drawer. */
export function notifyAdded(label: string, openCart?: () => void, note?: string) {
  toast.custom(
    (t) => (
      <div className={`${card} ${t.visible ? "animate-enter" : "opacity-0"}`} role="status">
        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand-accent" aria-hidden="true" />
        <div className="min-w-0">
          <p className="line-clamp-2">
            <span className="font-medium">Added to cart:</span> {label}
          </p>
          {note && <p className="text-brand-muted text-custom-xs mt-0.5">{note}</p>}
          <div className="mt-1.5 flex gap-4">
            <button
              type="button"
              className="font-medium text-brand-accent hover:underline"
              onClick={() => {
                toast.dismiss(t.id);
                openCart?.();
              }}
            >
              View cart
            </button>
            <Link href="/checkout" onClick={() => toast.dismiss(t.id)} className="text-white hover:text-brand-accent">
              Checkout
            </Link>
          </div>
        </div>
      </div>
    ),
    { duration: 3500, id: "cart-added" }
  );
}

export function notifyCartError(message: string) {
  toast.error(message, { id: "cart-error" });
}

export function notifyCartInfo(message: string, openCart?: () => void) {
  toast(
    (t) => (
      <span className="text-sm">
        {message}
        {openCart && (
          <button
            type="button"
            className="ml-2 font-medium text-brand-accent hover:underline"
            onClick={() => {
              toast.dismiss(t.id);
              openCart();
            }}
          >
            View cart
          </button>
        )}
      </span>
    ),
    { id: "cart-info" }
  );
}
