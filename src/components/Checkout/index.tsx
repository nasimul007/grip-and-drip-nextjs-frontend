"use client";
import { track } from "@/lib/track";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Breadcrumb from "../Common/Breadcrumb";
import CartEmpty from "../Common/CartEmpty";
import SavedAddresses from "./SavedAddresses";
import Login from "./Login";
import PaymentMethod, { type PaymentMethodValue } from "./PaymentMethod";
import Billing from "./Billing";
import OrderSummary from "../Cart/OrderSummary";
import { useAppSelector } from "@/redux/store";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useCart } from "@/lib/useCart";
import { useShippingRates } from "@/lib/useShippingRates";
import { formatPrice } from "@/lib/format";
import { api } from "@/lib/api";
import { saveLastOrder } from "@/lib/orders";
import type { Address, Order } from "@/lib/types";
import { useT } from "@/lib/i18n/client";

// Maps an error key to the id of the field that should receive focus.
const FIELD_IDS: Record<string, string> = {
  fullName: "fullName",
  phone: "phone",
  address: "address",
  division: "division",
  city: "city",
  area: "area",
  terms: "terms",
};

const Checkout = () => {
  const { t } = useT();
  const router = useRouter();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const subtotal = useAppSelector(selectTotalPrice);
  const { user, isAuthenticated } = useAppSelector((state) => state.authReducer);
  const { clearCart } = useCart();
  const rates = useShippingRates();

  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [payment, setPayment] = useState<PaymentMethodValue>("cash");
  const [bkashNumber, setBkashNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const placing = useRef(false);

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    division_id: "",
    division_name: "",
    city_id: "",
    city_name: "",
    area_id: "",
    area_name: "",
    phone: "",
    email: "",
    notes: "",
  });

  // One begin_checkout event per visit, once the cart has loaded.
  const checkoutTracked = useRef(false);
  useEffect(() => {
    if (checkoutTracked.current || cartItems.length === 0) return;
    checkoutTracked.current = true;
    track("begin_checkout", {
      value: cartItems.reduce((n, i) => n + i.discountedPrice * i.quantity, 0),
      items: cartItems.map((i) => ({ id: i.id, name: i.title, price: i.discountedPrice, quantity: i.quantity, variant: i.variantName })),
    });
  }, [cartItems]);

  // Prefill contact details for signed-in customers (never overwrite typing).
  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || user.full_name || "",
      phone: prev.phone || user.phone_number || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  // Saved addresses (signed-in customers): the default one is picked once they load.
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [saveAddress, setSaveAddress] = useState(true);

  const applyAddress = (a: Address | null) => {
    setAddressId(a ? a.id : null);
    setFormData((prev) =>
      a
        ? {
            ...prev,
            fullName: a.recipient_name || prev.fullName || user?.full_name || "",
            phone: a.phone || prev.phone || user?.phone_number || "",
            division_id: a.division_id,
            division_name: a.division_name,
            city_id: a.city_id,
            city_name: a.city_name,
            area_id: a.area_id,
            area_name: a.area_name,
            address: a.address,
          }
        : { ...prev, division_id: "", division_name: "", city_id: "", city_name: "", area_id: "", area_name: "", address: "" }
    );
    if (a) setErrors({});
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setAddresses([]);
      setAddressId(null);
      return;
    }
    api
      .getAddresses()
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results || [];
        setAddresses(list);
        const preferred = list.find((a) => a.is_default_shipping) || list[0];
        if (preferred) applyAddress(preferred);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleChange = (e: { target: { name: string; value: string } }, displayName?: string) => {
    const { name, value } = e.target;
    if (addressId !== null && ["address", "division_id", "city_id", "area_id"].includes(name)) setAddressId(null);
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (displayName !== undefined) next[name.replace("_id", "_name") as keyof typeof prev] = displayName;
      return next;
    });
    const errorKey = name.replace("_id", "");
    setErrors((prev) => {
      if (!prev[errorKey]) return prev;
      const next = { ...prev };
      delete next[errorKey];
      return next;
    });
  };

  const cityKey = formData.city_name.toLowerCase().replace(/[-\s]/g, "");
  const insideDhaka = cityKey === "dhakanorth" || cityKey === "dhakasouth";
  const shippingRate =
    rates.find((r) => r.area_type === (insideDhaka ? "inside_dhaka" : "outside_dhaka")) ||
    rates.find((r) => r.area_type === "outside_dhaka") ||
    null;
  const freeFrom = shippingRate?.free_shipping_minimum != null ? Number(shippingRate.free_shipping_minimum) : null;
  const shippingCost = !shippingRate ? 0 : freeFrom && subtotal >= freeFrom ? 0 : Number(shippingRate.charge) || 0;
  const shippingLabel = formData.city_id
    ? insideDhaka
      ? t("Inside Dhaka")
      : t("Outside Dhaka")
    : t("Outside Dhaka · choose your city to update");
  const total = subtotal + shippingCost;

  const focusField = (key: string) => {
    const el = document.getElementById(FIELD_IDS[key] || key);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    (el as HTMLElement | null)?.focus?.({ preventScroll: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (placing.current) return;
    setSubmitError("");

    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = t("Enter your full name.");
    if (!formData.phone.trim()) newErrors.phone = t("Enter a phone number we can call.");
    else if (!/^(\+?88)?01[3-9]\d{8}$/.test(formData.phone.replace(/[\s-]/g, "")))
      newErrors.phone = t("Enter a valid Bangladeshi mobile number (01XXXXXXXXX).");
    if (!formData.division_id) newErrors.division = t("Select a division.");
    if (!formData.city_id) newErrors.city = t("Select a city.");
    if (!formData.area_id) newErrors.area = t("Select an area.");
    if (!formData.address.trim()) newErrors.address = t("Enter your full address.");
    if (!agree) newErrors.terms = t("Please accept the terms and conditions.");

    setErrors(newErrors);
    const firstError = Object.keys(newErrors)[0];
    if (firstError) {
      focusField(firstError);
      return;
    }
    if (!shippingRate) {
      setSubmitError(t("Delivery rates could not be loaded. Please refresh the page and try again."));
      return;
    }

    placing.current = true;
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        shipping_rate_id: shippingRate.id,
        notes: formData.notes,
        payment_method: payment,
        payment_details:
          payment === "cash" && (bkashNumber.trim() || transactionId.trim())
            ? { advance_bkash_number: bkashNumber.trim(), advance_transaction_id: transactionId.trim() }
            : {},
        shipping_address: {
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim(),
          address_line1: formData.address.trim(),
          address_line2: "",
          city: `${formData.area_name}, ${formData.city_name}`,
          state: formData.division_name,
          country: "Bangladesh",
        },
      };

      // Signed-in orders are built from the server cart; guests send their lines.
      if (!isAuthenticated) {
        body.items = cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          variant_id: item.variantId ?? null,
        }));
      }

      const placed = await api.post<Order>("/api/orders/", body);
      saveLastOrder({
        order_number: placed.order_number,
        total: Number(placed.total),
        payment_method: placed.payment_method || payment,
        shipping_area: placed.shipping_area || shippingRate.area_type,
        phone: formData.phone.trim(),
        item_count: placed.items?.length ?? cartItems.length,
      });
      if (isAuthenticated && addressId === null && saveAddress) {
        try {
          await api.createAddress({
            address_name: formData.area_name || formData.city_name || "Home",
            recipient_name: formData.fullName.trim(),
            phone: formData.phone.trim(),
            division_id: formData.division_id,
            division_name: formData.division_name,
            city_id: formData.city_id,
            city_name: formData.city_name,
            area_id: formData.area_id,
            area_name: formData.area_name,
            address: formData.address.trim(),
            is_default_shipping: addresses.length === 0,
          });
        } catch {
          /* the order is placed; a failed save is not worth interrupting it */
        }
      }
      await clearCart();
      router.push("/order-success");
    } catch (err) {
      const message = (err as Error)?.message || t("We could not place your order. Please try again.");
      setSubmitError(message);
      toast.error(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      placing.current = false;
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !loading) {
    return (
      <>
        <Breadcrumb title={t("Checkout")} items={[{ name: t("Cart"), href: "/cart" }, { name: t("Checkout") }]} />
        <section className="bg-brand-dark py-8">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="rounded-lg border border-brand-border bg-brand-card">
              <CartEmpty />
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={t("Checkout")} items={[{ name: t("Cart"), href: "/cart" }, { name: t("Checkout") }]} />
      <section className="bg-brand-dark pt-4 pb-24 lg:pb-10">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form id="checkout-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Login isAuthenticated={isAuthenticated} />

            {submitError && (
              <div role="alert" className="rounded-md border border-red bg-red-light-6/10 px-4 py-3 text-sm text-white">
                <span className="font-medium text-red">{t("Order not placed.")}</span> {submitError}
              </div>
            )}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1 flex flex-col gap-4">
                {isAuthenticated && <SavedAddresses addresses={addresses} selectedId={addressId} onSelect={applyAddress} />}
                <Billing formData={formData} onChange={handleChange} errors={errors} />
                {isAuthenticated && addressId === null && (
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                    <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="h-4 w-4 accent-brand-accent" />
                    {t("Save this address for next time")}
                  </label>
                )}
                <PaymentMethod
                  payment={payment}
                  bkashNumber={bkashNumber}
                  transactionId={transactionId}
                  onPayment={setPayment}
                  onBkashNumberChange={setBkashNumber}
                  onTransactionIdChange={setTransactionId}
                />
              </div>

              <div className="w-full lg:w-[380px] lg:shrink-0">
                <OrderSummary
                  cartItems={cartItems}
                  subtotal={subtotal}
                  shippingCost={shippingCost}
                  shippingLabel={shippingLabel}
                  showProceedLink={false}
                  showItems
                >
                  <div>
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => {
                          setAgree(e.target.checked);
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.terms;
                            return next;
                          });
                        }}
                        className="mt-0.5 h-4 w-4 accent-brand-accent"
                      />
                      <span className="text-custom-xs text-brand-muted">
                        {t("I agree to the")}{" "}
                        <Link href="/terms" target="_blank" className="text-brand-accent underline underline-offset-2">
                          {t("terms and conditions")}
                        </Link>
                        {t(", and the")}{" "}
                        <Link href="/return-policy" target="_blank" className="text-brand-accent underline underline-offset-2">
                          {t("return policy")}
                        </Link>
                        .
                      </span>
                    </label>
                    {errors.terms && (
                      <p className="mt-1 text-custom-xs text-red" role="alert">
                        {errors.terms}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-11 w-full items-center justify-center rounded-md bg-brand-accent font-medium text-brand-dark hover:bg-brand-hover disabled:opacity-60"
                  >
                    {loading ? t("Placing order…") : `${t("Place order")} · ${formatPrice(total)}`}
                  </button>
                </OrderSummary>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Phones: total and Place order stay in reach */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-999 flex items-center gap-3 border-t border-brand-border bg-brand-surface px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-custom-xs text-brand-muted">{t("Total")}</p>
          <p className="font-semibold text-white">{formatPrice(total)}</p>
        </div>
        <button
          type="submit"
          form="checkout-form"
          disabled={loading}
          className="h-10 rounded-md bg-brand-accent px-6 text-sm font-medium text-brand-dark disabled:opacity-60"
        >
          {loading ? t("Placing…") : t("Place order")}
        </button>
      </div>
    </>
  );
};

export default Checkout;
