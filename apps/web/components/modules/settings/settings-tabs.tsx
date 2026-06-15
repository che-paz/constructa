"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "empresa", label: "Empresa" },
  { id: "cuenta", label: "Cuenta" },
  { id: "usuarios", label: "Usuarios" },
] as const;

export type SettingsTab = (typeof TABS)[number]["id"];

interface SettingsTabsProps {
  activeTab: SettingsTab;
  children: React.ReactNode;
}

export function SettingsTabs({ activeTab, children }: SettingsTabsProps) {
  const searchParams = useSearchParams();

  function hrefFor(tab: SettingsTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    return `/settings?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={hrefFor(tab.id)}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
