"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ERP_NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-r border-border bg-surface lg:w-72">
      <div className="border-b border-border px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">AGH</p>
        <h1 className="text-xl font-bold text-foreground">ERP Core</h1>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {ERP_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isEnabled =
            item.href === "/dashboard" ||
            item.href === "/clientes" ||
            item.href === "/cotizaciones" ||
            item.href === "/empleados";

          return (
            <Link
              key={item.href}
              href={isEnabled ? item.href : "#"}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-foreground hover:bg-surface-strong hover:text-foreground",
                !isEnabled && "pointer-events-none opacity-50",
              )}
              aria-disabled={!isEnabled}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
