import Contact from "@/components/Contact";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contact us",
  description: "Questions about an order, a product or delivery? Contact Gadget & Widget customer support in Dhaka, Bangladesh.",
  alternates: { canonical: "/contact" },
};

const ContactPage = () => {
  return (
    <main>
      <Contact />
    </main>
  );
};

export default ContactPage;
