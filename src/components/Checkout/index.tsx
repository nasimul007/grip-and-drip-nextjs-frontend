"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import PaymentMethod from "./PaymentMethod";
import Billing from "./Billing";
import OrderSummary from "../Cart/OrderSummary";
import { useAppSelector } from "@/redux/store";
import { useCart } from "@/lib/useCart";
import { api } from "@/lib/api";
import type { ShippingRate } from "@/lib/types";

const Checkout = () => {
  const router = useRouter();
  const isAuthenticated = useAppSelector(
    (state) => state.authReducer.isAuthenticated
  );
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const { clearCart } = useCart();

  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    division: "",
    city: "",
    area: "",
    phone: "",
    email: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    api.get("/api/shipping-rates/").then((data: any) => {
      const ratesList = Array.isArray(data) ? data : data?.results || [];
      setRates(ratesList);
    });
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.discountedPrice * item.quantity,
    0
  );

  const cityKey = formData.city.toLowerCase().replace(/[-\s]/g, "");
  const insideDhaka = cityKey === "dhakanorth" || cityKey === "dhakasouth";
  const shippingRate =
    rates.find(
      (rate) =>
        rate.area_type === (insideDhaka ? "inside_dhaka" : "outside_dhaka")
    ) || rates.find((rate) => rate.area_type === "outside_dhaka") || null;
  const shippingCost = shippingRate ? Number(shippingRate.charge) || 0 : 0;
  const shippingLabel = insideDhaka ? "Inside Dhaka" : "Outside Dhaka";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }
    if (!shippingRate) return;
    if (
      !formData.fullName ||
      !formData.address ||
      !formData.division ||
      !formData.city ||
      !formData.area ||
      !formData.phone
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/orders/", {
        shipping_rate_id: shippingRate.id,
        notes,
        shipping_address: {
          full_name: formData.fullName,
          phone: formData.phone,
          address_line1: formData.address,
          address_line2: "",
          city: `${formData.area}, ${formData.city}`,
          state: formData.division,
          postal_code: "",
          country: "Bangladesh",
        },
      });
      await clearCart();
      router.push("/mail-success");
    } catch (err: any) {
      alert(err?.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden pt-4 pb-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-5 xl:gap-7">
              <div className="w-full lg:flex-[1.9] lg:min-w-0">
                <Login />
                <Billing formData={formData} onChange={handleChange} />
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Other Notes (optional)
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      rows={5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notes about your order, e.g. speacial notes for delivery."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    ></textarea>
                  </div>
                </div>

                <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
                  <div className="border-b border-gray-3 py-3 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Your Order
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    <div className="flex items-center justify-between py-3 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Product</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">
                          Subtotal
                        </h4>
                      </div>
                    </div>

                    {cartItems.length > 0 ? (
                      cartItems.map((item) => (
                        <div
                          key={item.lineKey || `${item.id}:${item.variantName || ""}`}
                          className="flex items-center justify-between py-3 border-b border-gray-3"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center rounded-[5px] bg-gray-2 max-w-[70px] w-full h-16 overflow-hidden">
                              {item.imgs?.thumbnails[0] ? (
                                <Image
                                  width={70}
                                  height={70}
                                  src={item.imgs.thumbnails[0]}
                                  alt="product"
                                  className="object-cover"
                                />
                              ) : (
                                <span className="text-dark-4 text-xs">
                                  No Image
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-dark">{item.title}</p>
                              <p className="text-dark-4 text-custom-sm">
                                ৳{item.discountedPrice.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="text-dark text-right">
                            ৳{(item.discountedPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-dark-4 mb-4">Your cart is empty!</p>
                        <Link
                          href="/shop-with-sidebar"
                          className="inline-flex font-medium text-white bg-blue py-2.5 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
                        >
                          Continue Shopping
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full lg:flex-1 lg:max-w-[420px] lg:min-w-0">
                <OrderSummary
                  cartItems={cartItems}
                  subtotal={subtotal}
                  shippingCost={shippingCost}
                  shippingLabel={shippingLabel}
                  showProceedLink={false}
                  sticky={false}
                />
                <PaymentMethod />

                <button
                  type="submit"
                  disabled={loading || cartItems.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Process to Checkout"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
