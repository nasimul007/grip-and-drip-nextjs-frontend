import React from "react";
import type { Order } from "@/lib/types";

const OrderDetails = ({ orderItem }: { orderItem: Order }) => {
  return (
    <>
      <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex">
        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">Order</p>
        </div>
        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">Date</p>
        </div>
        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">Status</p>
        </div>
        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">Total</p>
        </div>
      </div>

      <div className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex">
        <div className="min-w-[111px]">
          <p className="text-custom-sm text-red">#{orderItem.order_number}</p>
        </div>
        <div className="min-w-[175px]">
          <p className="text-custom-sm text-dark">
            {new Date(orderItem.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="min-w-[128px]">
          <span
            className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${
              orderItem.status === "delivered"
                ? "text-green bg-green-light-6"
                : orderItem.status === "cancelled"
                ? "text-red bg-red-light-6"
                : "text-yellow bg-yellow-light-4"
            }`}
          >
            {orderItem.status}
          </span>
        </div>
        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">
            ${orderItem.total.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="px-7.5 w-full py-4 border-t border-gray-3">
        <p className="font-bold mb-2">Items:</p>
        {orderItem.items.map((item, i) => (
          <p key={i} className="text-custom-sm text-dark">
            {item.product_name} x {item.quantity} — $
            {(item.price * item.quantity).toFixed(2)}
          </p>
        ))}
      </div>

      {orderItem.shipping_address && (
        <div className="px-7.5 w-full pb-4">
          <p className="font-bold">Shipping Address:</p>
          <p className="text-custom-sm text-dark">
            {orderItem.shipping_address.full_name},{" "}
            {orderItem.shipping_address.address_line1},{" "}
            {orderItem.shipping_address.city}
          </p>
        </div>
      )}
    </>
  );
};

export default OrderDetails;
