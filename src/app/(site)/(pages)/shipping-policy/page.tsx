import PolicyPage, { policyMetadata } from "@/components/Policy/PolicyPage";

export const metadata = policyMetadata("shipping-policy");

export default function Page() {
  return <PolicyPage slug="shipping-policy" />;
}
