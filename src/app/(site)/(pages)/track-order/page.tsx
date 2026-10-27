import { Metadata } from "next";
import TrackOrder from "@/components/TrackOrder";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check the status of your Gadget & Widget order with your order number and phone number.",
  alternates: { canonical: "/track-order" },
  robots: { index: false, follow: true },
};

const TrackOrderPage = () => (
  <main>
    <TrackOrder />
  </main>
);

export default TrackOrderPage;
