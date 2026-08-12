import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PesertaLokaIDForm } from "@/components/lokaid/PesertaLokaIDForm";
import { ScanPesertaPanel } from "@/components/lokaid/ScanPesertaPanel";

export default async function LokaIDPesertaPage({ searchParams }: PageProps<"/dashboard/lokaid/peserta">) {
  const session = await auth();
  if (!session?.user?.mitraId) redirect("/login");

  const mitra = await prisma.mitra.findUnique({ where: { id: session.user.mitraId }, select: { tipeMitra: true } });
  if (mitra?.tipeMitra !== "lokaid") redirect("/dashboard/spbu");

  const isWilayah = session.user.role === "admin_cabang";
  const cabangId = isWilayah ? (session.user.cabangId ?? undefined) : undefined;

  const params = await searchParams;
  const programFilter = typeof params.program === "string" ? params.program : "semua";

  // Program: wilayah lihat programnya + induk, induk lihat semua
  const programWhere = cabangId
    ? { mitraId: session.user.mitraId, status: "aktif", OR: [{ cabangId }, { cabangId: null }] }
    : { mitraId: session.user.mitraId, status: "aktif" };

  const programs = await prisma.programLokaID.findMany({
    where: programWhere,
    select: { id: true, nama: true, tujuan: true },
    orderBy: { nama: "asc" },
  });

  // Peserta: wilayah hanya lihat yang didaftarkan wilayahnya
  const pesertaWhere = cabangId
    ? { cabangId, programId: programFilter !== "semua" ? Number(programFilter) : undefined }
    : { program: { mitraId: session.user.mitraId }, programId: programFilter !== "semua" ? Number(programFilter) : undefined };

  // Scan dari alat: wilayah hanya lihat scan wilayahnya, induk lihat semua cabang mitra
  const scanWhere = cabangId
    ? { cabangId }
    : { cabang: { mitraId: session.user.mitraId } };

  const [peserta, scans] = await Promise.all([
    prisma.pesertaLokaID.findMany({
      where: pesertaWhere,
      include: {
        penduduk: true,
        program: { select: { nama: true, tujuan: true } },
        cabang: { select: { nama: true } },
        _count: { select: { aktivitas: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.scanPending.findMany({
      where: scanWhere,
      include: { cabang: { select: { nama: true } } },
      orderBy: { waktuScan: "desc" },
      take: 10,
    }),
  ]);

  const tujuanLabel: Record<string, string> = {
    bantuan: "Bantuan", kegiatan: "Kegiatan", pendataan: "Pendataan",
    peminjaman: "Peminjaman", pendaftaran: "Pendaftaran",
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">LokaID</p>
        <h1 className="font-display text-4xl font-semibold">Peserta</h1>
        <p className="mt-2 text-muted-foreground">Daftarkan warga ke program dan kelola peserta aktif.</p>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Daftar Peserta</TabsTrigger>
          <TabsTrigger value="scan">Scan Terbaru</TabsTrigger>
          <TabsTrigger value="new">Daftar Baru</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Peserta Terdaftar</CardTitle>
                  <CardDescription>{peserta.length} peserta.</CardDescription>
                </div>
                <form className="flex items-center gap-2">
                  <Select name="program" defaultValue={programFilter}>
                    <SelectTrigger className="w-52">
                      <SelectValue placeholder="Filter program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua Program</SelectItem>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="submit" variant="outline" size="sm">Filter</Button>
                </form>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIK</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>UID Kartu</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Wilayah</TableHead>
                    <TableHead>Tujuan</TableHead>
                    <TableHead>Aktivitas</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peserta.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        Belum ada peserta. Daftarkan peserta baru di tab Daftar Baru.
                      </TableCell>
                    </TableRow>
                  ) : peserta.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.penduduk.nik}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.penduduk.nama}</div>
                        <div className="text-xs text-muted-foreground">{item.penduduk.alamat}</div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.penduduk.uidKartu}</TableCell>
                      <TableCell>{item.program.nama}</TableCell>
                      <TableCell>
                        {item.cabang
                          ? <span className="text-sm">{item.cabang.nama}</span>
                          : <span className="text-muted-foreground text-xs">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">
                          {tujuanLabel[item.program.tujuan] ?? item.program.tujuan}
                        </Badge>
                      </TableCell>
                      <TableCell>{item._count.aktivitas}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "aktif" ? "secondary" : "outline"} className="capitalize">
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scan">
          <Card>
            <CardHeader>
              <CardTitle>Scan Terbaru</CardTitle>
              <CardDescription>UID dari alat di lapangan. Klik untuk melengkapi dan mendaftarkan ke program.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScanPesertaPanel scans={scans} programs={programs} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Daftarkan Peserta Baru</CardTitle>
              <CardDescription>NIK dan UID kartu bersifat permanen. Pilih program yang sesuai.</CardDescription>
            </CardHeader>
            <CardContent>
              <PesertaLokaIDForm programs={programs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
