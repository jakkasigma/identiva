import { redirect } from "next/navigation";
import { Download, Hash, ReceiptText, Wallet } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatTanggal, getDateRange } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function RekapPage({ searchParams }: PageProps<"/dashboard/rekap">) {
  const session = await auth();
  if (!session?.user?.mitraId) redirect("/login");

  // Guard: hanya untuk SPBU
  const mitra = await prisma.mitra.findUnique({ where: { id: session.user.mitraId }, select: { tipeMitra: true } });
  if (mitra?.tipeMitra === "lokaid") redirect("/dashboard/lokaid");

  const params = await searchParams;
  const date = typeof params.date === "string" ? params.date : new Date().toISOString().slice(0, 10);
  const metode = typeof params.metode === "string" ? params.metode : "semua";
  const cabangParam = typeof params.cabang === "string" ? params.cabang : "semua";
  const { start, end } = getDateRange(date);

  const isCabang = session.user.role === "admin_cabang";

  // Daftar cabang untuk filter dropdown (hanya induk)
  const cabangList = isCabang
    ? []
    : await prisma.cabang.findMany({
        where: { mitraId: session.user.mitraId },
        select: { id: true, nama: true },
        orderBy: { nama: "asc" },
      });

  // Tentukan filter cabangId
  const cabangId = isCabang
    ? (session.user.cabangId ?? undefined)
    : cabangParam !== "semua"
      ? Number(cabangParam)
      : undefined;

  const transaksi = await prisma.transaksi.findMany({
    where: {
      mitraId: session.user.mitraId,
      waktu: { gte: start, lt: end },
      metodeBayar: metode === "cash" || metode === "qris" ? metode : undefined,
      cabangId: cabangId ?? undefined,
    },
    include: {
      warga: { include: { penduduk: true } },
      programSubsidi: true,
      cabang: true,
    },
    orderBy: { waktu: "desc" },
  });

  const summary = transaksi.reduce(
    (acc, item) => {
      acc.count += 1;
      acc.totalNominal += item.nominal;
      acc.totalDiskon += item.diskonRupiah;
      acc.totalDiterima += item.totalBayar;
      return acc;
    },
    { count: 0, totalNominal: 0, totalDiskon: 0, totalDiterima: 0 },
  );

  const csvParams = new URLSearchParams({ date, metode });
  if (cabangId) csvParams.set("cabang_id", String(cabangId));
  csvParams.set("format", "csv");
  const csvHref = `/api/rekap?${csvParams.toString()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">Laporan</p>
          <h1 className="font-display text-4xl font-semibold">Rekap Transaksi</h1>
          <p className="mt-2 text-muted-foreground">
            {isCabang
              ? `Laporan cabang ${session.user.cabangNama ?? ""}.`
              : "Filter per cabang, tanggal, metode bayar, dan export CSV."}
          </p>
        </div>
        <a href={csvHref} className={buttonVariants()}>
          <Download className="mr-2 size-4" />Export CSV
        </a>
      </div>

      <form className="flex flex-wrap gap-3 rounded-xl border bg-card p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tanggal</label>
          <input name="date" type="date" defaultValue={date} className="h-10 rounded-md border bg-background px-3 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Metode</label>
          <Select name="metode" defaultValue={metode}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="qris">QRIS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {!isCabang && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Cabang</label>
            <Select name="cabang" defaultValue={cabangParam}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Cabang</SelectItem>
                {cabangList.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex items-end">
          <Button type="submit">Terapkan Filter</Button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Transaksi" value={summary.count} icon={<Hash className="size-5" />} />
        <StatCard title="Total Nominal" value={formatRupiah(summary.totalNominal)} icon={<ReceiptText className="size-5" />} />
        <StatCard title="Total Diskon / Klaim" value={formatRupiah(summary.totalDiskon)} note="Total subsidi diklaim" />
        <StatCard title="Diterima Mitra" value={formatRupiah(summary.totalDiterima)} icon={<Wallet className="size-5" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
          <CardDescription>{summary.count} transaksi ditemukan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                {!isCabang && <TableHead>Cabang</TableHead>}
                <TableHead>Warga</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Diskon</TableHead>
                <TableHead>Total Bayar</TableHead>
                <TableHead>Metode</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transaksi.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isCabang ? 7 : 8} className="py-8 text-center text-muted-foreground">
                    Tidak ada transaksi untuk filter ini.
                  </TableCell>
                </TableRow>
              ) : (
                transaksi.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatTanggal(item.waktu)}</TableCell>
                    {!isCabang && (
                      <TableCell className="text-sm text-muted-foreground">{item.cabang.nama}</TableCell>
                    )}
                    <TableCell>
                      <div className="font-medium">{item.warga.penduduk.nama}</div>
                      <div className="font-mono text-xs text-muted-foreground">{item.warga.penduduk.nik}</div>
                    </TableCell>
                    <TableCell>{item.programSubsidi.nama}</TableCell>
                    <TableCell className="font-mono">{formatRupiah(item.nominal)}</TableCell>
                    <TableCell>
                      <div>{item.diskon}%</div>
                      <div className="font-mono text-xs text-muted-foreground">-{formatRupiah(item.diskonRupiah)}</div>
                    </TableCell>
                    <TableCell className="font-mono">{formatRupiah(item.totalBayar)}</TableCell>
                    <TableCell className="uppercase">{item.metodeBayar}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
