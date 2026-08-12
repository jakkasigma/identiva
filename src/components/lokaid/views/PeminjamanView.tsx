"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Package } from "lucide-react";

type Peserta = {
  id: number;
  nik: string;
  nama: string;
  statusPeriodeIni: string | null;
  totalAktivitas: number;
};

type Props = {
  programId: number;
  peserta: Peserta[];
  periode: string;
};

const statusConfig: Record<string, { label: string; variant: "secondary" | "outline" | "destructive" }> = {
  mengajukan:   { label: "Mengajukan",    variant: "outline" },
  disetujui:    { label: "Disetujui",     variant: "secondary" },
  meminjam:     { label: "Sedang Pinjam", variant: "secondary" },
  dikembalikan: { label: "Dikembalikan",  variant: "outline" },
  ditolak:      { label: "Ditolak",       variant: "destructive" },
};

export function PeminjamanView({ programId, peserta, periode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<{ id: number; aksi: string } | null>(null);

  const meminjam = peserta.filter((p) => p.statusPeriodeIni === "meminjam" || p.statusPeriodeIni === "disetujui").length;
  const tersedia = peserta.filter((p) => !p.statusPeriodeIni || p.statusPeriodeIni === "dikembalikan").length;

  async function setujui(pesertaId: number) {
    setLoading({ id: pesertaId, aksi: "setujui" });
    try {
      await fetch("/api/lokaid/persetujuan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peserta_id: pesertaId, program_id: programId, aksi: "setujui" }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function tolak(pesertaId: number) {
    setLoading({ id: pesertaId, aksi: "tolak" });
    try {
      await fetch("/api/lokaid/persetujuan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peserta_id: pesertaId, program_id: programId, aksi: "tolak" }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Sedang Dipinjam</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              <span className="text-2xl font-semibold">{meminjam}</span>
              <span className="text-muted-foreground text-sm">peminjam</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Slot Tersedia</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="size-5 text-green-500" />
              <span className="text-2xl font-semibold">{tersedia}</span>
              <span className="text-muted-foreground text-sm">tersedia</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NIK</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Aktivitas</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {peserta.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Belum ada peserta.</TableCell></TableRow>
          ) : peserta.map((p) => {
            const cfg = statusConfig[p.statusPeriodeIni ?? ""] ?? { label: "—", variant: "outline" as const };
            const menunggu = p.statusPeriodeIni === "mengajukan";
            const isLoading = loading?.id === p.id;
            return (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-sm">{p.nik}</TableCell>
                <TableCell className="font-medium">{p.nama}</TableCell>
                <TableCell>
                  {p.statusPeriodeIni
                    ? <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    : <span className="text-muted-foreground">—</span>
                  }
                </TableCell>
                <TableCell>{p.totalAktivitas}</TableCell>
                <TableCell>
                  {menunggu && (
                    <div className="flex gap-2">
                      <Button size="sm" disabled={isLoading} onClick={() => setujui(p.id)}>
                        {isLoading && loading?.aksi === "setujui" ? "..." : "Setujui"}
                      </Button>
                      <Button size="sm" variant="destructive" disabled={isLoading} onClick={() => tolak(p.id)}>
                        {isLoading && loading?.aksi === "tolak" ? "..." : "Tolak"}
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
