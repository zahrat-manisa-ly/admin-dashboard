"use client";

import Image from "next/image";
import Link from "next/link";

import { useShallow } from "zustand/react/shallow";

import { usePermissions } from "@/app/(main)/dashboard/_components/access/access.queries";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { useLanguage } from "@/i18n/language-provider";
import {
  type NavGroup,
  type NavMainItem,
  type NavMainLinkItem,
  sidebarItems,
} from "@/navigation/sidebar/sidebar-items";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

import { NavMain } from "./nav-main";

//--------translations----//
const translatedNavItems: Record<string, string> = {
  "/dashboard/default": "navigation.overview",
  "/dashboard/finance": "navigation.finance",
  "/dashboard/bookings": "navigation.bookings",
  "/dashboard/flights": "navigation.flights",
  "/dashboard/ticketing": "navigation.ticketing",
  "/dashboard/cancellations": "navigation.cancellations",
  "/dashboard/customers": "navigation.customers",
  "/dashboard/support": "navigation.support",
  "/dashboard/transactions": "navigation.transactions",
  "/dashboard/refunds": "navigation.refunds",
  "/dashboard/users": "navigation.users",
  "/dashboard/roles-permissions": "navigation.rolesPermissions",
};

const translatedGroups: Record<string, string> = {
  Dashboard: "navigation.dashboard",
  Operations: "navigation.operations",
  Customers: "navigation.customers",
  Finance: "navigation.finance",
  "User Management": "navigation.userManagement",
};

const translatedParents: Record<string, string> = {
  dashboard: "navigation.dashboard",
};
//-------end-translations----//

function isNavLink(item: NavMainItem): item is NavMainLinkItem {
  return "url" in item;
}

function translateItem(item: NavMainItem, t: (id: string) => string): NavMainItem {
  if (isNavLink(item)) {
    return { ...item, title: translatedNavItems[item.url] ? t(translatedNavItems[item.url]) : item.title };
  }

  return {
    ...item,
    title: translatedParents[item.id] ? t(translatedParents[item.id]) : item.title,
    subItems: item.subItems.map((subItem) => ({
      ...subItem,
      title: translatedNavItems[subItem.url] ? t(translatedNavItems[subItem.url]) : subItem.title,
    })),
  };
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { direction, inlineStart, t } = useLanguage();
  const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
    useShallow((s) => ({
      sidebarVariant: s.values.sidebar_variant,
      sidebarCollapsible: s.values.sidebar_collapsible,
      isSynced: s.isSynced,
    })),
  );

  const variant = isSynced ? sidebarVariant : props.variant;
  const collapsible = isSynced ? sidebarCollapsible : props.collapsible;
  const { can, currentUser } = usePermissions();

  //--------visible-groups----//
  const visibleGroups = sidebarItems.reduce<NavGroup[]>((groups, group) => {
    const items = group.items.reduce<NavMainItem[]>((visibleItems, item) => {
      if (isNavLink(item)) {
        if (!item.permission || can(item.permission)) visibleItems.push(translateItem(item, t));
        return visibleItems;
      }
      const subItems = item.subItems.filter((subItem) => !subItem.permission || can(subItem.permission));
      if (subItems.length) visibleItems.push(translateItem({ ...item, subItems }, t));
      return visibleItems;
    }, []);
    if (items.length) {
      const label = group.label && translatedGroups[group.label] ? t(translatedGroups[group.label]) : group.label;
      groups.push({ ...group, label, items });
    }
    return groups;
  }, []);
  //-------end-visible-groups----//

  return (
    <Sidebar {...props} dir={direction} side={inlineStart} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="h-auto py-2">
              <Link prefetch={false} href="/dashboard/default">
                {/* //--------brand-logo----// */}
                <span className="w-full group-data-[collapsible=icon]:hidden">
                  <Image
                    src="/logo/manisa-logo-h-color.svg"
                    alt={APP_CONFIG.name}
                    width={341}
                    height={101}
                    unoptimized
                    className="h-auto w-full max-w-52 [html.dark_&]:hidden [html[data-theme-preset=manisa]_&]:hidden"
                  />
                  <Image
                    src="/logo/manisa-logo-h-white.svg"
                    alt=""
                    width={341}
                    height={101}
                    unoptimized
                    className="hidden h-auto w-full max-w-52 [html.dark_&]:block [html[data-theme-preset=manisa]_&]:block"
                  />
                </span>
                {/* //-------end-brand-logo----// */}
                {/* //--------brand-emblem----// */}
                <span className="relative hidden size-8 shrink-0 group-data-[collapsible=icon]:block">
                  <Image
                    src="/logo/manisa-emblem-color.svg"
                    alt=""
                    fill
                    unoptimized
                    className="object-contain [html.dark_&]:hidden [html[data-theme-preset=manisa]_&]:hidden"
                  />
                  <Image
                    src="/logo/manisa-emblem-white.svg"
                    alt=""
                    fill
                    unoptimized
                    className="hidden object-contain [html.dark_&]:block [html[data-theme-preset=manisa]_&]:block"
                  />
                </span>
                {/* //-------end-brand-emblem----// */}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>{currentUser && <NavMain items={visibleGroups} />}</SidebarContent>
    </Sidebar>
  );
}
