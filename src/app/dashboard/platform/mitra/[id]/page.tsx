import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MitraScanPreference } from "@/components/platform/MitraScanPreference";
import { SCAN_METHOD_LABELS } from "@/lib/scan-methods";

export default async function PlatformMitraDetailPage({ params }: PageProps<"/dashboard/platform/mitra/[id]">) {
  const session = await auth();
  if (session?.user?.role !== "admin_platform") redirect("/dashboard");

  const { id } = await params;
  const mitra = await prisma.mitra.findUnique({
    where: { id: Number(id) },
    include: {
      cabang: {
        include: { _count: { select: { users: true, transaksi: true, programLokaID: true, pesertaLokaID: true } } },
        orderBy: { nama: "asc" },
      },
      _count: { select: { cabang: true, warga: true, transaksi: true, programSubsidi: true, programLokaID: true, aktivitasLokaID: true } },
    },
  });

  if (!mitra) redirect("/dashboard/platform/mitra");

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">Detail Mitra</p>
        <h1 className="font-display text-4xl font-semibold">{mitra.nama}</h1>
        <p className="mt-2 text-muted-foreground">{mitra.kode} · {mitra.jenisLayanan}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Info Dasar</CardTitle>
            <CardDescription>Identitas mitra di platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Tipe</span><Badge variant="outline">{mitra.tipeMitra}</Badge></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Status</span><Badge variant={mitra.status === "aktif" ? "secondary" : "destructive"}>{mitra.status}</Badge></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Cabang</span><span>{mitra._count.cabang}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Transaksi</span><span>{mitra._count.transaksi}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Program LokaID</span><span>{mitra._count.programLokaID}</span></div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Preferensi Scan</CardTitle>
            <CardDescription>Atur metode scan yang diizinkan untuk mitra ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <MitraScanPreference mitraId={mitra.id} value={mitra.metodeScanDiizinkan} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cabang / Wilayah</CardTitle>
          <CardDescription>Metode scan aktif per unit operasional.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Metode Aktif</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaksi</TableHead>
                <TableHead>Program</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mitra.cabang.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nama}</TableCell>
                  <TableCell className="font-mono text-xs">{c.kode}</TableCell>
                  <TableCell>{SCAN_METHOD_LABELS[c.metodeScanAktif as keyof typeof SCAN_METHOD_LABELS] ?? c.metodeScanAktif}</TableCell>
                  <TableCell><Badge variant={c.status === "aktif" ? "secondary" : "destructive"}>{c.status}</Badge></TableCell>
                  <TableCell>{c._count.transaksi}</TableCell>
                  <TableCell>{c._count.programLokaID}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
