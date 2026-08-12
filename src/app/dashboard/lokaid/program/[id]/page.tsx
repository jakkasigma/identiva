import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentPeriode } from "@/lib/quota";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CalendarDays, Users, FileText } from "lucide-react";
import { BantuanView }     from "@/components/lokaid/views/BantuanView";
import { KegiatanView }    from "@/components/lokaid/views/KegiatanView";
import { PendataanView }   from "@/components/lokaid/views/PendataanView";
import { PeminjamanView }  from "@/components/lokaid/views/PeminjamanView";
import { PendaftaranView } from "@/components/lokaid/views/PendaftaranView";
import { DynamicDataForm, type FieldDef } from "@/components/lokaid/DynamicDataForm";

const tujuanLabel: Record<string, string> = {
  bantuan: "Memberikan Bantuan", kegiatan: "Mengadakan Kegiatan",
  pendataan: "Mengumpulkan Data", peminjaman: "Meminjamkan Barang/Fasilitas",
  pendaftaran: "Mendaftarkan Warga",
};

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.mitraId) redirect("/login");

  // Guard: hanya untuk LokaID
  const mitra = await prisma.mitra.findUnique({ where: { id: session.user.mitraId }, select: { tipeMitra: true } });
  if (mitra?.tipeMitra !== "lokaid") redirect("/dashboard/spbu");

  const { id } = await params;
  const programId = Number(id);
  if (isNaN(programId)) notFound();

  const program = await prisma.programLokaID.findFirst({
    where: { id: programId, mitraId: session.user.mitraId },
    include: {
      aktivitasList: { orderBy: { urutan: "asc" } },
      fields: { orderBy: { urutan: "asc" } },
      _count: { select: { peserta: true, aktivitas: true } },
    },
  });
  if (!program) notFound();

  const periode = getCurrentPeriode(program.periodeReset);
  const hasFields = program.fields.length > 0;

  const pesertaRaw = await prisma.pesertaLokaID.findMany({
    where: { programId },
    include: {
      penduduk: true,
      statusPeserta: { where: { programId, periode }, take: 1 },
      aktivitas: { where: { programId }, select: { id: true } },
      fieldValues: hasFields ? { include: { field: true } } : false,
      dependents: program.sasaran === "anak" ? { orderBy: { createdAt: "asc" } } : false,
    },
    orderBy: { createdAt: "asc" },
  });

  const peserta = pesertaRaw.map((p) => ({
    id: p.id,
    nik: p.penduduk.nik,
    nama: p.penduduk.nama,
    alamat: p.penduduk.alamat,
    statusPeriodeIni: p.statusPeserta[0]?.status ?? null,
    totalAktivitas: p.aktivitas.length,
    createdAt: p.createdAt,
    anak: program.sasaran === "anak" ? p.dependents.map((d) => ({
      id: d.id, nama: d.nama,
      tanggalLahir: d.tanggalLahir ? d.tanggalLahir.toISOString() : null,
      jenisKelamin: d.jenisKelamin,
    })) : undefined,
    // Hitung kelengkapan field wajib
    fieldLengkap: hasFields ? (() => {
      const wajibCount = program.fields.filter(f => f.wajib).length;
      if (wajibCount === 0) return true;
      const terisi = p.fieldValues.filter(v => program.fields.find(f => f.id === v.fieldId && f.wajib) && v.nilai).length;
      return terisi >= wajibCount;
    })() : true,
  }));

  const fmt = (d: Date | null) => d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1">
            <Link href="/dashboard/lokaid/program" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              <ChevronLeft className="size-4 mr-1" />Program
            </Link>
          </div>
          <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">LokaID</p>
          <h1 className="font-display text-3xl font-semibold">{program.nama}</h1>
          {program.deskripsi && <p className="mt-1 text-muted-foreground">{program.deskripsi}</p>}
        </div>
        <Badge variant={program.status === "aktif" ? "secondary" : "outline"} className="capitalize self-start mt-1">{program.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">Tujuan</CardTitle></CardHeader>
          <CardContent><p className="font-medium text-sm">{tujuanLabel[program.tujuan] ?? program.tujuan}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">Peserta</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-1.5"><Users className="size-4 text-muted-foreground" /><span className="font-semibold">{program._count.peserta}</span></div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">Kuota</CardTitle></CardHeader>
          <CardContent><p className="font-medium text-sm">{program.kuotaTotal ? `${program.kuotaTotal}× / ${program.periodeReset}` : "Tidak terbatas"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">Periode</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-1.5"><CalendarDays className="size-4 text-muted-foreground" /><span className="font-mono text-sm">{periode}</span></div></CardContent>
        </Card>
      </div>

      {(program.tanggalMulai || program.tanggalSelesai) && (
        <p className="text-sm text-muted-foreground">{fmt(program.tanggalMulai)} {program.tanggalSelesai ? `— ${fmt(program.tanggalSelesai)}` : ""}</p>
      )}

      <div className="flex flex-wrap gap-1">
        {program.aktivitasList.map((a, i) => (
          <div key={a.id} className="flex items-center gap-1">
            <Badge variant="outline" className="capitalize text-xs">{a.jenis}</Badge>
            {i < program.aktivitasList.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
          </div>
        ))}
        {hasFields && (
          <Badge variant="secondary" className="text-xs gap-1">
            <FileText className="size-3" />{program.fields.length} field data
          </Badge>
        )}
      </div>

      {/* Tombol Isi Data per peserta (jika ada field tambahan) */}
      {hasFields && (
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Field Data Program</p>
          <div className="flex flex-wrap gap-1">
            {program.fields.map((f) => (
              <Badge key={f.id} variant="outline" className="text-xs">
                {f.nama}{f.wajib ? " *" : ""}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Klik tombol Isi Data di baris peserta untuk mengisi data individual.</p>
        </div>
      )}

      {/* View adaptif per tujuan */}
      {program.tujuan === "bantuan" && <BantuanView programId={program.id} peserta={peserta} periode={periode} />}
      {program.tujuan === "kegiatan" && <KegiatanView programId={program.id} peserta={peserta} periode={periode} sasaran={program.sasaran as "warga" | "anak"} />}
      {program.tujuan === "pendataan" && <PendataanView programId={program.id} peserta={peserta} periode={periode} />}
      {program.tujuan === "peminjaman" && <PeminjamanView programId={program.id} peserta={peserta} periode={periode} />}
      {program.tujuan === "pendaftaran" && <PendaftaranView programId={program.id} peserta={peserta} periode={periode} />}

      {/* Dialog Isi Data — satu per peserta, lazy load fields via API */}
      {hasFields && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Isi Data Peserta</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {peserta.map((p) => {
              const fieldDefs: FieldDef[] = program.fields.map((f) => ({
                fieldId: f.id, nama: f.nama, kode: f.kode, tipe: f.tipe as FieldDef["tipe"],
                wajib: f.wajib, opsi: f.opsi ? JSON.parse(f.opsi) as string[] : null,
                nilai: null, // akan diisi saat dialog dibuka
              }));
              return (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium text-sm">{p.nama}</div>
                    <div className="text-xs text-muted-foreground">{p.fieldLengkap ? "✓ Data lengkap" : "Belum lengkap"}</div>
                  </div>
                  <Dialog>
                    <DialogTrigger render={<Button variant="outline" size="sm" />}>Isi Data</DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader><DialogTitle>Data {p.nama}</DialogTitle></DialogHeader>
                      <DynamicDataForm pesertaId={p.id} fields={fieldDefs} />
                    </DialogContent>
                  </Dialog>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
