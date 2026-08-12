import { redirect } from "next/navigation";
import { Building2, ClipboardList, Fuel, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MitraTable } from "@/components/platform/MitraTable";

export default async function PlatformDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "admin_platform") redirect("/dashboard");

  const [totalMitra, totalCabang, totalPenduduk, totalTransaksi, totalAktivitas, mitra] = await Promise.all([
    prisma.mitra.count(),
    prisma.cabang.count(),
    prisma.penduduk.count(),
    prisma.transaksi.count(),
    prisma.aktivitasLokaID.count(),
    prisma.mitra.findMany({
      include: { _count: { select: { cabang: true, warga: true, programLokaID: true, transaksi: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">Platform Identiva</p>
        <h1 className="font-display text-4xl font-semibold">Ringkasan Platform</h1>
        <p className="mt-2 text-muted-foreground">Pantau mitra, cabang, transaksi, dan aktivitas lintas platform.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Mitra" value={totalMitra} icon={<Building2 className="size-5" />} />
        <StatCard title="Cabang/Wilayah" value={totalCabang} icon={<Building2 className="size-5" />} />
        <StatCard title="Penduduk" value={totalPenduduk} icon={<Users className="size-5" />} />
        <StatCard title="Transaksi SPBU" value={totalTransaksi} icon={<Fuel className="size-5" />} />
        <StatCard title="Aktivitas LokaID" value={totalAktivitas} icon={<ClipboardList className="size-5" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mitra Terbaru</CardTitle>
          <CardDescription>5 mitra terakhir di platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <MitraTable mitra={mitra} />
        </CardContent>
      </Card>
    </div>
  );
}
