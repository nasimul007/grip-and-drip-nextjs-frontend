"use client";
import { Toaster } from "react-hot-toast";
import { ReduxProvider } from "@/redux/provider";
import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import dynamic from "next/dynamic";
import CartInit from "@/components/Providers/CartInit";
import AuthInit from "@/components/Providers/AuthInit";
import StoreHydrator from "@/components/Providers/StoreHydrator";

// Modals are only needed after a click, so keep them out of the first-load JS bundle.
const QuickViewModal = dynamic(() => import("@/components/Common/QuickViewModal"), { ssr: false });
const CartSidebarModal = dynamic(() => import("@/components/Common/CartSidebarModal"), { ssr: false });
const PreviewSliderModal = dynamic(() => import("@/components/Common/PreviewSlider"), { ssr: false });

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <CartModalProvider>
        <ModalProvider>
          <PreviewSliderProvider>
            {children}
            <QuickViewModal />
            <CartSidebarModal />
            <PreviewSliderModal />
            <StoreHydrator />
            <CartInit />
            <AuthInit />
            <Toaster
              toastOptions={{
                style: {
                  background: "#242428",
                  color: "#FFFFFF",
                  border: "1px solid #2A2A30",
                },
              }}
            />
          </PreviewSliderProvider>
        </ModalProvider>
      </CartModalProvider>
    </ReduxProvider>
  );
}
