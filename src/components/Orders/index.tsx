"use client";
import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";
import { api } from "@/lib/api";
import type { OrderListItem } from "@/lib/types";

const Orders = () => {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<OrderListItem[]>("/api/orders/list/")
      .then((data) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">Loading orders...</p>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[770px]">
          {orders.length > 0 && (
            <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex ">
              <div className="min-w-[175px]">
                <p className="text-custom-sm text-dark">Order</p>
              </div>
              <div className="min-w-[175px]">
                <p className="text-custom-sm text-dark">Date</p>
              </div>
              <div className="min-w-[128px]">
                <p className="text-custom-sm text-dark">Status</p>
              </div>
              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Total</p>
              </div>
              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Items</p>
              </div>
            </div>
          )}
          {orders.length > 0 ? (
            orders.map((order, key) => (
              <SingleOrder key={key} order={order} smallView={false} />
            ))
          ) : (
            <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">
              You don&apos;t have any orders!
            </p>
          )}
        </div>

        {orders.length > 0 &&
          orders.map((order, key) => (
            <SingleOrder key={key} order={order} smallView={true} />
          ))}
      </div>
    </>
  );
};

export default Orders;
