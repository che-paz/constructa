import type { LucideIcon } from "lucide-react";
import { Bot, Building2, Package, Users, Wallet } from "lucide-react";

export interface DashboardNavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    href: "/projects",
    label: "Proyectos",
    shortLabel: "Obras",
    icon: Building2,
  },
  {
    href: "/materials",
    label: "Materiales",
    shortLabel: "Materiales",
    icon: Package,
  },
  {
    href: "/personal",
    label: "Personal",
    shortLabel: "Personal",
    icon: Users,
  },
  {
    href: "/finance",
    label: "Finanzas",
    shortLabel: "Finanzas",
    icon: Wallet,
  },
  {
    href: "/assistant",
    label: "Asistente IA",
    shortLabel: "Asistente",
    icon: Bot,
  },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
