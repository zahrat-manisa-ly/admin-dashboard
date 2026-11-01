"use client";

import { useEffect, useState } from "react";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { usePermissions } from "@/app/(main)/dashboard/_components/access/access.queries";
import { AccessError } from "@/app/(main)/dashboard/_components/access/access-feedback";
import { AccessSkeleton } from "@/app/(main)/dashboard/_components/access/access-skeleton";
import { type DirectoryRow, UserDatatable } from "@/components/shadcn-studio/blocks/datatable-user/user-datatable";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { useI18n } from "@/i18n/language-provider";
import { customersApi } from "@/lib/api/services/customers";

export function CustomersWorkspace() {
  const { locale, formatNumber } = useI18n();
  const ar = locale === "ar";
  const { can } = usePermissions();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, []);

  const customersQuery = useQuery({
    queryKey: ["customers-v1", page, pageSize, query],
    queryFn: ({ signal }) => customersApi.list({ page, size: pageSize, search: query }, signal),
    placeholderData: keepPreviousData,
    enabled: can("clients:read"),
  });

  if (customersQuery.isPending) return <AccessSkeleton />;
  if (!customersQuery.data) {
    return (
      <AccessError
        error={customersQuery.error}
        retry={() => void customersQuery.refetch()}
        busy={customersQuery.isFetching}
      />
    );
  }

  const date = (value: string) =>
    new Intl.DateTimeFormat(ar ? "ar" : "en", { dateStyle: "medium" }).format(new Date(value));

  const rows: DirectoryRow[] = customersQuery.data.items.map((customer) => ({
    id: customer.id,
    name: `${customer.first_name} ${customer.last_name}`.trim(),
    email: customer.email ?? "",
    detail: customer.phone_number ?? "",
    extra: date(customer.created_at),
    statusLabel: customer.is_blocked ? (ar ? "موقوف" : "Blocked") : ar ? "نشط" : "Active",
    statusTone: customer.is_blocked ? "danger" : "success",
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-tight">{ar ? "العملاء" : "Customers"}</h1>
        <p className="text-muted-foreground text-sm">
          {ar
            ? `${formatNumber(customersQuery.data.kpis.total_customers)} عميل في المنصة.`
            : `${formatNumber(customersQuery.data.kpis.total_customers)} customers on the platform.`}
        </p>
      </div>

      <Card className="gap-0 py-0">
        <div className="border-b px-4 py-4">
          <Field className="max-w-md gap-1.5">
            <FieldLabel htmlFor="customers-search">{ar ? "بحث" : "Search"}</FieldLabel>
            <InputGroup className="h-9">
              <InputGroupAddon align="inline-start">
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                id="customers-search"
                className="h-9"
                value={search}
                placeholder={ar ? "الاسم، البريد، أو الهاتف" : "Name, email, or phone"}
                onChange={(event) => setSearch(event.target.value)}
              />
            </InputGroup>
          </Field>
        </div>
        <CardContent className="px-0" aria-busy={customersQuery.isFetching}>
          <UserDatatable
            rows={rows}
            page={customersQuery.data.page}
            pageSize={customersQuery.data.size}
            total={customersQuery.data.total}
            pages={customersQuery.data.pages}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            formatNumber={formatNumber}
            headers={{
              person: ar ? "العميل" : "Customer",
              detail: ar ? "الهاتف" : "Phone",
              extra: ar ? "تاريخ الانضمام" : "Joined",
              status: ar ? "الحالة" : "Status",
              actions: "",
            }}
            labels={{
              showing: ar ? "عرض {start} إلى {end} من {total}" : "Showing {start} to {end} of {total} entries",
              previous: ar ? "السابق" : "Previous",
              next: ar ? "التالي" : "Next",
              rowsPerPage: ar ? "صفوف لكل صفحة" : "Rows per page",
              emptyTitle: ar ? "لا يوجد عملاء" : "No customers",
              emptyDescription: query
                ? ar
                  ? "جرّب عبارة بحث أخرى."
                  : "Try a different search."
                : ar
                  ? "سيظهر العملاء هنا بعد تسجيلهم."
                  : "Customers will appear here after they register.",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
