import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTanggal, generateCSV, getDateRange } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/StatCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";

const SEMUA_JENIS: Record<string, string> = {
  checkin:      "Check-in",
  distribusi:   "Distribusi",
  verifikasi:   "Verifikasi",
  pendataan:    "Pendataan",
  penilaian:    "Penilaian",
  pengajuan:    "Pengajuan",
  persetujuan:  "Persetujuan",
  peminjaman:   "Peminjaman",
  pengembalian: "Pengembalian",
  pendaftaran:  "Pendaftaran",
  aktivasi:     "Aktivasi",
};

export default async function LokaIDAktivitasPage({ searchParams }: PageProps<"/dashboard/lokaid/aktivitas">) {
  const session = await auth();
  if (!session?.user?.mitraId) redirect("/login");

  const mitra = await prisma.mitra.findUnique({ where: { id: session.user.mitraId }, select: { tipeMitra: true } });
  if (mitra?.tipeMitra !== "lokaid") redirect("/dashboard/spbu");

  const isWilayah = session.user.role === "admin_cabang";
  const cabangId = isWilayah ? (session.user.cabangId ?? undefined) : undefined;

  const params = await searchParams;
  const date = typeof params.date === "string" ? params.date : new Date().toISOString().slice(0, 10);
  const programFilter = typeof params.program === "string" ? params.program : "semua";
  const jenisFilter = typeof params.jenis === "string" ? params.jenis : "semua";
  const { start, end } = getDateRange(date);

  // Program dropdown: wilayah lihat programnya + induk
  const programWhere = cabangId
    ? { mitraId: session.user.mitraId, OR: [{ cabangId }, { cabangId: null }] }
    : { mitraId: session.user.mitraId };

  const programs = await prisma.programLokaID.findMany({
    where: programWhere,
    select: { id: true, nama: true },
    orderBy: { nama: "asc" },
  });

  const aktivitasWhere = {
    mitraId: session.user.mitraId,
    waktu: { gte: start, lt: end },
    ...(cabangId ? { cabangId } : {}),
    programId: programFilter !== "semua" ? Number(programFilter) : undefined,
    jenis: jenisFilter !== "semua" ? jenisFilter : undefined,
  };

  const aktivitas = await prisma.aktivitasLokaID.findMany({
    where: aktivitasWhere,
    include: {
      peserta: { include: { penduduk: true } },
      program: true,
    },
    orderBy: { waktu: "desc" },
  });

  // Hitung per jenis yang ada di hasil
  const perJenis = aktivitas.reduce<Record<string, number>>((acc, a) => {
    acc[a.jenis] = (acc[a.jenis] ?? 0) + 1;
    return acc;
  }, {});

  // 3 jenis teratas untuk StatCard
  const statEntries = Object.entries(perJenis).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const csvParams = new URLSearchParams({ date, program: programFilter, jenis: jenisFilter, format: "csv" });
  const csvHref = `/api/lokaid/aktivitas?${csvParams.toString()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">LokaID</p>
          <h1 className="font-display text-4xl font-semibold">Aktivitas</h1>
          <p className="mt-2 text-muted-foreground">Rekap semua aktivitas program per hari.</p>
        </div>
        <a href={csvHref} className={buttonVariants()}>
          <Download className="mr-2 size-4" />Export CSV
        </a>
      </div>

      {/* Filter */}
      <form className="flex flex-wrap gap-3 rounded-xl border bg-card p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tanggal</label>
          <input name="date" type="date" defaultValue={date} className="h-10 rounded-md border bg-background px-3 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Program</label>
          <Select name="program" defaultValue={programFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Program</SelectItem>
              {programs.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.nama}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Jenis</label>
          <Select name="jenis" defaultValue={jenisFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua</SelectItem>
              {Object.entries(SEMUA_JENIS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button type="submit">Terapkan Filter</Button>
        </div>
      </form>

      {/* StatCards — dinamis 3 teratas */}
      {statEntries.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {statEntries.map(([jenis, count]) => (
            <StatCard key={jenis} title={SEMUA_JENIS[jenis] ?? jenis} value={count} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Total Aktivitas" value={0} />
        </div>
      )}

      {/* Tabel */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Aktivitas</CardTitle>
          <CardDescription>{aktivitas.length} aktivitas ditemukan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Peserta</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aktivitas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Tidak ada aktivitas untuk filter ini.
                  </TableCell>
                </TableRow>
              ) : aktivitas.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{formatTanggal(a.waktu)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{a.peserta.penduduk.nama}</div>
                    <div className="font-mono text-xs text-muted-foreground">{a.peserta.penduduk.nik}</div>
                  </TableCell>
                  <TableCell>{a.program.nama}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {SEMUA_JENIS[a.jenis] ?? a.jenis}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.keterangan ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
