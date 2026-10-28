"use client";
import { usePathname } from "next/navigation";
import { whatsappHref } from "@/lib/site";
import { WhatsAppIcon } from "./icons";
import { useT } from "@/lib/i18n/client";

/** Floating "chat on WhatsApp" button; renders only when NEXT_PUBLIC_WHATSAPP is set. */
export default function WhatsAppFloat() {
  const { t } = useT();
  const pathname = usePathname();
  const href = whatsappHref("Hi, I have a question about a product.");
  // Product pages have their own "Order on WhatsApp" button.
  if (!href || /^\/(checkout|cart)/.test(pathname) || /^\/shop\/[^/]+$/.test(pathname)) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("Chat with us on WhatsApp")}
      className="fixed left-4 lg:left-auto lg:right-8 bottom-24 lg:bottom-20 z-999 flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition"
    >
      <WhatsAppIcon size={26} />
    </a>
  );
}
