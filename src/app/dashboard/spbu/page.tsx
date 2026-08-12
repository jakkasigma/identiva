import { redirect } from "next/navigation";
import { Building2, CreditCard, Hash, ReceiptText, Wallet } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDateRange, formatRupiah, formatTanggal } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function SpbuDashboardPage() {
  const session = await auth();
  if (!session?.user?.mitraId) redirect("/login");

  // Guard: hanya untuk tipeMitra subsidi
  const mitra = await prisma.mitra.findUnique({
    where: { id: session.user.mitraId },
    select: { tipeMitra: true },
  });
  if (mitra?.tipeMitra === "lokaid") redirect("/dashboard/lokaid");

  const { start, end } = getDateRange();
  const isCabang = session.user.role === "admin_cabang";

  // ── Dashboard Cabang ──
  if (isCabang && session.user.cabangId) {
    const cabangId = session.user.cabangId;

    const [transaksiHariIni, recent] = await Promise.all([
      prisma.transaksi.findMany({ where: { cabangId, waktu: { gte: start, lt: end } } }),
      prisma.transaksi.findMany({
        where: { cabangId },
        include: { warga: { include: { penduduk: true } }, programSubsidi: true },
        orderBy: { waktu: "desc" },
        take: 5,
      }),
    ]);

    const totalNominal  = transaksiHariIni.reduce((s, i) => s + i.nominal, 0);
    const totalDiskon   = transaksiHariIni.reduce((s, i) => s + i.diskonRupiah, 0);
    const totalDiterima = transaksiHariIni.reduce((s, i) => s + i.totalBayar, 0);

    return (
      <div className="space-y-6">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">Ringkasan</p>
          <h1 className="font-display text-4xl font-semibold">Selamat datang, {session.user.cabangNama ?? "Cabang"}</h1>
          <p className="mt-2 text-muted-foreground">Transaksi subsidi hari ini di cabang ini.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Transaksi Hari Ini" value={transaksiHariIni.length} icon={<Hash className="size-5" />} />
          <StatCard title="Total Nominal"       value={formatRupiah(totalNominal)} icon={<Wallet className="size-5" />} />
          <StatCard title="Total Diskon"        value={formatRupiah(totalDiskon)} note="Klaim subsidi" />
          <StatCard title="Diterima Cabang"     value={formatRupiah(totalDiterima)} icon={<CreditCard className="size-5" />} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>5 transaksi terakhir di cabang ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead><TableHead>Warga</TableHead>
                  <TableHead>Program</TableHead><TableHead>Total Bayar</TableHead><TableHead>Metode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Belum ada transaksi.</TableCell></TableRow>
                ) : recent.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatTanggal(item.waktu)}</TableCell>
                    <TableCell>{item.warga.penduduk.nama}</TableCell>
                    <TableCell>{item.programSubsidi.nama}</TableCell>
                    <TableCell className="font-mono">{formatRupiah(item.totalBayar)}</TableCell>
                    <TableCell className="uppercase">{item.metodeBayar}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Dashboard Mitra Induk SPBU ──
  const [transaksiHariIni, wargaCount, saldoAgg, cabangList, recent] = await Promise.all([
    prisma.transaksi.findMany({ where: { mitraId: session.user.mitraId, waktu: { gte: start, lt: end } } }),
    prisma.warga.count({ where: { mitraId: session.user.mitraId } }),
    prisma.saldo.aggregate({ where: { mitraId: session.user.mitraId }, _sum: { saldoTotal: true, saldoTerpakai: true } }),
    prisma.cabang.findMany({
      where: { mitraId: session.user.mitraId },
      include: { transaksi: { where: { waktu: { gte: start, lt: end } }, select: { nominal: true, diskonRupiah: true, totalBayar: true } } },
      orderBy: { nama: "asc" },
    }),
    prisma.transaksi.findMany({
      where: { mitraId: session.user.mitraId },
      include: { warga: { include: { penduduk: true } }, programSubsidi: true, cabang: true },
      orderBy: { waktu: "desc" },
      take: 5,
    }),
  ]);

  const totalNominal  = transaksiHariIni.reduce((s, i) => s + i.nominal, 0);
  const totalDiskon   = transaksiHariIni.reduce((s, i) => s + i.diskonRupiah, 0);
  const saldoTerpakai = formatRupiah(saldoAgg._sum.saldoTerpakai ?? 0);
  const saldoTotal    = formatRupiah(saldoAgg._sum.saldoTotal ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">Ringkasan</p>
        <h1 className="font-display text-4xl font-semibold">Selamat datang, {session.user.mitraNama}</h1>
        <p className="mt-2 text-muted-foreground">Monitoring semua cabang SPBU hari ini.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Transaksi Hari Ini" value={transaksiHariIni.length} icon={<ReceiptText className="size-5" />} />
        <StatCard title="Total Nominal"      value={formatRupiah(totalNominal)} icon={<Wallet className="size-5" />} />
        <StatCard title="Total Diskon"       value={formatRupiah(totalDiskon)} note="Dasar klaim subsidi" />
        <StatCard title="Saldo Terpakai"     value={saldoTerpakai} icon={<CreditCard className="size-5" />} note={`dari ${saldoTotal} · ${wargaCount} warga`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="size-5" />Performa Cabang Hari Ini</CardTitle>
          <CardDescription>{cabangList.length} cabang terdaftar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cabang</TableHead><TableHead>Kode</TableHead><TableHead>Transaksi</TableHead>
                <TableHead>Nominal</TableHead><TableHead>Diskon</TableHead><TableHead>Diterima</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cabangList.map((c) => {
                const nominal  = c.transaksi.reduce((s, t) => s + t.nominal, 0);
                const diskon   = c.transaksi.reduce((s, t) => s + t.diskonRupiah, 0);
                const diterima = c.transaksi.reduce((s, t) => s + t.totalBayar, 0);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nama}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{c.kode}</TableCell>
                    <TableCell>{c.transaksi.length}</TableCell>
                    <TableCell className="font-mono">{formatRupiah(nominal)}</TableCell>
                    <TableCell className="font-mono">{formatRupiah(diskon)}</TableCell>
                    <TableCell className="font-mono">{formatRupiah(diterima)}</TableCell>
                    <TableCell><Badge variant={c.status === "aktif" ? "secondary" : "destructive"}>{c.status}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>5 transaksi terakhir dari semua cabang.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead><TableHead>Cabang</TableHead><TableHead>Warga</TableHead>
                <TableHead>Program</TableHead><TableHead>Total Bayar</TableHead><TableHead>Metode</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Belum ada transaksi.</TableCell></TableRow>
              ) : recent.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatTanggal(item.waktu)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.cabang.nama}</TableCell>
                  <TableCell>{item.warga.penduduk.nama}</TableCell>
                  <TableCell>{item.programSubsidi.nama}</TableCell>
                  <TableCell className="font-mono">{formatRupiah(item.totalBayar)}</TableCell>
                  <TableCell className="uppercase">{item.metodeBayar}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
