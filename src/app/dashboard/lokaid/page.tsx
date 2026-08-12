import { redirect } from "next/navigation";
import { ClipboardList, Users } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDateRange, formatTanggal } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight } from "lucide-react";

const SEMUA_JENIS: Record<string, string> = {
  checkin: "Check-in", distribusi: "Distribusi", verifikasi: "Verifikasi",
  pendataan: "Pendataan", penilaian: "Penilaian", pengajuan: "Pengajuan",
  persetujuan: "Persetujuan", peminjaman: "Peminjaman", pengembalian: "Pengembalian",
  pendaftaran: "Pendaftaran", aktivasi: "Aktivasi",
};

export default async function LokaIDDashboardPage() {
  const session = await auth();
  if (!session?.user?.mitraId) redirect("/login");

  // Guard: hanya untuk tipeMitra lokaid
  const mitra = await prisma.mitra.findUnique({
    where: { id: session.user.mitraId },
    select: { tipeMitra: true },
  });
  if (mitra?.tipeMitra !== "lokaid") redirect("/dashboard/spbu");

  const { start, end } = getDateRange();
  const isWilayah = session.user.role === "admin_cabang";
  const cabangId = isWilayah ? (session.user.cabangId ?? undefined) : undefined;

  // Filter: wilayah hanya lihat datanya sendiri, induk lihat semua
  const programWhere = cabangId
    ? { mitraId: session.user.mitraId, status: "aktif", cabangId }
    : { mitraId: session.user.mitraId, status: "aktif" };

  const aktivitasWhere = cabangId
    ? { mitraId: session.user.mitraId, cabangId }
    : { mitraId: session.user.mitraId };

  const [programs, aktivitasHariIni, aktivitasRecent] = await Promise.all([
    prisma.programLokaID.findMany({
      where: programWhere,
      include: {
        _count: { select: { peserta: true, aktivitas: true } },
        aktivitasList: { orderBy: { urutan: "asc" }, take: 3 },
        cabang: { select: { nama: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.aktivitasLokaID.findMany({
      where: { ...aktivitasWhere, waktu: { gte: start, lt: end } },
      select: { jenis: true },
    }),
    prisma.aktivitasLokaID.findMany({
      where: aktivitasWhere,
      include: { peserta: { include: { penduduk: true } }, program: true },
      orderBy: { waktu: "desc" },
      take: 5,
    }),
  ]);

  const totalPeserta = programs.reduce((s, p) => s + p._count.peserta, 0);

  // Hitung aktivitas hari ini per jenis
  const perJenis = aktivitasHariIni.reduce<Record<string, number>>((acc, a) => {
    acc[a.jenis] = (acc[a.jenis] ?? 0) + 1;
    return acc;
  }, {});
  const topJenis = Object.entries(perJenis).sort((a, b) => b[1] - a[1]).slice(0, 2);

  const tujuanLabel: Record<string, string> = {
    bantuan: "Bantuan", kegiatan: "Kegiatan", pendataan: "Pendataan",
    peminjaman: "Peminjaman", pendaftaran: "Pendaftaran",
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">Ringkasan</p>
        <h1 className="font-display text-4xl font-semibold">Selamat datang, {session.user.mitraNama}</h1>
        <p className="mt-2 text-muted-foreground">
            {isWilayah
              ? `Pantau program dan peserta di ${session.user.cabangNama ?? "wilayah ini"}.`
              : "Pantau program, peserta, dan aktivitas layanan masyarakat."}
          </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Program Aktif" value={programs.length} icon={<ClipboardList className="size-5" />} />
        <StatCard title="Total Peserta" value={totalPeserta} icon={<Users className="size-5" />} />
        {topJenis[0] && <StatCard title={SEMUA_JENIS[topJenis[0][0]] ?? topJenis[0][0]} value={topJenis[0][1]} note="Aktivitas hari ini" />}
        {topJenis[1] && <StatCard title={SEMUA_JENIS[topJenis[1][0]] ?? topJenis[1][0]} value={topJenis[1][1]} note="Aktivitas hari ini" />}
        {topJenis.length === 0 && <StatCard title="Aktivitas Hari Ini" value={0} note="Belum ada aktivitas" />}
      </div>

      {/* Program aktif */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Program Aktif</CardTitle>
              <CardDescription>{programs.length} program berjalan.</CardDescription>
            </div>
            <Link href="/dashboard/lokaid/program" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Kelola Program <ArrowRight className="ml-1 size-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Program</TableHead>
                <TableHead>Tujuan</TableHead>
                <TableHead>Aktivitas</TableHead>
                <TableHead>Peserta</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Belum ada program aktif.
                  </TableCell>
                </TableRow>
              ) : programs.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nama}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {tujuanLabel[p.tujuan] ?? p.tujuan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.aktivitasList.map((a) => (
                        <Badge key={a.id} variant="secondary" className="text-xs capitalize">{a.jenis}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{p._count.peserta}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/lokaid/program/${p.id}`}
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      Detail <ArrowRight className="ml-1 size-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Aktivitas terbaru */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>5 aktivitas terakhir.</CardDescription>
            </div>
            <Link href="/dashboard/lokaid/aktivitas" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Lihat Semua <ArrowRight className="ml-1 size-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Peserta</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Jenis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aktivitasRecent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Belum ada aktivitas.
                  </TableCell>
                </TableRow>
              ) : aktivitasRecent.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{formatTanggal(a.waktu)}</TableCell>
                  <TableCell>{a.peserta.penduduk.nama}</TableCell>
                  <TableCell>{a.program.nama}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {SEMUA_JENIS[a.jenis] ?? a.jenis}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
