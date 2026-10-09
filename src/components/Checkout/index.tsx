"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Breadcrumb from "../Common/Breadcrumb";
import CartEmpty from "../Common/CartEmpty";
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

  const handleChange = (e: { target: { name: string; value: string } }, displayName?: string) => {
    const { name, value } = e.target;
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
      ? "Inside Dhaka"
      : "Outside Dhaka"
    : "Outside Dhaka · choose your city to update";
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
    if (!formData.fullName.trim()) newErrors.fullName = "Enter your full name.";
    if (!formData.phone.trim()) newErrors.phone = "Enter a phone number we can call.";
    else if (!/^(\+?88)?01[3-9]\d{8}$/.test(formData.phone.replace(/[\s-]/g, "")))
      newErrors.phone = "Enter a valid Bangladeshi mobile number (01XXXXXXXXX).";
    if (!formData.division_id) newErrors.division = "Select a division.";
    if (!formData.city_id) newErrors.city = "Select a city.";
    if (!formData.area_id) newErrors.area = "Select an area.";
    if (!formData.address.trim()) newErrors.address = "Enter your full address.";
    if (!agree) newErrors.terms = "Please accept the terms and conditions.";

    setErrors(newErrors);
    const firstError = Object.keys(newErrors)[0];
    if (firstError) {
      focusField(firstError);
      return;
    }
    if (!shippingRate) {
      setSubmitError("Delivery rates could not be loaded. Please refresh the page and try again.");
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

      await api.post("/api/orders/", body);
      await clearCart();
      router.push("/order-success");
    } catch (err) {
      const message = (err as Error)?.message || "We could not place your order. Please try again.";
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
        <Breadcrumb title="Checkout" items={[{ name: "Cart", href: "/cart" }, { name: "Checkout" }]} />
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
      <Breadcrumb title="Checkout" items={[{ name: "Cart", href: "/cart" }, { name: "Checkout" }]} />
      <section className="bg-brand-dark pt-4 pb-24 lg:pb-10">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form id="checkout-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Login isAuthenticated={isAuthenticated} />

            {submitError && (
              <div role="alert" className="rounded-md border border-red bg-red-light-6/10 px-4 py-3 text-sm text-white">
                <span className="font-medium text-red">Order not placed.</span> {submitError}
              </div>
            )}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1 flex flex-col gap-4">
                <Billing formData={formData} onChange={handleChange} errors={errors} />
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
                        I agree to the{" "}
                        <Link href="/terms" target="_blank" className="text-brand-accent underline underline-offset-2">
                          terms and conditions
                        </Link>
                        , and the{" "}
                        <Link href="/return-policy" target="_blank" className="text-brand-accent underline underline-offset-2">
                          return policy
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
                    {loading ? "Placing order…" : `Place order · ${formatPrice(total)}`}
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
          <p className="text-custom-xs text-brand-muted">Total</p>
          <p className="font-semibold text-white">{formatPrice(total)}</p>
        </div>
        <button
          type="submit"
          form="checkout-form"
          disabled={loading}
          className="h-10 rounded-md bg-brand-accent px-6 text-sm font-medium text-brand-dark disabled:opacity-60"
        >
          {loading ? "Placing…" : "Place order"}
        </button>
      </div>
    </>
  );
};

export default Checkout;
