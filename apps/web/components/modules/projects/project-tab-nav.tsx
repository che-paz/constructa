"use client";

import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  FileText,
  Globe,
  LayoutDashboard,
  Package,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const PROJECT_TABS = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "cronograma", label: "Cronograma", icon: CalendarDays },
  { id: "materiales", label: "Materiales", icon: Package },
  { id: "personal", label: "Personal", icon: Users },
  { id: "finanzas", label: "Finanzas", icon: Wallet },
  { id: "cliente", label: "Cliente", icon: Globe },
  { id: "reportes", label: "Reportes", icon: FileText },
] as const;

export type ProjectTabId = (typeof PROJECT_TABS)[number]["id"];

export function isValidProjectTab(value: string | null): value is ProjectTabId {
  return PROJECT_TABS.some((tab) => tab.id === value);
}

interface ProjectTabNavProps {
  activeTab: ProjectTabId;
  onTabChange: (tab: ProjectTabId) => void;
  materialAlertCount?: number;
}

export function ProjectTabNav({
  activeTab,
  onTabChange,
  materialAlertCount = 0,
}: ProjectTabNavProps) {
  return (
    <nav
      className="sticky top-0 z-10 -mx-3 border-b bg-background/95 px-1 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:-mx-6 md:px-6"
      aria-label="Secciones del proyecto"
    >
      <div className="flex gap-0.5 overflow-x-auto pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PROJECT_TABS.map((tab) => {
          const Icon = tab.icon as LucideIcon;
          const isActive = activeTab === tab.id;
          const showBadge =
            tab.id === "materiales" && materialAlertCount > 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex shrink-0 flex-col items-center gap-0.5 border-b-2 px-2.5 py-2 text-[11px] font-medium transition-colors sm:flex-row sm:gap-2 sm:px-3 sm:py-3 sm:text-sm",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
              aria-label={tab.label}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="max-w-[4.5rem] truncate sm:max-w-none">
                {tab.label}
              </span>
              {showBadge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
                  {materialAlertCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

interface FinanceSubNavProps {
  active: "pagos" | "gastos";
  onChange: (section: "pagos" | "gastos") => void;
}

export function FinanceSubNav({ active, onChange }: FinanceSubNavProps) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto border-b pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {(
        [
          { id: "pagos" as const, label: "Pagos del cliente" },
          { id: "gastos" as const, label: "Gastos del proyecto" },
        ] as const
      ).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            "shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:px-4",
            active === item.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
