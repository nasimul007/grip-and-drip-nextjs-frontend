// Store policy content. REVIEW AND EDIT before launch: these are sensible
// defaults for a Bangladeshi gadget shop, not legal advice.
import { DELIVERY_TIME, SITE_NAME } from "./site";

export type Policy = {
  slug: string;
  title: string;
  description: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
};

export const POLICIES: Policy[] = [
  {
    slug: "shipping-policy",
    title: "Shipping & delivery policy",
    description: `Delivery areas, charges and delivery times for ${SITE_NAME} orders across Bangladesh.`,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Delivery areas",
        body: ["We deliver to all 64 districts of Bangladesh through our own riders inside Dhaka and trusted courier partners outside Dhaka."],
      },
      {
        heading: "Delivery time",
        body: [
          `Inside Dhaka: ${DELIVERY_TIME.insideDhaka} after order confirmation.`,
          `Outside Dhaka: ${DELIVERY_TIME.outsideDhaka} after order confirmation.`,
          "Orders placed after 6 PM, on Fridays or on public holidays are processed the next working day.",
        ],
      },
      {
        heading: "Delivery charges",
        body: ["Delivery charges are shown at checkout before you place the order. Orders above the free-delivery amount shown on the product page are delivered free."],
      },
      {
        heading: "Order confirmation",
        body: ["Our team calls or messages you to confirm every order before dispatch. Please keep your phone reachable."],
      },
      {
        heading: "Receiving your parcel",
        body: ["Please check the parcel in front of the delivery person. If the box is damaged or the product is wrong, refuse the parcel and contact us immediately."],
      },
    ],
  },
  {
    slug: "return-policy",
    title: "Return & refund policy",
    description: `How to return or replace a product bought from ${SITE_NAME}, and how refunds work.`,
    updated: "2026-10-09",
    sections: [
      {
        heading: "7-day replacement",
        body: ["If a product arrives damaged, defective or different from what you ordered, you can request a replacement within 7 days of delivery."],
      },
      {
        heading: "Conditions",
        body: [
          "The product must be unused, in its original box with all accessories, manuals and gifts.",
          "Physical damage, liquid damage or missing parts caused after delivery are not covered.",
          "Change-of-mind returns are accepted only for unopened, sealed products.",
        ],
      },
      {
        heading: "How to request",
        body: ["Contact us with your order number and a photo or short video of the issue. We will arrange pickup or tell you where to send the product."],
      },
      {
        heading: "Refunds",
        body: ["If a replacement is not available, we refund the product price to your bKash or bank account within 7 working days after we receive and check the returned product. Delivery charges are refundable only when the mistake was ours."],
      },
    ],
  },
  {
    slug: "warranty-policy",
    title: "Warranty policy",
    description: `Warranty coverage and claim process for products bought from ${SITE_NAME}.`,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Warranty period",
        body: ["The warranty period for each product is shown on its product page. If no period is shown, a 7-day replacement warranty applies."],
      },
      {
        heading: "What is covered",
        body: ["Manufacturing defects that appear during normal use within the warranty period."],
      },
      {
        heading: "What is not covered",
        body: ["Physical damage, burns, liquid damage, broken seals, misuse, power-surge damage, and normal wear such as scratches or battery wear."],
      },
      {
        heading: "How to claim",
        body: ["Keep your invoice or order number. Contact us and send the product with all accessories; we repair, replace or refund according to the manufacturer's warranty terms."],
      },
    ],
  },
  {
    slug: "privacy-policy",
    title: "Privacy policy",
    description: `How ${SITE_NAME} collects, uses and protects your personal information.`,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Information we collect",
        body: ["Name, phone number, email, delivery address and order details you give us when you create an account or place an order."],
      },
      {
        heading: "How we use it",
        body: ["To process and deliver orders, contact you about your orders, provide support and, if you subscribe, send offers. We never sell your information."],
      },
      {
        heading: "Sharing",
        body: ["We share only what is needed with delivery partners and payment providers to complete your order."],
      },
      {
        heading: "Your choices",
        body: ["You can update your details in My Account, unsubscribe from emails at any time, or ask us to delete your account by contacting us."],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms & conditions",
    description: `Terms that apply when you use the ${SITE_NAME} website and place orders.`,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Orders",
        body: ["An order is confirmed only after our team confirms it with you. We may cancel an order if a product is out of stock or a price was shown incorrectly; any payment made is refunded in full."],
      },
      {
        heading: "Prices",
        body: ["All prices are in Bangladeshi Taka (BDT) and include applicable VAT. Prices and offers can change without notice."],
      },
      {
        heading: "Payment",
        body: ["We accept cash on delivery, bKash and bank transfer. For some high-value orders we may ask for an advance payment."],
      },
      {
        heading: "Product information",
        body: ["We try to show accurate product photos and specifications. Colours and minor details may vary slightly from the images."],
      },
    ],
  },
];

export const getPolicy = (slug: string) => POLICIES.find((p) => p.slug === slug);
