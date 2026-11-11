"use client";

export function DetailFields({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: string; dir?: "ltr" | "rtl" }>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium text-sm">{title}</p>
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm">{row.label}</p>
          <p className="break-all font-medium text-sm" dir={row.dir}>
            {row.value}
          </p>
        </div>
      ))}
    </div>
  );
}
