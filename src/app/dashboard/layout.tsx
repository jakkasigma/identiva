import { redirect } from "next/navigation";
import { Menu } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/app/login/actions";
import { DashboardNav } from "@/components/DashboardNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Role } from "@prisma/client";

type SidebarProps = {
  role?: Role | null;
  tipeMitra?: string;
  namaUtama: string;
  namaSubtitle?: string | null;
  kode?: string | null;
  tokenApi?: string | null;
};

function Sidebar({ role, tipeMitra, namaUtama, namaSubtitle, kode, tokenApi }: SidebarProps) {
  const isCabang = role === "admin_cabang";
  const isLokaID = tipeMitra === "lokaid";

  return (
    <aside className="flex h-full flex-col bg-sidebar p-4 text-sidebar-foreground">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-sidebar-foreground/70">Identiva</p>
        <h2 className="mt-2 font-display text-2xl font-semibold">
          {isCabang ? "Dashboard Cabang" : isLokaID ? "Dashboard LokaID" : "Dashboard"}
        </h2>
        <p className="mt-1 text-sm text-sidebar-foreground/70">{namaUtama}</p>
        {namaSubtitle && <p className="mt-0.5 text-xs text-sidebar-foreground/50">{namaSubtitle}</p>}
        {kode && <p className="mt-1 font-mono text-xs text-sidebar-foreground/40">{kode}</p>}
      </div>
      <DashboardNav role={role} tipeMitra={tipeMitra} />
      <div className="mt-auto rounded-xl border border-sidebar-border/60 bg-white/10 p-3 text-sm">
        <p className="font-medium">Token API IoT</p>
        <p className="mt-1 text-xs text-sidebar-foreground/70">
          {isCabang ? "Token untuk alat ESP32 di cabang ini." : isLokaID ? "Dipakai alat di lokasi kegiatan." : "Dipakai alat ESP32 per cabang."}
        </p>
        {tokenApi && <p className="mt-2 break-all font-mono text-xs text-sidebar-foreground/60">{tokenApi}</p>}
      </div>
    </aside>
  );
}

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await auth();
  if (!session?.user?.mitraId) redirect("/login");

  const isCabang = session.user.role === "admin_cabang";

  let namaUtama = session.user.mitraNama ?? "Mitra";
  let namaSubtitle: string | null = null;
  let kode: string | null = null;
  let tokenApi: string | null = null;
  let tipeMitra = "subsidi";

  if (isCabang && session.user.cabangId) {
    const cabang = await prisma.cabang.findUnique({
      where: { id: session.user.cabangId },
      select: { tokenApi: true, kode: true, nama: true, mitra: { select: { nama: true, tipeMitra: true } } },
    });
    namaUtama = cabang?.nama ?? session.user.cabangNama ?? "Cabang";
    namaSubtitle = cabang?.mitra?.nama ?? session.user.mitraNama ?? null;
    kode = cabang?.kode ?? session.user.cabangKode ?? null;
    tokenApi = cabang?.tokenApi ?? null;
    tipeMitra = cabang?.mitra?.tipeMitra ?? "subsidi";
  } else {
    const mitra = await prisma.mitra.findUnique({
      where: { id: session.user.mitraId },
      select: { tokenApi: true, kode: true, tipeMitra: true },
    });
    kode = mitra?.kode ?? null;
    tokenApi = mitra?.tokenApi ?? null;
    tipeMitra = mitra?.tipeMitra ?? "subsidi";
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 hidden w-72 lg:block">
        <Sidebar role={session.user.role} tipeMitra={tipeMitra} namaUtama={namaUtama} namaSubtitle={namaSubtitle} kode={kode} tokenApi={tokenApi} />
      </div>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="icon" className="lg:hidden" />}>
                <Menu className="size-4" />
                <span className="sr-only">Buka menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-none bg-sidebar p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigasi dashboard</SheetTitle>
                </SheetHeader>
                <Sidebar role={session.user.role} tipeMitra={tipeMitra} namaUtama={namaUtama} namaSubtitle={namaSubtitle} kode={kode} tokenApi={tokenApi} />
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-sm text-muted-foreground">{isCabang ? "Cabang aktif" : "Mitra aktif"}</p>
              <h1 className="font-semibold leading-none">{namaUtama}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{session.user.role}</Badge>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">Logout</Button>
            </form>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
