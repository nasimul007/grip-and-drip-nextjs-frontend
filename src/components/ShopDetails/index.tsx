"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { updateproductDetails } from "@/redux/features/product-details";
import { useCart } from "@/lib/useCart";
import { discountPercent, formatPrice } from "@/lib/format";
import { getKeyDetails, prettyKey } from "@/lib/product-display";
import {
  CONTACT,
  DEFAULT_WARRANTY,
  DELIVERY_TIME,
  PAYMENT_METHODS,
  absoluteUrl,
  telHref,
  whatsappHref,
} from "@/lib/site";
import { BadgeIcon, PhoneIcon, ShieldIcon, TruckIcon, WhatsAppIcon } from "@/components/Common/icons";
import WishlistButton from "@/components/Common/WishlistButton";
import ProductGallery from "./ProductGallery";
import ProductSections from "./ProductSections";
import type { Product, VariantItem } from "@/types/product";
import type { ShippingRate } from "@/lib/types";

type Props = {
  product: Product & { categoryName?: string; categorySlug?: string };
  shippingRates?: ShippingRate[];
};

const slugify = (v: string) => v.toLowerCase().replace(/\s+/g, "-");

const ShopDetails = ({ product, shippingRates = [] }: Props) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { openPreviewModal } = usePreviewSlider();
  const { addItem } = useCart();
  const [previewImg, setPreviewImg] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const variants: VariantItem[] = useMemo(
    () => (product.variants || []).filter((v) => v.is_active !== false),
    [product.variants]
  );

  // { attribute: [{ id, title }] } discovered from the variants.
  const variantAttrOptions = useMemo(() => {
    const map: Record<string, { id: string; title: string }[]> = {};
    variants.forEach((v) =>
      Object.entries(v.attributes || {}).forEach(([key, val]) => {
        if (!val) return;
        map[key] ||= [];
        if (!map[key].some((o) => o.id === slugify(String(val)))) {
          map[key].push({ id: slugify(String(val)), title: String(val) });
        }
      })
    );
    return map;
  }, [variants]);

  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(() => {
    // Default to the first in-stock variant, otherwise the first variant.
    const first = variants.find((v) => v.stock > 0) || variants[0];
    const initial: Record<string, string> = {};
    Object.entries(first?.attributes || {}).forEach(([k, v]) => {
      if (v) initial[k] = slugify(String(v));
    });
    return initial;
  });

  const matchedVariant = variants.find((v) =>
    Object.entries(selectedAttrs).every(
      ([key, val]) => slugify(String(v.attributes?.[key] ?? "")) === val
    )
  );

  const salePrice = Number(matchedVariant?.price_override ?? product.discountedPrice);
  const listPrice = Number(product.price);
  const showListPrice = listPrice > salePrice;
  const savePct = discountPercent(listPrice, salePrice);
  const stock = Number(matchedVariant?.stock ?? product.stock ?? 0);
  const inStock = stock > 0;

  const images = useMemo(() => {
    const list = [...(product.imgs?.previews || [])];
    const vImg = matchedVariant?.image;
    if (vImg && !list.includes(vImg)) list.unshift(vImg);
    return list;
  }, [product.imgs, matchedVariant]);

  useEffect(() => {
    const vImg = matchedVariant?.image;
    setPreviewImg(vImg ? Math.max(0, images.indexOf(vImg)) : 0);
    setQuantity(1);
  }, [matchedVariant?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const keyDetails = useMemo(
    () => getKeyDetails(product.attributes, product.description),
    [product.attributes, product.description]
  );

  const cartPayload = () => ({
    id: product.id,
    title: product.title,
    price: listPrice,
    discountedPrice: salePrice,
    quantity,
    stock,
    slug: product.slug,
    variantName: matchedVariant?.name,
    variantId: matchedVariant?.id,
    imgs: product.imgs,
  });

  const handleAddToCart = () => addItem(cartPayload());
  const handleBuyNow = async () => {
    await addItem(cartPayload());
    router.push("/checkout");
  };

  const openZoom = () => {
    dispatch(updateproductDetails({ ...product, imgs: { thumbnails: images, previews: images } }));
    openPreviewModal(previewImg);
  };

  const freeShipping = shippingRates.find((r) => r.free_shipping_minimum);
  const warrantyEntry = Object.entries(product.attributes || {}).find(([k]) =>
    k.toLowerCase().includes("warranty")
  );
  const warranty = warrantyEntry
    ? `${warrantyEntry[1]} warranty`.replace(/warranty warranty$/i, "warranty")
    : DEFAULT_WARRANTY;
  const orderMessage = `Hi, I want to order: ${product.title}${
    matchedVariant ? ` (${matchedVariant.name})` : ""
  } x${quantity} – ${formatPrice(salePrice)}\n${absoluteUrl(`/shop/${product.slug}`)}`;
  const whatsappOrder = whatsappHref(orderMessage);

  const sku = matchedVariant?.sku || product.sku;

  return (
    <>
      <section className="overflow-hidden relative pb-8 pt-5">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-6 xl:gap-10">
            <ProductGallery
              images={images}
              alt={matchedVariant ? `${product.title} – ${matchedVariant.name}` : product.title}
              selected={previewImg}
              onSelect={setPreviewImg}
              onZoom={openZoom}
            />

            {/* Summary: compact type scale so more information fits above the fold */}
            <div className="min-w-0 flex-1 max-w-[620px] text-[13px] leading-5">
              <h1 className="font-semibold text-lg sm:text-xl leading-snug text-white mb-2">
                {product.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-[13px]">
                <span className={`font-medium ${inStock ? "text-green" : "text-red"}`}>
                  {inStock ? (stock <= 5 ? `Only ${stock} left` : "In stock") : "Out of stock"}
                </span>
                {sku && (
                  <span>
                    SKU: <span className="text-white">{sku}</span>
                  </span>
                )}
                {product.brand && (
                  <span>
                    Brand: <span className="text-white">{product.brand}</span>
                  </span>
                )}
                {product.categoryName && product.categorySlug && (
                  <span>
                    Category:{" "}
                    <Link href={`/category/${product.categorySlug}`} className="text-white hover:text-brand-accent">
                      {product.categoryName}
                    </Link>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3 pb-3 border-b border-brand-border">
                <span className="font-semibold text-xl text-white">{formatPrice(salePrice)}</span>
                {showListPrice && (
                  <>
                    <span className="text-sm line-through text-brand-muted">
                      <span className="sr-only">Regular price </span>
                      {formatPrice(listPrice)}
                    </span>
                    <span className="text-xs font-semibold text-brand-dark bg-brand-accent rounded px-1.5 py-0.5">
                      Save {savePct}%
                    </span>
                  </>
                )}
              </div>

              {/* Key details */}
              {(keyDetails.items.length > 0 || keyDetails.fallback) && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-white mb-1.5">Key details</p>
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
                    <p>{keyDetails.fallback}</p>
                  )}
                  <a
                    href="#specification"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("specification")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="mt-1.5 inline-block text-brand-accent hover:underline"
                  >
                    View full specification
                  </a>
                </div>
              )}

              <form onSubmit={(e) => e.preventDefault()}>
                {Object.keys(variantAttrOptions).length > 0 && (
                  <div className="flex flex-col gap-3 border-y border-brand-border mb-4 py-4">
                    {Object.entries(variantAttrOptions).map(([attrKey, options]) => (
                      <fieldset key={attrKey} className="flex items-center gap-3">
                        <legend className="sr-only">{prettyKey(attrKey)}</legend>
                        <span className="min-w-[64px] font-medium text-white capitalize" aria-hidden="true">
                          {prettyKey(attrKey)}:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {options.map((opt) => {
                            const checked = selectedAttrs[attrKey] === opt.id;
                            const isColor = attrKey.toLowerCase() === "color";
                            return (
                              <label key={opt.id} className="cursor-pointer select-none" title={opt.title}>
                                <input
                                  type="radio"
                                  name={attrKey}
                                  value={opt.id}
                                  checked={checked}
                                  className="sr-only peer"
                                  onChange={() => setSelectedAttrs((p) => ({ ...p, [attrKey]: opt.id }))}
                                />
                                {isColor ? (
                                  <span
                                    className={`flex items-center justify-center w-6 h-6 rounded-full border-2 peer-focus-visible:ring-2 ring-brand-accent ${checked ? "border-brand-accent" : "border-transparent"}`}
                                  >
                                    <span className="block w-4 h-4 rounded-full border border-brand-border" style={{ backgroundColor: opt.title }} />
                                    <span className="sr-only">{opt.title}</span>
                                  </span>
                                ) : (
                                  <span
                                    className={`block px-3 py-1.5 rounded-md border text-[13px] font-medium transition peer-focus-visible:ring-2 ring-brand-accent ${
                                      checked
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
                      </fieldset>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center rounded-md border border-brand-border">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex items-center justify-center w-9 h-10 text-white hover:text-brand-accent disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="flex items-center justify-center w-10 h-10 border-x border-brand-border text-white text-sm" aria-live="polite">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={quantity >= stock}
                      onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                      className="flex items-center justify-center w-9 h-10 text-white hover:text-brand-accent disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={!inStock}
                    className="inline-flex text-sm font-medium text-brand-dark bg-brand-accent h-10 px-5 items-center rounded-md ease-out duration-200 hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Buy now
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="inline-flex text-sm font-medium text-white bg-brand-card border border-brand-border h-10 px-5 items-center rounded-md ease-out duration-200 hover:bg-brand-hover hover:border-brand-accent disabled:opacity-40 disabled:cursor-not-allowed"
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
                      imgs: product.imgs,
                    }}
                    className="!w-10 !h-10 !rounded-md"
                  />
                </div>
              </form>

              {(CONTACT.phone || whatsappOrder) && (
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {whatsappOrder && (
                    <a
                      href={whatsappOrder}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] h-10 px-4 text-sm font-medium text-white hover:opacity-90"
                    >
                      <WhatsAppIcon size={18} /> Order on WhatsApp
                    </a>
                  )}
                  {CONTACT.phone && (
                    <a
                      href={telHref(CONTACT.phone)}
                      className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-md border border-brand-border h-10 px-4 text-sm font-medium text-white hover:border-brand-accent"
                    >
                      <PhoneIcon size={16} /> Call to order
                    </a>
                  )}
                </div>
              )}

              <ul className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <li className="flex flex-col items-center gap-1 rounded-lg border border-brand-border bg-brand-card p-2.5">
                  <ShieldIcon className="text-brand-accent" size={18} />
                  <span className="text-white">100% original</span>
                </li>
                <li className="flex flex-col items-center gap-1 rounded-lg border border-brand-border bg-brand-card p-2.5">
                  <BadgeIcon className="text-brand-accent" size={18} />
                  <span className="text-white">{warranty}</span>
                </li>
                <li className="flex flex-col items-center gap-1 rounded-lg border border-brand-border bg-brand-card p-2.5">
                  <TruckIcon className="text-brand-accent" size={18} />
                  <span className="text-white">Cash on delivery</span>
                </li>
              </ul>

              <ul className="mt-3 rounded-lg border border-brand-border bg-brand-card divide-y divide-brand-border">
                {shippingRates.length > 0 && (
                  <li className="px-3.5 py-2.5">
                    <p className="text-white font-medium mb-0.5">Delivery</p>
                    <ul>
                      {shippingRates.map((r) => (
                        <li key={r.id}>
                          {r.area_type === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}:{" "}
                          <span className="text-white">{formatPrice(r.charge)}</span>
                          <span className="text-brand-muted">
                            {" "}· {r.area_type === "inside_dhaka" ? DELIVERY_TIME.insideDhaka : DELIVERY_TIME.outsideDhaka}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {freeShipping && (
                      <p className="mt-0.5 text-brand-accent">
                        Free delivery on orders over {formatPrice(freeShipping.free_shipping_minimum)}
                      </p>
                    )}
                  </li>
                )}
                <li className="px-3.5 py-2.5">
                  <span className="text-white font-medium">Payment: </span>
                  {PAYMENT_METHODS.join(" · ")}
                </li>
                <li className="px-3.5 py-2.5 flex flex-wrap gap-x-4 gap-y-1">
                  <Link href="/return-policy" className="text-brand-accent hover:underline">Return policy</Link>
                  <Link href="/warranty-policy" className="text-brand-accent hover:underline">Warranty policy</Link>
                  <Link href="/shipping-policy" className="text-brand-accent hover:underline">Delivery info</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ProductSections
        title={product.title}
        description={product.description}
        attributes={product.attributes}
        brand={product.brand}
        sku={product.sku}
        categoryName={product.categoryName}
      />

      {/* Sticky add-to-cart for small screens */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-999 bg-brand-surface border-t border-brand-border px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold">{formatPrice(salePrice)}</p>
          <p className={`text-xs ${inStock ? "text-green" : "text-red"}`}>{inStock ? "In stock" : "Out of stock"}</p>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className="text-sm font-medium text-white bg-brand-card border border-brand-border py-2.5 px-4 rounded-md disabled:opacity-40"
        >
          Add to cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!inStock}
          className="text-sm font-medium text-brand-dark bg-brand-accent py-2.5 px-4 rounded-md disabled:opacity-40"
        >
          Buy now
        </button>
      </div>
      <div className="lg:hidden h-18" aria-hidden="true" />
    </>
  );
};

export default ShopDetails;
