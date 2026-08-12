import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WilayahLokaIDForm } from "@/components/lokaid/WilayahLokaIDForm";
import { ArrowRight, MapPin } from "lucide-react";
import { SCAN_METHOD_LABELS, parseScanMethods } from "@/lib/scan-methods";

export default async function LokaIDWilayahPage() {
  const session = await auth();
  if (!session?.user?.mitraId) redirect("/login");

  // Guard: hanya admin induk LokaID
  const mitra = await prisma.mitra.findUnique({ where: { id: session.user.mitraId }, select: { tipeMitra: true, metodeScanDiizinkan: true } });
  if (mitra?.tipeMitra !== "lokaid") redirect("/dashboard/spbu");
  if (session.user.role !== "admin_mitra") redirect("/dashboard/lokaid");
  const allowedMethods = parseScanMethods(mitra.metodeScanDiizinkan);

  const wilayahList = await prisma.cabang.findMany({
    where: { mitraId: session.user.mitraId },
    include: {
      users: { select: { username: true, role: true } },
      programLokaID: { select: { id: true } },
      pesertaLokaID: { select: { id: true } },
    },
    orderBy: { nama: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">LokaID</p>
          <h1 className="font-display text-4xl font-semibold">Wilayah</h1>
          <p className="mt-2 text-muted-foreground">Kelola kecamatan/unit wilayah dan monitor aktivitas masing-masing.</p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button />}>Tambah Wilayah</DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Tambah Wilayah Baru</DialogTitle></DialogHeader>
            <WilayahLokaIDForm allowedMethods={allowedMethods} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Card grid per wilayah */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wilayahList.map((w) => {
          const adminWilayah = w.users.find((u) => u.role === "admin_cabang");
          return (
            <Card key={w.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{w.nama}</CardTitle>
                    <CardDescription className="font-mono">{w.kode}</CardDescription>
                  </div>
                  <Badge variant={w.status === "aktif" ? "secondary" : "destructive"}>{w.status}</Badge>
                </div>
                {w.alamat && <p className="text-xs text-muted-foreground"><MapPin className="inline size-3 mr-1" />{w.alamat}</p>}
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="rounded-lg bg-muted/50 p-3 text-sm grid grid-cols-2 gap-1">
                  <span className="text-muted-foreground">Program</span>
                  <span className="text-right font-medium">{w.programLokaID.length}</span>
                  <span className="text-muted-foreground">Peserta</span>
                  <span className="text-right font-medium">{w.pesertaLokaID.length}</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Operator</p>
                  <p className="text-sm">
                    {adminWilayah
                      ? <span className="font-mono">{adminWilayah.username}</span>
                      : <span className="text-muted-foreground italic">Belum ada akun</span>}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Token API</p>
                  <p className="break-all font-mono text-xs text-muted-foreground">{w.tokenApi}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Metode Scan</p>
                  <Badge variant="outline">{SCAN_METHOD_LABELS[w.metodeScanAktif as keyof typeof SCAN_METHOD_LABELS] ?? w.metodeScanAktif}</Badge>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/lokaid/wilayah/${w.id}`} className={buttonVariants({ variant: "default", size: "sm", className: "flex-1" })}>
                    Detail <ArrowRight className="ml-1 size-3" />
                  </Link>
                  <Dialog>
                    <DialogTrigger render={<Button variant="outline" size="sm" />}>Edit</DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader><DialogTitle>Edit {w.nama}</DialogTitle></DialogHeader>
                      <WilayahLokaIDForm wilayah={w} allowedMethods={allowedMethods} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {wilayahList.length === 0 && (
          <div className="col-span-3 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            Belum ada wilayah. Tambah wilayah pertama.
          </div>
        )}
      </div>

      {/* Tabel ringkas */}
      {wilayahList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Semua Wilayah</CardTitle>
            <CardDescription>{wilayahList.length} wilayah terdaftar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wilayah</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Peserta</TableHead>
                  <TableHead>Metode Scan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wilayahList.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.nama}</TableCell>
                    <TableCell className="font-mono text-xs">{w.kode}</TableCell>
                    <TableCell>{w.users.find((u) => u.role === "admin_cabang")?.username ?? <span className="text-muted-foreground italic">—</span>}</TableCell>
                    <TableCell>{w.programLokaID.length}</TableCell>
                    <TableCell>{w.pesertaLokaID.length}</TableCell>
                    <TableCell>{SCAN_METHOD_LABELS[w.metodeScanAktif as keyof typeof SCAN_METHOD_LABELS] ?? w.metodeScanAktif}</TableCell>
                    <TableCell><Badge variant={w.status === "aktif" ? "secondary" : "destructive"}>{w.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
