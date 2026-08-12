import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentPeriode } from "@/lib/quota";
import { PeriodeReset } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WargaTable } from "@/components/warga/WargaTable";
import { WargaForm } from "@/components/warga/WargaForm";
import { ScanTerbaruPanel } from "@/components/warga/ScanTerbaruPanel";

export default async function WargaPage() {
  const session = await auth();
  if (!session?.user?.mitraId) redirect("/login");

  // Guard: hanya untuk SPBU
  const mitra = await prisma.mitra.findUnique({ where: { id: session.user.mitraId }, select: { tipeMitra: true } });
  if (mitra?.tipeMitra === "lokaid") redirect("/dashboard/lokaid");

  const periodeAktif = getCurrentPeriode(PeriodeReset.bulanan);

  // ScanPending filter: admin_cabang → cabangnya saja, induk → semua cabang mitra
  const scanWhere =
    session.user.role === "admin_cabang" && session.user.cabangId
      ? { cabangId: session.user.cabangId }
      : { cabang: { mitraId: session.user.mitraId } };

  const [wargaRaw, scans] = await Promise.all([
    prisma.warga.findMany({
      where: { mitraId: session.user.mitraId },
      include: { penduduk: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.scanPending.findMany({
      where: scanWhere,
      include: { cabang: { select: { nama: true } } },
      orderBy: { waktuScan: "desc" },
      take: 10,
    }),
  ]);

  // Ambil saldo bulan ini untuk semua penduduk mitra
  const saldoList = await prisma.saldo.findMany({
    where: {
      mitraId: session.user.mitraId,
      periode: periodeAktif,
    },
    select: { pendudukId: true, saldoTotal: true, saldoTerpakai: true },
  });

  const saldoMap = new Map(saldoList.map((s) => [s.pendudukId, s]));

  const warga = wargaRaw.map((w) => ({
    ...w,
    saldo: saldoMap.get(w.pendudukId) ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">Pendataan</p>
        <h1 className="font-display text-4xl font-semibold">Warga Mitra</h1>
        <p className="mt-2 text-muted-foreground">Daftarkan warga, tautkan KTP ke mitra, proses scan dari Alat B.</p>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Warga Mitra</TabsTrigger>
          <TabsTrigger value="scan">Scan Terbaru</TabsTrigger>
          <TabsTrigger value="new">Daftar Baru</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <WargaTable warga={warga} />
        </TabsContent>
        <TabsContent value="scan">
          <ScanTerbaruPanel scans={scans} />
        </TabsContent>
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Warga Baru</CardTitle>
              <CardDescription>NIK dan UID bersifat paten. Pastikan data benar sebelum menyimpan.</CardDescription>
            </CardHeader>
            <CardContent>
              <WargaForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
