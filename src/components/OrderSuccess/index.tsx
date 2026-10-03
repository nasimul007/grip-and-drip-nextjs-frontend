import React from "react";
import Link from "next/link";

const OrderSuccess = () => {
  return (
    <>
      <section className="overflow-hidden py-20 bg-brand-dark">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-brand-card border border-brand-border rounded-xl shadow-1 px-4 py-10 sm:py-15 lg:py-20 xl:py-25">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-accent/10 mb-6">
                <svg
                  className="w-10 h-10 text-brand-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="font-bold text-white text-4xl lg:text-[45px] lg:leading-[57px] mb-5">
                Successful!
              </h2>

              <h3 className="font-medium text-white text-xl sm:text-2xl mb-3">
                Order placed successfully
              </h3>

              <p className="max-w-[491px] w-full mx-auto mb-7.5 text-brand-muted">
                Thank you for your order. We'll send you a confirmation email shortly
                with your order details and tracking information.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {/* <Link
                  href="/"
                  className="inline-flex items-center gap-2 font-medium text-brand-dark bg-brand-accent py-3 px-6 rounded-md ease-out duration-200 hover:bg-brand-hover"
                >
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.6654 9.37502C17.0105 9.37502 17.2904 9.65484 17.2904 10C17.2904 10.3452 17.0105 10.625 16.6654 10.625H8.95703L8.95703 15C8.95703 15.2528 8.80476 15.4807 8.57121 15.5774C8.33766 15.6742 8.06884 15.6207 7.89009 15.442L2.89009 10.442C2.77288 10.3247 2.70703 10.1658 2.70703 10C2.70703 9.83426 2.77288 9.67529 2.89009 9.55808L7.89009 4.55808C8.06884 4.37933 8.33766 4.32586 8.57121 4.42259C8.80475 4.51933 8.95703 4.74723 8.95703 5.00002L8.95703 9.37502H16.6654Z"
                      fill=""
                    />
                  </svg>
                  Back to Home
                </Link> */}

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 font-medium text-brand-accent bg-brand-surface border border-brand-border py-3 px-6 rounded-md ease-out duration-200 hover:bg-brand-card hover:border-brand-accent/50"
                >
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.3536 1.14581C12.5139 1.14581 14.3081 2.94002 14.3081 5.09998C14.3081 7.25994 12.5139 9.05415 10.3536 9.05415C8.19327 9.05415 6.39907 7.25994 6.39907 5.09998C6.39907 2.94002 8.19327 1.14581 10.3536 1.14581ZM7.5208 5.09998C7.5208 3.65759 8.6856 2.52081 10.3536 2.52081C12.0216 2.52081 13.1864 3.65759 13.1864 5.09998C13.1864 6.54237 12.0216 7.67915 10.3536 7.67915C8.6856 7.67915 7.5208 6.54237 7.5208 5.09998Z"
                      fill=""
                    />
                    <path
                      d="M3.35364 16.0416C3.35364 15.2612 3.92324 14.4147 5.15108 13.724C6.35737 13.0455 8.07014 12.6041 10.0007 12.6041C11.93 12.6041 13.6428 13.0455 14.869 13.724C16.0968 14.4147 16.6664 15.2612 16.6664 16.0416C16.6664 17.2405 16.6295 17.9153 15.9991 18.4254C15.6594 18.702 15.0916 18.9719 14.1197 19.1686C13.1508 19.3648 11.8262 19.4791 10.0007 19.4791C8.191 19.4791 6.86638 19.3648 5.89751 19.1686C4.9256 18.9719 4.35781 18.702 4.01816 18.4254C3.39182 17.9153 3.35487 17.2405 3.35487 16.0416Z"
                      fill=""
                    />
                  </svg>
                  Explore more products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OrderSuccess;