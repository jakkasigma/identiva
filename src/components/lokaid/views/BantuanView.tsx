"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, Clock } from "lucide-react";

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

const statusLabel: Record<string, { label: string; variant: "secondary" | "outline" | "destructive" }> = {
  sudah_terima:  { label: "Sudah Terima",   variant: "secondary" },
  terverifikasi: { label: "Terverifikasi",  variant: "secondary" },
  ditolak:       { label: "Ditolak",        variant: "destructive" },
  belum:         { label: "Belum Terima",   variant: "outline" },
};

export function BantuanView({ programId, peserta, periode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);

  const sudahTerima = peserta.filter((p) => p.statusPeriodeIni === "sudah_terima").length;
  const belum = peserta.length - sudahTerima;
  const persen = peserta.length > 0 ? Math.round((sudahTerima / peserta.length) * 100) : 0;

  async function catatDistribusi(pesertaId: number) {
    setLoading(pesertaId);
    try {
      await fetch("/api/lokaid/verifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peserta_id: pesertaId, program_id: programId, aksi: "setujui" }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <Card>
        <CardHeader><CardTitle className="text-base">Penerimaan Bantuan — {periode}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-green-500" />
              <span className="font-medium">{sudahTerima}</span>
              <span className="text-muted-foreground">sudah terima</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 text-muted-foreground" />
              <span className="font-medium">{belum}</span>
              <span className="text-muted-foreground">belum</span>
            </div>
            <span className="ml-auto font-mono text-sm text-muted-foreground">{persen}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${persen}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{sudahTerima} dari {peserta.length} penerima</p>
        </CardContent>
      </Card>

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
            const s = statusLabel[p.statusPeriodeIni ?? "belum"] ?? statusLabel.belum;
            const sudah = p.statusPeriodeIni === "sudah_terima";
            return (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-sm">{p.nik}</TableCell>
                <TableCell className="font-medium">{p.nama}</TableCell>
                <TableCell><Badge variant={s.variant}>{s.label}</Badge></TableCell>
                <TableCell>{p.totalAktivitas}</TableCell>
                <TableCell>
                  {!sudah && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading === p.id}
                      onClick={() => catatDistribusi(p.id)}
                    >
                      {loading === p.id ? "..." : "Catat Terima"}
                    </Button>
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
