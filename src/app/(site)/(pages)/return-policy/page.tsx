import PolicyPage, { policyMetadata } from "@/components/Policy/PolicyPage";

export const metadata = policyMetadata("return-policy");

export default function Page() {
  return <PolicyPage slug="return-policy" />;
}
