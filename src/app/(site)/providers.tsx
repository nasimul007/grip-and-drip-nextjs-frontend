"use client";
import { Toaster } from "react-hot-toast";
import { ReduxProvider } from "@/redux/provider";
import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import PreviewSliderModal from "@/components/Common/PreviewSlider";
import CartInit from "@/components/Providers/CartInit";
import AuthInit from "@/components/Providers/AuthInit";
import StoreHydrator from "@/components/Providers/StoreHydrator";

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
