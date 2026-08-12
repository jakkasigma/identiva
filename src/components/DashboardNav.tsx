"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Building2, ClipboardList, Home, Users, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "admin_mitra" | "admin_cabang" | "admin_platform";

// ── Menu SPBU (subsidi) ──
const itemsSubsidiInduk = [
  { href: "/dashboard/spbu",     label: "Ringkasan",  icon: Home },
  { href: "/dashboard/cabang",   label: "Cabang",     icon: Building2 },
  { href: "/dashboard/warga",    label: "Warga",      icon: Users },
  { href: "/dashboard/program",  label: "Program",    icon: WalletCards },
  { href: "/dashboard/rekap",    label: "Rekap",      icon: BarChart3 },
];

const itemsSubsidiCabang = [
  { href: "/dashboard/spbu",    label: "Ringkasan", icon: Home },
  { href: "/dashboard/warga",   label: "Warga",     icon: Users },
  { href: "/dashboard/rekap",   label: "Rekap",     icon: BarChart3 },
];

const itemsPlatform = [
  { href: "/dashboard/platform",       label: "Ringkasan",  icon: Home },
  { href: "/dashboard/platform/mitra", label: "Mitra",      icon: Building2 },
];

// ── Menu LokaID ──
const itemsLokaID = [
  { href: "/dashboard/lokaid",             label: "Ringkasan",  icon: Home },
  { href: "/dashboard/lokaid/wilayah",     label: "Wilayah",    icon: Building2 },
  { href: "/dashboard/lokaid/program",     label: "Program",    icon: WalletCards },
  { href: "/dashboard/lokaid/peserta",     label: "Peserta",    icon: Users },
  { href: "/dashboard/lokaid/aktivitas",   label: "Aktivitas",  icon: ClipboardList },
];

// ── Menu LokaID Wilayah (admin_cabang) ──
const itemsLokaIDWilayah = [
  { href: "/dashboard/lokaid",             label: "Ringkasan",  icon: Home },
  { href: "/dashboard/lokaid/program",     label: "Program",    icon: WalletCards },
  { href: "/dashboard/lokaid/peserta",     label: "Peserta",    icon: Users },
  { href: "/dashboard/lokaid/aktivitas",   label: "Aktivitas",  icon: ClipboardList },
];

export function DashboardNav({ role, tipeMitra }: { role?: Role | null; tipeMitra?: string }) {
  const pathname = usePathname();

  let items = itemsSubsidiInduk;
  if (role === "admin_platform") {
    items = itemsPlatform;
  } else if (tipeMitra === "lokaid") {
    items = role === "admin_cabang" ? itemsLokaIDWilayah : itemsLokaID;
  } else if (role === "admin_cabang") {
    items = itemsSubsidiCabang;
  }

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
