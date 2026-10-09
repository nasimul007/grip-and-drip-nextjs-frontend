import React from "react";

const Coupon = () => {
  return (
    <div className="bg-brand-card shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-brand-border py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-white">Have any Coupon Code?</h3>
      </div>

      <div className="py-8 px-4 sm:px-8.5">
        <div className="flex gap-4">
          <input
            type="text"
            name="coupon"
            id="coupon"
            placeholder="Enter coupon code"
            className="rounded-md border border-brand-border bg-brand-card placeholder:text-brand-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
          />

          <button
            type="submit"
            className="inline-flex font-medium text-brand-dark bg-brand-accent py-3 px-6 rounded-md ease-out duration-200 hover:bg-brand-hover"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default Coupon;
