import PolicyPage, { policyMetadata } from "@/components/Policy/PolicyPage";

export const metadata = policyMetadata("privacy-policy");

export default function Page() {
  return <PolicyPage slug="privacy-policy" />;
}
