"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { updateproductDetails } from "@/redux/features/product-details";
import { useCart } from "@/lib/useCart";
import { discountPercent, formatPrice } from "@/lib/format";
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
import type { Product, VariantItem } from "@/types/product";
import type { ShippingRate } from "@/lib/types";

type Props = {
  product: Product & { categoryName?: string; categorySlug?: string };
  shippingRates?: ShippingRate[];
};

const slugify = (v: string) => v.toLowerCase().replace(/\s+/g, "-");
const prettyKey = (k: string) => k.replace(/[_-]+/g, " ");

const ShopDetails = ({ product, shippingRates = [] }: Props) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { openPreviewModal } = usePreviewSlider();
  const { addItem } = useCart();
  const [previewImg, setPreviewImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs">("description");

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

  const specs = Object.entries(product.attributes || {}).filter(
    ([, v]) => v !== null && v !== undefined && String(v).trim() !== ""
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
    openPreviewModal();
  };

  const freeShipping = shippingRates.find((r) => r.free_shipping_minimum);
  const warrantyEntry = Object.entries(product.attributes || {}).find(([k]) =>
    k.toLowerCase().includes("warranty")
  );
  const warranty = warrantyEntry ? `${warrantyEntry[1]} warranty`.replace(/warranty warranty$/i, "warranty") : DEFAULT_WARRANTY;
  const orderMessage = `Hi, I want to order: ${product.title}${
    matchedVariant ? ` (${matchedVariant.name})` : ""
  } x${quantity} – ${formatPrice(salePrice)}\n${absoluteUrl(`/shop/${product.slug}`)}`;
  const whatsappOrder = whatsappHref(orderMessage);

  return (
    <>
      <section className="overflow-hidden relative pb-10 pt-7.5">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
            {/* Gallery */}
            <div className="lg:max-w-[570px] w-full flex flex-col sm:flex-row gap-4">
              <div className="flex-1 aspect-square lg:aspect-auto lg:min-h-[512px] rounded-lg border border-brand-border bg-brand-surface p-4 sm:p-7.5 relative flex items-center justify-center">
                {images.length > 0 && (
                  <button
                    type="button"
                    onClick={openZoom}
                    aria-label="Zoom product images"
                    className="w-11 h-11 rounded-[5px] bg-brand-card border border-brand-border flex items-center justify-center ease-out duration-200 text-white hover:text-brand-accent absolute top-4 lg:top-6 right-4 lg:right-6 z-10"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M20 20l-3.5-3.5M11 8v6M8 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
                {images[previewImg] ? (
                  <Image
                    src={images[previewImg]}
                    alt={matchedVariant ? `${product.title} – ${matchedVariant.name}` : product.title}
                    width={480}
                    height={480}
                    priority
                    sizes="(max-width: 1024px) 90vw, 480px"
                    className="object-contain max-h-[480px] w-auto h-auto"
                  />
                ) : (
                  <span className="text-brand-muted">No image available</span>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex sm:flex-col gap-2 sm:order-first overflow-x-auto no-scrollbar">
                  {images.map((src, i) => (
                    <button
                      type="button"
                      key={src}
                      onClick={() => setPreviewImg(i)}
                      aria-label={`Show image ${i + 1} of ${images.length}`}
                      aria-pressed={i === previewImg}
                      className={`flex items-center justify-center w-15 sm:w-20 h-15 sm:h-20 overflow-hidden rounded-lg bg-brand-surface border-2 ease-out duration-200 hover:border-brand-accent shrink-0 ${
                        i === previewImg ? "border-brand-accent" : "border-transparent"
                      }`}
                    >
                      <Image width={64} height={64} src={src} alt="" className="object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="max-w-[539px] w-full">
              {product.brand && (
                <p className="text-custom-sm text-brand-accent font-medium mb-1.5">{product.brand}</p>
              )}
              <h1 className="font-semibold text-xl sm:text-2xl xl:text-custom-3 text-white mb-3">
                {product.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-5 text-custom-sm">
                <span className={`font-medium ${inStock ? "text-green" : "text-red"}`}>
                  {inStock ? (stock <= 5 ? `Only ${stock} left` : "In stock") : "Out of stock"}
                </span>
                {(matchedVariant?.sku || product.sku) && (
                  <span>SKU: <span className="text-white">{matchedVariant?.sku || product.sku}</span></span>
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

              <div className="flex flex-wrap items-baseline gap-3 mb-6">
                <span className="font-semibold text-2xl sm:text-heading-6 text-white">
                  {formatPrice(salePrice)}
                </span>
                {showListPrice && (
                  <>
                    <span className="text-base line-through text-brand-muted">
                      <span className="sr-only">Regular price </span>
                      {formatPrice(listPrice)}
                    </span>
                    <span className="text-custom-sm font-medium text-brand-dark bg-brand-accent rounded px-2 py-0.5">
                      Save {savePct}%
                    </span>
                  </>
                )}
              </div>

              <form onSubmit={(e) => e.preventDefault()}>
                {Object.keys(variantAttrOptions).length > 0 && (
                  <div className="flex flex-col gap-4.5 border-y border-brand-border mb-7.5 py-7.5">
                    {Object.entries(variantAttrOptions).map(([attrKey, options]) => (
                      <fieldset key={attrKey} className="flex items-center gap-4">
                        <legend className="sr-only">{prettyKey(attrKey)}</legend>
                        <span className="min-w-[80px] font-medium text-white capitalize" aria-hidden="true">
                          {prettyKey(attrKey)}:
                        </span>
                        <div className="flex items-center gap-2.5 flex-wrap">
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
                                    className={`flex items-center justify-center w-7 h-7 rounded-full border-2 peer-focus-visible:ring-2 ring-brand-accent ${checked ? "border-brand-accent" : "border-transparent"}`}
                                  >
                                    <span className="block w-4.5 h-4.5 rounded-full border border-brand-border" style={{ backgroundColor: opt.title }} />
                                    <span className="sr-only">{opt.title}</span>
                                  </span>
                                ) : (
                                  <span
                                    className={`block px-4 py-2 rounded-md border text-sm font-medium transition peer-focus-visible:ring-2 ring-brand-accent ${
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

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-md border border-brand-border">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex items-center justify-center w-11 h-11 text-white hover:text-brand-accent disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="flex items-center justify-center w-12 h-11 border-x border-brand-border text-white" aria-live="polite">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={quantity >= stock}
                      onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                      className="flex items-center justify-center w-11 h-11 text-white hover:text-brand-accent disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="inline-flex font-medium text-white bg-brand-card border border-brand-border py-3 px-6 rounded-md ease-out duration-200 hover:bg-brand-hover hover:border-brand-accent disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {inStock ? "Add to Cart" : "Out of Stock"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={!inStock}
                    className="inline-flex font-medium text-brand-dark bg-brand-accent py-3 px-6 rounded-md ease-out duration-200 hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Buy Now
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
                    className="!w-11 !h-11 !rounded-md"
                  />
                </div>
              </form>

              {(CONTACT.phone || whatsappOrder) && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {whatsappOrder && (
                    <a
                      href={whatsappOrder}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] py-3 px-5 font-medium text-white hover:opacity-90"
                    >
                      <WhatsAppIcon size={20} /> Order on WhatsApp
                    </a>
                  )}
                  {CONTACT.phone && (
                    <a
                      href={telHref(CONTACT.phone)}
                      className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 rounded-md border border-brand-border py-3 px-5 font-medium text-white hover:border-brand-accent"
                    >
                      <PhoneIcon size={18} /> Call to order
                    </a>
                  )}
                </div>
              )}

              <ul className="mt-6 grid grid-cols-3 gap-2 text-center text-custom-xs sm:text-custom-sm">
                <li className="flex flex-col items-center gap-1.5 rounded-lg border border-brand-border bg-brand-card p-3">
                  <ShieldIcon className="text-brand-accent" />
                  <span className="text-white">100% original</span>
                </li>
                <li className="flex flex-col items-center gap-1.5 rounded-lg border border-brand-border bg-brand-card p-3">
                  <BadgeIcon className="text-brand-accent" />
                  <span className="text-white">{warranty}</span>
                </li>
                <li className="flex flex-col items-center gap-1.5 rounded-lg border border-brand-border bg-brand-card p-3">
                  <TruckIcon className="text-brand-accent" />
                  <span className="text-white">Cash on delivery</span>
                </li>
              </ul>

              {/* Delivery & payment */}
              <ul className="mt-7.5 rounded-lg border border-brand-border bg-brand-card divide-y divide-brand-border text-custom-sm">
                {shippingRates.length > 0 && (
                  <li className="p-4">
                    <p className="text-white font-medium mb-1">Delivery</p>
                    <ul className="flex flex-col gap-0.5">
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
                      <p className="mt-1 text-brand-accent">
                        Free delivery on orders over {formatPrice(freeShipping.free_shipping_minimum)}
                      </p>
                    )}
                  </li>
                )}
                <li className="p-4">
                  <p className="text-white font-medium mb-1">Payment</p>
                  <p>{PAYMENT_METHODS.join(" · ")}</p>
                </li>
                <li className="p-4 flex flex-wrap gap-x-4 gap-y-1">
                  <Link href="/return-policy" className="text-brand-accent hover:underline">Return policy</Link>
                  <Link href="/warranty-policy" className="text-brand-accent hover:underline">Warranty policy</Link>
                  <Link href="/shipping-policy" className="text-brand-accent hover:underline">Delivery info</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Description / specifications */}
      <section className="overflow-hidden bg-brand-surface py-10">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div
            role="tablist"
            aria-label="Product information"
            className="flex flex-wrap items-center bg-brand-card rounded-[10px] border border-brand-border gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6"
          >
            {([
              ["description", "Description"],
              ["specs", "Specifications"],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={activeTab === id}
                aria-controls={`panel-${id}`}
                onClick={() => setActiveTab(id)}
                className={`font-medium lg:text-lg ease-out duration-200 hover:text-brand-accent ${
                  activeTab === id ? "text-brand-accent" : "text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Both panels stay in the DOM so crawlers index them. */}
          <div
            role="tabpanel"
            id="panel-description"
            aria-labelledby="tab-description"
            hidden={activeTab !== "description"}
            className="mt-10 max-w-[800px]"
          >
            <h2 className="sr-only">Description</h2>
            {product.description ? (
              <div className="product-description" dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <p>No description available.</p>
            )}
          </div>

          <div
            role="tabpanel"
            id="panel-specs"
            aria-labelledby="tab-specs"
            hidden={activeTab !== "specs"}
            className="mt-10"
          >
            <h2 className="sr-only">Specifications</h2>
            {specs.length > 0 ? (
              <table className="w-full max-w-[800px] rounded-xl overflow-hidden border border-brand-border text-sm sm:text-base">
                <tbody>
                  {specs.map(([key, value]) => (
                    <tr key={key} className="odd:bg-brand-card">
                      <th scope="row" className="text-left font-normal text-brand-muted capitalize py-3 px-4 sm:px-5 w-2/5">
                        {prettyKey(key)}
                      </th>
                      <td className="text-white py-3 px-4 sm:px-5">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-brand-muted">No specifications listed.</p>
            )}
          </div>
        </div>
      </section>

      {/* Sticky add-to-cart for small screens */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-999 bg-brand-surface border-t border-brand-border px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold">{formatPrice(salePrice)}</p>
          <p className={`text-custom-xs ${inStock ? "text-green" : "text-red"}`}>
            {inStock ? "In stock" : "Out of stock"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className="font-medium text-white bg-brand-card border border-brand-border py-2.5 px-4 rounded-md disabled:opacity-40"
        >
          Add to Cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!inStock}
          className="font-medium text-brand-dark bg-brand-accent py-2.5 px-4 rounded-md disabled:opacity-40"
        >
          Buy Now
        </button>
      </div>
      <div className="lg:hidden h-18" aria-hidden="true" />
    </>
  );
};

export default ShopDetails;
