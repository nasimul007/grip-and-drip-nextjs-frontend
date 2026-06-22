"use client";
import React, { useState } from "react";
import OrderActions from "./OrderActions";
import OrderModal from "./OrderModal";
import type { OrderListItem } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const SingleOrder = ({ order, smallView }: { order: OrderListItem; smallView: boolean }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const toggleDetails = () => setShowDetails(!showDetails);
  const toggleEdit = () => setShowEdit(!showEdit);
  const toggleModal = (status: boolean) => {
    setShowDetails(status);
    setShowEdit(status);
  };

  return (
    <>
      {!smallView && (
        <div className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex">
          <div className="min-w-[175px]">
            <p className="text-custom-sm text-red">#{order.order_number}</p>
          </div>
          <div className="min-w-[175px]">
            <p className="text-custom-sm text-dark">{formatDate(order.created_at)}</p>
          </div>
          <div className="min-w-[128px]">
            <span
              className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${
                order.status === "delivered"
                  ? "text-green bg-green-light-6"
                  : order.status === "cancelled"
                  ? "text-red bg-red-light-6"
                  : "text-yellow bg-yellow-light-4"
              }`}
            >
              {order.status}
            </span>
          </div>
          <div className="min-w-[113px]">
            <p className="text-custom-sm text-dark">${order.total.toFixed(2)}</p>
          </div>
          <div className="min-w-[113px]">
            <p className="text-custom-sm text-dark">{order.item_count}</p>
          </div>
          <div className="flex gap-5 items-center">
            <OrderActions toggleDetails={toggleDetails} toggleEdit={toggleEdit} />
          </div>
        </div>
      )}

      {smallView && (
        <div className="block md:hidden">
          <div className="py-4.5 px-7.5">
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Order:</span> #{order.order_number}
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Date:</span> {formatDate(order.created_at)}
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Status:</span>{" "}
              <span
                className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${
                  order.status === "delivered"
                    ? "text-green bg-green-light-6"
                    : order.status === "cancelled"
                    ? "text-red bg-red-light-6"
                    : "text-yellow bg-yellow-light-4"
                }`}
              >
                {order.status}
              </span>
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Total:</span> ${order.total.toFixed(2)}
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Items:</span> {order.item_count}
            </p>
            <p className="text-custom-sm text-dark flex items-center">
              <span className="font-bold pr-2">Actions:</span>{" "}
              <OrderActions toggleDetails={toggleDetails} toggleEdit={toggleEdit} />
            </p>
          </div>
        </div>
      )}

      <OrderModal
        showDetails={showDetails}
        showEdit={showEdit}
        toggleModal={toggleModal}
        orderId={order.id}
      />
    </>
  );
};

export default SingleOrder;
