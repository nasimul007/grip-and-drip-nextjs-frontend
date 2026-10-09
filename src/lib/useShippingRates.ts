"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PaginatedResponse, ShippingRate } from "@/lib/types";
export { freeShippingThreshold } from "@/lib/shipping";

let cache: ShippingRate[] | null = null;
let inflight: Promise<ShippingRate[]> | null = null;

function loadRates(): Promise<ShippingRate[]> {
  if (cache) return Promise.resolve(cache);
  inflight ||= api
    .get<PaginatedResponse<ShippingRate> | ShippingRate[]>("/api/shipping-rates/")
    .then((data) => {
      cache = Array.isArray(data) ? data : data?.results || [];
      return cache;
    })
    .catch(() => [] as ShippingRate[])
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Active shipping rates, fetched once and shared across components. */
export function useShippingRates(): ShippingRate[] {
  const [rates, setRates] = useState<ShippingRate[]>(cache || []);
  useEffect(() => {
    let alive = true;
    loadRates().then((r) => alive && setRates(r));
    return () => {
      alive = false;
    };
  }, []);
  return rates;
}
