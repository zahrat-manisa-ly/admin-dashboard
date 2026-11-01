import type { Metadata } from "next";

import { CustomersWorkspace } from "./_components/customers-workspace";

export const metadata: Metadata = {
  title: "Customers | Manisa Travel Admin",
  description: "View customer accounts registered on the platform.",
  alternates: {
    canonical: "/dashboard/customers",
  },
};

export default function Page() {
  return <CustomersWorkspace />;
}
