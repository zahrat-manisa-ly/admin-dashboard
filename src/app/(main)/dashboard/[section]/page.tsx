import { notFound } from "next/navigation";

import type { Metadata } from "next";

const sections = {
  reconciliation: {
    title: "Reconciliation",
    description: "Review and match financial records in one place.",
  },
  promotions: {
    title: "Promotions",
    description: "Create and manage travel offers and promotional rules.",
  },
  campaigns: {
    title: "Campaigns",
    description: "Plan and monitor marketing campaigns.",
  },
  reports: {
    title: "Reports",
    description: "Access operational and financial reports.",
  },
  "analytics-overview": {
    title: "Analytics",
    description: "Explore travel business performance and trends.",
  },
  "airlines-providers": {
    title: "Airlines & Providers",
    description: "Manage airline and travel-provider information.",
  },
  "roles-permissions": {
    title: "Roles & Permissions",
    description: "Manage team roles and access permissions.",
  },
  "audit-logs": {
    title: "Audit Logs",
    description: "Review activity across the admin workspace.",
  },
  settings: {
    title: "Settings",
    description: "Configure workspace preferences and defaults.",
  },
} as const;

type Section = keyof typeof sections;

function isSection(value: string): value is Section {
  return value in sections;
}

export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}

export async function generateMetadata({ params }: PageProps<"/dashboard/[section]">): Promise<Metadata> {
  const { section } = await params;

  if (!isSection(section)) {
    return {};
  }

  const { title, description } = sections[section];

  return {
    title: `${title} | Manisa Travel Admin`,
    description,
    alternates: {
      canonical: `/dashboard/${section}`,
    },
  };
}

export default async function Page({ params }: PageProps<"/dashboard/[section]">) {
  const { section } = await params;

  if (!isSection(section)) {
    notFound();
  }

  const { title, description } = sections[section];

  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
