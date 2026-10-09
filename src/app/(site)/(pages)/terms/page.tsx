import PolicyPage, { policyMetadata } from "@/components/Policy/PolicyPage";

export const metadata = policyMetadata("terms");

export default function Page() {
  return <PolicyPage slug="terms" />;
}
