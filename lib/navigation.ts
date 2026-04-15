import { LayoutDashboard, Settings, ShieldCheck, UsersRound, FileSpreadsheet, Badge } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  module: string;
}

export const ERP_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    module: "dashboard",
  },
  {
    label: "Empleados",
    href: "/empleados",
    icon: Badge,
    module: "empleados",
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: UsersRound,
    module: "clientes",
  },
  {
    label: "Cotizaciones",
    href: "/cotizaciones",
    icon: FileSpreadsheet,
    module: "cotizaciones",
  },
  {
    label: "Seguridad",
    href: "/seguridad",
    icon: ShieldCheck,
    module: "seguridad",
  },
  {
    label: "Configuracion",
    href: "/configuracion",
    icon: Settings,
    module: "configuracion",
  },
];
