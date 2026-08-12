"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck, UserX, Plus, ChevronDown, ChevronRight } from "lucide-react";

type Anak = { id: number; nama: string; tanggalLahir: string | null; jenisKelamin: string | null };
type Peserta = {
  id: number; nik: string; nama: string;
  statusPeriodeIni: string | null; totalAktivitas: number;
  anak?: Anak[]; // hanya ada jika sasaran = "anak"
};

type Props = {
  programId: number;
  peserta: Peserta[];
  periode: string;
  sasaran: "warga" | "anak";
};

// ─── Form tambah anak ────────────────────────────────────
function TambahAnakDialog({ pesertaId, programId, onDone }: { pesertaId: number; programId: number; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/lokaid/dependent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wali_id: pesertaId,
          nama: fd.get("nama"),
          tanggal_lahir: fd.get("tanggal_lahir") || null,
          jenis_kelamin: fd.get("jenis_kelamin") || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        setError(d?.error ?? "Gagal menyimpan.");
        return;
      }
      setOpen(false);
      onDone();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Plus className="size-3.5 mr-1" />Tambah Anak
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Daftarkan Anak</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1"><Label>Nama Anak *</Label>
            <Input name="nama" required placeholder="Nama lengkap anak" />
          </div>
          <div className="space-y-1"><Label>Tanggal Lahir</Label>
            <Input name="tanggal_lahir" type="date" />
          </div>
          <div className="space-y-1"><Label>Jenis Kelamin</Label>
            <Select name="jenis_kelamin">
              <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Laki-laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Menyimpan..." : "Daftarkan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main View ───────────────────────────────────────────
export function KegiatanView({ programId, peserta, periode, sasaran }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const hadir = peserta.filter((p) => p.statusPeriodeIni === "hadir").length;
  const tidakHadir = peserta.length - hadir;
  const persen = peserta.length > 0 ? Math.round((hadir / peserta.length) * 100) : 0;

  async function absen(pesertaId: number) {
    setLoading(pesertaId);
    try {
      await fetch("/api/lokaid/verifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peserta_id: pesertaId, program_id: programId, aksi: "setujui", keterangan: "Absen manual" }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Kehadiran — {periode}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <UserCheck className="size-4 text-green-500" />
              <span className="font-medium">{hadir}</span>
              <span className="text-muted-foreground">hadir</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserX className="size-4 text-muted-foreground" />
              <span className="font-medium">{tidakHadir}</span>
              <span className="text-muted-foreground">tidak hadir</span>
            </div>
            <span className="ml-auto font-mono text-sm text-muted-foreground">{persen}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${persen}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Tampilan berbeda untuk sasaran anak (grouped wali-anak) vs warga */}
      {sasaran === "anak" ? (
        <div className="space-y-2">
          {peserta.map((p) => {
            const isExpanded = expanded.has(p.id);
            const sudahHadir = p.statusPeriodeIni === "hadir";
            return (
              <div key={p.id} className="rounded-lg border overflow-hidden">
                <div className="flex items-center gap-3 p-3 bg-muted/30 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleExpand(p.id)}>
                  {isExpanded ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{p.nama}</div>
                    <div className="font-mono text-xs text-muted-foreground">{p.nik}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">{p.anak?.length ?? 0} anak</Badge>
                  <Badge variant={sudahHadir ? "secondary" : "outline"} className="text-xs">
                    {sudahHadir ? "Hadir" : "Belum"}
                  </Badge>
                  {!sudahHadir && (
                    <Button size="sm" variant="outline" disabled={loading === p.id}
                      onClick={(e) => { e.stopPropagation(); absen(p.id); }}>
                      {loading === p.id ? "..." : "Absen"}
                    </Button>
                  )}
                </div>
                {isExpanded && (
                  <div className="p-3 space-y-2 border-t bg-background">
                    {(p.anak ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">Belum ada anak terdaftar.</p>
                    ) : (
                      <div className="space-y-1">
                        {(p.anak ?? []).map((a) => (
                          <div key={a.id} className="flex items-center gap-2 text-sm py-1">
                            <span className="font-medium">{a.nama}</span>
                            {a.jenisKelamin && <Badge variant="outline" className="text-xs">{a.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</Badge>}
                            {a.tanggalLahir && <span className="text-muted-foreground text-xs">{new Date(a.tanggalLahir).toLocaleDateString("id-ID")}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    <TambahAnakDialog pesertaId={p.id} programId={programId} onDone={() => router.refresh()} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NIK</TableHead><TableHead>Nama</TableHead>
              <TableHead>Status Bulan Ini</TableHead><TableHead>Total Hadir</TableHead><TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {peserta.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Belum ada peserta.</TableCell></TableRow>
            ) : peserta.map((p) => {
              const sudahHadir = p.statusPeriodeIni === "hadir";
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.nik}</TableCell>
                  <TableCell className="font-medium">{p.nama}</TableCell>
                  <TableCell><Badge variant={sudahHadir ? "secondary" : "outline"}>{sudahHadir ? "Hadir" : "Belum Absen"}</Badge></TableCell>
                  <TableCell>{p.totalAktivitas}</TableCell>
                  <TableCell>
                    {!sudahHadir && (
                      <Button size="sm" variant="outline" disabled={loading === p.id} onClick={() => absen(p.id)}>
                        {loading === p.id ? "..." : "Absen"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
