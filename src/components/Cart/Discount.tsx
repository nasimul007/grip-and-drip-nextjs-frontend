import React from "react";

const Discount = () => {
  return (
    <div className="lg:max-w-[670px] w-full">
      <form>
        {/* <!-- coupon box --> */}
        <div className="bg-brand-card shadow-1 rounded-[10px]">
          <div className="border-b border-brand-border py-5 px-4 sm:px-5.5">
            <h3 className="">Have any discount code?</h3>
          </div>

          <div className="py-8 px-4 sm:px-8.5">
            <div className="flex flex-wrap gap-4 xl:gap-5.5">
              <div className="max-w-[426px] w-full">
                <input
                  type="text"
                  name="coupon"
                  id="coupon"
                  placeholder="Enter coupon code"
                  className="rounded-md border border-brand-border bg-brand-card placeholder:text-brand-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                />
              </div>

              <button
                type="submit"
                className="inline-flex font-medium text-brand-dark bg-brand-accent py-3 px-8 rounded-md ease-out duration-200 hover:bg-brand-hover"
              >
                Apply Code
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Discount;
