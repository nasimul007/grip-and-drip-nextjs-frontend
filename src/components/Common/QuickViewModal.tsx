"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDialogFocus } from "@/lib/useDialogFocus";
import Link from "next/link";
import { useDispatch } from "react-redux";

import { useModalContext } from "@/app/context/QuickViewModalContext";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { updateproductDetails } from "@/redux/features/product-details";
import { useCart } from "@/lib/useCart";
import { cartImgs } from "@/lib/media";
import { discountBadge, formatPrice, formatWarranty } from "@/lib/format";
import { getKeyDetails } from "@/lib/product-display";
import { attrsOf, defaultVariant, isOptionAvailable, pickVariantFor, variantMatches } from "@/lib/variants";
import ProductGallery from "@/components/ShopDetails/ProductGallery";
import QtyStepper from "@/components/Common/QtyStepper";
import WishlistButton from "@/components/Common/WishlistButton";

const slugifyOption = (val: string) => val.toLowerCase().replace(/\s+/g, "-");

const QuickViewModal = () => {
  const { isModalOpen, closeModal } = useModalContext();
  const { openPreviewModal } = usePreviewSlider();
  const dispatch = useDispatch<AppDispatch>();
  const { addItem } = useCart();

  const product = useAppSelector((state) => state.quickViewReducer.value);
  const loading = !product?.id;
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, isModalOpen);

  const [quantity, setQuantity] = useState(1);
  const [activePreview, setActivePreview] = useState(0);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  // Opens on the primary image; only the shopper's own option pick jumps to a variant image.
  const userPickedOption = useRef(false);

  const activeVariants = useMemo(
    () => (product?.variants || []).filter((v: any) => v.is_active !== false),
    [product?.variants]
  );

  // { attribute: [{ id, title }] } discovered from the variants.
  const variantAttrOptions = useMemo(() => {
    const map: Record<string, { id: string; title: string }[]> = {};
    activeVariants.forEach((v: any) =>
      Object.entries(v.attributes || {}).forEach(([key, val]) => {
        if (!val) return;
        map[key] ||= [];
        const id = slugifyOption(String(val));
        if (!map[key].some((o) => o.id === id)) map[key].push({ id, title: String(val) });
      })
    );
    return map;
  }, [activeVariants]);

  // A different product starts from its default variant and its primary image.
  useEffect(() => {
    userPickedOption.current = false;
    setActivePreview(0);
    setQuantity(1);
    setSelectedAttrs(attrsOf(defaultVariant(activeVariants)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const matchedVariant = useMemo(() => {
    if (Object.keys(selectedAttrs).length === 0) return null;
    return activeVariants.find((v: any) => variantMatches(v, selectedAttrs)) || null;
  }, [activeVariants, selectedAttrs]);

  // Keep the other choices when that combination exists, else jump to the closest variant.
  const selectOption = (key: string, value: string) => {
    userPickedOption.current = true;
    const next = pickVariantFor(activeVariants, selectedAttrs, key, value);
    setSelectedAttrs(next ? attrsOf(next) : { ...selectedAttrs, [key]: value });
  };

  const images = useMemo(() => {
    const list: string[] = [...(product?.imgs?.previews || [])].filter(Boolean);
    const vImg = matchedVariant?.image;
    if (vImg && !list.includes(vImg)) list.push(vImg);
    return list;
  }, [product?.imgs, matchedVariant]);

  useEffect(() => {
    const vImg = matchedVariant?.image;
    if (userPickedOption.current && vImg) setActivePreview(Math.max(0, images.indexOf(vImg)));
    setQuantity(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedVariant?.id]);

  const salePrice = Number(matchedVariant?.price_override ?? product?.discountedPrice ?? 0);
  const listPrice = Number(product?.price ?? 0);
  const stock = Number(matchedVariant?.stock ?? product?.stock ?? 0);
  const inStock = stock > 0;
  const badge = discountBadge(listPrice, salePrice);
  const warranty = formatWarranty(product?.warrantyMonths);
  const href = product?.slug ? `/shop/${product.slug}` : "/shop";

  const keyDetails = useMemo(
    () => getKeyDetails(product?.attributes, product?.description, 4),
    [product?.attributes, product?.description]
  );
  // A description sentence that just repeats the title would show the name twice.
  const fallbackText =
    keyDetails.fallback && !keyDetails.fallback.toLowerCase().startsWith((product?.title || "").toLowerCase().slice(0, 30))
      ? keyDetails.fallback
      : "";

  const handleZoom = () => {
    dispatch(updateproductDetails({ ...product, imgs: { thumbnails: images, previews: images } }));
    openPreviewModal(activePreview);
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: listPrice,
      discountedPrice: salePrice,
      quantity,
      stock,
      slug: product.slug,
      variantName: matchedVariant?.name,
      variantId: matchedVariant?.id,
      imgs: cartImgs(product.imgs, matchedVariant?.image),
    });
    closeModal();
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-99999 overflow-y-auto no-scrollbar bg-[#000000CC] px-3 py-4 sm:px-8 sm:py-10"
      onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={loading ? "Quick view" : `${product.title} quick view`}
        className="relative mx-auto w-full max-w-[1000px] rounded-xl border border-brand-border bg-brand-card p-4 sm:p-6"
      >
        <button
          onClick={closeModal}
          aria-label="Close quick view"
          className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-brand-surface text-xl leading-none text-brand-muted hover:text-white"
        >
          <span aria-hidden="true">×</span>
        </button>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-[minmax(0,480px)_1fr] animate-pulse" aria-busy="true">
            <div className="aspect-square rounded-lg bg-brand-surface" />
            <div className="flex flex-col gap-3">
              <div className="h-6 w-3/4 rounded bg-brand-surface" />
              <div className="h-4 w-1/3 rounded bg-brand-surface" />
              <div className="h-24 rounded bg-brand-surface" />
              <div className="h-10 w-1/2 rounded bg-brand-surface" />
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-[minmax(0,480px)_1fr] md:gap-8">
            <ProductGallery
              images={images}
              alt={product.title}
              selected={activePreview}
              onSelect={setActivePreview}
              onZoom={handleZoom}
            />

            <div className="min-w-0 text-sm">
              <h2 className="pr-9 text-lg font-semibold leading-snug text-white sm:text-xl">
                <Link href={href} onClick={closeModal} className="hover:text-brand-accent">
                  {product.title}
                </Link>
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={`font-medium ${inStock ? "text-green" : "text-red"}`}>
                  {inStock ? "In stock" : "Out of stock"}
                </span>
                {product.brand && <span className="text-brand-muted">Brand: {product.brand}</span>}
                {warranty && <span className="text-brand-muted">{warranty} warranty</span>}
                {product.reviews > 0 && (
                  <span className="text-brand-muted">{product.reviews} review{product.reviews > 1 ? "s" : ""}</span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-baseline gap-2">
                <span className="text-2xl font-semibold text-white">{formatPrice(salePrice)}</span>
                {listPrice > salePrice && (
                  <>
                    <span className="text-brand-muted line-through">{formatPrice(listPrice)}</span>
                    {badge && (
                      <span className="rounded bg-green px-2 py-0.5 text-custom-xs font-medium text-white">{badge}</span>
                    )}
                  </>
                )}
              </div>

              {(keyDetails.items.length > 0 || fallbackText) && (
                <div className="mt-4">
                  {keyDetails.items.length > 0 ? (
                    <ul className="flex flex-col gap-1">
                      {keyDetails.items.map((d) => (
                        <li key={d.label} className="flex gap-2">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" aria-hidden="true" />
                          <span>
                            <span className="capitalize text-brand-muted">{d.label}:</span>{" "}
                            <span className="text-white">{d.value}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-brand-muted">{fallbackText}</p>
                  )}
                </div>
              )}

              {Object.keys(variantAttrOptions).length > 0 && (
                <div className="mt-4 flex flex-col gap-3 border-y border-brand-border py-4">
                  {Object.entries(variantAttrOptions).map(([attrKey, options]) => (
                    <div key={attrKey} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <h3 className="min-w-[60px] font-medium capitalize text-white">{attrKey}:</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {options.map((opt) => {
                          const selected = selectedAttrs[attrKey] === opt.id;
                          const available = isOptionAvailable(activeVariants, selectedAttrs, attrKey, opt.id);
                          return (
                            <label key={opt.id} className={`cursor-pointer select-none ${available ? "" : "opacity-50"}`}>
                              <input
                                type="radio"
                                name={`qv-${attrKey}`}
                                className="sr-only"
                                checked={selected}
                                onChange={() => selectOption(attrKey, opt.id)}
                              />
                              {attrKey.toLowerCase() === "color" ? (
                                <span
                                  className={`flex h-6 w-6 items-center justify-center rounded-full ${selected ? "border" : ""}`}
                                  style={{ borderColor: opt.title }}
                                  title={opt.title}
                                >
                                  <span className="block h-3.5 w-3.5 rounded-full" style={{ backgroundColor: opt.title }} />
                                </span>
                              ) : (
                                <span
                                  className={`block rounded-md border px-3 py-1.5 font-medium transition ${
                                    selected
                                      ? "border-brand-accent bg-brand-accent text-brand-dark"
                                      : "border-brand-border bg-brand-card text-white hover:border-brand-accent"
                                  }`}
                                >
                                  {opt.title}
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <QtyStepper quantity={quantity} max={stock} onChange={(q) => setQuantity(Math.max(1, Math.min(q, stock || 1)))} label={product.title} />
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={handleAddToCart}
                  className={`inline-flex min-w-[140px] flex-1 items-center justify-center rounded-md bg-brand-accent px-6 py-2.5 font-medium text-brand-dark duration-200 hover:bg-brand-accent-dark sm:flex-none ${
                    inStock ? "" : "cursor-not-allowed opacity-40"
                  }`}
                >
                  {inStock ? "Add to cart" : "Out of stock"}
                </button>
                <WishlistButton
                  item={{
                    id: product.id,
                    title: product.title,
                    price: listPrice,
                    discountedPrice: salePrice,
                    slug: product.slug,
                    imgs: cartImgs(product.imgs, matchedVariant?.image),
                  }}
                  className="!h-10 !w-10"
                />
              </div>

              <Link
                href={href}
                onClick={closeModal}
                className="mt-4 inline-block font-medium text-brand-accent hover:underline"
              >
                View full product details →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickViewModal;
