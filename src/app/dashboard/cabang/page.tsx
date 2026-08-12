import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah, getDateRange } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CabangForm } from "@/components/cabang/CabangForm";
import { SCAN_METHOD_LABELS, parseScanMethods } from "@/lib/scan-methods";

export default async function CabangPage() {
  const session = await auth();
  if (!session?.user?.mitraId || session.user.role !== "admin_mitra") redirect("/dashboard");

  // Guard: hanya untuk SPBU
  const mitra = await prisma.mitra.findUnique({ where: { id: session.user.mitraId }, select: { tipeMitra: true, metodeScanDiizinkan: true } });
  if (mitra?.tipeMitra === "lokaid") redirect("/dashboard/lokaid");
  const allowedMethods = parseScanMethods(mitra?.metodeScanDiizinkan);

  const { start, end } = getDateRange();

  const cabangList = await prisma.cabang.findMany({
    where: { mitraId: session.user.mitraId },
    include: {
      users: { select: { username: true, role: true } },
      transaksi: {
        where: { waktu: { gte: start, lt: end } },
        select: { nominal: true, diskonRupiah: true, totalBayar: true, metodeBayar: true },
      },
      _count: { select: { transaksi: true } },
    },
    orderBy: { nama: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">Jaringan</p>
          <h1 className="font-display text-4xl font-semibold">Cabang SPBU</h1>
          <p className="mt-2 text-muted-foreground">Kelola cabang, token API, dan monitor performa tiap SPBU.</p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button />}>Tambah Cabang</DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tambah Cabang Baru</DialogTitle>
            </DialogHeader>
            <CabangForm allowedMethods={allowedMethods} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cabangList.map((c) => {
          const nominal = c.transaksi.reduce((s, t) => s + t.nominal, 0);
          const diskon = c.transaksi.reduce((s, t) => s + t.diskonRupiah, 0);
          const diterima = c.transaksi.reduce((s, t) => s + t.totalBayar, 0);
          const adminCabang = c.users.find((u) => u.role === "admin_cabang");

          return (
            <Card key={c.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{c.nama}</CardTitle>
                    <CardDescription className="font-mono">{c.kode}</CardDescription>
                  </div>
                  <Badge variant={c.status === "aktif" ? "secondary" : "destructive"}>
                    {c.status}
                  </Badge>
                </div>
                {c.alamat && (
                  <p className="text-xs text-muted-foreground">{c.alamat}</p>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {/* Statistik hari ini */}
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="mb-2 font-medium text-muted-foreground">Hari ini</p>
                  <div className="grid grid-cols-2 gap-1">
                    <span className="text-muted-foreground">Transaksi</span>
                    <span className="text-right font-medium">{c.transaksi.length}</span>
                    <span className="text-muted-foreground">Nominal</span>
                    <span className="text-right font-mono text-xs">{formatRupiah(nominal)}</span>
                    <span className="text-muted-foreground">Diskon</span>
                    <span className="text-right font-mono text-xs text-accent-foreground">{formatRupiah(diskon)}</span>
                    <span className="text-muted-foreground">Diterima</span>
                    <span className="text-right font-mono text-xs">{formatRupiah(diterima)}</span>
                  </div>
                </div>

                {/* Token API */}
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Token API</p>
                  <p className="break-all font-mono text-xs text-muted-foreground">{c.tokenApi}</p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Metode Scan</p>
                  <Badge variant="outline">{SCAN_METHOD_LABELS[c.metodeScanAktif as keyof typeof SCAN_METHOD_LABELS] ?? c.metodeScanAktif}</Badge>
                </div>

                {/* Operator */}
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Operator</p>
                  <p className="text-sm">
                    {adminCabang ? (
                      <span className="font-mono">{adminCabang.username}</span>
                    ) : (
                      <span className="text-muted-foreground italic">Belum ada akun</span>
                    )}
                  </p>
                </div>

                {/* Edit */}
                <Dialog>
                  <DialogTrigger render={<Button variant="outline" size="sm" className="w-full" />}>
                    Edit Cabang
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Edit {c.nama}</DialogTitle>
                    </DialogHeader>
                    <CabangForm cabang={c} allowedMethods={allowedMethods} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabel semua cabang ringkas */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Semua Cabang</CardTitle>
          <CardDescription>Total transaksi sepanjang waktu per cabang.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cabang</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Total Transaksi</TableHead>
                <TableHead>Metode Scan</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cabangList.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nama}</TableCell>
                  <TableCell className="font-mono text-xs">{c.kode}</TableCell>
                  <TableCell>
                    {c.users.find((u) => u.role === "admin_cabang")?.username ?? (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </TableCell>
                  <TableCell>{c._count.transaksi}</TableCell>
                  <TableCell>{SCAN_METHOD_LABELS[c.metodeScanAktif as keyof typeof SCAN_METHOD_LABELS] ?? c.metodeScanAktif}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "aktif" ? "secondary" : "destructive"}>
                      {c.status}
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
