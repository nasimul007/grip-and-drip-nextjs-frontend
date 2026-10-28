"use client";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useCart } from "@/lib/useCart";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";

type ReorderResult = { added: number; skipped: { name: string; reason: string }[] };

/** Put a past order's available items back in the cart and open the cart. */
export function useReorder() {
  const { fetchCart } = useCart();
  const { openCartModal } = useCartModalContext();
  const [busyId, setBusyId] = useState<number | null>(null);

  const reorder = useCallback(
    async (orderId: number) => {
      setBusyId(orderId);
      try {
        const res = await api.post<ReorderResult>(`/api/orders/${orderId}/reorder/`);
        await fetchCart();
        if (res.added > 0) openCartModal();
        else toast.error("None of these items are available right now.");
        if (res.skipped.length > 0) {
          toast(res.skipped.map((s) => `${s.name}: ${s.reason}`).join("\n"), { icon: "ℹ️", duration: 6000 });
        }
      } catch (err) {
        toast.error((err as Error).message || "Could not reorder. Please try again.");
      } finally {
        setBusyId(null);
      }
    },
    [fetchCart, openCartModal]
  );

  return { reorder, busyId };
}
