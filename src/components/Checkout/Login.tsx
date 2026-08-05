import React, { useState } from "react";
import Link from "next/link";

const Login = () => {
  const [dropdown, setDropdown] = useState(false);

  return (
    <div className="bg-brand-card border border-brand-border rounded-[10px]">
      <div
        className={`flex items-center justify-between gap-3 py-5 px-5.5 ${
          dropdown && "border-b border-brand-border"
        }`}
      >
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 font-medium text-white bg-brand-accent py-2 px-4 rounded-md ease-out duration-200 hover:bg-brand-hover"
        >
          <svg
            className="fill-current"
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.6654 9.37502C17.0105 9.37502 17.2904 9.65484 17.2904 10C17.2904 10.3452 17.0105 10.625 16.6654 10.625H8.95703L8.95703 15C8.95703 15.2528 8.80476 15.4807 8.57121 15.5774C8.33766 15.6742 8.06884 15.6207 7.89009 15.442L2.89009 10.442C2.77288 10.3247 2.70703 10.1658 2.70703 10C2.70703 9.83426 2.77288 9.67529 2.89009 9.55808L7.89009 4.55808C8.06884 4.37933 8.33766 4.32586 8.57121 4.42259C8.80475 4.51933 8.95703 4.74723 8.95703 5.00002L8.95703 9.37502H16.6654Z"
              fill=""
            />
          </svg>
          Back to Cart
        </Link>

        <div
          onClick={() => setDropdown(!dropdown)}
          className="cursor-pointer flex items-center gap-0.5"
        >
          Returning customer?
          <span className="flex items-center gap-2.5 pl-1 font-medium text-white">
            Click here to login
            <svg
              className={`${
                dropdown && "rotate-180"
              } fill-current ease-out duration-200`}
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.06103 7.80259C4.30813 7.51431 4.74215 7.48092 5.03044 7.72802L10.9997 12.8445L16.9689 7.72802C17.2572 7.48092 17.6912 7.51431 17.9383 7.80259C18.1854 8.09088 18.1521 8.5249 17.8638 8.772L11.4471 14.272C11.1896 14.4927 10.8097 14.4927 10.5523 14.272L4.1356 8.772C3.84731 8.5249 3.81393 8.09088 4.06103 7.80259Z"
                fill=""
              />
            </svg>
          </span>
        </div>
      </div>

      {/* <!-- dropdown menu --> */}
      <div
        className={`${
          dropdown ? "block" : "hidden"
        } pt-7.5 pb-8.5 px-4 sm:px-8.5`}
      >
        <p className="text-custom-sm mb-6">
          If you didn&apos;t Logged in, Please Log in first.
        </p>

        <div className="mb-5">
          <label htmlFor="name" className="block mb-2.5">
            Username or Email
          </label>

          <input
            type="text"
            name="name"
            id="name"
            className="rounded-md border border-brand-border bg-brand-surface placeholder:text-brand-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-brand-accent/20"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="password" className="block mb-2.5">
            Password
          </label>

          <input
            type="password"
            name="password"
            id="password"
            autoComplete="on"
            className="rounded-md border border-brand-border bg-brand-surface placeholder:text-brand-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-brand-accent/20"
          />
        </div>

        <button
          type="submit"
          className="inline-flex font-medium text-white bg-brand-accent py-3 px-10.5 rounded-md ease-out duration-200 hover:bg-brand-hover"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
