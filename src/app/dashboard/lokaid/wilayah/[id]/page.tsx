import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDateRange, formatTanggal } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/StatCard";
import { OperatorWilayahPanel } from "@/components/lokaid/OperatorWilayahPanel";
import { ChevronLeft, ClipboardList, Users } from "lucide-react";

const SEMUA_JENIS: Record<string, string> = {
  checkin: "Check-in", distribusi: "Distribusi", verifikasi: "Verifikasi",
  pendataan: "Pendataan", pengajuan: "Pengajuan", persetujuan: "Persetujuan",
  peminjaman: "Peminjaman", pengembalian: "Pengembalian", pendaftaran: "Pendaftaran",
};

const tujuanLabel: Record<string, string> = {
  bantuan: "Bantuan", kegiatan: "Kegiatan", pendataan: "Pendataan",
  peminjaman: "Peminjaman", pendaftaran: "Pendaftaran",
};

export default async function WilayahDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.mitraId) redirect("/login");

  const mitra = await prisma.mitra.findUnique({ where: { id: session.user.mitraId }, select: { tipeMitra: true } });
  if (mitra?.tipeMitra !== "lokaid") redirect("/dashboard/spbu");
  if (session.user.role !== "admin_mitra") redirect("/dashboard/lokaid");

  const { id } = await params;
  const wilayahId = Number(id);
  if (isNaN(wilayahId)) notFound();

  const wilayah = await prisma.cabang.findFirst({
    where: { id: wilayahId, mitraId: session.user.mitraId },
    include: {
      users: {
        where: { role: "admin_cabang" },
        select: { id: true, username: true, cabangId: true },
      },
    },
  });
  if (!wilayah) notFound();

  // Tentukan data operator
  const operatorRaw = wilayah.users[0] ?? null;
  const operator = operatorRaw
    ? { id: operatorRaw.id, username: operatorRaw.username, aktif: operatorRaw.cabangId !== null }
    : null;

  const { start, end } = getDateRange();

  const [programs, pesertaCount, aktivitasHariIni, aktivitasRecent] = await Promise.all([
    prisma.programLokaID.findMany({
      where: { mitraId: session.user.mitraId, cabangId: wilayahId, status: "aktif" },
      include: { _count: { select: { peserta: true, aktivitas: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.pesertaLokaID.count({ where: { cabangId: wilayahId } }),
    prisma.aktivitasLokaID.findMany({
      where: { mitraId: session.user.mitraId, cabangId: wilayahId, waktu: { gte: start, lt: end } },
      select: { jenis: true },
    }),
    prisma.aktivitasLokaID.findMany({
      where: { mitraId: session.user.mitraId, cabangId: wilayahId },
      include: { peserta: { include: { penduduk: true } }, program: true },
      orderBy: { waktu: "desc" },
      take: 10,
    }),
  ]);

  const perJenis = aktivitasHariIni.reduce<Record<string, number>>((acc, a) => {
    acc[a.jenis] = (acc[a.jenis] ?? 0) + 1;
    return acc;
  }, {});
  const topJenis = Object.entries(perJenis).sort((a, b) => b[1] - a[1]).slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1">
            <Link href="/dashboard/lokaid/wilayah" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              <ChevronLeft className="size-4 mr-1" />Wilayah
            </Link>
          </div>
          <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">LokaID · Wilayah</p>
          <h1 className="font-display text-3xl font-semibold">{wilayah.nama}</h1>
          <p className="font-mono text-sm text-muted-foreground">{wilayah.kode}</p>
        </div>
        <Badge variant={wilayah.status === "aktif" ? "secondary" : "outline"} className="self-start capitalize">{wilayah.status}</Badge>
      </div>

      {/* Stat */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Program Aktif"  value={programs.length}  icon={<ClipboardList className="size-5" />} />
        <StatCard title="Total Peserta"  value={pesertaCount}     icon={<Users className="size-5" />} />
        {topJenis[0] && <StatCard title={SEMUA_JENIS[topJenis[0][0]] ?? topJenis[0][0]} value={topJenis[0][1]} note="Aktivitas hari ini" />}
        {topJenis[1] && <StatCard title={SEMUA_JENIS[topJenis[1][0]] ?? topJenis[1][0]} value={topJenis[1][1]} note="Aktivitas hari ini" />}
        {topJenis.length === 0 && <StatCard title="Aktivitas Hari Ini" value={0} />}
      </div>

      {/* Program */}
      <Card>
        <CardHeader><CardTitle>Program di Wilayah Ini</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead><TableHead>Tujuan</TableHead>
                <TableHead>Peserta</TableHead><TableHead>Aktivitas</TableHead><TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="py-6 text-center text-muted-foreground">Belum ada program.</TableCell></TableRow>
              ) : programs.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nama}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{tujuanLabel[p.tujuan] ?? p.tujuan}</Badge></TableCell>
                  <TableCell>{p._count.peserta}</TableCell>
                  <TableCell>{p._count.aktivitas}</TableCell>
                  <TableCell>
                    <Link href={`/dashboard/lokaid/program/${p.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>Detail →</Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Aktivitas terbaru */}
      <Card>
        <CardHeader><CardTitle>Aktivitas Terbaru</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead><TableHead>Peserta</TableHead>
                <TableHead>Program</TableHead><TableHead>Jenis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aktivitasRecent.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="py-6 text-center text-muted-foreground">Belum ada aktivitas.</TableCell></TableRow>
              ) : aktivitasRecent.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{formatTanggal(a.waktu)}</TableCell>
                  <TableCell>{a.peserta.penduduk.nama}</TableCell>
                  <TableCell>{a.program.nama}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{SEMUA_JENIS[a.jenis] ?? a.jenis}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Operator Panel */}
      <OperatorWilayahPanel wilayahId={wilayah.id} operator={operator} />

      {/* Token */}
      <Card>
        <CardHeader><CardTitle className="text-sm text-muted-foreground">Token API IoT Wilayah</CardTitle></CardHeader>
        <CardContent>
          <p className="font-mono text-sm break-all">{wilayah.tokenApi}</p>
          <p className="text-xs text-muted-foreground mt-1">Dipakai perangkat ESP32/RFID di wilayah ini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
