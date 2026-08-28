"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { api, getTokens, clearTokens } from "@/lib/api";
import { setUser } from "@/redux/features/auth-slice";

export default function AuthInit() {
  const dispatch = useDispatch();

  useEffect(() => {
    const { access } = getTokens();
    if (!access) return;

    api
      .get<{
        id: number;
        username: string;
        full_name: string;
        email: string;
        phone_number: string;
        is_vendor: boolean;
      }>("/api/auth/profile/")
      .then((user) => dispatch(setUser(user)))
      .catch(() => clearTokens());
  }, [dispatch]);

  return null;
}
