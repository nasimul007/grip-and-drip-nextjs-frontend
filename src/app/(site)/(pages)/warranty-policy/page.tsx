import PolicyPage, { policyMetadata } from "@/components/Policy/PolicyPage";

export const metadata = policyMetadata("warranty-policy");

export default function Page() {
  return <PolicyPage slug="warranty-policy" />;
}
