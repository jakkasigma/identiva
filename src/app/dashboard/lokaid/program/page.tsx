import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTanggal } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProgramWizard } from "@/components/lokaid/ProgramWizard";
import { ProgramLokaIDForm } from "@/components/lokaid/ProgramLokaIDForm";
import { ArrowRight } from "lucide-react";

const tujuanLabel: Record<string, string> = {
  bantuan: "Bantuan", kegiatan: "Kegiatan", pendataan: "Pendataan",
  peminjaman: "Peminjaman", pendaftaran: "Pendaftaran",
};
const tujuanVariant: Record<string, "default" | "secondary" | "outline"> = {
  bantuan: "secondary", kegiatan: "secondary",
  pendataan: "outline", peminjaman: "outline", pendaftaran: "outline",
};

export default async function LokaIDProgramPage() {
  const session = await auth();
  if (!session?.user?.mitraId) redirect("/login");

  const mitra = await prisma.mitra.findUnique({ where: { id: session.user.mitraId }, select: { tipeMitra: true } });
  if (mitra?.tipeMitra !== "lokaid") redirect("/dashboard/spbu");

  const isWilayah = session.user.role === "admin_cabang";
  const cabangId = isWilayah ? (session.user.cabangId ?? undefined) : undefined;

  // Admin wilayah: lihat program wilayahnya + program induk (cabangId null)
  // Admin induk: lihat semua program
  const programWhere = cabangId
    ? { mitraId: session.user.mitraId, OR: [{ cabangId }, { cabangId: null }] }
    : { mitraId: session.user.mitraId };

  const [programs, wilayahList] = await Promise.all([
    prisma.programLokaID.findMany({
      where: programWhere,
      include: {
        _count: { select: { peserta: true, aktivitas: true } },
        aktivitasList: { orderBy: { urutan: "asc" } },
        cabang: { select: { nama: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Hanya admin induk yang butuh list wilayah (untuk pilih cakupan)
    !isWilayah
      ? prisma.cabang.findMany({ where: { mitraId: session.user.mitraId }, select: { id: true, nama: true }, orderBy: { nama: "asc" } })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">LokaID</p>
          <h1 className="font-display text-4xl font-semibold">Program</h1>
          <p className="mt-2 text-muted-foreground">
            {isWilayah ? "Program di wilayah ini dan program induk." : "Kelola semua program layanan masyarakat."}
          </p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button />}>Buat Program</DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Buat Program Baru</DialogTitle></DialogHeader>
            <ProgramWizard isInduk={!isWilayah} wilayahList={wilayahList} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Program</CardTitle>
          <CardDescription>{programs.length} program terdaftar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Wilayah</TableHead>
                <TableHead>Tujuan</TableHead>
                <TableHead>Aktivitas</TableHead>
                <TableHead>Peserta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Belum ada program. Buat program baru.
                  </TableCell>
                </TableRow>
              ) : programs.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.nama}</div>
                    {p.tanggalMulai && (
                      <div className="text-xs text-muted-foreground">
                        {formatTanggal(p.tanggalMulai)}{p.tanggalSelesai ? ` — ${formatTanggal(p.tanggalSelesai)}` : ""}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.cabang
                      ? <span className="text-sm">{p.cabang.nama}</span>
                      : <Badge variant="secondary" className="text-xs">Semua Wilayah</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tujuanVariant[p.tujuan] ?? "outline"}>{tujuanLabel[p.tujuan] ?? p.tujuan}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.aktivitasList.map((a) => (
                        <Badge key={a.id} variant="outline" className="text-xs capitalize">{a.jenis}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{p._count.peserta}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "aktif" ? "secondary" : "outline"} className="capitalize">{p.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/lokaid/program/${p.id}`} className={buttonVariants({ variant: "default", size: "sm" })}>
                        Detail <ArrowRight className="ml-1 size-3" />
                      </Link>
                      {/* Edit hanya untuk program milik wilayah sendiri atau admin induk */}
                      {(!isWilayah || p.cabangId === cabangId) && (
                        <Dialog>
                          <DialogTrigger render={<Button variant="outline" size="sm" />}>Edit</DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader><DialogTitle>Edit {p.nama}</DialogTitle></DialogHeader>
                            <ProgramLokaIDForm program={p} />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
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
