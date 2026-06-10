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
      className="sticky top-0 z-10 -mx-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:-mx-6 md:px-6"
      aria-label="Secciones del proyecto"
    >
      <div className="flex gap-1 overflow-x-auto pb-px scrollbar-none">
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
                "flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
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
    <div className="flex gap-2 border-b pb-4">
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
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
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
