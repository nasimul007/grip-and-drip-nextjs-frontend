"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import SingleOrder from "./SingleOrder";
import OrderModal from "./OrderModal";
import { api } from "@/lib/api";
import { useReorder } from "@/lib/useReorder";
import type { OrderListItem, PaginatedResponse } from "@/lib/types";
import { useT } from "@/lib/i18n/client";

const Orders = () => {
  const { t } = useT();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const { reorder, busyId } = useReorder();

  useEffect(() => {
    api
      .get<PaginatedResponse<OrderListItem> | OrderListItem[]>("/api/orders/list/")
      .then((data) => setOrders(Array.isArray(data) ? data : data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-brand-border px-4 py-3.5 sm:px-5">
        <h2 className="text-lg font-semibold text-white">{t("My orders")}</h2>
        <Link href="/track-order" className="text-custom-sm text-brand-accent hover:underline">{t("Track an order")}</Link>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2 p-4 sm:p-5" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="h-14 rounded-md bg-brand-surface" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-white">{t("You have no orders yet.")}</p>
          <Link href="/shop" className="mt-4 inline-block rounded-md bg-brand-accent px-6 py-2.5 font-medium text-brand-dark hover:bg-brand-hover">
            {t("Start shopping")}
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden grid-cols-[1.5fr_1fr_1fr_90px] gap-x-3 border-b border-brand-border pl-5 pr-[110px] py-2.5 text-custom-xs uppercase tracking-wide text-brand-muted sm:grid">
            <span>{t("Order")}</span><span>{t("Date")}</span><span>{t("Status")}</span><span className="text-right">{t("Total")}</span>
          </div>
          <ul className="divide-y divide-brand-border">
            {orders.map((order) => (
              <SingleOrder key={order.id} order={order} onOpen={() => setOpenId(order.id)} onReorder={() => reorder(order.id)} reordering={busyId === order.id} />
            ))}
          </ul>
        </>
      )}

      {openId !== null && <OrderModal orderId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
};

export default Orders;
