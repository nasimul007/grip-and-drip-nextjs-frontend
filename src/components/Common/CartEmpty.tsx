"use client";
import Link from "next/link";
import { CartIcon } from "./icons";
import { useT } from "@/lib/i18n/client";

/** Empty-cart state shared by the drawer and the cart page. */
export default function CartEmpty({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  const { t } = useT();
  return (
    <div className={`flex flex-col items-center text-center ${compact ? "py-10" : "py-16"}`}>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-surface border border-brand-border text-brand-accent mb-4">
        <CartIcon size={28} />
      </span>
      <p className="text-white font-medium mb-1">{t("Your cart is empty")}</p>
      <p className="text-custom-sm mb-5">{t("Add gadgets and accessories to get started.")}</p>
      <Link
        href="/shop"
        onClick={onNavigate}
        className="inline-flex items-center justify-center font-medium text-sm text-brand-dark bg-brand-accent h-10 px-6 rounded-md hover:bg-brand-hover"
      >
        {t("Continue shopping")}
      </Link>
    </div>
  );
}
