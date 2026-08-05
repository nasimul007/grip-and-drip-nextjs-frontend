import React, { useState } from "react";
import Image from "next/image";

const BkashNumber = "01XXX-XXXXXX";

const PaymentMethod = () => {
  const [payment, setPayment] = useState("cash");
  const [bkashNumber, setBkashNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");

  return (
    <div className="bg-brand-card border border-brand-border rounded-[10px] mt-7.5">
      <div className="border-b border-brand-border py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-white">Payment Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-3">
          <label
            htmlFor="cash"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="cash"
                id="cash"
                className="sr-only"
                onChange={() => setPayment("cash")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  payment === "cash"
                    ? "border-4 border-brand-accent"
                    : "border border-brand-border"
                }`}
              ></div>
            </div>

            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-brand-surface hover:border-transparent hover:shadow-none min-w-[240px] ${
                payment === "cash"
                  ? "border-transparent bg-brand-surface"
                  : " border-brand-border"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-2.5">
                  <Image
                    src="/images/checkout/cash.svg"
                    alt="cash"
                    width={21}
                    height={21}
                  />
                </div>

                <div className="border-l border-brand-border pl-2.5">
                  <p>Cash on delivery</p>
                  <p className="text-custom-xs text-brand-muted">
                    minimum advance 200tk
                  </p>
                </div>
              </div>
            </div>
          </label>

          <div
            className={`grid transition-[grid-template-rows] ease-out duration-300 ${
              payment === "cash" ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="rounded-md border border-brand-border bg-brand-surface p-5">
                <p className="text-custom-sm text-white mb-4">
                  অর্ডার কনফার্ম করতে অনুগ্রহ করে নিচের বিকাশ মার্চেন্ট নাম্বারে ২০০ টাকা সেন্ড মানি করে,
                  বিকাশ নাম্বার ও ট্রান্সেকশন আইডি নিচের বক্সে লিখুন।
                </p>

                <div className="flex items-center justify-between mb-5 text-custom-sm">
                  <span className="text-white font-medium">
                    bKash Merchant Number:
                  </span>
                  <span className="font-semibold text-brand-accent">{BkashNumber}</span>
                </div>

                <div className="mb-4">
                  <label htmlFor="bkashNumber" className="block mb-2.5">
                    bKash Number
                  </label>
                  <input
                    type="text"
                    name="bkashNumber"
                    id="bkashNumber"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="rounded-md border border-brand-border bg-brand-card placeholder:text-brand-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-brand-accent/20"
                  />
                </div>

                <div>
                  <label htmlFor="transactionId" className="block mb-2.5">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Transaction ID"
                    className="rounded-md border border-brand-border bg-brand-card placeholder:text-brand-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-brand-accent/20"
                  />
                </div>
              </div>
            </div>
          </div>

          <label
            htmlFor="bank"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="bank"
                id="bank"
                className="sr-only"
                onChange={() => setPayment("bank")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  payment === "bank"
                    ? "border-4 border-brand-accent"
                    : "border border-brand-border"
                }`}
              ></div>
            </div>

            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-brand-surface hover:border-transparent hover:shadow-none ${
                payment === "bank"
                  ? "border-transparent bg-brand-surface"
                  : " border-brand-border"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-2.5">
                  <Image
                    src="/images/checkout/bank.svg"
                    alt="bank"
                    width={29}
                    height={12}
                  />
                </div>

                <div className="border-l border-brand-border pl-2.5">
                  <p>Bank payment</p>
                  <p className="text-custom-xs text-brand-muted">
                    Stripe payment coming soon
                  </p>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
